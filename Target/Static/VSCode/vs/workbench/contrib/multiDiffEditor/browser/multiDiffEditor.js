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
import * as DOM from "../../../../base/browser/dom.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { MultiDiffEditorWidget } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js";
import { IResourceLabel, IWorkbenchUIElementFactory } from "../../../../editor/browser/widget/multiDiffEditor/workbenchUIElementFactory.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { InstantiationService } from "../../../../platform/instantiation/common/instantiationService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabel } from "../../../browser/labels.js";
import { AbstractEditorWithViewState } from "../../../browser/parts/editor/editorWithViewState.js";
import { ICompositeControl } from "../../../common/composite.js";
import { IEditorOpenContext } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IDocumentDiffItemWithMultiDiffEditorItem, MultiDiffEditorInput } from "./multiDiffEditorInput.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { URI } from "../../../../base/common/uri.js";
import { MultiDiffEditorViewModel } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js";
import { IMultiDiffEditorOptions, IMultiDiffEditorViewState } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IDiffEditor } from "../../../../editor/common/editorCommon.js";
import { Range } from "../../../../editor/common/core/range.js";
import { MultiDiffEditorItem } from "./multiDiffSourceResolverService.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
let MultiDiffEditor = class extends AbstractEditorWithViewState {
  constructor(group, instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService, editorProgressService) {
    super(
      MultiDiffEditor.ID,
      group,
      "multiDiffEditor",
      telemetryService,
      instantiationService,
      storageService,
      textResourceConfigurationService,
      themeService,
      editorService,
      editorGroupService
    );
    this.editorProgressService = editorProgressService;
  }
  static {
    __name(this, "MultiDiffEditor");
  }
  static ID = "multiDiffEditor";
  _multiDiffEditorWidget = void 0;
  _viewModel;
  get viewModel() {
    return this._viewModel;
  }
  createEditor(parent) {
    this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(
      MultiDiffEditorWidget,
      parent,
      this.instantiationService.createInstance(WorkbenchUIElementFactory)
    ));
    this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
      this._onDidChangeControl.fire();
    }));
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this._viewModel = await input.getViewModel();
    this._multiDiffEditorWidget.setViewModel(this._viewModel);
    const viewState = this.loadEditorViewState(input, context);
    if (viewState) {
      this._multiDiffEditorWidget.setViewState(viewState);
    }
    this._applyOptions(options);
  }
  setOptions(options) {
    this._applyOptions(options);
  }
  _applyOptions(options) {
    const viewState = options?.viewState;
    if (!viewState || !viewState.revealData) {
      return;
    }
    this._multiDiffEditorWidget?.reveal(viewState.revealData.resource, {
      range: viewState.revealData.range ? Range.lift(viewState.revealData.range) : void 0,
      highlight: true
    });
  }
  async clearInput() {
    await super.clearInput();
    this._multiDiffEditorWidget.setViewModel(void 0);
  }
  layout(dimension) {
    this._multiDiffEditorWidget.layout(dimension);
  }
  getControl() {
    return this._multiDiffEditorWidget.getActiveControl();
  }
  focus() {
    super.focus();
    this._multiDiffEditorWidget?.getActiveControl()?.focus();
  }
  hasFocus() {
    return this._multiDiffEditorWidget?.getActiveControl()?.hasTextFocus() || super.hasFocus();
  }
  computeEditorViewState(resource) {
    return this._multiDiffEditorWidget.getViewState();
  }
  tracksEditorViewState(input) {
    return input instanceof MultiDiffEditorInput;
  }
  toEditorViewStateResource(input) {
    return input.resource;
  }
  tryGetCodeEditor(resource) {
    return this._multiDiffEditorWidget.tryGetCodeEditor(resource);
  }
  findDocumentDiffItem(resource) {
    const i = this._multiDiffEditorWidget.findDocumentDiffItem(resource);
    if (!i) {
      return void 0;
    }
    const i2 = i;
    return i2.multiDiffEditorItem;
  }
  async showWhile(promise) {
    return this.editorProgressService.showWhile(promise);
  }
};
MultiDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, IEditorProgressService)
], MultiDiffEditor);
let WorkbenchUIElementFactory = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "WorkbenchUIElementFactory");
  }
  createResourceLabel(element) {
    const label = this._instantiationService.createInstance(ResourceLabel, element, {});
    return {
      setUri(uri, options = {}) {
        if (!uri) {
          label.element.clear();
        } else {
          label.element.setFile(uri, { strikethrough: options.strikethrough });
        }
      },
      dispose() {
        label.dispose();
      }
    };
  }
};
WorkbenchUIElementFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkbenchUIElementFactory);
export {
  MultiDiffEditor
};
//# sourceMappingURL=multiDiffEditor.js.map
