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
import { isAbsolute } from "../../../../../../base/common/path.js";
import { ResourceSet } from "../../../../../../base/common/map.js";
import * as nls from "../../../../../../nls.js";
import { FileOperationError, IFileService } from "../../../../../../platform/files/common/files.js";
import { getPromptFileLocationsConfigKey, isTildePath, PromptsConfig } from "../config/config.js";
import { basename, dirname, isEqualOrParent, joinPath } from "../../../../../../base/common/resources.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { COPILOT_CUSTOM_INSTRUCTIONS_FILENAME, AGENTS_SOURCE_FOLDER, getPromptFileExtension, getPromptFileType, LEGACY_MODE_FILE_EXTENSION, getCleanPromptName, AGENT_FILE_EXTENSION, getPromptFileDefaultLocations, SKILL_FILENAME, PromptFileSource, isInClaudeRulesFolder } from "../config/promptFileLocations.js";
import { PromptsType } from "../promptTypes.js";
import { IWorkbenchEnvironmentService } from "../../../../../services/environment/common/environmentService.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { getExcludes, ISearchService } from "../../../../../services/search/common/search.js";
import { isCancellationError } from "../../../../../../base/common/errors.js";
import { AgentFileType, PromptsStorage } from "../service/promptsService.js";
import { IUserDataProfileService } from "../../../../../services/userDataProfile/common/userDataProfile.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { IPathService } from "../../../../../services/path/common/pathService.js";
let PromptFilesLocator = class PromptFilesLocator2 {
  static {
    __name(this, "PromptFilesLocator");
  }
  constructor(fileService, configService, workspaceService, environmentService, searchService, userDataService, logService, pathService) {
    this.fileService = fileService;
    this.configService = configService;
    this.workspaceService = workspaceService;
    this.environmentService = environmentService;
    this.searchService = searchService;
    this.userDataService = userDataService;
    this.logService = logService;
    this.pathService = pathService;
  }
  getWorkspaceFolders() {
    return this.workspaceService.getWorkspace().folders;
  }
  getWorkspaceFolder(resource) {
    return this.workspaceService.getWorkspaceFolder(resource) ?? void 0;
  }
  onDidChangeWorkspaceFolders() {
    return Event.map(this.workspaceService.onDidChangeWorkspaceFolders, () => void 0);
  }
  /**
   * List all prompt files from the filesystem.
   *
   * @returns List of prompt files found in the workspace.
   */
  async listFiles(type, storage, token) {
    if (storage === PromptsStorage.local) {
      return await this.listFilesInLocal(type, token);
    } else if (storage === PromptsStorage.user) {
      return await this.listFilesInUserData(type, token);
    }
    throw new Error(`Unsupported prompt file storage: ${storage}`);
  }
  async listFilesInUserData(type, token) {
    const userStorageFolders = await this.getUserStorageFolders(type);
    const paths = new ResourceSet();
    for (const { uri } of userStorageFolders) {
      const files = await this.resolveFilesAtLocation(uri, type, token);
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
  /**
   * Gets all user storage folders for the given prompt type.
   * This includes configured tilde paths and the VS Code user data prompts folder.
   */
  async getUserStorageFolders(type) {
    const userHome = await this.pathService.userHome();
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const absoluteLocations = this.toAbsoluteLocations(type, configuredLocations, userHome);
    const result = absoluteLocations.filter((loc) => loc.storage === PromptsStorage.user);
    if (type === PromptsType.agent || type === PromptsType.instructions || type === PromptsType.prompt) {
      const userDataPromptsHome = this.userDataService.currentProfile.promptsHome;
      return [
        ...result,
        {
          uri: userDataPromptsHome,
          source: PromptFileSource.CopilotPersonal,
          storage: PromptsStorage.user,
          displayPath: nls.localize("promptsUserDataFolder", "User Data"),
          isDefault: true
        }
      ];
    }
    return result;
  }
  /**
   * Gets all source folder URIs for a prompt type (both workspace and user home).
   * This is used for file watching to detect changes in all relevant locations.
   */
  getSourceFoldersSync(type, userHome) {
    const result = [];
    const folders = this.getWorkspaceFolders();
    const defaultFileOrFolders = getPromptFileDefaultLocations(type);
    const getFolderUri = /* @__PURE__ */ __name((type2, fileOrFolderPath) => {
      if (type2 === PromptsType.hook && fileOrFolderPath.path.toLowerCase().endsWith(".json")) {
        return dirname(fileOrFolderPath);
      }
      return fileOrFolderPath;
    }, "getFolderUri");
    for (const sourceFileOrFolder of defaultFileOrFolders) {
      let fileOrFolderPath;
      if (sourceFileOrFolder.storage === PromptsStorage.local) {
        for (const workspaceFolder of folders) {
          fileOrFolderPath = joinPath(workspaceFolder.uri, sourceFileOrFolder.path);
          result.push(getFolderUri(type, fileOrFolderPath));
        }
      } else if (sourceFileOrFolder.storage === PromptsStorage.user) {
        const relativePath = isTildePath(sourceFileOrFolder.path) ? sourceFileOrFolder.path.substring(2) : sourceFileOrFolder.path;
        fileOrFolderPath = joinPath(userHome, relativePath);
        result.push(getFolderUri(type, fileOrFolderPath));
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
    let allSourceFolders = [];
    const externalFolderWatchers = disposables.add(new DisposableStore());
    const updateExternalFolderWatchers = /* @__PURE__ */ __name(() => {
      externalFolderWatchers.clear();
      for (const folder of parentFolders) {
        if (!this.getWorkspaceFolder(folder.parent)) {
          const recursive = folder.filePattern !== void 0;
          externalFolderWatchers.add(this.fileService.watch(folder.parent, { recursive, excludes: [] }));
        }
      }
      for (const folder of allSourceFolders) {
        if (!this.getWorkspaceFolder(folder)) {
          externalFolderWatchers.add(this.fileService.watch(folder, { recursive: true, excludes: [] }));
        }
      }
    }, "updateExternalFolderWatchers");
    this.pathService.userHome().then((userHome) => {
      allSourceFolders = [...this.getSourceFoldersSync(type, userHome)];
      updateExternalFolderWatchers();
    });
    disposables.add(this.configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(key)) {
        parentFolders = this.getLocalParentFolders(type);
        updateExternalFolderWatchers();
        eventEmitter.fire();
      }
    }));
    disposables.add(this.onDidChangeWorkspaceFolders()(() => {
      parentFolders = this.getLocalParentFolders(type);
      this.pathService.userHome().then((userHome) => {
        allSourceFolders = [...this.getSourceFoldersSync(type, userHome)];
        updateExternalFolderWatchers();
      });
      eventEmitter.fire();
    }));
    disposables.add(this.fileService.onDidFilesChange((e) => {
      if (e.affects(userDataFolder)) {
        eventEmitter.fire();
        return;
      }
      if (parentFolders.some((folder) => e.affects(folder.parent))) {
        eventEmitter.fire();
        return;
      }
      if (allSourceFolders.some((folder) => e.affects(folder))) {
        eventEmitter.fire();
        return;
      }
    }));
    disposables.add(this.fileService.watch(userDataFolder));
    return { event: eventEmitter.event, dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose") };
  }
  /**
   * Gets the hook source folders for creating new hooks.
   * Returns folders from config, excluding user storage and Claude paths (which are read-only).
   */
  async getHookSourceFolders() {
    const userHome = await this.pathService.userHome();
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, PromptsType.hook);
    const allowedHookFolders = configuredLocations.filter((loc) => !loc.path.startsWith(".claude/") && !loc.path.includes("/.claude/"));
    const result = new ResourceSet();
    const absoluteLocations = this.toAbsoluteLocations(PromptsType.hook, allowedHookFolders, userHome);
    for (const location of absoluteLocations) {
      const isSpecificFile = location.uri.path.endsWith(".json");
      if (isSpecificFile) {
        result.add(dirname(location.uri));
      } else {
        result.add(location.uri);
      }
    }
    return [...result];
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
  async getConfigBasedSourceFolders(type) {
    const userHome = await this.pathService.userHome();
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const absoluteLocations = this.toAbsoluteLocations(type, configuredLocations, userHome).map((l) => l.uri);
    if (type !== PromptsType.prompt && type !== PromptsType.instructions) {
      return absoluteLocations;
    }
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
   * Gets all resolved source folders for the given prompt type with metadata.
   * This method merges configured locations with default locations and resolves them
   * to absolute paths, including displayPath and isDefault information.
   *
   * The returned order prefers workspace (local) folders first, then user folders.
   * This is used for UX like the "Create Prompt" command where workspace is preferred.
   *
   * @param type The type of prompt files.
   * @returns List of resolved source folders with metadata.
   */
  async getResolvedSourceFolders(type) {
    const localFolders = await this.getLocalStorageFolders(type);
    const userFolders = await this.getUserStorageFolders(type);
    return this.dedupeSourceFolders([...localFolders, ...userFolders]);
  }
  /**
   * Gets all resolved source folders in the same order that file discovery
   * searches them (user folders first, then local/workspace folders).
   * This matches the order used by {@link listFiles} and should be used
   * for debug/diagnostic output so the displayed order is accurate.
   */
  async getSourceFoldersInDiscoveryOrder(type) {
    const userFolders = await this.getUserStorageFolders(type);
    const localFolders = await this.getLocalStorageFolders(type);
    return this.dedupeSourceFolders([...userFolders, ...localFolders]);
  }
  /**
   * Gets all local (workspace) storage folders for the given prompt type.
   * This merges default folders with configured locations.
   */
  async getLocalStorageFolders(type) {
    const userHome = await this.pathService.userHome();
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, type);
    const defaultFolders = getPromptFileDefaultLocations(type);
    const allFolders = [
      ...defaultFolders,
      ...configuredLocations.filter((loc) => !defaultFolders.some((df) => df.path === loc.path))
    ];
    return this.toAbsoluteLocations(type, allFolders, userHome, defaultFolders);
  }
  /**
   * Deduplicates source folders by URI.
   */
  dedupeSourceFolders(folders) {
    const seen = new ResourceSet();
    const result = [];
    for (const folder of folders) {
      if (!seen.has(folder.uri)) {
        seen.add(folder.uri);
        result.push(folder);
      }
    }
    return result;
  }
  /**
   * Finds all existent prompt files in the configured local source folders.
   *
   * @returns List of prompt files found in the local source folders.
   */
  async listFilesInLocal(type, token) {
    const paths = new ResourceSet();
    for (const { parent, filePattern } of this.getLocalParentFolders(type)) {
      const files = filePattern === void 0 ? await this.resolveFilesAtLocation(parent, type, token) : await this.searchFilesInLocation(parent, filePattern, token);
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
    const absoluteLocations = this.toAbsoluteLocations(type, configuredLocations, void 0);
    return absoluteLocations.map((location) => firstNonGlobParentAndPattern(location.uri));
  }
  /**
   * Converts locations defined in `settings` to absolute filesystem path URIs with metadata.
   * This conversion is needed because locations in settings can be relative,
   * hence we need to resolve them based on the current workspace folders.
   * If userHome is provided, paths starting with `~` will be expanded. Otherwise these paths are ignored.
   * Preserves the type and location properties from the source folder definitions.
   */
  toAbsoluteLocations(type, configuredLocations, userHome, defaultLocations) {
    const result = [];
    const seen = new ResourceSet();
    const folders = this.getWorkspaceFolders();
    const defaultPaths = new Set(defaultLocations?.map((loc) => loc.path));
    const validLocations = configuredLocations.filter((sourceFolder) => {
      if (type === PromptsType.instructions || type === PromptsType.prompt) {
        const path = sourceFolder.path;
        if (hasGlobPattern(path)) {
          if (type === PromptsType.prompt) {
            this.logService.warn(`[Deprecated] Glob patterns (* and **) in prompt file locations are deprecated: "${path}". Consider using explicit paths instead.`);
          } else if (type === PromptsType.instructions) {
            this.logService.info(`Glob patterns (* and **) detected in instruction file location: "${path}". Consider using explicit paths for better performance.`);
          }
        }
        return true;
      }
      const configuredLocation = sourceFolder.path;
      if (!isValidPromptFolderPath(configuredLocation)) {
        this.logService.warn(`Skipping invalid path (glob patterns and absolute paths not supported): ${configuredLocation}`);
        return false;
      }
      return true;
    });
    for (const sourceFolder of validLocations) {
      const configuredLocation = sourceFolder.path;
      const isDefault = defaultPaths?.has(configuredLocation);
      try {
        if (isTildePath(configuredLocation)) {
          if (userHome) {
            const uri = joinPath(userHome, configuredLocation.substring(2));
            if (!seen.has(uri)) {
              seen.add(uri);
              result.push({ uri, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
            }
          }
          continue;
        }
        if (isAbsolute(configuredLocation)) {
          let uri = URI.file(configuredLocation);
          const remoteAuthority = this.environmentService.remoteAuthority;
          if (remoteAuthority) {
            uri = uri.with({ scheme: Schemas.vscodeRemote, authority: remoteAuthority });
          }
          if (!seen.has(uri)) {
            seen.add(uri);
            result.push({ uri, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
          }
        } else {
          for (const workspaceFolder of folders) {
            const absolutePath = joinPath(workspaceFolder.uri, configuredLocation);
            if (!seen.has(absolutePath)) {
              seen.add(absolutePath);
              result.push({ uri: absolutePath, source: sourceFolder.source, storage: sourceFolder.storage, displayPath: configuredLocation, isDefault });
            }
          }
        }
      } catch (error) {
        this.logService.error(`Failed to resolve prompt file location: ${configuredLocation}`, error);
      }
    }
    return result;
  }
  /**
   * Uses the file service to resolve the provided location and return either the file at the location of files in the directory.
   * For claude rules folders (.claude/rules), this searches recursively to support subdirectories.
   */
  async resolveFilesAtLocation(location, type, token) {
    if (type === PromptsType.skill) {
      return this.findAgentSkillsInFolder(location, token);
    }
    const recursive = type === PromptsType.instructions && isInClaudeRulesFolder(joinPath(location, "dummy.md"));
    try {
      const info = await this.fileService.resolve(location);
      if (token.isCancellationRequested) {
        return [];
      }
      if (info.isFile) {
        return [info.resource];
      } else if (info.isDirectory && info.children) {
        const result = [];
        for (const child of info.children) {
          if (child.isFile) {
            result.push(child.resource);
          } else if (recursive && child.isDirectory) {
            const subFiles = await this.resolveFilesAtLocation(child.resource, type, token);
            result.push(...subFiles);
          }
        }
        return result;
      }
    } catch (e) {
      if (e instanceof FileOperationError && e.fileOperationResult === 1) {
      } else {
        this.logService.error(`Failed to resolve files at location: ${location.toString()}`, e);
      }
    }
    return [];
  }
  /**
   * Uses the search service to find all files at the provided location.
   * Requires a FileSearchProvider to be available for the folder's scheme.
   */
  async searchFilesInLocation(folder, filePattern, token) {
    if (!this.searchService.schemeHasFileSearchProvider(folder.scheme)) {
      this.logService.warn(`[PromptFilesLocator] No FileSearchProvider available for scheme '${folder.scheme}'. Cannot search for pattern '${filePattern}' in ${folder.toString()}`);
      return [];
    }
    const disregardIgnoreFiles = this.configService.getValue("explorer.excludeGitIgnore");
    const workspaceRoot = this.getWorkspaceFolder(folder);
    const getExcludePattern = /* @__PURE__ */ __name((folder2) => getExcludes(this.configService.getValue({ resource: folder2 })) || {}, "getExcludePattern");
    const searchOptions = {
      folderQueries: [{ folder, disregardIgnoreFiles }],
      type: 1,
      shouldGlobMatchFilePattern: true,
      excludePattern: workspaceRoot ? getExcludePattern(workspaceRoot.uri) : void 0,
      ignoreGlobCase: true,
      sortByScore: true,
      filePattern
    };
    try {
      const searchResult = await this.searchService.fileSearch(searchOptions, token);
      if (token.isCancellationRequested) {
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
  async findCopilotInstructionsMDsInWorkspace(token) {
    const result = [];
    const folders = this.getWorkspaceFolders();
    for (const folder of folders) {
      const file = joinPath(folder.uri, `.github/` + COPILOT_CUSTOM_INSTRUCTIONS_FILENAME);
      try {
        const stat = await this.fileService.stat(file);
        if (stat.isFile) {
          const realPath = stat.isSymbolicLink ? await this.fileService.realpath(file) : void 0;
          result.push({ uri: file, realPath, type: AgentFileType.copilotInstructionsMd });
        }
      } catch (error) {
        this.logService.trace(`[PromptFilesLocator] Skipping copilot-instructions.md at ${file.toString()}: ${error}`);
      }
    }
    return result;
  }
  /**
   * Gets list of `AGENTS.md` files anywhere in the workspace.
   */
  async findAgentMDsInWorkspace(token) {
    const result = await Promise.all(this.getWorkspaceFolders().map((folder) => this.findAgentMDsInFolder(folder.uri, token)));
    return result.flat(1);
  }
  async findAgentMDsInFolder(folder, token) {
    if (this.searchService.schemeHasFileSearchProvider(folder.scheme)) {
      const disregardIgnoreFiles = this.configService.getValue("explorer.excludeGitIgnore");
      const getExcludePattern = /* @__PURE__ */ __name((folder2) => getExcludes(this.configService.getValue({ resource: folder2 })) || {}, "getExcludePattern");
      const searchOptions = {
        folderQueries: [{ folder, disregardIgnoreFiles }],
        type: 1,
        shouldGlobMatchFilePattern: true,
        excludePattern: getExcludePattern(folder),
        filePattern: "**/AGENTS.md",
        ignoreGlobCase: true
      };
      try {
        const searchResult = await this.searchService.fileSearch(searchOptions, token);
        if (token.isCancellationRequested) {
          return [];
        }
        const results = [];
        for (const r of searchResult.results) {
          const realPath = void 0;
          results.push({ uri: r.resource, realPath, type: AgentFileType.agentsMd });
        }
        return results;
      } catch (e) {
        if (!isCancellationError(e)) {
          throw e;
        }
      }
      return [];
    } else {
      return this.findAgentMDsUsingFileService(folder, token);
    }
  }
  /**
   * Recursively traverses a folder using the file service to find AGENTS.md files.
   * This is used as a fallback when no FileSearchProvider is available for the scheme.
   */
  async findAgentMDsUsingFileService(folder, token) {
    const result = [];
    const agentsMdFileName = "agents.md";
    const traverse = /* @__PURE__ */ __name(async (uri) => {
      if (token.isCancellationRequested) {
        return;
      }
      try {
        const stat = await this.fileService.resolve(uri);
        if (stat.isFile && stat.name.toLowerCase() === agentsMdFileName) {
          const realPath = stat.isSymbolicLink ? await this.fileService.realpath(stat.resource) : void 0;
          result.push({ uri: stat.resource, realPath, type: AgentFileType.agentsMd });
        } else if (stat.isDirectory && stat.children) {
          for (const child of stat.children) {
            await traverse(child.resource);
          }
        }
      } catch (error) {
        this.logService.trace(`[PromptFilesLocator] Error traversing ${uri.toString()}: ${error}`);
      }
    }, "traverse");
    await traverse(folder);
    return result;
  }
  /**
   * Gets list of files at the root workspace folder(s).
   */
  async findFilesInWorkspaceRoots(fileName, folder, type, token, result = []) {
    const folders = this.getWorkspaceFolders();
    if (folder) {
      return this.findFilesInRoots(folders.map((f) => joinPath(f.uri, folder)), fileName, type, token, result);
    }
    return this.findFilesInRoots(folders.map((f) => f.uri), fileName, type, token, result);
  }
  async findFilesInRoots(roots, fileName, type, token, result = []) {
    const fileNameLower = fileName.toLowerCase();
    const resolvedRoots = await this.fileService.resolveAll(roots.map((uri) => ({ resource: uri })));
    if (token.isCancellationRequested) {
      return result;
    }
    for (const root of resolvedRoots) {
      if (root.success && root.stat?.children) {
        const file = root.stat.children.find((c) => c.isFile && c.name.toLowerCase() === fileNameLower);
        if (file) {
          const realPath = file.isSymbolicLink ? await this.fileService.realpath(file.resource) : void 0;
          result.push({ uri: file.resource, realPath, type });
        }
      }
    }
    return result;
  }
  getAgentFileURIFromModeFile(oldURI) {
    if (oldURI.path.endsWith(LEGACY_MODE_FILE_EXTENSION)) {
      let newLocation;
      const workspaceFolder = this.getWorkspaceFolder(oldURI);
      if (workspaceFolder) {
        newLocation = joinPath(workspaceFolder.uri, AGENTS_SOURCE_FOLDER, getCleanPromptName(oldURI) + AGENT_FILE_EXTENSION);
      } else if (isEqualOrParent(oldURI, this.userDataService.currentProfile.promptsHome)) {
        newLocation = joinPath(this.userDataService.currentProfile.promptsHome, getCleanPromptName(oldURI) + AGENT_FILE_EXTENSION);
      }
      return newLocation;
    }
    return void 0;
  }
  async findAgentSkillsInFolder(uri, token) {
    try {
      const result = [];
      const stat = await this.fileService.resolve(uri);
      if (stat.isDirectory && stat.children) {
        for (const child of stat.children) {
          try {
            if (token.isCancellationRequested) {
              return [];
            }
            if (child.isDirectory) {
              const skillFile = joinPath(child.resource, SKILL_FILENAME);
              const skillStat = await this.fileService.resolve(skillFile);
              if (skillStat.isFile) {
                result.push(skillStat.resource);
              }
            }
          } catch (error) {
          }
        }
      }
      return result;
    } catch (e) {
      if (!isCancellationError(e)) {
        this.logService.trace(`[PromptFilesLocator] Error searching for skills in ${uri.toString()}: ${e}`);
      }
      return [];
    }
  }
  /**
   * Searches for skills in all configured locations.
   */
  async findAgentSkills(token) {
    const userHome = await this.pathService.userHome();
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService, PromptsType.skill);
    const absoluteLocations = this.toAbsoluteLocations(PromptsType.skill, configuredLocations, userHome);
    const allResults = [];
    for (const { uri, source, storage } of absoluteLocations) {
      if (token.isCancellationRequested) {
        return [];
      }
      const results = await this.findAgentSkillsInFolder(uri, token);
      allResults.push(...results.map((uri2) => ({ fileUri: uri2, source, storage })));
    }
    return allResults;
  }
};
PromptFilesLocator = __decorate([
  __param(0, IFileService),
  __param(1, IConfigurationService),
  __param(2, IWorkspaceContextService),
  __param(3, IWorkbenchEnvironmentService),
  __param(4, ISearchService),
  __param(5, IUserDataProfileService),
  __param(6, ILogService),
  __param(7, IPathService)
], PromptFilesLocator);
function hasGlobPattern(path) {
  return path.includes("*");
}
__name(hasGlobPattern, "hasGlobPattern");
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
const VALID_PROMPT_FOLDER_PATTERN = "^(?![A-Za-z]:[\\\\/])(?!/)(?!~(?!/))(?!.*\\\\)(?!.*[*?\\[\\]{}]).*\\S.*$";
const VALID_PROMPT_FOLDER_REGEX = new RegExp(VALID_PROMPT_FOLDER_PATTERN);
function isValidPromptFolderPath(path) {
  return VALID_PROMPT_FOLDER_REGEX.test(path);
}
__name(isValidPromptFolderPath, "isValidPromptFolderPath");
export {
  PromptFilesLocator,
  VALID_PROMPT_FOLDER_PATTERN,
  hasGlobPattern,
  isValidGlob,
  isValidPromptFolderPath
};
//# sourceMappingURL=promptFilesLocator.js.map
