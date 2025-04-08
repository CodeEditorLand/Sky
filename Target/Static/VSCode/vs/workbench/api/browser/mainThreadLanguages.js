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
import { URI, UriComponents } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { MainThreadLanguagesShape, MainContext, ExtHostContext, ExtHostLanguagesShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IPosition } from "../../../editor/common/core/position.js";
import { IRange, Range } from "../../../editor/common/core/range.js";
import { StandardTokenType } from "../../../editor/common/encodedTokenAttributes.js";
import { ITextModelService } from "../../../editor/common/services/resolverService.js";
import { ILanguageStatus, ILanguageStatusService } from "../../services/languageStatus/common/languageStatusService.js";
import { DisposableMap, DisposableStore } from "../../../base/common/lifecycle.js";
let MainThreadLanguages = class {
  constructor(_extHostContext, _languageService, _modelService, _resolverService, _languageStatusService) {
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._resolverService = _resolverService;
    this._languageStatusService = _languageStatusService;
    this._proxy = _extHostContext.getProxy(ExtHostContext.ExtHostLanguages);
    this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
    this._disposables.add(_languageService.onDidChange((_) => {
      this._proxy.$acceptLanguageIds(_languageService.getRegisteredLanguageIds());
    }));
  }
  _disposables = new DisposableStore();
  _proxy;
  _status = new DisposableMap();
  dispose() {
    this._disposables.dispose();
    this._status.dispose();
  }
  async $changeLanguage(resource, languageId) {
    if (!this._languageService.isRegisteredLanguageId(languageId)) {
      return Promise.reject(new Error(`Unknown language id: ${languageId}`));
    }
    const uri = URI.revive(resource);
    const ref = await this._resolverService.createModelReference(uri);
    try {
      ref.object.textEditorModel.setLanguage(this._languageService.createById(languageId));
    } finally {
      ref.dispose();
    }
  }
  async $tokensAtPosition(resource, position) {
    const uri = URI.revive(resource);
    const model = this._modelService.getModel(uri);
    if (!model) {
      return void 0;
    }
    model.tokenization.tokenizeIfCheap(position.lineNumber);
    const tokens = model.tokenization.getLineTokens(position.lineNumber);
    const idx = tokens.findTokenIndexAtOffset(position.column - 1);
    return {
      type: tokens.getStandardTokenType(idx),
      range: new Range(position.lineNumber, 1 + tokens.getStartOffset(idx), position.lineNumber, 1 + tokens.getEndOffset(idx))
    };
  }
  // --- language status
  $setLanguageStatus(handle, status) {
    this._status.get(handle)?.dispose();
    this._status.set(handle, this._languageStatusService.addStatus(status));
  }
  $removeLanguageStatus(handle) {
    this._status.get(handle)?.dispose();
  }
};
__name(MainThreadLanguages, "MainThreadLanguages");
MainThreadLanguages = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguages),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, ILanguageStatusService)
], MainThreadLanguages);
export {
  MainThreadLanguages
};
//# sourceMappingURL=mainThreadLanguages.js.map
