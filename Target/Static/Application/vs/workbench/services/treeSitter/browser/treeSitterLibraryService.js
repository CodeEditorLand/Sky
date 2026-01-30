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
import { ObservablePromise } from "../../../../base/common/observable.js";
import { canASAR, importAMDNodeModule } from "../../../../amdX.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService, toFileOperationResult } from "../../../../platform/files/common/files.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { CachedFunction } from "../../../../base/common/cache.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "../../../../base/common/network.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
const EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";
const TREESITTER_ALLOWED_SUPPORT = ["css", "typescript", "ini", "regex"];
const MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;
const FILENAME_TREESITTER_WASM = `tree-sitter.wasm`;
function getModuleLocation(environmentService) {
  return `${canASAR && environmentService.isBuilt ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}
__name(getModuleLocation, "getModuleLocation");
let TreeSitterLibraryService = class TreeSitterLibraryService2 extends Disposable {
  static {
    __name(this, "TreeSitterLibraryService");
  }
  constructor(_configurationService, _fileService, _environmentService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this.isTest = false;
    this._treeSitterImport = new Lazy(async () => {
      const TreeSitter = await importAMDNodeModule("@vscode/tree-sitter-wasm", "wasm/tree-sitter.js");
      const environmentService = this._environmentService;
      const isTest = this.isTest;
      await TreeSitter.Parser.init({
        locateFile(_file, _folder) {
          const location = `${getModuleLocation(environmentService)}/${FILENAME_TREESITTER_WASM}`;
          if (isTest) {
            return FileAccess.asFileUri(location).toString(true);
          } else {
            return FileAccess.asBrowserUri(location).toString(true);
          }
        }
      });
      return TreeSitter;
    });
    this._supportsLanguage = new CachedFunction((languageId) => {
      return observableConfigValue(`${EDITOR_EXPERIMENTAL_PREFER_TREESITTER}.${languageId}`, false, this._configurationService);
    });
    this._languagesCache = new CachedFunction((languageId) => {
      return ObservablePromise.fromFn(async () => {
        const languageLocation = getModuleLocation(this._environmentService);
        const grammarName = `tree-sitter-${languageId}`;
        const wasmPath = `${languageLocation}/${grammarName}.wasm`;
        const [treeSitter, languageFile] = await Promise.all([
          this._treeSitterImport.value,
          this._fileService.readFile(FileAccess.asFileUri(wasmPath))
        ]);
        const Language = treeSitter.Language;
        const language = await Language.load(languageFile.value.buffer);
        return language;
      });
    });
    this._injectionQueries = new CachedFunction({ getCacheKey: JSON.stringify }, (arg) => {
      const loadQuerySource = /* @__PURE__ */ __name(async () => {
        const injectionsQueriesLocation = `vs/editor/common/languages/${arg.kind}/${arg.languageId}.scm`;
        const uri = FileAccess.asFileUri(injectionsQueriesLocation);
        if (!this._fileService.hasProvider(uri)) {
          return void 0;
        }
        const query = await tryReadFile(this._fileService, uri);
        if (query === void 0) {
          return void 0;
        }
        return query.value.toString();
      }, "loadQuerySource");
      return ObservablePromise.fromFn(async () => {
        const [querySource, language, treeSitter] = await Promise.all([
          loadQuerySource(),
          this._languagesCache.get(arg.languageId).promise,
          this._treeSitterImport.value
        ]);
        if (querySource === void 0) {
          return null;
        }
        const Query = treeSitter.Query;
        return new Query(language, querySource);
      }).resolvedValue;
    });
  }
  supportsLanguage(languageId, reader) {
    return this._supportsLanguage.get(languageId).read(reader);
  }
  async getParserClass() {
    const treeSitter = await this._treeSitterImport.value;
    return treeSitter.Parser;
  }
  getLanguage(languageId, ignoreSupportsCheck, reader) {
    if (!ignoreSupportsCheck && !this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const lang = this._languagesCache.get(languageId).resolvedValue.read(reader);
    return lang;
  }
  async getLanguagePromise(languageId) {
    return this._languagesCache.get(languageId).promise;
  }
  getInjectionQueries(languageId, reader) {
    if (!this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const query = this._injectionQueries.get({ languageId, kind: "injections" }).read(reader);
    return query;
  }
  getHighlightingQueries(languageId, reader) {
    if (!this.supportsLanguage(languageId, reader)) {
      return void 0;
    }
    const query = this._injectionQueries.get({ languageId, kind: "highlights" }).read(reader);
    return query;
  }
  async createQuery(language, querySource) {
    const treeSitter = await this._treeSitterImport.value;
    return new treeSitter.Query(language, querySource);
  }
};
TreeSitterLibraryService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IFileService),
  __param(2, IEnvironmentService)
], TreeSitterLibraryService);
async function tryReadFile(fileService, uri) {
  try {
    const result = await fileService.readFile(uri);
    return result;
  } catch (e) {
    if (toFileOperationResult(e) === 1) {
      return void 0;
    }
    throw e;
  }
}
__name(tryReadFile, "tryReadFile");
export {
  EDITOR_EXPERIMENTAL_PREFER_TREESITTER,
  TREESITTER_ALLOWED_SUPPORT,
  TreeSitterLibraryService,
  getModuleLocation
};
//# sourceMappingURL=treeSitterLibraryService.js.map
