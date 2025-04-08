var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { range } from "../../../common/arrays.js";
import { CancellationTokenSource } from "../../../common/cancellation.js";
import { Event } from "../../../common/event.js";
import { Disposable, IDisposable } from "../../../common/lifecycle.js";
import { IPagedModel } from "../../../common/paging.js";
import { ScrollbarVisibility } from "../../../common/scrollable.js";
import "./list.css";
import { IListContextMenuEvent, IListEvent, IListMouseEvent, IListRenderer, IListVirtualDelegate } from "./list.js";
import { IListAccessibilityProvider, IListOptions, IListOptionsUpdate, IListStyles, List, TypeNavigationMode } from "./listWidget.js";
import { isActiveElement } from "../../dom.js";
class PagedRenderer {
  constructor(renderer, modelProvider) {
    this.renderer = renderer;
    this.modelProvider = modelProvider;
  }
  static {
    __name(this, "PagedRenderer");
  }
  get templateId() {
    return this.renderer.templateId;
  }
  renderTemplate(container) {
    const data = this.renderer.renderTemplate(container);
    return { data, disposable: Disposable.None };
  }
  renderElement(index, _, data, height) {
    data.disposable?.dispose();
    if (!data.data) {
      return;
    }
    const model = this.modelProvider();
    if (model.isResolved(index)) {
      return this.renderer.renderElement(model.get(index), index, data.data, height);
    }
    const cts = new CancellationTokenSource();
    const promise = model.resolve(index, cts.token);
    data.disposable = { dispose: /* @__PURE__ */ __name(() => cts.cancel(), "dispose") };
    this.renderer.renderPlaceholder(index, data.data);
    promise.then((entry) => this.renderer.renderElement(entry, index, data.data, height));
  }
  disposeTemplate(data) {
    if (data.disposable) {
      data.disposable.dispose();
      data.disposable = void 0;
    }
    if (data.data) {
      this.renderer.disposeTemplate(data.data);
      data.data = void 0;
    }
  }
}
class PagedAccessibilityProvider {
  constructor(modelProvider, accessibilityProvider) {
    this.modelProvider = modelProvider;
    this.accessibilityProvider = accessibilityProvider;
  }
  static {
    __name(this, "PagedAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return this.accessibilityProvider.getWidgetAriaLabel();
  }
  getAriaLabel(index) {
    const model = this.modelProvider();
    if (!model.isResolved(index)) {
      return null;
    }
    return this.accessibilityProvider.getAriaLabel(model.get(index));
  }
}
function fromPagedListOptions(modelProvider, options) {
  return {
    ...options,
    accessibilityProvider: options.accessibilityProvider && new PagedAccessibilityProvider(modelProvider, options.accessibilityProvider)
  };
}
__name(fromPagedListOptions, "fromPagedListOptions");
class PagedList {
  static {
    __name(this, "PagedList");
  }
  list;
  _model;
  constructor(user, container, virtualDelegate, renderers, options = {}) {
    const modelProvider = /* @__PURE__ */ __name(() => this.model, "modelProvider");
    const pagedRenderers = renderers.map((r) => new PagedRenderer(r, modelProvider));
    this.list = new List(user, container, virtualDelegate, pagedRenderers, fromPagedListOptions(modelProvider, options));
  }
  updateOptions(options) {
    this.list.updateOptions(options);
  }
  getHTMLElement() {
    return this.list.getHTMLElement();
  }
  isDOMFocused() {
    return isActiveElement(this.getHTMLElement());
  }
  domFocus() {
    this.list.domFocus();
  }
  get onDidFocus() {
    return this.list.onDidFocus;
  }
  get onDidBlur() {
    return this.list.onDidBlur;
  }
  get widget() {
    return this.list;
  }
  get onDidDispose() {
    return this.list.onDidDispose;
  }
  get onMouseClick() {
    return Event.map(this.list.onMouseClick, ({ element, index, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index, browserEvent }));
  }
  get onMouseDblClick() {
    return Event.map(this.list.onMouseDblClick, ({ element, index, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index, browserEvent }));
  }
  get onTap() {
    return Event.map(this.list.onTap, ({ element, index, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index, browserEvent }));
  }
  get onPointer() {
    return Event.map(this.list.onPointer, ({ element, index, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index, browserEvent }));
  }
  get onDidChangeFocus() {
    return Event.map(this.list.onDidChangeFocus, ({ elements, indexes, browserEvent }) => ({ elements: elements.map((e) => this._model.get(e)), indexes, browserEvent }));
  }
  get onDidChangeSelection() {
    return Event.map(this.list.onDidChangeSelection, ({ elements, indexes, browserEvent }) => ({ elements: elements.map((e) => this._model.get(e)), indexes, browserEvent }));
  }
  get onContextMenu() {
    return Event.map(this.list.onContextMenu, ({ element, index, anchor, browserEvent }) => typeof element === "undefined" ? { element, index, anchor, browserEvent } : { element: this._model.get(element), index, anchor, browserEvent });
  }
  get model() {
    return this._model;
  }
  set model(model) {
    this._model = model;
    this.list.splice(0, this.list.length, range(model.length));
  }
  get length() {
    return this.list.length;
  }
  get scrollTop() {
    return this.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.list.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.list.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.list.scrollLeft = scrollLeft;
  }
  setAnchor(index) {
    this.list.setAnchor(index);
  }
  getAnchor() {
    return this.list.getAnchor();
  }
  setFocus(indexes) {
    this.list.setFocus(indexes);
  }
  focusNext(n, loop) {
    this.list.focusNext(n, loop);
  }
  focusPrevious(n, loop) {
    this.list.focusPrevious(n, loop);
  }
  focusNextPage() {
    return this.list.focusNextPage();
  }
  focusPreviousPage() {
    return this.list.focusPreviousPage();
  }
  focusLast() {
    this.list.focusLast();
  }
  focusFirst() {
    this.list.focusFirst();
  }
  getFocus() {
    return this.list.getFocus();
  }
  setSelection(indexes, browserEvent) {
    this.list.setSelection(indexes, browserEvent);
  }
  getSelection() {
    return this.list.getSelection();
  }
  getSelectedElements() {
    return this.getSelection().map((i) => this.model.get(i));
  }
  layout(height, width) {
    this.list.layout(height, width);
  }
  triggerTypeNavigation() {
    this.list.triggerTypeNavigation();
  }
  reveal(index, relativeTop) {
    this.list.reveal(index, relativeTop);
  }
  style(styles) {
    this.list.style(styles);
  }
  dispose() {
    this.list.dispose();
  }
}
export {
  PagedList
};
//# sourceMappingURL=listPaging.js.map
