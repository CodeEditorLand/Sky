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
import { AppResourcePath, FileAccess } from "../../../../base/common/network.js";
import { EDITOR_EXPERIMENTAL_PREFER_TREESITTER, ITreeSitterParserService, ITextModelTreeSitter, TreeUpdateEvent, ITreeSitterImporter, TREESITTER_ALLOWED_SUPPORT, ModelTreeUpdateEvent } from "../treeSitterParserService.js";
import { IModelService } from "../model.js";
import { Disposable, DisposableMap, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ITextModel } from "../../model.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { TextModelTreeSitter, TextModelTreeSitterItem } from "./textModelTreeSitter.js";
import { getModuleLocation, TreeSitterLanguages } from "./treeSitterLanguages.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
const EDITOR_TREESITTER_TELEMETRY = "editor.experimental.treeSitterTelemetry";
const FILENAME_TREESITTER_WASM = `tree-sitter.wasm`;
let TreeSitterTextModelService = class extends Disposable {
  constructor(_modelService, fileService, _configurationService, _environmentService, _treeSitterImporter, _instantiationService) {
    super();
    this._modelService = _modelService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._treeSitterImporter = _treeSitterImporter;
    this._instantiationService = _instantiationService;
    this._treeSitterLanguages = this._register(new TreeSitterLanguages(this._treeSitterImporter, fileService, this._environmentService, this._registeredLanguages));
    this.onDidAddLanguage = this._treeSitterLanguages.onDidAddLanguage;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
        this._supportedLanguagesChanged();
      }
    }));
    this._supportedLanguagesChanged();
  }
  static {
    __name(this, "TreeSitterTextModelService");
  }
  _serviceBrand;
  _init;
  _textModelTreeSitters = this._register(new DisposableMap());
  _registeredLanguages = /* @__PURE__ */ new Map();
  _treeSitterLanguages;
  onDidAddLanguage;
  _onDidUpdateTree = this._register(new Emitter());
  onDidUpdateTree = this._onDidUpdateTree.event;
  isTest = false;
  getOrInitLanguage(languageId) {
    return this._treeSitterLanguages.getOrInitLanguage(languageId);
  }
  getParseResult(textModel) {
    const textModelTreeSitter = this._textModelTreeSitters.get(textModel);
    return textModelTreeSitter?.textModelTreeSitter;
  }
  /**
   * For testing
   */
  async getTree(content, languageId) {
    const language = await this.getLanguage(languageId);
    const Parser = await this._treeSitterImporter.getParserClass();
    if (language) {
      const parser = new Parser();
      parser.setLanguage(language);
      return parser.parse(content) ?? void 0;
    }
    return void 0;
  }
  getTreeSync(content, languageId) {
    const language = this.getOrInitLanguage(languageId);
    const Parser = this._treeSitterImporter.parserClass;
    if (language && Parser) {
      const parser = new Parser();
      parser.setLanguage(language);
      return parser.parse(content) ?? void 0;
    }
    return void 0;
  }
  async getLanguage(languageId) {
    await this._init;
    return this._treeSitterLanguages.getLanguage(languageId);
  }
  async _doInitParser() {
    const Parser = await this._treeSitterImporter.getParserClass();
    const environmentService = this._environmentService;
    const isTest = this.isTest;
    await Parser.init({
      locateFile(_file, _folder) {
        const location = `${getModuleLocation(environmentService)}/${FILENAME_TREESITTER_WASM}`;
        if (isTest) {
          return FileAccess.asFileUri(location).toString(true);
        } else {
          return FileAccess.asBrowserUri(location).toString(true);
        }
      }
    });
    return true;
  }
  _hasInit = false;
  async _initParser(hasLanguages) {
    if (this._hasInit) {
      return this._init;
    }
    if (hasLanguages) {
      this._hasInit = true;
      this._init = this._doInitParser();
      this._init.then(() => this._registerModelServiceListeners());
    } else {
      this._init = Promise.resolve(false);
    }
    return this._init;
  }
  async _supportedLanguagesChanged() {
    let hasLanguages = false;
    const handleLanguage = /* @__PURE__ */ __name((languageId) => {
      if (this._getSetting(languageId)) {
        hasLanguages = true;
        this._addGrammar(languageId, `tree-sitter-${languageId}`);
      } else {
        this._removeGrammar(languageId);
      }
    }, "handleLanguage");
    for (const languageId of TREESITTER_ALLOWED_SUPPORT) {
      handleLanguage(languageId);
    }
    return this._initParser(hasLanguages);
  }
  _getSetting(languageId) {
    const setting = this._configurationService.getValue(`${EDITOR_EXPERIMENTAL_PREFER_TREESITTER}.${languageId}`);
    if (!setting && TREESITTER_ALLOWED_SUPPORT.includes(languageId)) {
      return this._configurationService.getValue(EDITOR_TREESITTER_TELEMETRY);
    }
    return setting;
  }
  async _registerModelServiceListeners() {
    this._register(this._modelService.onModelAdded((model) => {
      this._createTextModelTreeSitter(model);
    }));
    this._register(this._modelService.onModelRemoved((model) => {
      this._textModelTreeSitters.deleteAndDispose(model);
    }));
    this._modelService.getModels().forEach((model) => this._createTextModelTreeSitter(model));
  }
  async getTextModelTreeSitter(model, parseImmediately = false) {
    await this.getLanguage(model.getLanguageId());
    return this._createTextModelTreeSitter(model, parseImmediately);
  }
  _createTextModelTreeSitter(model, parseImmediately = true) {
    const textModelTreeSitter = this._instantiationService.createInstance(TextModelTreeSitter, model, this._treeSitterLanguages, parseImmediately);
    const disposables = new DisposableStore();
    disposables.add(textModelTreeSitter);
    disposables.add(textModelTreeSitter.onDidChangeParseResult((e) => this._handleOnDidChangeParseResult(e, model)));
    this._textModelTreeSitters.set(model, {
      textModelTreeSitter,
      disposables,
      dispose: disposables.dispose.bind(disposables)
    });
    return textModelTreeSitter;
  }
  _handleOnDidChangeParseResult(change, model) {
    this._onDidUpdateTree.fire({ textModel: model, ranges: change.ranges, versionId: change.versionId, tree: change.tree, languageId: change.languageId, hasInjections: change.hasInjections });
  }
  _addGrammar(languageId, grammarName) {
    if (!this._registeredLanguages.has(languageId)) {
      this._registeredLanguages.set(languageId, grammarName);
    }
  }
  _removeGrammar(languageId) {
    if (this._registeredLanguages.has(languageId)) {
      this._registeredLanguages.delete(languageId);
    }
  }
};
TreeSitterTextModelService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, ITreeSitterImporter),
  __decorateParam(5, IInstantiationService)
], TreeSitterTextModelService);
export {
  TreeSitterTextModelService
};
//# sourceMappingURL=treeSitterParserService.js.map
