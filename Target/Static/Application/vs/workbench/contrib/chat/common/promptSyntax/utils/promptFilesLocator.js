var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { URI } from "../../../../../../base/common/uri.js";
import { match } from "../../../../../../base/common/glob.js";
import { assert } from "../../../../../../base/common/assert.js";
import { isAbsolute } from "../../../../../../base/common/path.js";
import { ResourceSet } from "../../../../../../base/common/map.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { PromptsConfig } from "../../../../../../platform/prompts/common/config.js";
import { basename, dirname, extUri } from "../../../../../../base/common/resources.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { getPromptFileType, PROMPT_FILE_EXTENSION } from "../../../../../../platform/prompts/common/constants.js";
let PromptFilesLocator = class PromptFilesLocator2 {
  static {
    __name(this, "PromptFilesLocator");
  }
  constructor(fileService, configService, workspaceService) {
    this.fileService = fileService;
    this.configService = configService;
    this.workspaceService = workspaceService;
  }
  /**
   * List all prompt files from the filesystem.
   *
   * @returns List of prompt files found in the workspace.
   */
  async listFiles(type) {
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const absoluteLocations = toAbsoluteLocations(configuredLocations, this.workspaceService);
    return await this.listFilesIn(absoluteLocations, type);
  }
  /**
   * Lists all prompt files in the provided folders.
   *
   * @throws if any of the provided folder paths is not an `absolute path`.
   *
   * @param absoluteLocations List of prompt file source folders to search for prompt files in. Must be absolute paths.
   * @returns List of prompt files found in the provided folders.
   */
  async listFilesIn(folders, type) {
    return await this.findFilesInLocations(folders, type);
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
    const absoluteLocations = toAbsoluteLocations(configuredLocations, this.workspaceService);
    const result = new ResourceSet();
    for (const absoluteLocation of absoluteLocations) {
      let { path } = absoluteLocation;
      const baseName = basename(absoluteLocation);
      const filePatterns = ["*.md", `*${PROMPT_FILE_EXTENSION}`];
      for (const filePattern of filePatterns) {
        if (baseName === filePattern) {
          path = URI.joinPath(absoluteLocation, "..").path;
          continue;
        }
      }
      if (baseName === "*") {
        path = URI.joinPath(absoluteLocation, "..").path;
      }
      if (isValidGlob(path) === true) {
        continue;
      }
      result.add(URI.file(path));
    }
    return [...result];
  }
  /**
   * Finds all existent prompt files in the provided source folders.
   *
   * @throws if any of the provided folder paths is not an `absolute path`.
   *
   * @param absoluteLocations List of prompt file source folders to search for prompt files in. Must be absolute paths.
   * @returns List of prompt files found in the provided source folders.
   */
  async findFilesInLocations(absoluteLocations, type) {
    const paths = new ResourceSet();
    for (const absoluteLocation of absoluteLocations) {
      assert(isAbsolute(absoluteLocation.path), `Provided location must be an absolute path, got '${absoluteLocation.path}'.`);
      const nonGlobParent = firstNonGlobParent(absoluteLocation);
      if (nonGlobParent === absoluteLocation) {
        const promptFiles = await findFilesInLocation(absoluteLocation, type, this.fileService);
        for (const file of promptFiles) {
          paths.add(file);
        }
      } else {
        const promptFiles = await findFilesInLocation(nonGlobParent, type, this.fileService);
        for (const file of promptFiles) {
          if (match(absoluteLocation.path, file.path)) {
            paths.add(file);
          }
        }
      }
    }
    return [...paths];
  }
};
PromptFilesLocator = __decorate([
  __param(0, IFileService),
  __param(1, IConfigurationService),
  __param(2, IWorkspaceContextService)
], PromptFilesLocator);
const isValidGlob = /* @__PURE__ */ __name((pattern) => {
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
}, "isValidGlob");
const firstNonGlobParent = /* @__PURE__ */ __name((location) => {
  assert(isAbsolute(location.path), `Provided location must be an absolute path, got '${location.path}'.`);
  if (isValidGlob(location.path) === false) {
    return location;
  }
  const parent = dirname(location);
  if (extUri.isEqual(parent, location)) {
    return location;
  }
  return firstNonGlobParent(parent);
}, "firstNonGlobParent");
const findFilesInLocation = /* @__PURE__ */ __name(async (location, type, fileService) => {
  const result = [];
  try {
    const info = await fileService.resolve(location);
    if (info.isFile && getPromptFileType(info.resource) === type) {
      result.push(info.resource);
      return result;
    }
    if (info.isDirectory && info.children) {
      for (const child of info.children) {
        if (child.isFile && getPromptFileType(child.resource) === type) {
          result.push(child.resource);
          continue;
        }
        if (child.isDirectory) {
          const promptFiles = await findFilesInLocation(child.resource, type, fileService);
          result.push(...promptFiles);
          continue;
        }
      }
      return result;
    }
  } catch (error) {
  }
  return result;
}, "findFilesInLocation");
const toAbsoluteLocations = /* @__PURE__ */ __name((configuredLocations, workspaceService) => {
  const result = new ResourceSet();
  const { folders } = workspaceService.getWorkspace();
  for (const configuredLocation of configuredLocations) {
    if (isAbsolute(configuredLocation)) {
      result.add(URI.file(configuredLocation));
      continue;
    }
    for (const workspaceFolder of folders) {
      const absolutePath = extUri.resolvePath(workspaceFolder.uri, configuredLocation);
      assert(isAbsolute(absolutePath.path), `Provided location must be an absolute path, got '${absolutePath.path}'.`);
      if (result.has(absolutePath) === false) {
        result.add(absolutePath);
      }
      if (folders.length <= 1) {
        continue;
      }
      const workspaceRootUri = dirname(workspaceFolder.uri);
      const workspaceFolderUri = extUri.resolvePath(workspaceRootUri, configuredLocation);
      if (result.has(workspaceFolderUri) === true) {
        continue;
      }
      if (workspaceFolderUri.fsPath.startsWith(workspaceFolder.uri.fsPath)) {
        result.add(workspaceFolderUri);
      }
    }
  }
  return [...result];
}, "toAbsoluteLocations");
export {
  PromptFilesLocator,
  firstNonGlobParent,
  isValidGlob
};
//# sourceMappingURL=promptFilesLocator.js.map
