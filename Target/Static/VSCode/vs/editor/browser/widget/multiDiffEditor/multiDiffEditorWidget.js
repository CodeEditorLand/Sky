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
import { Dimension } from "../../../../base/browser/dom.js";
import { Event } from "../../../../base/common/event.js";
import { readHotReloadableExport } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { derived, derivedWithStore, observableValue, recomputeInitiallyAndOnChange } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Range } from "../../../common/core/range.js";
import { IDiffEditor } from "../../../common/editorCommon.js";
import { ICodeEditor } from "../../editorBrowser.js";
import { DiffEditorWidget } from "../diffEditor/diffEditorWidget.js";
import "./colors.js";
import { DiffEditorItemTemplate } from "./diffEditorItemTemplate.js";
import { IDocumentDiffItem, IMultiDiffEditorModel } from "./model.js";
import { MultiDiffEditorViewModel } from "./multiDiffEditorViewModel.js";
import { IMultiDiffEditorViewState, IMultiDiffResourceId, MultiDiffEditorWidgetImpl } from "./multiDiffEditorWidgetImpl.js";
import { IWorkbenchUIElementFactory } from "./workbenchUIElementFactory.js";
let MultiDiffEditorWidget = class extends Disposable {
  constructor(_element, _workbenchUIElementFactory, _instantiationService) {
    super();
    this._element = _element;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._instantiationService = _instantiationService;
    this._register(recomputeInitiallyAndOnChange(this._widgetImpl));
  }
  static {
    __name(this, "MultiDiffEditorWidget");
  }
  _dimension = observableValue(this, void 0);
  _viewModel = observableValue(this, void 0);
  _widgetImpl = derivedWithStore(this, (reader, store) => {
    readHotReloadableExport(DiffEditorItemTemplate, reader);
    return store.add(this._instantiationService.createInstance(
      readHotReloadableExport(MultiDiffEditorWidgetImpl, reader),
      this._element,
      this._dimension,
      this._viewModel,
      this._workbenchUIElementFactory
    ));
  });
  reveal(resource, options) {
    this._widgetImpl.get().reveal(resource, options);
  }
  createViewModel(model) {
    return new MultiDiffEditorViewModel(model, this._instantiationService);
  }
  setViewModel(viewModel) {
    this._viewModel.set(viewModel, void 0);
  }
  layout(dimension) {
    this._dimension.set(dimension, void 0);
  }
  _activeControl = derived(this, (reader) => this._widgetImpl.read(reader).activeControl.read(reader));
  getActiveControl() {
    return this._activeControl.get();
  }
  onDidChangeActiveControl = Event.fromObservableLight(this._activeControl);
  getViewState() {
    return this._widgetImpl.get().getViewState();
  }
  setViewState(viewState) {
    this._widgetImpl.get().setViewState(viewState);
  }
  tryGetCodeEditor(resource) {
    return this._widgetImpl.get().tryGetCodeEditor(resource);
  }
  findDocumentDiffItem(resource) {
    return this._widgetImpl.get().findDocumentDiffItem(resource);
  }
};
MultiDiffEditorWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], MultiDiffEditorWidget);
export {
  MultiDiffEditorWidget
};
//# sourceMappingURL=multiDiffEditorWidget.js.map
