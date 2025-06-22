var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { readHotReloadableExport } from "../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { derived, observableValue, recomputeInitiallyAndOnChange } from "../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import "./colors.js";
import { DiffEditorItemTemplate } from "./diffEditorItemTemplate.js";
import { MultiDiffEditorViewModel } from "./multiDiffEditorViewModel.js";
import { MultiDiffEditorWidgetImpl } from "./multiDiffEditorWidgetImpl.js";
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
let MultiDiffEditorWidget = class MultiDiffEditorWidget2 extends Disposable {
  static {
    __name(this, "MultiDiffEditorWidget");
  }
  constructor(_element, _workbenchUIElementFactory, _instantiationService) {
    super();
    this._element = _element;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._instantiationService = _instantiationService;
    this._dimension = observableValue(this, void 0);
    this._viewModel = observableValue(this, void 0);
    this._widgetImpl = derived(this, (reader) => {
      readHotReloadableExport(DiffEditorItemTemplate, reader);
      return reader.store.add(this._instantiationService.createInstance(readHotReloadableExport(MultiDiffEditorWidgetImpl, reader), this._element, this._dimension, this._viewModel, this._workbenchUIElementFactory));
    });
    this._activeControl = derived(this, (reader) => this._widgetImpl.read(reader).activeControl.read(reader));
    this.onDidChangeActiveControl = Event.fromObservableLight(this._activeControl);
    this._register(recomputeInitiallyAndOnChange(this._widgetImpl));
  }
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
  getActiveControl() {
    return this._activeControl.get();
  }
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
MultiDiffEditorWidget = __decorate([
  __param(2, IInstantiationService)
], MultiDiffEditorWidget);
export {
  MultiDiffEditorWidget
};
//# sourceMappingURL=multiDiffEditorWidget.js.map
