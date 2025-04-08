var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AppResourcePath, FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "../../../../base/common/network.js";
import { ITreeSitterImporter } from "../treeSitterParserService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { canASAR } from "../../../../amdX.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { PromiseResult } from "../../../../base/common/observable.js";
const MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;
function getModuleLocation(environmentService) {
  return `${canASAR && environmentService.isBuilt ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}
__name(getModuleLocation, "getModuleLocation");
class TreeSitterLanguages extends Disposable {
  constructor(_treeSitterImporter, _fileService, _environmentService, _registeredLanguages) {
    super();
    this._treeSitterImporter = _treeSitterImporter;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._registeredLanguages = _registeredLanguages;
  }
  static {
    __name(this, "TreeSitterLanguages");
  }
  _languages = new AsyncCache();
  _onDidAddLanguage = this._register(new Emitter());
  /**
   * If you're looking for a specific language, make sure to check if it already exists with `getLanguage` as it will kick off the process to add it if it doesn't exist.
   */
  onDidAddLanguage = this._onDidAddLanguage.event;
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
  _values = /* @__PURE__ */ new Map();
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
}
class PromiseWithSyncAccess {
  constructor(promise) {
    this.promise = promise;
    promise.then((result) => {
      this._result = new PromiseResult(result, void 0);
    }).catch((e) => {
      this._result = new PromiseResult(void 0, e);
    });
  }
  static {
    __name(this, "PromiseWithSyncAccess");
  }
  _result;
  /**
   * Returns undefined if the promise did not resolve yet.
   */
  get result() {
    return this._result;
  }
}
export {
  MODULE_LOCATION_SUBPATH,
  TreeSitterLanguages,
  getModuleLocation
};
//# sourceMappingURL=treeSitterLanguages.js.map
