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
import { reverseOrder, compareBy, numberComparator } from "../../../../base/common/arrays.js";
import { observableValue, observableSignalFromEvent, autorunWithStore, IReader } from "../../../../base/common/observable.js";
import { HideUnchangedRegionsFeature, IDiffEditorBreadcrumbsSource } from "../../../browser/widget/diffEditor/features/hideUnchangedRegionsFeature.js";
import { DisposableCancellationTokenSource } from "../../../browser/widget/diffEditor/utils.js";
import { LineRange } from "../../../common/core/lineRange.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IOutlineModelService, OutlineModel } from "../../documentSymbols/browser/outlineModel.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Event } from "../../../../base/common/event.js";
import { SymbolKind } from "../../../common/languages.js";
let DiffEditorBreadcrumbsSource = class extends Disposable {
  constructor(_textModel, _languageFeaturesService, _outlineModelService) {
    super();
    this._textModel = _textModel;
    this._languageFeaturesService = _languageFeaturesService;
    this._outlineModelService = _outlineModelService;
    const documentSymbolProviderChanged = observableSignalFromEvent(
      "documentSymbolProvider.onDidChange",
      this._languageFeaturesService.documentSymbolProvider.onDidChange
    );
    const textModelChanged = observableSignalFromEvent(
      "_textModel.onDidChangeContent",
      Event.debounce((e) => this._textModel.onDidChangeContent(e), () => void 0, 100)
    );
    this._register(autorunWithStore(async (reader, store) => {
      documentSymbolProviderChanged.read(reader);
      textModelChanged.read(reader);
      const src = store.add(new DisposableCancellationTokenSource());
      const model = await this._outlineModelService.getOrCreate(this._textModel, src.token);
      if (store.isDisposed) {
        return;
      }
      this._currentModel.set(model, void 0);
    }));
  }
  static {
    __name(this, "DiffEditorBreadcrumbsSource");
  }
  _currentModel = observableValue(this, void 0);
  getBreadcrumbItems(startRange, reader) {
    const m = this._currentModel.read(reader);
    if (!m) {
      return [];
    }
    const symbols = m.asListOfDocumentSymbols().filter((s) => startRange.contains(s.range.startLineNumber) && !startRange.contains(s.range.endLineNumber));
    symbols.sort(reverseOrder(compareBy((s) => s.range.endLineNumber - s.range.startLineNumber, numberComparator)));
    return symbols.map((s) => ({ name: s.name, kind: s.kind, startLineNumber: s.range.startLineNumber }));
  }
};
DiffEditorBreadcrumbsSource = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IOutlineModelService)
], DiffEditorBreadcrumbsSource);
HideUnchangedRegionsFeature.setBreadcrumbsSourceFactory((textModel, instantiationService) => {
  return instantiationService.createInstance(DiffEditorBreadcrumbsSource, textModel);
});
//# sourceMappingURL=contribution.js.map
