var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalCompletionItemKind } from "./terminalCompletionItem.js";
import { env as processEnv } from "../../../../../base/common/process.js";
import { timeout } from "../../../../../base/common/async.js";
import { gitBashToWindowsPath } from "./terminalGitBashHelpers.js";
import { isEqual } from "../../../../../base/common/resources.js";
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
const ITerminalCompletionService = createDecorator("terminalCompletionService");
class TerminalCompletionList {
  static {
    __name(this, "TerminalCompletionList");
  }
  /**
   * Creates a new completion list.
   *
   * @param items The completion items.
   * @param isIncomplete The list is not complete.
   */
  constructor(items, resourceRequestConfig) {
    this.items = items;
    this.resourceRequestConfig = resourceRequestConfig;
  }
}
let TerminalCompletionService = class TerminalCompletionService2 extends Disposable {
  static {
    __name(this, "TerminalCompletionService");
  }
  get providers() {
    return this._providersGenerator();
  }
  *_providersGenerator() {
    for (const providerMap of this._providers.values()) {
      for (const provider of providerMap.values()) {
        yield provider;
      }
    }
  }
  /** Overrides the environment for testing purposes. */
  set processEnv(env) {
    this._processEnv = env;
  }
  constructor(_configurationService, _fileService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._providers = /* @__PURE__ */ new Map();
    this._processEnv = processEnv;
  }
  registerTerminalCompletionProvider(extensionIdentifier, id, provider, ...triggerCharacters) {
    let extMap = this._providers.get(extensionIdentifier);
    if (!extMap) {
      extMap = /* @__PURE__ */ new Map();
      this._providers.set(extensionIdentifier, extMap);
    }
    provider.triggerCharacters = triggerCharacters;
    provider.id = id;
    extMap.set(id, provider);
    return toDisposable(() => {
      const extMap2 = this._providers.get(extensionIdentifier);
      if (extMap2) {
        extMap2.delete(id);
        if (extMap2.size === 0) {
          this._providers.delete(extensionIdentifier);
        }
      }
    });
  }
  async provideCompletions(promptValue, cursorPosition, allowFallbackCompletions, shellType, capabilities, token, triggerCharacter, skipExtensionCompletions, explicitlyInvoked) {
    if (!this._providers || !this._providers.values || cursorPosition < 0) {
      return void 0;
    }
    let providers;
    if (triggerCharacter) {
      const providersToRequest = [];
      for (const provider of this.providers) {
        if (!provider.triggerCharacters) {
          continue;
        }
        for (const char of provider.triggerCharacters) {
          if (promptValue.substring(0, cursorPosition)?.endsWith(char)) {
            providersToRequest.push(provider);
            break;
          }
        }
      }
      providers = providersToRequest;
    } else {
      providers = [...this._providers.values()].flatMap((providerMap) => [...providerMap.values()]);
    }
    if (skipExtensionCompletions) {
      providers = providers.filter((p) => p.isBuiltin);
      return this._collectCompletions(providers, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked);
    }
    const providerConfig = this._configurationService.getValue(
      "terminal.integrated.suggest.providers"
      /* TerminalSuggestSettingId.Providers */
    );
    providers = providers.filter((p) => {
      const providerId = p.id;
      return providerId && providerId in providerConfig && providerConfig[providerId] !== false;
    });
    if (!providers.length) {
      return;
    }
    return this._collectCompletions(providers, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked);
  }
  async _collectCompletions(providers, shellType, promptValue, cursorPosition, allowFallbackCompletions, capabilities, token, explicitlyInvoked) {
    const completionPromises = providers.map(async (provider) => {
      if (provider.shellTypes && !provider.shellTypes.includes(shellType)) {
        return void 0;
      }
      const timeoutMs = explicitlyInvoked ? 3e4 : 5e3;
      const completions = await Promise.race([
        provider.provideCompletions(promptValue, cursorPosition, allowFallbackCompletions, token),
        timeout(timeoutMs)
      ]);
      if (!completions) {
        return void 0;
      }
      const completionItems = Array.isArray(completions) ? completions : completions.items ?? [];
      if (shellType === "pwsh") {
        for (const completion of completionItems) {
          completion.isFileOverride ??= completion.kind === TerminalCompletionItemKind.Method && completion.replacementIndex === 0;
        }
      }
      if (provider.isBuiltin) {
        for (const item of completionItems) {
          item.provider ??= provider.id;
        }
      }
      if (Array.isArray(completions)) {
        return completionItems;
      }
      if (completions.resourceRequestConfig) {
        const resourceCompletions = await this.resolveResources(completions.resourceRequestConfig, promptValue, cursorPosition, provider.id, capabilities, shellType);
        if (resourceCompletions) {
          for (const item of resourceCompletions) {
            const labels = new Set(completionItems.map((c) => c.label));
            if (!labels.has(item.label)) {
              completionItems.push(item);
            }
          }
        }
      }
      return completionItems;
    });
    const results = await Promise.all(completionPromises);
    return results.filter((result) => !!result).flat();
  }
  async resolveResources(resourceRequestConfig, promptValue, cursorPosition, provider, capabilities, shellType) {
    const useWindowsStylePath = resourceRequestConfig.pathSeparator === "\\";
    if (useWindowsStylePath) {
      promptValue = promptValue.replaceAll(/[\\/]/g, resourceRequestConfig.pathSeparator);
    }
    const foldersRequested = (resourceRequestConfig.foldersRequested || resourceRequestConfig.filesRequested) ?? false;
    const filesRequested = resourceRequestConfig.filesRequested ?? false;
    const fileExtensions = resourceRequestConfig.fileExtensions ?? void 0;
    const cwd = URI.revive(resourceRequestConfig.cwd);
    if (!cwd || !foldersRequested && !filesRequested) {
      return;
    }
    const resourceCompletions = [];
    const cursorPrefix = promptValue.substring(0, cursorPosition);
    const lastWord = cursorPrefix.endsWith(" ") ? "" : cursorPrefix.split(/(?<!\\) /).at(-1) ?? "";
    let lastSlashIndex;
    if (useWindowsStylePath) {
      let lastBackslashIndex = -1;
      for (let i = lastWord.length - 1; i >= 0; i--) {
        if (lastWord[i] === "\\") {
          if (i === lastWord.length - 1 || lastWord[i + 1] !== " ") {
            lastBackslashIndex = i;
            break;
          }
        }
      }
      lastSlashIndex = Math.max(lastBackslashIndex, lastWord.lastIndexOf("/"));
    } else {
      lastSlashIndex = lastWord.lastIndexOf(resourceRequestConfig.pathSeparator);
    }
    let lastWordFolder = lastSlashIndex === -1 ? "" : lastWord.slice(0, lastSlashIndex + 1);
    if (useWindowsStylePath) {
      lastWordFolder = lastWordFolder.replaceAll("/", "\\");
    }
    let lastWordFolderResource;
    const lastWordFolderHasDotPrefix = !!lastWordFolder.match(/^\.\.?[\\\/]/);
    const lastWordFolderHasTildePrefix = !!lastWordFolder.match(/^~[\\\/]?/);
    const isAbsolutePath = useWindowsStylePath ? /^[a-zA-Z]:[\\\/]/.test(lastWord) : lastWord.startsWith(resourceRequestConfig.pathSeparator);
    const type = lastWordFolderHasTildePrefix ? "tilde" : isAbsolutePath ? "absolute" : "relative";
    switch (type) {
      case "tilde": {
        const home = this._getHomeDir(useWindowsStylePath, capabilities);
        if (home) {
          lastWordFolderResource = URI.joinPath(URI.file(home), lastWordFolder.slice(1).replaceAll("\\ ", " "));
        }
        if (!lastWordFolderResource) {
          if (lastWord.match(/^~[\\\/]$/)) {
            lastWordFolderResource = useWindowsStylePath ? "Home directory" : "$HOME";
          }
        }
        break;
      }
      case "absolute": {
        if (shellType === "gitbash") {
          lastWordFolderResource = URI.file(gitBashToWindowsPath(lastWordFolder, this._processEnv.SystemDrive));
        } else {
          lastWordFolderResource = URI.file(lastWordFolder.replaceAll("\\ ", " "));
        }
        break;
      }
      case "relative": {
        lastWordFolderResource = cwd;
        break;
      }
    }
    if (!lastWordFolderResource) {
      return void 0;
    }
    if (typeof lastWordFolderResource === "string") {
      resourceCompletions.push({
        label: lastWordFolder,
        provider,
        kind: TerminalCompletionItemKind.Folder,
        detail: lastWordFolderResource,
        replacementIndex: cursorPosition - lastWord.length,
        replacementLength: lastWord.length
      });
      return resourceCompletions;
    }
    const stat = await this._fileService.resolve(lastWordFolderResource, { resolveSingleChildDescendants: true });
    if (!stat?.children) {
      return;
    }
    if (foldersRequested) {
      let label;
      switch (type) {
        case "tilde": {
          label = lastWordFolder;
          break;
        }
        case "absolute": {
          label = lastWordFolder;
          break;
        }
        case "relative": {
          label = ".";
          if (lastWordFolder.length > 0) {
            label = addPathRelativePrefix(lastWordFolder, resourceRequestConfig, lastWordFolderHasDotPrefix);
          }
          break;
        }
      }
      resourceCompletions.push({
        label,
        provider,
        kind: TerminalCompletionItemKind.Folder,
        detail: getFriendlyPath(lastWordFolderResource, resourceRequestConfig.pathSeparator, TerminalCompletionItemKind.Folder, shellType),
        replacementIndex: cursorPosition - lastWord.length,
        replacementLength: lastWord.length
      });
    }
    for (const child of stat.children) {
      let kind;
      let detail = void 0;
      if (foldersRequested && child.isDirectory) {
        if (child.isSymbolicLink) {
          kind = TerminalCompletionItemKind.SymbolicLinkFolder;
        } else {
          kind = TerminalCompletionItemKind.Folder;
        }
      } else if (filesRequested && child.isFile) {
        if (child.isSymbolicLink) {
          kind = TerminalCompletionItemKind.SymbolicLinkFile;
        } else {
          kind = TerminalCompletionItemKind.File;
        }
      }
      if (kind === void 0) {
        continue;
      }
      let label = lastWordFolder;
      if (label.length > 0 && !label.endsWith(resourceRequestConfig.pathSeparator)) {
        label += resourceRequestConfig.pathSeparator;
      }
      label += child.name;
      if (type === "relative") {
        label = addPathRelativePrefix(label, resourceRequestConfig, lastWordFolderHasDotPrefix);
      }
      if (child.isDirectory && !label.endsWith(resourceRequestConfig.pathSeparator)) {
        label += resourceRequestConfig.pathSeparator;
      }
      if (child.isFile && fileExtensions) {
        const extension = child.name.split(".").length > 1 ? child.name.split(".").at(-1) : void 0;
        if (extension && !fileExtensions.includes(extension)) {
          continue;
        }
      }
      if (child.isSymbolicLink) {
        try {
          const realpath = await this._fileService.realpath(child.resource);
          if (realpath && !isEqual(child.resource, realpath)) {
            detail = `${getFriendlyPath(child.resource, resourceRequestConfig.pathSeparator, kind, shellType)} -> ${getFriendlyPath(realpath, resourceRequestConfig.pathSeparator, kind, shellType)}`;
          }
        } catch (error) {
        }
      }
      resourceCompletions.push({
        label,
        provider,
        kind,
        detail: detail ?? getFriendlyPath(child.resource, resourceRequestConfig.pathSeparator, kind, shellType),
        replacementIndex: cursorPosition - lastWord.length,
        replacementLength: lastWord.length
      });
    }
    if (type === "relative" && foldersRequested) {
      if (promptValue.startsWith("cd ")) {
        const config = this._configurationService.getValue(
          "terminal.integrated.suggest.cdPath"
          /* TerminalSuggestSettingId.CdPath */
        );
        if (config === "absolute" || config === "relative") {
          const cdPath = this._getEnvVar("CDPATH", capabilities);
          if (cdPath) {
            const cdPathEntries = cdPath.split(useWindowsStylePath ? ";" : ":");
            for (const cdPathEntry of cdPathEntries) {
              try {
                const fileStat = await this._fileService.resolve(URI.file(cdPathEntry), { resolveSingleChildDescendants: true });
                if (fileStat?.children) {
                  for (const child of fileStat.children) {
                    if (!child.isDirectory) {
                      continue;
                    }
                    const useRelative = config === "relative";
                    const kind = TerminalCompletionItemKind.Folder;
                    const label = useRelative ? basename(child.resource.fsPath) : getFriendlyPath(child.resource, resourceRequestConfig.pathSeparator, kind, shellType);
                    const detail = useRelative ? `CDPATH ${getFriendlyPath(child.resource, resourceRequestConfig.pathSeparator, kind, shellType)}` : `CDPATH`;
                    resourceCompletions.push({
                      label,
                      provider,
                      kind,
                      detail,
                      replacementIndex: cursorPosition - lastWord.length,
                      replacementLength: lastWord.length
                    });
                  }
                }
              } catch {
              }
            }
          }
        }
      }
    }
    if (type === "relative" && foldersRequested) {
      let label = `..${resourceRequestConfig.pathSeparator}`;
      if (lastWordFolder.length > 0) {
        label = addPathRelativePrefix(lastWordFolder + label, resourceRequestConfig, lastWordFolderHasDotPrefix);
      }
      const parentDir = URI.joinPath(cwd, ".." + resourceRequestConfig.pathSeparator);
      resourceCompletions.push({
        label,
        provider,
        kind: TerminalCompletionItemKind.Folder,
        detail: getFriendlyPath(parentDir, resourceRequestConfig.pathSeparator, TerminalCompletionItemKind.Folder, shellType),
        replacementIndex: cursorPosition - lastWord.length,
        replacementLength: lastWord.length
      });
    }
    if (type === "relative" && !lastWordFolder.match(/[\\\/]/)) {
      let homeResource;
      const home = this._getHomeDir(useWindowsStylePath, capabilities);
      if (home) {
        homeResource = URI.joinPath(URI.file(home), lastWordFolder.slice(1).replaceAll("\\ ", " "));
      }
      if (!homeResource) {
        homeResource = useWindowsStylePath ? "Home directory" : "$HOME";
      }
      resourceCompletions.push({
        label: "~",
        provider,
        kind: TerminalCompletionItemKind.Folder,
        detail: typeof homeResource === "string" ? homeResource : getFriendlyPath(homeResource, resourceRequestConfig.pathSeparator, TerminalCompletionItemKind.Folder, shellType),
        replacementIndex: cursorPosition - lastWord.length,
        replacementLength: lastWord.length
      });
    }
    return resourceCompletions;
  }
  _getEnvVar(key, capabilities) {
    const env = capabilities.get(
      5
      /* TerminalCapability.ShellEnvDetection */
    )?.env?.value;
    if (env) {
      return env[key];
    }
    return this._processEnv[key];
  }
  _getHomeDir(useWindowsStylePath, capabilities) {
    return useWindowsStylePath ? this._getEnvVar("USERPROFILE", capabilities) : this._getEnvVar("HOME", capabilities);
  }
};
TerminalCompletionService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IFileService)
], TerminalCompletionService);
function getFriendlyPath(uri, pathSeparator, kind, shellType) {
  let path = uri.fsPath;
  const sep = shellType === "gitbash" ? "\\" : pathSeparator;
  if (kind === TerminalCompletionItemKind.Folder && !path.endsWith(sep)) {
    path += sep;
  }
  if (sep === "\\" && path.match(/^[a-zA-Z]:\\/)) {
    path = `${path[0].toUpperCase()}:${path.slice(2)}`;
  }
  return path;
}
__name(getFriendlyPath, "getFriendlyPath");
function addPathRelativePrefix(text, resourceRequestConfig, lastWordFolderHasDotPrefix) {
  if (!lastWordFolderHasDotPrefix) {
    if (text.startsWith(resourceRequestConfig.pathSeparator)) {
      return `.${text}`;
    }
    return `.${resourceRequestConfig.pathSeparator}${text}`;
  }
  return text;
}
__name(addPathRelativePrefix, "addPathRelativePrefix");
export {
  ITerminalCompletionService,
  TerminalCompletionList,
  TerminalCompletionService
};
//# sourceMappingURL=terminalCompletionService.js.map
