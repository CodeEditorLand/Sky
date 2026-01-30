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
var MultiDiffEditor_1;
import * as DOM from "../../../../base/browser/dom.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { MultiDiffEditorWidget } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { FloatingClickMenu } from "../../../../platform/actions/browser/floatingMenu.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ResourceLabel } from "../../../browser/labels.js";
import { AbstractEditorWithViewState } from "../../../browser/parts/editor/editorWithViewState.js";
import { MultiDiffEditorInput } from "./multiDiffEditorInput.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { ResourceContextKey } from "../../../common/contextkeys.js";
let MultiDiffEditor = class MultiDiffEditor2 extends AbstractEditorWithViewState {
  static {
    __name(this, "MultiDiffEditor");
  }
  static {
    MultiDiffEditor_1 = this;
  }
  static {
    this.ID = "multiDiffEditor";
  }
  get viewModel() {
    return this._viewModel;
  }
  constructor(group, instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService, editorProgressService, menuService) {
    super(MultiDiffEditor_1.ID, group, "multiDiffEditor", telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
    this.editorProgressService = editorProgressService;
    this.menuService = menuService;
    this._multiDiffEditorWidget = void 0;
  }
  createEditor(parent) {
    this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(MultiDiffEditorWidget, parent, this.instantiationService.createInstance(WorkbenchUIElementFactory)));
    this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
      this._onDidChangeControl.fire();
    }));
    const scopedContextKeyService = this._multiDiffEditorWidget.getContextKeyService();
    const scopedInstantiationService = this._multiDiffEditorWidget.getScopedInstantiationService();
    this._sessionResourceContextKey = this._register(scopedInstantiationService.createInstance(ResourceContextKey));
    this._contentOverlay = this._register(new MultiDiffEditorContentMenuOverlay(this._multiDiffEditorWidget.getRootElement(), this._sessionResourceContextKey, scopedContextKeyService, this.menuService, scopedInstantiationService));
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this._viewModel = await input.getViewModel();
    this._sessionResourceContextKey?.set(input.resource);
    this._contentOverlay?.updateResource(input.resource);
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
    this._sessionResourceContextKey?.set(null);
    this._contentOverlay?.updateResource(void 0);
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
  goToNextChange() {
    this._multiDiffEditorWidget?.goToNextChange();
  }
  goToPreviousChange() {
    this._multiDiffEditorWidget?.goToPreviousChange();
  }
  async showWhile(promise) {
    return this.editorProgressService.showWhile(promise);
  }
};
MultiDiffEditor = MultiDiffEditor_1 = __decorate([
  __param(1, IInstantiationService),
  __param(2, ITelemetryService),
  __param(3, IThemeService),
  __param(4, IStorageService),
  __param(5, IEditorService),
  __param(6, IEditorGroupsService),
  __param(7, ITextResourceConfigurationService),
  __param(8, IEditorProgressService),
  __param(9, IMenuService)
], MultiDiffEditor);
class MultiDiffEditorContentMenuOverlay extends Disposable {
  static {
    __name(this, "MultiDiffEditorContentMenuOverlay");
  }
  constructor(root, resourceContextKey, contextKeyService, menuService, instantiationService) {
    super();
    this.overlayStore = this._register(new MutableDisposable());
    this.resourceContextKey = resourceContextKey;
    const menu = this._register(menuService.createMenu(MenuId.MultiDiffEditorContent, contextKeyService));
    this.rebuild = () => {
      this.overlayStore.clear();
      const hasActions = menu.getActions().length > 0;
      if (!hasActions) {
        return;
      }
      const container = DOM.h("div.floating-menu-overlay-widget.multi-diff-root-floating-menu");
      root.appendChild(container.root);
      const floatingMenu = instantiationService.createInstance(FloatingClickMenu, {
        container: container.root,
        menuId: MenuId.MultiDiffEditorContent,
        getActionArg: /* @__PURE__ */ __name(() => this.currentResource, "getActionArg")
      });
      const store = new DisposableStore();
      store.add(floatingMenu);
      store.add(toDisposable(() => container.root.remove()));
      this.overlayStore.value = store;
    };
    this.rebuild();
    this._register(menu.onDidChange(() => {
      this.overlayStore.clear();
      this.rebuild();
    }));
    this._register(resourceContextKey);
  }
  updateResource(resource) {
    this.currentResource = resource;
    this.resourceContextKey.set(resource ?? null);
    this.overlayStore.clear();
    this.rebuild();
  }
}
let WorkbenchUIElementFactory = class WorkbenchUIElementFactory2 {
  static {
    __name(this, "WorkbenchUIElementFactory");
  }
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
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
WorkbenchUIElementFactory = __decorate([
  __param(0, IInstantiationService)
], WorkbenchUIElementFactory);
export {
  MultiDiffEditor
};
//# sourceMappingURL=multiDiffEditor.js.map
