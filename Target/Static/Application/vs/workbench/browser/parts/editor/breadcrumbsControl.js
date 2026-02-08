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
var OutlineItem_1, FileItem_1, BreadcrumbsControl_1;
import * as dom from "../../../../base/browser/dom.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { PixelRatio } from "../../../../base/browser/pixelRatio.js";
import { BreadcrumbsItem, BreadcrumbsWidget } from "../../../../base/browser/ui/breadcrumbs/breadcrumbsWidget.js";
import { applyDragImage } from "../../../../base/browser/ui/dnd/dnd.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { timeout } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { combinedDisposable, DisposableStore, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { basename, extUri } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { OutlineElement } from "../../../../editor/contrib/documentSymbols/browser/outlineModel.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { fillInSymbolsDragData, LocalSelectionTransfer } from "../../../../platform/dnd/browser/dnd.js";
import { FileKind, IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IListService, WorkbenchAsyncDataTree, WorkbenchDataTree, WorkbenchListFocusContextKey } from "../../../../platform/list/browser/listService.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { defaultBreadcrumbsWidgetStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IOutlineService } from "../../../services/outline/browser/outline.js";
import { DraggedEditorIdentifier, fillEditorsDragData } from "../../dnd.js";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "../../labels.js";
import { BreadcrumbsConfig, IBreadcrumbsService } from "./breadcrumbs.js";
import { BreadcrumbsModel, FileElement, OutlineElement2 } from "./breadcrumbsModel.js";
import { BreadcrumbsFilePicker, BreadcrumbsOutlinePicker } from "./breadcrumbsPicker.js";
import "./media/breadcrumbscontrol.css";
import { CancellationToken } from "../../../../base/common/cancellation.js";
let OutlineItem = OutlineItem_1 = class OutlineItem2 extends BreadcrumbsItem {
  static {
    __name(this, "OutlineItem");
  }
  constructor(model, element, options, _instantiationService) {
    super();
    this.model = model;
    this.element = element;
    this.options = options;
    this._instantiationService = _instantiationService;
    this._disposables = new DisposableStore();
  }
  dispose() {
    this._disposables.dispose();
  }
  equals(other) {
    if (!(other instanceof OutlineItem_1)) {
      return false;
    }
    return this.element.element === other.element.element && this.options.showFileIcons === other.options.showFileIcons && this.options.showSymbolIcons === other.options.showSymbolIcons;
  }
  render(container) {
    const { element, outline } = this.element;
    if (element === outline) {
      const element2 = dom.$("span", void 0, "\u2026");
      container.appendChild(element2);
      return;
    }
    const templateId = outline.config.delegate.getTemplateId(element);
    const renderer = outline.config.renderers.find((renderer2) => renderer2.templateId === templateId);
    if (!renderer) {
      container.textContent = "<<NO RENDERER>>";
      return;
    }
    const template = renderer.renderTemplate(container);
    renderer.renderElement({
      element,
      children: [],
      depth: 0,
      visibleChildrenCount: 0,
      visibleChildIndex: 0,
      collapsible: false,
      collapsed: false,
      visible: true,
      filterData: void 0
    }, 0, template, void 0);
    if (!this.options.showSymbolIcons) {
      dom.hide(template.iconClass);
    }
    this._disposables.add(toDisposable(() => {
      renderer.disposeTemplate(template);
    }));
    if (element instanceof OutlineElement && outline.uri) {
      this._disposables.add(this._instantiationService.invokeFunction((accessor) => createBreadcrumbDndObserver(accessor, container, element.symbol.name, { symbol: element.symbol, uri: outline.uri }, this.model, this.options.dragEditor)));
    }
  }
};
OutlineItem = OutlineItem_1 = __decorate([
  __param(3, IInstantiationService)
], OutlineItem);
let FileItem = FileItem_1 = class FileItem2 extends BreadcrumbsItem {
  static {
    __name(this, "FileItem");
  }
  constructor(model, element, options, _labels, _hoverDelegate, _instantiationService) {
    super();
    this.model = model;
    this.element = element;
    this.options = options;
    this._labels = _labels;
    this._hoverDelegate = _hoverDelegate;
    this._instantiationService = _instantiationService;
    this._disposables = new DisposableStore();
  }
  dispose() {
    this._disposables.dispose();
  }
  equals(other) {
    if (!(other instanceof FileItem_1)) {
      return false;
    }
    return extUri.isEqual(this.element.uri, other.element.uri) && this.options.showFileIcons === other.options.showFileIcons && this.options.showSymbolIcons === other.options.showSymbolIcons;
  }
  render(container) {
    const label = this._labels.create(container, { hoverDelegate: this._hoverDelegate });
    label.setFile(this.element.uri, {
      hidePath: true,
      hideIcon: this.element.kind === FileKind.FOLDER || !this.options.showFileIcons,
      fileKind: this.element.kind,
      fileDecorations: { colors: this.options.showDecorationColors, badges: false }
    });
    container.classList.add(FileKind[this.element.kind].toLowerCase());
    this._disposables.add(label);
    this._disposables.add(this._instantiationService.invokeFunction((accessor) => createBreadcrumbDndObserver(accessor, container, basename(this.element.uri), this.element.uri, this.model, this.options.dragEditor)));
  }
};
FileItem = FileItem_1 = __decorate([
  __param(5, IInstantiationService)
], FileItem);
function createBreadcrumbDndObserver(accessor, container, label, item, model, dragEditor) {
  const instantiationService = accessor.get(IInstantiationService);
  container.draggable = true;
  return new dom.DragAndDropObserver(container, {
    onDragStart: /* @__PURE__ */ __name((event) => {
      if (!event.dataTransfer) {
        return;
      }
      event.dataTransfer.effectAllowed = "copyMove";
      instantiationService.invokeFunction((accessor2) => {
        if (URI.isUri(item)) {
          fillEditorsDragData(accessor2, [item], event);
        } else {
          fillEditorsDragData(accessor2, [{ resource: item.uri, selection: item.symbol.range }], event);
          fillInSymbolsDragData([{
            name: item.symbol.name,
            fsPath: item.uri.fsPath,
            range: item.symbol.range,
            kind: item.symbol.kind
          }], event);
        }
        if (dragEditor && model.editor?.input) {
          const editorTransfer = LocalSelectionTransfer.getInstance();
          editorTransfer.setData([new DraggedEditorIdentifier({ editor: model.editor.input, groupId: model.editor.group.id })], DraggedEditorIdentifier.prototype);
        }
      });
      applyDragImage(event, container, label);
    }, "onDragStart")
  });
}
__name(createBreadcrumbDndObserver, "createBreadcrumbDndObserver");
const separatorIcon = registerIcon("breadcrumb-separator", Codicon.chevronRight, localize("separatorIcon", "Icon for the separator in the breadcrumbs."));
let BreadcrumbsControl = class BreadcrumbsControl2 {
  static {
    __name(this, "BreadcrumbsControl");
  }
  static {
    BreadcrumbsControl_1 = this;
  }
  static {
    this.HEIGHT = 22;
  }
  static {
    this.SCROLLBAR_SIZES = {
      default: 3,
      large: 8
    };
  }
  static {
    this.SCROLLBAR_VISIBILITY = {
      auto: 1,
      visible: 3,
      hidden: 2
      /* ScrollbarVisibility.Hidden */
    };
  }
  static {
    this.Payload_Reveal = {};
  }
  static {
    this.Payload_RevealAside = {};
  }
  static {
    this.Payload_Pick = {};
  }
  static {
    this.CK_BreadcrumbsPossible = new RawContextKey("breadcrumbsPossible", false, localize("breadcrumbsPossible", "Whether the editor can show breadcrumbs"));
  }
  static {
    this.CK_BreadcrumbsVisible = new RawContextKey("breadcrumbsVisible", false, localize("breadcrumbsVisible", "Whether breadcrumbs are currently visible"));
  }
  static {
    this.CK_BreadcrumbsActive = new RawContextKey("breadcrumbsActive", false, localize("breadcrumbsActive", "Whether breadcrumbs have focus"));
  }
  get onDidVisibilityChange() {
    return this._onDidVisibilityChange.event;
  }
  constructor(container, _options, _editorGroup, _contextKeyService, _contextViewService, _instantiationService, _quickInputService, _fileService, _editorService, _labelService, configurationService, breadcrumbsService) {
    this._options = _options;
    this._editorGroup = _editorGroup;
    this._contextKeyService = _contextKeyService;
    this._contextViewService = _contextViewService;
    this._instantiationService = _instantiationService;
    this._quickInputService = _quickInputService;
    this._fileService = _fileService;
    this._editorService = _editorService;
    this._labelService = _labelService;
    this._disposables = new DisposableStore();
    this._breadcrumbsDisposables = new DisposableStore();
    this._model = new MutableDisposable();
    this._breadcrumbsPickerShowing = false;
    this._onDidVisibilityChange = this._disposables.add(new Emitter());
    this.domNode = document.createElement("div");
    this.domNode.classList.add("breadcrumbs-control");
    dom.append(container, this.domNode);
    this._cfUseQuickPick = BreadcrumbsConfig.UseQuickPick.bindTo(configurationService);
    this._cfShowIcons = BreadcrumbsConfig.Icons.bindTo(configurationService);
    this._cfTitleScrollbarSizing = BreadcrumbsConfig.TitleScrollbarSizing.bindTo(configurationService);
    this._cfTitleScrollbarVisibility = BreadcrumbsConfig.TitleScrollbarVisibility.bindTo(configurationService);
    this._labels = this._instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER);
    const sizing = this._cfTitleScrollbarSizing.getValue() ?? "default";
    const styles = _options.widgetStyles ?? defaultBreadcrumbsWidgetStyles;
    const visibility = this._cfTitleScrollbarVisibility?.getValue() ?? "auto";
    this._widget = new BreadcrumbsWidget(this.domNode, BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing], BreadcrumbsControl_1.SCROLLBAR_VISIBILITY[visibility], separatorIcon, styles);
    this._widget.onDidSelectItem(this._onSelectEvent, this, this._disposables);
    this._widget.onDidFocusItem(this._onFocusEvent, this, this._disposables);
    this._widget.onDidChangeFocus(this._updateCkBreadcrumbsActive, this, this._disposables);
    this._ckBreadcrumbsPossible = BreadcrumbsControl_1.CK_BreadcrumbsPossible.bindTo(this._contextKeyService);
    this._ckBreadcrumbsVisible = BreadcrumbsControl_1.CK_BreadcrumbsVisible.bindTo(this._contextKeyService);
    this._ckBreadcrumbsActive = BreadcrumbsControl_1.CK_BreadcrumbsActive.bindTo(this._contextKeyService);
    this._hoverDelegate = getDefaultHoverDelegate("mouse");
    this._disposables.add(breadcrumbsService.register(this._editorGroup.id, this._widget));
    this.hide();
  }
  dispose() {
    this._disposables.dispose();
    this._breadcrumbsDisposables.dispose();
    this._model.dispose();
    this._ckBreadcrumbsPossible.reset();
    this._ckBreadcrumbsVisible.reset();
    this._ckBreadcrumbsActive.reset();
    this._cfUseQuickPick.dispose();
    this._cfShowIcons.dispose();
    this._cfTitleScrollbarSizing.dispose();
    this._cfTitleScrollbarVisibility.dispose();
    this._widget.dispose();
    this._labels.dispose();
    this.domNode.remove();
  }
  get model() {
    return this._model.value;
  }
  layout(dim) {
    this._widget.layout(dim);
  }
  isHidden() {
    return this.domNode.classList.contains("hidden");
  }
  hide() {
    const wasHidden = this.isHidden();
    this._breadcrumbsDisposables.clear();
    this._ckBreadcrumbsVisible.set(false);
    this.domNode.classList.toggle("hidden", true);
    if (!wasHidden) {
      this._onDidVisibilityChange.fire();
    }
  }
  show() {
    const wasHidden = this.isHidden();
    this._ckBreadcrumbsVisible.set(true);
    this.domNode.classList.toggle("hidden", false);
    if (wasHidden) {
      this._onDidVisibilityChange.fire();
    }
  }
  revealLast() {
    this._widget.revealLast();
  }
  update() {
    this._breadcrumbsDisposables.clear();
    const uri = EditorResourceAccessor.getCanonicalUri(this._editorGroup.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    const wasHidden = this.isHidden();
    if (!uri || !this._fileService.hasProvider(uri)) {
      this._ckBreadcrumbsPossible.set(false);
      if (!wasHidden) {
        this.hide();
        return true;
      } else {
        return false;
      }
    }
    const fileInfoUri = EditorResourceAccessor.getOriginalUri(this._editorGroup.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    this.show();
    this._ckBreadcrumbsPossible.set(true);
    const model = this._instantiationService.createInstance(BreadcrumbsModel, fileInfoUri ?? uri, this._editorGroup.activeEditorPane);
    this._model.value = model;
    this.domNode.classList.toggle("backslash-path", this._labelService.getSeparator(uri.scheme, uri.authority) === "\\");
    const updateBreadcrumbs = /* @__PURE__ */ __name(() => {
      this.domNode.classList.toggle("relative-path", model.isRelative());
      const showIcons = this._cfShowIcons.getValue();
      const options = {
        ...this._options,
        showFileIcons: this._options.showFileIcons && showIcons,
        showSymbolIcons: this._options.showSymbolIcons && showIcons
      };
      const items = model.getElements().map((element) => element instanceof FileElement ? this._instantiationService.createInstance(FileItem, model, element, options, this._labels, this._hoverDelegate) : this._instantiationService.createInstance(OutlineItem, model, element, options));
      if (items.length === 0) {
        this._widget.setEnabled(false);
        this._widget.setItems([new class extends BreadcrumbsItem {
          render(container) {
            container.textContent = localize("empty", "no elements");
          }
          equals(other) {
            return other === this;
          }
          dispose() {
          }
        }()]);
      } else {
        this._widget.setEnabled(true);
        this._widget.setItems(items);
        this._widget.reveal(items[items.length - 1]);
      }
    }, "updateBreadcrumbs");
    const listener = model.onDidUpdate(updateBreadcrumbs);
    const configListener = this._cfShowIcons.onDidChange(updateBreadcrumbs);
    updateBreadcrumbs();
    this._breadcrumbsDisposables.clear();
    this._breadcrumbsDisposables.add(listener);
    this._breadcrumbsDisposables.add(toDisposable(() => this._model.clear()));
    this._breadcrumbsDisposables.add(configListener);
    this._breadcrumbsDisposables.add(toDisposable(() => this._widget.setItems([])));
    const updateScrollbarSizing = /* @__PURE__ */ __name(() => {
      const sizing = this._cfTitleScrollbarSizing.getValue() ?? "default";
      const visibility = this._cfTitleScrollbarVisibility?.getValue() ?? "auto";
      this._widget.setHorizontalScrollbarSize(BreadcrumbsControl_1.SCROLLBAR_SIZES[sizing]);
      this._widget.setHorizontalScrollbarVisibility(BreadcrumbsControl_1.SCROLLBAR_VISIBILITY[visibility]);
    }, "updateScrollbarSizing");
    updateScrollbarSizing();
    const updateScrollbarSizeListener = this._cfTitleScrollbarSizing.onDidChange(updateScrollbarSizing);
    const updateScrollbarVisibilityListener = this._cfTitleScrollbarVisibility.onDidChange(updateScrollbarSizing);
    this._breadcrumbsDisposables.add(updateScrollbarSizeListener);
    this._breadcrumbsDisposables.add(updateScrollbarVisibilityListener);
    this._breadcrumbsDisposables.add({
      dispose: /* @__PURE__ */ __name(() => {
        if (this._breadcrumbsPickerShowing) {
          this._contextViewService.hideContextView({ source: this });
        }
      }, "dispose")
    });
    return wasHidden !== this.isHidden();
  }
  _onFocusEvent(event) {
    if (event.item && this._breadcrumbsPickerShowing) {
      this._breadcrumbsPickerIgnoreOnceItem = void 0;
      this._widget.setSelection(event.item);
    }
  }
  _onSelectEvent(event) {
    if (!event.item) {
      return;
    }
    if (event.item === this._breadcrumbsPickerIgnoreOnceItem) {
      this._breadcrumbsPickerIgnoreOnceItem = void 0;
      this._widget.setFocused(void 0);
      this._widget.setSelection(void 0);
      return;
    }
    const { element } = event.item;
    this._editorGroup.focus();
    const group = this._getEditorGroup(event.payload);
    if (group !== void 0) {
      this._widget.setFocused(void 0);
      this._widget.setSelection(void 0);
      this._revealInEditor(event, element, group);
      return;
    }
    if (this._cfUseQuickPick.getValue()) {
      this._widget.setFocused(void 0);
      this._widget.setSelection(void 0);
      this._quickInputService.quickAccess.show(element instanceof OutlineElement2 ? "@" : "");
      return;
    }
    let picker;
    let pickerAnchor;
    this._contextViewService.showContextView({
      render: /* @__PURE__ */ __name((parent) => {
        if (event.item instanceof FileItem) {
          picker = this._instantiationService.createInstance(BreadcrumbsFilePicker, parent, event.item.model.resource);
        } else if (event.item instanceof OutlineItem) {
          picker = this._instantiationService.createInstance(BreadcrumbsOutlinePicker, parent, event.item.model.resource);
        }
        const selectListener = picker.onWillPickElement(() => this._contextViewService.hideContextView({ source: this, didPick: true }));
        const zoomListener = PixelRatio.getInstance(dom.getWindow(this.domNode)).onDidChange(() => this._contextViewService.hideContextView({ source: this }));
        const focusTracker = dom.trackFocus(parent);
        const blurListener = focusTracker.onDidBlur(() => {
          this._breadcrumbsPickerIgnoreOnceItem = this._widget.isDOMFocused() ? event.item : void 0;
          this._contextViewService.hideContextView({ source: this });
        });
        this._breadcrumbsPickerShowing = true;
        this._updateCkBreadcrumbsActive();
        return combinedDisposable(picker, selectListener, zoomListener, focusTracker, blurListener);
      }, "render"),
      getAnchor: /* @__PURE__ */ __name(() => {
        if (!pickerAnchor) {
          const window = dom.getWindow(this.domNode);
          const maxInnerWidth = window.innerWidth - 8;
          let maxHeight = Math.min(window.innerHeight * 0.7, 300);
          const pickerWidth = Math.min(maxInnerWidth, Math.max(240, maxInnerWidth / 4.17));
          const pickerArrowSize = 8;
          let pickerArrowOffset;
          const data = dom.getDomNodePagePosition(event.node);
          const y = data.top + data.height + pickerArrowSize;
          if (y + maxHeight >= window.innerHeight) {
            maxHeight = window.innerHeight - y - 30;
          }
          let x = data.left;
          if (x + pickerWidth >= maxInnerWidth) {
            x = maxInnerWidth - pickerWidth;
          }
          if (event.payload instanceof StandardMouseEvent) {
            const maxPickerArrowOffset = pickerWidth - 2 * pickerArrowSize;
            pickerArrowOffset = event.payload.posx - x;
            if (pickerArrowOffset > maxPickerArrowOffset) {
              x = Math.min(maxInnerWidth - pickerWidth, x + pickerArrowOffset - maxPickerArrowOffset);
              pickerArrowOffset = maxPickerArrowOffset;
            }
          } else {
            pickerArrowOffset = data.left + data.width * 0.3 - x;
          }
          picker.show(element, maxHeight, pickerWidth, pickerArrowSize, Math.max(0, pickerArrowOffset));
          pickerAnchor = { x, y };
        }
        return pickerAnchor;
      }, "getAnchor"),
      onHide: /* @__PURE__ */ __name((data) => {
        if (!data?.didPick) {
          picker.restoreViewState();
        }
        this._breadcrumbsPickerShowing = false;
        this._updateCkBreadcrumbsActive();
        if (data?.source === this) {
          this._widget.setFocused(void 0);
          this._widget.setSelection(void 0);
        }
        picker.dispose();
      }, "onHide")
    });
  }
  _updateCkBreadcrumbsActive() {
    const value = this._widget.isDOMFocused() || this._breadcrumbsPickerShowing;
    this._ckBreadcrumbsActive.set(value);
  }
  async _revealInEditor(event, element, group, pinned = false) {
    if (element instanceof FileElement) {
      if (element.kind === FileKind.FILE) {
        await this._editorService.openEditor({ resource: element.uri, options: { pinned } }, group);
      } else {
        const items = this._widget.getItems();
        const idx = items.indexOf(event.item);
        this._widget.setFocused(items[idx + 1]);
        this._widget.setSelection(items[idx + 1], BreadcrumbsControl_1.Payload_Pick);
      }
    } else {
      element.outline.reveal(element, { pinned }, group === SIDE_GROUP, false);
    }
  }
  _getEditorGroup(data) {
    if (data === BreadcrumbsControl_1.Payload_RevealAside) {
      return SIDE_GROUP;
    } else if (data === BreadcrumbsControl_1.Payload_Reveal) {
      return ACTIVE_GROUP;
    } else {
      return void 0;
    }
  }
};
BreadcrumbsControl = BreadcrumbsControl_1 = __decorate([
  __param(3, IContextKeyService),
  __param(4, IContextViewService),
  __param(5, IInstantiationService),
  __param(6, IQuickInputService),
  __param(7, IFileService),
  __param(8, IEditorService),
  __param(9, ILabelService),
  __param(10, IConfigurationService),
  __param(11, IBreadcrumbsService)
], BreadcrumbsControl);
let BreadcrumbsControlFactory = class BreadcrumbsControlFactory2 {
  static {
    __name(this, "BreadcrumbsControlFactory");
  }
  get control() {
    return this._control;
  }
  get onDidEnablementChange() {
    return this._onDidEnablementChange.event;
  }
  get onDidVisibilityChange() {
    return this._onDidVisibilityChange.event;
  }
  constructor(_container, _editorGroup, _options, configurationService, _instantiationService, fileService) {
    this._container = _container;
    this._editorGroup = _editorGroup;
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._disposables = new DisposableStore();
    this._controlDisposables = new DisposableStore();
    this._onDidEnablementChange = this._disposables.add(new Emitter());
    this._onDidVisibilityChange = this._disposables.add(new Emitter());
    const config = this._disposables.add(BreadcrumbsConfig.IsEnabled.bindTo(configurationService));
    this._disposables.add(config.onDidChange(() => {
      const value = config.getValue();
      if (!value && this._control) {
        this._controlDisposables.clear();
        this._control = void 0;
        this._onDidEnablementChange.fire();
      } else if (value && !this._control) {
        this._control = this.createControl();
        this._control.update();
        this._onDidEnablementChange.fire();
      }
    }));
    if (config.getValue()) {
      this._control = this.createControl();
    }
    this._disposables.add(fileService.onDidChangeFileSystemProviderRegistrations((e) => {
      if (this._control?.model && this._control.model.resource.scheme !== e.scheme) {
        return;
      }
      if (this._control?.update()) {
        this._onDidEnablementChange.fire();
      }
    }));
  }
  createControl() {
    const control = this._controlDisposables.add(this._instantiationService.createInstance(BreadcrumbsControl, this._container, this._options, this._editorGroup));
    this._controlDisposables.add(control.onDidVisibilityChange(() => this._onDidVisibilityChange.fire()));
    return control;
  }
  dispose() {
    this._disposables.dispose();
    this._controlDisposables.dispose();
  }
};
BreadcrumbsControlFactory = __decorate([
  __param(3, IConfigurationService),
  __param(4, IInstantiationService),
  __param(5, IFileService)
], BreadcrumbsControlFactory);
registerAction2(class ToggleBreadcrumb extends Action2 {
  static {
    __name(this, "ToggleBreadcrumb");
  }
  constructor() {
    super({
      id: "breadcrumbs.toggle",
      title: localize2("cmd.toggle", "Toggle Breadcrumbs"),
      shortTitle: localize2("cmd.toggle.short", "Breadcrumbs"),
      category: Categories.View,
      toggled: {
        condition: ContextKeyExpr.equals("config.breadcrumbs.enabled", true),
        title: localize("cmd.toggle2", "Breadcrumbs"),
        mnemonicTitle: localize({ key: "miBreadcrumbs2", comment: ["&& denotes a mnemonic"] }, "&&Breadcrumbs")
      },
      menu: [
        { id: MenuId.CommandPalette },
        { id: MenuId.MenubarAppearanceMenu, group: "4_editor", order: 2 },
        { id: MenuId.NotebookToolbar, group: "notebookLayout", order: 2 },
        { id: MenuId.StickyScrollContext },
        { id: MenuId.NotebookStickyScrollContext, group: "notebookView", order: 2 },
        { id: MenuId.NotebookToolbarContext, group: "notebookView", order: 2 }
      ]
    });
  }
  run(accessor) {
    const config = accessor.get(IConfigurationService);
    const breadCrumbsConfig = BreadcrumbsConfig.IsEnabled.bindTo(config);
    const value = breadCrumbsConfig.getValue();
    breadCrumbsConfig.updateValue(!value);
    breadCrumbsConfig.dispose();
  }
});
function focusAndSelectHandler(accessor, select) {
  const groups = accessor.get(IEditorGroupsService);
  const breadcrumbs = accessor.get(IBreadcrumbsService);
  const widget = breadcrumbs.getWidget(groups.activeGroup.id);
  if (widget) {
    const item = widget.getItems().at(-1);
    widget.setFocused(item);
    if (select) {
      widget.setSelection(item, BreadcrumbsControl.Payload_Pick);
    }
  }
}
__name(focusAndSelectHandler, "focusAndSelectHandler");
registerAction2(class FocusAndSelectBreadcrumbs extends Action2 {
  static {
    __name(this, "FocusAndSelectBreadcrumbs");
  }
  constructor() {
    super({
      id: "breadcrumbs.focusAndSelect",
      title: localize2("cmd.focusAndSelect", "Focus and Select Breadcrumbs"),
      precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
      keybinding: {
        weight: 200,
        primary: 2048 | 1024 | 89,
        when: BreadcrumbsControl.CK_BreadcrumbsPossible
      },
      f1: true
    });
  }
  run(accessor, ...args) {
    focusAndSelectHandler(accessor, true);
  }
});
registerAction2(class FocusBreadcrumbs extends Action2 {
  static {
    __name(this, "FocusBreadcrumbs");
  }
  constructor() {
    super({
      id: "breadcrumbs.focus",
      title: localize2("cmd.focus", "Focus Breadcrumbs"),
      precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
      keybinding: {
        weight: 200,
        primary: 2048 | 1024 | 85,
        when: BreadcrumbsControl.CK_BreadcrumbsPossible
      },
      f1: true
    });
  }
  run(accessor, ...args) {
    focusAndSelectHandler(accessor, false);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.toggleToOn",
  weight: 200,
  primary: 2048 | 1024 | 89,
  when: ContextKeyExpr.not("config.breadcrumbs.enabled"),
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const instant = accessor.get(IInstantiationService);
    const config = accessor.get(IConfigurationService);
    const isEnabled = BreadcrumbsConfig.IsEnabled.bindTo(config);
    if (!isEnabled.getValue()) {
      await isEnabled.updateValue(true);
      await timeout(50);
    }
    isEnabled.dispose();
    return instant.invokeFunction(focusAndSelectHandler, true);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.focusNext",
  weight: 200,
  primary: 17,
  secondary: [
    2048 | 17
    /* KeyCode.RightArrow */
  ],
  mac: {
    primary: 17,
    secondary: [
      512 | 17
      /* KeyCode.RightArrow */
    ]
  },
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.focusNext();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.focusPrevious",
  weight: 200,
  primary: 15,
  secondary: [
    2048 | 15
    /* KeyCode.LeftArrow */
  ],
  mac: {
    primary: 15,
    secondary: [
      512 | 15
      /* KeyCode.LeftArrow */
    ]
  },
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.focusPrev();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.focusNextWithPicker",
  weight: 200 + 1,
  primary: 2048 | 17,
  mac: {
    primary: 512 | 17
  },
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, WorkbenchListFocusContextKey),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.focusNext();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.focusPreviousWithPicker",
  weight: 200 + 1,
  primary: 2048 | 15,
  mac: {
    primary: 512 | 15
  },
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, WorkbenchListFocusContextKey),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.focusPrev();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.selectFocused",
  weight: 200,
  primary: 3,
  secondary: [
    18
    /* KeyCode.DownArrow */
  ],
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Pick);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.revealFocused",
  weight: 200,
  primary: 10,
  secondary: [
    2048 | 3
    /* KeyCode.Enter */
  ],
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.setSelection(widget.getFocused(), BreadcrumbsControl.Payload_Reveal);
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.selectEditor",
  weight: 200 + 1,
  primary: 9,
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive),
  handler(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const breadcrumbs = accessor.get(IBreadcrumbsService);
    const widget = breadcrumbs.getWidget(groups.activeGroup.id);
    if (!widget) {
      return;
    }
    widget.setFocused(void 0);
    widget.setSelection(void 0);
    groups.activeGroup.activeEditorPane?.focus();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "breadcrumbs.revealFocusedFromTreeAside",
  weight: 200,
  primary: 2048 | 3,
  when: ContextKeyExpr.and(BreadcrumbsControl.CK_BreadcrumbsVisible, BreadcrumbsControl.CK_BreadcrumbsActive, WorkbenchListFocusContextKey),
  handler(accessor) {
    const editors = accessor.get(IEditorService);
    const lists = accessor.get(IListService);
    const tree = lists.lastFocusedList;
    if (!(tree instanceof WorkbenchDataTree) && !(tree instanceof WorkbenchAsyncDataTree)) {
      return;
    }
    const element = tree.getFocus()[0];
    if (URI.isUri(element?.resource)) {
      return editors.openEditor({
        resource: element.resource,
        options: { pinned: true }
      }, SIDE_GROUP);
    }
    const input = tree.getInput();
    if (input && typeof input.outlineKind === "string") {
      return input.reveal(element, {
        pinned: true,
        preserveFocus: false
      }, true, false);
    }
  }
});
registerAction2(class CopyBreadcrumbPath extends Action2 {
  static {
    __name(this, "CopyBreadcrumbPath");
  }
  constructor() {
    super({
      id: "breadcrumbs.copyPath",
      title: localize2("cmd.copyPath", "Copy Breadcrumbs Path"),
      category: Categories.View,
      precondition: BreadcrumbsControl.CK_BreadcrumbsVisible,
      f1: true,
      menu: [{
        id: MenuId.EditorTitleContext,
        group: "1_cutcopypaste",
        order: 100,
        when: BreadcrumbsControl.CK_BreadcrumbsPossible
      }]
    });
  }
  async run(accessor) {
    const groups = accessor.get(IEditorGroupsService);
    const clipboardService = accessor.get(IClipboardService);
    const configurationService = accessor.get(IConfigurationService);
    const outlineService = accessor.get(IOutlineService);
    if (!groups.activeGroup.activeEditorPane) {
      return;
    }
    const outline = await outlineService.createOutline(groups.activeGroup.activeEditorPane, 2, CancellationToken.None);
    if (!outline) {
      return;
    }
    const elements = outline.config.breadcrumbsDataSource.getBreadcrumbElements();
    const labels = elements.map((item) => item.label).filter(Boolean);
    outline.dispose();
    if (labels.length === 0) {
      return;
    }
    const resource = groups.activeGroup.activeEditorPane.input.resource;
    const config = BreadcrumbsConfig.SymbolPathSeparator.bindTo(configurationService);
    const separator = config.getValue(resource && { resource }) ?? ".";
    config.dispose();
    const path = labels.join(separator);
    await clipboardService.writeText(path);
  }
});
export {
  BreadcrumbsControl,
  BreadcrumbsControlFactory
};
//# sourceMappingURL=breadcrumbsControl.js.map
