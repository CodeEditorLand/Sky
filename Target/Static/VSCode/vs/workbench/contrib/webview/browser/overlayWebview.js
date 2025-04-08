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
import { Dimension, getWindowById } from "../../../../base/browser/dom.js";
import { FastDomNode } from "../../../../base/browser/fastDomNode.js";
import { IMouseWheelEvent } from "../../../../base/browser/mouseEvent.js";
import { CodeWindow } from "../../../../base/browser/window.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IContextKey, IContextKeyService, IScopedContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IOverlayWebview, IWebview, IWebviewElement, IWebviewService, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE, WebviewContentOptions, WebviewExtensionDescription, WebviewInitInfo, WebviewMessageReceivedEvent, WebviewOptions } from "./webview.js";
let OverlayWebview = class extends Disposable {
  constructor(initInfo, _layoutService, _webviewService, _baseContextKeyService) {
    super();
    this._layoutService = _layoutService;
    this._webviewService = _webviewService;
    this._baseContextKeyService = _baseContextKeyService;
    this.providedViewType = initInfo.providedViewType;
    this.origin = initInfo.origin ?? generateUuid();
    this._title = initInfo.title;
    this._extension = initInfo.extension;
    this._options = initInfo.options;
    this._contentOptions = initInfo.contentOptions;
  }
  static {
    __name(this, "OverlayWebview");
  }
  _isFirstLoad = true;
  _firstLoadPendingMessages = /* @__PURE__ */ new Set();
  _webview = this._register(new MutableDisposable());
  _webviewEvents = this._register(new DisposableStore());
  _html = "";
  _title;
  _initialScrollProgress = 0;
  _state = void 0;
  _extension;
  _contentOptions;
  _options;
  _owner = void 0;
  _windowId = void 0;
  get window() {
    return getWindowById(this._windowId, true).window;
  }
  _scopedContextKeyService = this._register(new MutableDisposable());
  _findWidgetVisible;
  _findWidgetEnabled;
  _shouldShowFindWidgetOnRestore = false;
  providedViewType;
  origin;
  _container;
  get isFocused() {
    return !!this._webview.value?.isFocused;
  }
  _isDisposed = false;
  _onDidDispose = this._register(new Emitter());
  onDidDispose = this._onDidDispose.event;
  dispose() {
    this._isDisposed = true;
    this._container?.domNode.remove();
    this._container = void 0;
    for (const msg of this._firstLoadPendingMessages) {
      msg.resolve(false);
    }
    this._firstLoadPendingMessages.clear();
    this._onDidDispose.fire();
    super.dispose();
  }
  get container() {
    if (this._isDisposed) {
      throw new Error(`OverlayWebview has been disposed`);
    }
    if (!this._container) {
      const node = document.createElement("div");
      node.style.position = "absolute";
      node.style.overflow = "hidden";
      this._container = new FastDomNode(node);
      this._container.setVisibility("hidden");
      this._layoutService.getContainer(this.window).appendChild(node);
    }
    return this._container.domNode;
  }
  claim(owner, targetWindow, scopedContextKeyService) {
    if (this._isDisposed) {
      return;
    }
    const oldOwner = this._owner;
    if (this._windowId !== targetWindow.vscodeWindowId) {
      this.release(oldOwner);
      this._webview.clear();
      this._webviewEvents.clear();
      this._container?.domNode.remove();
      this._container = void 0;
    }
    this._owner = owner;
    this._windowId = targetWindow.vscodeWindowId;
    this._show(targetWindow);
    if (oldOwner !== owner) {
      const contextKeyService = scopedContextKeyService || this._baseContextKeyService;
      this._scopedContextKeyService.clear();
      this._scopedContextKeyService.value = contextKeyService.createScoped(this.container);
      const wasFindVisible = this._findWidgetVisible?.get();
      this._findWidgetVisible?.reset();
      this._findWidgetVisible = KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
      this._findWidgetVisible.set(!!wasFindVisible);
      this._findWidgetEnabled?.reset();
      this._findWidgetEnabled = KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED.bindTo(contextKeyService);
      this._findWidgetEnabled.set(!!this.options.enableFindWidget);
      this._webview.value?.setContextKeyService(this._scopedContextKeyService.value);
    }
  }
  release(owner) {
    if (this._owner !== owner) {
      return;
    }
    this._scopedContextKeyService.clear();
    this._owner = void 0;
    if (this._container) {
      this._container.setVisibility("hidden");
    }
    if (this._options.retainContextWhenHidden) {
      this._shouldShowFindWidgetOnRestore = !!this._findWidgetVisible?.get();
      this.hideFind(false);
    } else {
      this._webview.clear();
      this._webviewEvents.clear();
    }
  }
  layoutWebviewOverElement(element, dimension, clippingContainer) {
    if (!this._container || !this._container.domNode.parentElement) {
      return;
    }
    const whenContainerStylesLoaded = this._layoutService.whenContainerStylesLoaded(this.window);
    if (whenContainerStylesLoaded) {
      whenContainerStylesLoaded.then(() => this.doLayoutWebviewOverElement(element, dimension, clippingContainer));
    } else {
      this.doLayoutWebviewOverElement(element, dimension, clippingContainer);
    }
  }
  doLayoutWebviewOverElement(element, dimension, clippingContainer) {
    if (!this._container || !this._container.domNode.parentElement) {
      return;
    }
    const frameRect = element.getBoundingClientRect();
    const containerRect = this._container.domNode.parentElement.getBoundingClientRect();
    const parentBorderTop = (containerRect.height - this._container.domNode.parentElement.clientHeight) / 2;
    const parentBorderLeft = (containerRect.width - this._container.domNode.parentElement.clientWidth) / 2;
    this._container.setTop(frameRect.top - containerRect.top - parentBorderTop);
    this._container.setLeft(frameRect.left - containerRect.left - parentBorderLeft);
    this._container.setWidth(dimension ? dimension.width : frameRect.width);
    this._container.setHeight(dimension ? dimension.height : frameRect.height);
    if (clippingContainer) {
      const { top, left, right, bottom } = computeClippingRect(frameRect, clippingContainer);
      this._container.domNode.style.clipPath = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
    }
  }
  _show(targetWindow) {
    if (this._isDisposed) {
      throw new Error("OverlayWebview is disposed");
    }
    if (!this._webview.value) {
      const webview = this._webviewService.createWebviewElement({
        providedViewType: this.providedViewType,
        origin: this.origin,
        title: this._title,
        options: this._options,
        contentOptions: this._contentOptions,
        extension: this.extension
      });
      this._webview.value = webview;
      webview.state = this._state;
      if (this._scopedContextKeyService.value) {
        this._webview.value.setContextKeyService(this._scopedContextKeyService.value);
      }
      if (this._html) {
        webview.setHtml(this._html);
      }
      if (this._options.tryRestoreScrollPosition) {
        webview.initialScrollProgress = this._initialScrollProgress;
      }
      this._findWidgetEnabled?.set(!!this.options.enableFindWidget);
      webview.mountTo(this.container, targetWindow);
      this._webviewEvents.clear();
      this._webviewEvents.add(webview.onDidFocus(() => {
        this._onDidFocus.fire();
      }));
      this._webviewEvents.add(webview.onDidBlur(() => {
        this._onDidBlur.fire();
      }));
      this._webviewEvents.add(webview.onDidClickLink((x) => {
        this._onDidClickLink.fire(x);
      }));
      this._webviewEvents.add(webview.onMessage((x) => {
        this._onMessage.fire(x);
      }));
      this._webviewEvents.add(webview.onMissingCsp((x) => {
        this._onMissingCsp.fire(x);
      }));
      this._webviewEvents.add(webview.onDidWheel((x) => {
        this._onDidWheel.fire(x);
      }));
      this._webviewEvents.add(webview.onDidReload(() => {
        this._onDidReload.fire();
      }));
      this._webviewEvents.add(webview.onFatalError((x) => {
        this._onFatalError.fire(x);
      }));
      this._webviewEvents.add(webview.onDidScroll((x) => {
        this._initialScrollProgress = x.scrollYPercentage;
        this._onDidScroll.fire(x);
      }));
      this._webviewEvents.add(webview.onDidUpdateState((state) => {
        this._state = state;
        this._onDidUpdateState.fire(state);
      }));
      if (this._isFirstLoad) {
        this._firstLoadPendingMessages.forEach(async (msg) => {
          msg.resolve(await webview.postMessage(msg.message, msg.transfer));
        });
      }
      this._isFirstLoad = false;
      this._firstLoadPendingMessages.clear();
    }
    if (this.options.retainContextWhenHidden && this._shouldShowFindWidgetOnRestore) {
      this.showFind(false);
      this._shouldShowFindWidgetOnRestore = false;
    }
    this._container?.setVisibility("visible");
  }
  setHtml(html) {
    this._html = html;
    this._withWebview((webview) => webview.setHtml(html));
  }
  setTitle(title) {
    this._title = title;
    this._withWebview((webview) => webview.setTitle(title));
  }
  get initialScrollProgress() {
    return this._initialScrollProgress;
  }
  set initialScrollProgress(value) {
    this._initialScrollProgress = value;
    this._withWebview((webview) => webview.initialScrollProgress = value);
  }
  get state() {
    return this._state;
  }
  set state(value) {
    this._state = value;
    this._withWebview((webview) => webview.state = value);
  }
  get extension() {
    return this._extension;
  }
  set extension(value) {
    this._extension = value;
    this._withWebview((webview) => webview.extension = value);
  }
  get options() {
    return this._options;
  }
  set options(value) {
    this._options = { customClasses: this._options.customClasses, ...value };
  }
  get contentOptions() {
    return this._contentOptions;
  }
  set contentOptions(value) {
    this._contentOptions = value;
    this._withWebview((webview) => webview.contentOptions = value);
  }
  set localResourcesRoot(resources) {
    this._withWebview((webview) => webview.localResourcesRoot = resources);
  }
  _onDidFocus = this._register(new Emitter());
  onDidFocus = this._onDidFocus.event;
  _onDidBlur = this._register(new Emitter());
  onDidBlur = this._onDidBlur.event;
  _onDidClickLink = this._register(new Emitter());
  onDidClickLink = this._onDidClickLink.event;
  _onDidReload = this._register(new Emitter());
  onDidReload = this._onDidReload.event;
  _onDidScroll = this._register(new Emitter());
  onDidScroll = this._onDidScroll.event;
  _onDidUpdateState = this._register(new Emitter());
  onDidUpdateState = this._onDidUpdateState.event;
  _onMessage = this._register(new Emitter());
  onMessage = this._onMessage.event;
  _onMissingCsp = this._register(new Emitter());
  onMissingCsp = this._onMissingCsp.event;
  _onDidWheel = this._register(new Emitter());
  onDidWheel = this._onDidWheel.event;
  _onFatalError = this._register(new Emitter());
  onFatalError = this._onFatalError.event;
  async postMessage(message, transfer) {
    if (this._webview.value) {
      return this._webview.value.postMessage(message, transfer);
    }
    if (this._isFirstLoad) {
      let resolve;
      const p = new Promise((r) => resolve = r);
      this._firstLoadPendingMessages.add({ message, transfer, resolve });
      return p;
    }
    return false;
  }
  focus() {
    this._webview.value?.focus();
  }
  reload() {
    this._webview.value?.reload();
  }
  selectAll() {
    this._webview.value?.selectAll();
  }
  copy() {
    this._webview.value?.copy();
  }
  paste() {
    this._webview.value?.paste();
  }
  cut() {
    this._webview.value?.cut();
  }
  undo() {
    this._webview.value?.undo();
  }
  redo() {
    this._webview.value?.redo();
  }
  showFind(animated = true) {
    if (this._webview.value) {
      this._webview.value.showFind(animated);
      this._findWidgetVisible?.set(true);
    }
  }
  hideFind(animated = true) {
    this._findWidgetVisible?.reset();
    this._webview.value?.hideFind(animated);
  }
  runFindAction(previous) {
    this._webview.value?.runFindAction(previous);
  }
  _withWebview(f) {
    if (this._webview.value) {
      f(this._webview.value);
    }
  }
  windowDidDragStart() {
    this._webview.value?.windowDidDragStart();
  }
  windowDidDragEnd() {
    this._webview.value?.windowDidDragEnd();
  }
  setContextKeyService(contextKeyService) {
    this._webview.value?.setContextKeyService(contextKeyService);
  }
};
OverlayWebview = __decorateClass([
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IWebviewService),
  __decorateParam(3, IContextKeyService)
], OverlayWebview);
function computeClippingRect(frameRect, clipper) {
  const rootRect = clipper.getBoundingClientRect();
  const top = Math.max(rootRect.top - frameRect.top, 0);
  const right = Math.max(frameRect.width - (frameRect.right - rootRect.right), 0);
  const bottom = Math.max(frameRect.height - (frameRect.bottom - rootRect.bottom), 0);
  const left = Math.max(rootRect.left - frameRect.left, 0);
  return { top, right, bottom, left };
}
__name(computeClippingRect, "computeClippingRect");
export {
  OverlayWebview
};
//# sourceMappingURL=overlayWebview.js.map
