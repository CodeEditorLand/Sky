var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "../../../../base/common/network.js";
import { EDITOR_EXPERIMENTAL_PREFER_TREESITTER } from "../treeSitterParserService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { canASAR } from "../../../../amdX.js";
import { Emitter } from "../../../../base/common/event.js";
import { PromiseResult } from "../../../../base/common/observable.js";
const MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;
function getModuleLocation(environmentService) {
  return `${canASAR && environmentService.isBuilt ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}
__name(getModuleLocation, "getModuleLocation");
class TreeSitterLanguages extends Disposable {
  static {
    __name(this, "TreeSitterLanguages");
  }
  constructor(_treeSitterImporter, _fileService, _environmentService, configurationService, _registeredLanguages) {
    super();
    this._treeSitterImporter = _treeSitterImporter;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._registeredLanguages = _registeredLanguages;
    this._languages = new AsyncCache();
    this._onDidAddLanguage = this._register(new Emitter());
    this.onDidAddLanguage = this._onDidAddLanguage.event;
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
        for (const language of this._languages.keys()) {
          if (e.affectsConfiguration(`${EDITOR_EXPERIMENTAL_PREFER_TREESITTER}.${language}`)) {
            if (this._languages.getSyncIfCached(language) === void 0) {
              this._languages.delete(language);
            }
          }
        }
      }
    }));
  }
  getOrInitLanguage(languageId) {
    if (this._languages.isCached(languageId)) {
      return this._languages.getSyncIfCached(languageId);
    } else {
      this._addLanguage(languageId);
      return void 0;
    }
  }
  async getLanguage(languageId) {
    if (this._languages.isCached(languageId)) {
      return this._languages.getSyncIfCached(languageId);
    } else {
      await this._addLanguage(languageId);
      return this._languages.get(languageId);
    }
  }
  async _addLanguage(languageId) {
    const languagePromise = this._languages.get(languageId);
    if (!languagePromise) {
      this._languages.set(languageId, this._fetchLanguage(languageId));
      const language = await this._languages.get(languageId);
      if (!language) {
        return void 0;
      }
      this._onDidAddLanguage.fire({ id: languageId, language });
    }
  }
  async _fetchLanguage(languageId) {
    const grammarName = this._registeredLanguages.get(languageId);
    const languageLocation = this._getLanguageLocation(languageId);
    if (!grammarName || !languageLocation) {
      return void 0;
    }
    const wasmPath = `${languageLocation}/${grammarName}.wasm`;
    const languageFile = await this._fileService.readFile(FileAccess.asFileUri(wasmPath));
    const Language = await this._treeSitterImporter.getLanguageClass();
    return Language.load(languageFile.value.buffer);
  }
  _getLanguageLocation(languageId) {
    const grammarName = this._registeredLanguages.get(languageId);
    if (!grammarName) {
      return void 0;
    }
    return getModuleLocation(this._environmentService);
  }
}
class AsyncCache {
  static {
    __name(this, "AsyncCache");
  }
  constructor() {
    this._values = /* @__PURE__ */ new Map();
  }
  set(key, promise) {
    this._values.set(key, new PromiseWithSyncAccess(promise));
  }
  get(key) {
    return this._values.get(key)?.promise;
  }
  getSyncIfCached(key) {
    return this._values.get(key)?.result?.data;
  }
  isCached(key) {
    return this._values.get(key)?.result !== void 0;
  }
  delete(key) {
    return this._values.delete(key);
  }
  keys() {
    return this._values.keys();
  }
}
class PromiseWithSyncAccess {
  static {
    __name(this, "PromiseWithSyncAccess");
  }
  /**
   * Returns undefined if the promise did not resolve yet.
   */
  get result() {
    return this._result;
  }
  constructor(promise) {
    this.promise = promise;
    promise.then((result) => {
      this._result = new PromiseResult(result, void 0);
    }).catch((e) => {
      this._result = new PromiseResult(void 0, e);
    });
  }
}
export {
  MODULE_LOCATION_SUBPATH,
  TreeSitterLanguages,
  getModuleLocation
};
//# sourceMappingURL=treeSitterLanguages.js.map
