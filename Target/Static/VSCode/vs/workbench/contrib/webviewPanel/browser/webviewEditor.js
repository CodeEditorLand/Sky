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
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import * as nls from "../../../../nls.js";
import { IContextKeyService, IScopedContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { IEditorOpenContext } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IOverlayWebview } from "../../webview/browser/webview.js";
import { WebviewWindowDragMonitor } from "../../webview/browser/webviewWindowDragMonitor.js";
import { WebviewInput } from "./webviewEditorInput.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService, Parts } from "../../../services/layout/browser/layoutService.js";
const CONTEXT_ACTIVE_WEBVIEW_PANEL_ID = new RawContextKey("activeWebviewPanelId", "", {
  type: "string",
  description: nls.localize("context.activeWebviewId", "The viewType of the currently active webview panel.")
});
let WebviewEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, storageService, _editorGroupsService, _editorService, _workbenchLayoutService, _hostService, _contextKeyService) {
    super(WebviewEditor.ID, group, telemetryService, themeService, storageService);
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._workbenchLayoutService = _workbenchLayoutService;
    this._hostService = _hostService;
    this._contextKeyService = _contextKeyService;
    const part = _editorGroupsService.getPart(group);
    this._register(Event.any(part.onDidScroll, part.onDidAddGroup, part.onDidRemoveGroup, part.onDidMoveGroup)(() => {
      if (this.webview && this._visible) {
        this.synchronizeWebviewContainerDimensions(this.webview);
      }
    }));
  }
  static {
    __name(this, "WebviewEditor");
  }
  static ID = "WebviewEditor";
  _element;
  _dimension;
  _visible = false;
  _isDisposed = false;
  _webviewVisibleDisposables = this._register(new DisposableStore());
  _onFocusWindowHandler = this._register(new MutableDisposable());
  _onDidFocusWebview = this._register(new Emitter());
  get onDidFocus() {
    return this._onDidFocusWebview.event;
  }
  _scopedContextKeyService = this._register(new MutableDisposable());
  get webview() {
    return this.input instanceof WebviewInput ? this.input.webview : void 0;
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService.value;
  }
  createEditor(parent) {
    const element = document.createElement("div");
    this._element = element;
    this._element.id = `webview-editor-element-${generateUuid()}`;
    parent.appendChild(element);
    this._scopedContextKeyService.value = this._register(this._contextKeyService.createScoped(element));
  }
  dispose() {
    this._isDisposed = true;
    this._element?.remove();
    this._element = void 0;
    super.dispose();
  }
  layout(dimension) {
    this._dimension = dimension;
    if (this.webview && this._visible) {
      this.synchronizeWebviewContainerDimensions(this.webview, dimension);
    }
  }
  focus() {
    super.focus();
    if (!this._onFocusWindowHandler.value && !isWeb) {
      this._onFocusWindowHandler.value = this._hostService.onDidChangeFocus((focused) => {
        if (focused && this._editorService.activeEditorPane === this && this._workbenchLayoutService.hasFocus(Parts.EDITOR_PART)) {
          this.focus();
        }
      });
    }
    this.webview?.focus();
  }
  setEditorVisible(visible) {
    this._visible = visible;
    if (this.input instanceof WebviewInput && this.webview) {
      if (visible) {
        this.claimWebview(this.input);
      } else {
        this.webview.release(this);
      }
    }
    super.setEditorVisible(visible);
  }
  clearInput() {
    if (this.webview) {
      this.webview.release(this);
      this._webviewVisibleDisposables.clear();
    }
    super.clearInput();
  }
  async setInput(input, options, context, token) {
    if (this.input && input.matches(this.input)) {
      return;
    }
    const alreadyOwnsWebview = input instanceof WebviewInput && input.webview === this.webview;
    if (this.webview && !alreadyOwnsWebview) {
      this.webview.release(this);
    }
    await super.setInput(input, options, context, token);
    await input.resolve();
    if (token.isCancellationRequested || this._isDisposed) {
      return;
    }
    if (input instanceof WebviewInput) {
      input.updateGroup(this.group.id);
      if (!alreadyOwnsWebview) {
        this.claimWebview(input);
      }
      if (this._dimension) {
        this.layout(this._dimension);
      }
    }
  }
  claimWebview(input) {
    input.claim(this, this.window, this.scopedContextKeyService);
    if (this._element) {
      this._element.setAttribute("aria-flowto", input.webview.container.id);
      DOM.setParentFlowTo(input.webview.container, this._element);
    }
    this._webviewVisibleDisposables.clear();
    this._webviewVisibleDisposables.add(this._editorGroupsService.createEditorDropTarget(input.webview.container, {
      containsGroup: /* @__PURE__ */ __name((group) => this.group.id === group.id, "containsGroup")
    }));
    this._webviewVisibleDisposables.add(new WebviewWindowDragMonitor(this.window, () => this.webview));
    this.synchronizeWebviewContainerDimensions(input.webview);
    this._webviewVisibleDisposables.add(this.trackFocus(input.webview));
  }
  synchronizeWebviewContainerDimensions(webview, dimension) {
    if (!this._element?.isConnected) {
      return;
    }
    const rootContainer = this._workbenchLayoutService.getContainer(this.window, Parts.EDITOR_PART);
    webview.layoutWebviewOverElement(this._element.parentElement, dimension, rootContainer);
  }
  trackFocus(webview) {
    const store = new DisposableStore();
    const webviewContentFocusTracker = DOM.trackFocus(webview.container);
    store.add(webviewContentFocusTracker);
    store.add(webviewContentFocusTracker.onDidFocus(() => this._onDidFocusWebview.fire()));
    store.add(webview.onDidFocus(() => this._onDidFocusWebview.fire()));
    return store;
  }
};
WebviewEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IHostService),
  __decorateParam(8, IContextKeyService)
], WebviewEditor);
export {
  CONTEXT_ACTIVE_WEBVIEW_PANEL_ID,
  WebviewEditor
};
//# sourceMappingURL=webviewEditor.js.map
