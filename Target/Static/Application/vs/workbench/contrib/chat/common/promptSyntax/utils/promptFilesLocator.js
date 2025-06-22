var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../../base/common/uri.js";
import { isAbsolute } from "../../../../../../base/common/path.js";
import { ResourceSet } from "../../../../../../base/common/map.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { getPromptFileLocationsConfigKey, PromptsConfig } from "../config/config.js";
import { basename, dirname, joinPath } from "../../../../../../base/common/resources.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { getPromptFileExtension, getPromptFileType } from "../config/promptFileLocations.js";
import { IWorkbenchEnvironmentService } from "../../../../../services/environment/common/environmentService.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { getExcludes, ISearchService } from "../../../../../services/search/common/search.js";
import { isCancellationError } from "../../../../../../base/common/errors.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let PromptFilesLocator = class PromptFilesLocator2 extends Disposable {
  static {
    __name(this, "PromptFilesLocator");
  }
  constructor(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService) {
    super();
    this.fileService = fileService;
    this.configService = configService;
    this.workspaceService = workspaceService;
    this.environmentService = environmentService;
    this.searchService = searchService;
    this.userDataService = userDataService;
    this.logService = logService;
  }
  /**
   * List all prompt files from the filesystem.
   *
   * @returns List of prompt files found in the workspace.
   */
  async listFiles(type, storage, token) {
    if (storage === "local") {
      return await this.listFilesInLocal(type, token);
    } else {
      return await this.listFilesInUserData(type, token);
    }
  }
  async listFilesInUserData(type, token) {
    const files = await this.resolveFilesAtLocation(this.userDataService.currentProfile.promptsHome, token);
    return files.filter((file) => getPromptFileType(file) === type);
  }
  async getCopilotInstructionsFiles(instructionFilePaths) {
    const { folders } = this.workspaceService.getWorkspace();
    const result = [];
    for (const folder of folders) {
      for (const instructionFilePath of instructionFilePaths) {
        const file = joinPath(folder.uri, instructionFilePath);
        if (await this.fileService.exists(file)) {
          result.push(file);
        }
      }
    }
    return result;
  }
  createFilesUpdatedEvent(type) {
    const disposables = new DisposableStore();
    const eventEmitter = disposables.add(new Emitter());
    const userDataFolder = this.userDataService.currentProfile.promptsHome;
    const key = getPromptFileLocationsConfigKey(type);
    let parentFolders = this.getLocalParentFolders(type);
    const externalFolderWatchers = disposables.add(new DisposableStore());
    const updateExternalFolderWatchers = /* @__PURE__ */ __name(() => {
      externalFolderWatchers.clear();
      for (const folder of parentFolders) {
        if (!this.workspaceService.getWorkspaceFolder(folder.parent)) {
          const recursive = folder.filePattern !== void 0;
          externalFolderWatchers.add(this.fileService.watch(folder.parent, { recursive, excludes: [] }));
        }
      }
    }, "updateExternalFolderWatchers");
    updateExternalFolderWatchers();
    disposables.add(this.configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(key)) {
        parentFolders = this.getLocalParentFolders(type);
        updateExternalFolderWatchers();
        eventEmitter.fire();
      }
    }));
    disposables.add(this.fileService.onDidFilesChange((e) => {
      if (e.contains(userDataFolder)) {
        eventEmitter.fire();
        return;
      }
      if (parentFolders.some((folder) => folder.filePattern !== void 0 ? e.affects(folder.parent) : e.contains(folder.parent))) {
        eventEmitter.fire();
        return;
      }
    }));
    disposables.add(this.fileService.watch(userDataFolder));
    return { event: eventEmitter.event, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") };
  }
  /**
   * Get all possible unambiguous prompt file source folders based on
   * the current workspace folder structure.
   *
   * This method is currently primarily used by the `> Create Prompt`
   * command that providers users with the list of destination folders
   * for a newly created prompt file. Because such a list cannot contain
   * paths that include `glob pattern` in them, we need to process config
   * values and try to create a list of clear and unambiguous locations.
   *
   * @returns List of possible unambiguous prompt file folders.
   */
  getConfigBasedSourceFolders(type) {
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const absoluteLocations = this.toAbsoluteLocations(configuredLocations);
    const result = new ResourceSet();
    for (let absoluteLocation of absoluteLocations) {
      const baseName = basename(absoluteLocation);
      const filePatterns = ["*.md", `*${getPromptFileExtension(type)}`];
      for (const filePattern of filePatterns) {
        if (baseName === filePattern) {
          absoluteLocation = dirname(absoluteLocation);
          continue;
        }
      }
      if (baseName === "*") {
        absoluteLocation = dirname(absoluteLocation);
      }
      if (isValidGlob(absoluteLocation.path) === true) {
        continue;
      }
      result.add(absoluteLocation);
    }
    return [...result];
  }
  /**
   * Finds all existent prompt files in the configured local source folders.
   *
   * @returns List of prompt files found in the local source folders.
   */
  async listFilesInLocal(type, token) {
    const paths = new ResourceSet();
    for (const { parent, filePattern } of this.getLocalParentFolders(type)) {
      const files = filePattern === void 0 ? await this.resolveFilesAtLocation(parent, token) : await this.searchFilesInLocation(parent, filePattern, token);
      for (const file of files) {
        if (getPromptFileType(file) === type) {
          paths.add(file);
        }
      }
      if (token.isCancellationRequested) {
        return [];
      }
    }
    return [...paths];
  }
  getLocalParentFolders(type) {
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const absoluteLocations = this.toAbsoluteLocations(configuredLocations);
    return absoluteLocations.map(firstNonGlobParentAndPattern);
  }
  /**
   * Converts locations defined in `settings` to absolute filesystem path URIs.
   * This conversion is needed because locations in settings can be relative,
   * hence we need to resolve them based on the current workspace folders.
   */
  toAbsoluteLocations(configuredLocations) {
    const result = new ResourceSet();
    const { folders } = this.workspaceService.getWorkspace();
    for (const configuredLocation of configuredLocations) {
      try {
        if (isAbsolute(configuredLocation)) {
          let uri = URI.file(configuredLocation);
          const remoteAuthority = this.environmentService.remoteAuthority;
          if (remoteAuthority) {
            uri = uri.with({ scheme: Schemas.vscodeRemote, authority: remoteAuthority });
          }
          result.add(uri);
        } else {
          for (const workspaceFolder of folders) {
            const absolutePath = joinPath(workspaceFolder.uri, configuredLocation);
            result.add(absolutePath);
          }
        }
      } catch (error) {
        this.logService.error(`Failed to resolve prompt file location: ${configuredLocation}`, error);
      }
    }
    return [...result];
  }
  /**
   * Uses the file service to resolve the provided location and return either the file at the location of files in the directory.
   */
  async resolveFilesAtLocation(location, token) {
    try {
      const info = await this.fileService.resolve(location);
      if (info.isFile) {
        return [info.resource];
      } else if (info.isDirectory && info.children) {
        const result = [];
        for (const child of info.children) {
          if (child.isFile) {
            result.push(child.resource);
          }
        }
        return result;
      }
    } catch (error) {
    }
    return [];
  }
  /**
   * Uses the search service to find all files at the provided location
   */
  async searchFilesInLocation(folder, filePattern, token) {
    const disregardIgnoreFiles = this.configService.getValue("explorer.excludeGitIgnore");
    const workspaceRoot = this.workspaceService.getWorkspaceFolder(folder);
    const getExcludePattern = /* @__PURE__ */ __name((folder2) => getExcludes(this.configService.getValue({ resource: folder2 })) || {}, "getExcludePattern");
    const searchOptions = {
      folderQueries: [{ folder, disregardIgnoreFiles }],
      type: 1,
      shouldGlobMatchFilePattern: true,
      excludePattern: workspaceRoot ? getExcludePattern(workspaceRoot.uri) : void 0,
      sortByScore: true,
      filePattern
    };
    try {
      const searchResult = await this.searchService.fileSearch(searchOptions, token);
      if (token?.isCancellationRequested) {
        return [];
      }
      return searchResult.results.map((r) => r.resource);
    } catch (e) {
      if (!isCancellationError(e)) {
        throw e;
      }
    }
    return [];
  }
};
PromptFilesLocator = __decorate([
  __param(0, IFileService),
  __param(1, IConfigurationService),
  __param(2, IWorkspaceContextService),
  __param(3, IWorkbenchEnvironmentService),
  __param(4, ISearchService),
  __param(5, IUserDataProfileService),
  __param(6, ILogService)
], PromptFilesLocator);
function isValidGlob(pattern) {
  let squareBrackets = false;
  let squareBracketsCount = 0;
  let curlyBrackets = false;
  let curlyBracketsCount = 0;
  let previousCharacter;
  for (const char of pattern) {
    if (previousCharacter === "\\") {
      previousCharacter = char;
      continue;
    }
    if (char === "*") {
      return true;
    }
    if (char === "?") {
      return true;
    }
    if (char === "[") {
      squareBrackets = true;
      squareBracketsCount++;
      previousCharacter = char;
      continue;
    }
    if (char === "]") {
      squareBrackets = true;
      squareBracketsCount--;
      previousCharacter = char;
      continue;
    }
    if (char === "{") {
      curlyBrackets = true;
      curlyBracketsCount++;
      continue;
    }
    if (char === "}") {
      curlyBrackets = true;
      curlyBracketsCount--;
      previousCharacter = char;
      continue;
    }
    previousCharacter = char;
  }
  if (squareBrackets && squareBracketsCount === 0) {
    return true;
  }
  if (curlyBrackets && curlyBracketsCount === 0) {
    return true;
  }
  return false;
}
__name(isValidGlob, "isValidGlob");
function firstNonGlobParentAndPattern(location) {
  const segments = location.path.split("/");
  let i = 0;
  while (i < segments.length && isValidGlob(segments[i]) === false) {
    i++;
  }
  if (i === segments.length) {
    return { parent: location };
  }
  const parent = location.with({ path: segments.slice(0, i).join("/") });
  if (i === segments.length - 1 && segments[i] === "*" || segments[i] === ``) {
    return { parent };
  }
  return {
    parent,
    filePattern: segments.slice(i).join("/")
  };
}
__name(firstNonGlobParentAndPattern, "firstNonGlobParentAndPattern");
export {
  PromptFilesLocator,
  isValidGlob
};
//# sourceMappingURL=promptFilesLocator.js.map
