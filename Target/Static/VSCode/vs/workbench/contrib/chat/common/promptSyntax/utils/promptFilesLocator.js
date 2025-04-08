var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
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
import { isPromptFile, PROMPT_FILE_EXTENSION } from "../../../../../../platform/prompts/common/constants.js";
let PromptFilesLocator = class {
  constructor(fileService, configService, workspaceService) {
    this.fileService = fileService;
    this.configService = configService;
    this.workspaceService = workspaceService;
  }
  static {
    __name(this, "PromptFilesLocator");
  }
  /**
   * List all prompt files from the filesystem.
   *
   * @returns List of prompt files found in the workspace.
   */
  async listFiles() {
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService);
    const absoluteLocations = toAbsoluteLocations(configuredLocations, this.workspaceService);
    return await this.listFilesIn(absoluteLocations);
  }
  /**
   * Lists all prompt files in the provided folders.
   *
   * @throws if any of the provided folder paths is not an `absolute path`.
   *
   * @param absoluteLocations List of prompt file source folders to search for prompt files in. Must be absolute paths.
   * @returns List of prompt files found in the provided folders.
   */
  async listFilesIn(folders) {
    return await this.findInstructionFiles(folders);
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
  getConfigBasedSourceFolders() {
    const configuredLocations = PromptsConfig.promptSourceFolders(this.configService);
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
  async findInstructionFiles(absoluteLocations) {
    const paths = new ResourceSet();
    for (const absoluteLocation of absoluteLocations) {
      assert(
        isAbsolute(absoluteLocation.path),
        `Provided location must be an absolute path, got '${absoluteLocation.path}'.`
      );
      const location = isValidGlob(basename(absoluteLocation)) || absoluteLocation.path.endsWith(PROMPT_FILE_EXTENSION) ? absoluteLocation : extUri.joinPath(absoluteLocation, `*${PROMPT_FILE_EXTENSION}`);
      const promptFiles = await findAllPromptFiles(
        firstNonGlobParent(location),
        this.fileService
      );
      for (const file of promptFiles) {
        if (match(location.path, file.path)) {
          paths.add(file);
        }
      }
    }
    return [...paths];
  }
};
PromptFilesLocator = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceContextService)
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
  assert(
    isAbsolute(location.path),
    `Provided location must be an absolute path, got '${location.path}'.`
  );
  if (isValidGlob(location.path) === false) {
    return location;
  }
  const parent = dirname(location);
  if (extUri.isEqual(parent, location)) {
    return location;
  }
  return firstNonGlobParent(parent);
}, "firstNonGlobParent");
const findAllPromptFiles = /* @__PURE__ */ __name(async (location, fileService) => {
  const result = [];
  try {
    const info = await fileService.resolve(location);
    if (info.isFile && isPromptFile(info.resource)) {
      result.push(info.resource);
      return result;
    }
    if (info.isDirectory && info.children) {
      for (const child of info.children) {
        if (child.isFile && isPromptFile(child.resource)) {
          result.push(child.resource);
          continue;
        }
        if (child.isDirectory) {
          const promptFiles = await findAllPromptFiles(child.resource, fileService);
          result.push(...promptFiles);
          continue;
        }
      }
      return result;
    }
  } catch (error) {
  }
  return result;
}, "findAllPromptFiles");
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
      assert(
        isAbsolute(absolutePath.path),
        `Provided location must be an absolute path, got '${absolutePath.path}'.`
      );
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
