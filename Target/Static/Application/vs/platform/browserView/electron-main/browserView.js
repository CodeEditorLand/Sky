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
import { WebContentsView, webContents } from "electron";
import { FileAccess } from "../../../base/common/network.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { Emitter } from "../../../base/common/event.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { BrowserNewPageLocation, browserViewIsolatedWorldId } from "../common/browserView.js";
import { EVENT_KEY_CODE_MAP, SCAN_CODE_STR_TO_EVENT_KEY_CODE } from "../../../base/common/keyCodes.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { IAuxiliaryWindowsMainService } from "../../auxiliaryWindow/electron-main/auxiliaryWindows.js";
import { isMacintosh } from "../../../base/common/platform.js";
import { BrowserViewUri } from "../common/browserViewUri.js";
import { BrowserViewDebugger } from "./browserViewDebugger.js";
import { ILogService } from "../../log/common/log.js";
const nativeShortcuts = /* @__PURE__ */ new Set([
  2048 | 31,
  2048 | 33,
  2048 | 52,
  2048 | 1024 | 52,
  2048 | 54,
  ...isMacintosh ? [] : [
    2048 | 55
    /* KeyCode.KeyY */
  ],
  2048 | 56,
  2048 | 1024 | 56
  /* KeyCode.KeyZ */
]);
let BrowserView = class BrowserView2 extends Disposable {
  static {
    __name(this, "BrowserView");
  }
  constructor(id, session, createChildView, options, windowsMainService, auxiliaryWindowsMainService, logService) {
    super();
    this.id = id;
    this.session = session;
    this.windowsMainService = windowsMainService;
    this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
    this.logService = logService;
    this._faviconRequestCache = /* @__PURE__ */ new Map();
    this._lastScreenshot = void 0;
    this._lastFavicon = void 0;
    this._lastError = void 0;
    this._lastUserGestureTimestamp = -Infinity;
    this._isSendingKeyEvent = false;
    this._isDisposed = false;
    this._onDidNavigate = this._register(new Emitter());
    this.onDidNavigate = this._onDidNavigate.event;
    this._onDidChangeLoadingState = this._register(new Emitter());
    this.onDidChangeLoadingState = this._onDidChangeLoadingState.event;
    this._onDidChangeFocus = this._register(new Emitter());
    this.onDidChangeFocus = this._onDidChangeFocus.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDidChangeDevToolsState = this._register(new Emitter());
    this.onDidChangeDevToolsState = this._onDidChangeDevToolsState.event;
    this._onDidKeyCommand = this._register(new Emitter());
    this.onDidKeyCommand = this._onDidKeyCommand.event;
    this._onDidChangeTitle = this._register(new Emitter());
    this.onDidChangeTitle = this._onDidChangeTitle.event;
    this._onDidChangeFavicon = this._register(new Emitter());
    this.onDidChangeFavicon = this._onDidChangeFavicon.event;
    this._onDidRequestNewPage = this._register(new Emitter());
    this.onDidRequestNewPage = this._onDidRequestNewPage.event;
    this._onDidFindInPage = this._register(new Emitter());
    this.onDidFindInPage = this._onDidFindInPage.event;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    const webPreferences = {
      ...options?.webPreferences,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
      session: this.session.electronSession,
      preload: FileAccess.asFileUri("vs/platform/browserView/electron-browser/preload-browserView.js").fsPath,
      // TODO@kycutler: Remove this once https://github.com/electron/electron/issues/42578 is fixed
      type: "browserView"
    };
    this._view = new WebContentsView({
      webPreferences,
      // Passing an `undefined` webContents triggers an error in Electron.
      ...options?.webContents ? { webContents: options.webContents } : {}
    });
    this._view.setBackgroundColor("#FFFFFF");
    this._view.webContents.setWindowOpenHandler((details) => {
      const location = (() => {
        switch (details.disposition) {
          case "background-tab":
            return BrowserNewPageLocation.Background;
          case "foreground-tab":
            return BrowserNewPageLocation.Foreground;
          case "new-window":
            return BrowserNewPageLocation.NewWindow;
          default:
            return void 0;
        }
      })();
      if (!location || !this.consumePopupPermission(location)) {
        return { action: "deny" };
      }
      return {
        action: "allow",
        createWindow: /* @__PURE__ */ __name((options2) => {
          const childView = createChildView(options2);
          const resource = BrowserViewUri.forUrl(details.url, childView.id);
          this._onDidRequestNewPage.fire({
            resource,
            location,
            position: { x: options2.x, y: options2.y, width: options2.width, height: options2.height }
          });
          return childView.webContents;
        }, "createWindow")
      };
    });
    this._view.webContents.on("destroyed", () => {
      this.dispose();
    });
    this._debugger = new BrowserViewDebugger(this, this.logService);
    this._register(session.acquire());
    this.setupEventListeners();
  }
  setupEventListeners() {
    const webContents2 = this._view.webContents;
    webContents2.on("devtools-opened", () => {
      this._onDidChangeDevToolsState.fire({ isDevToolsOpen: true });
    });
    webContents2.on("devtools-closed", () => {
      this._onDidChangeDevToolsState.fire({ isDevToolsOpen: false });
    });
    webContents2.on("page-favicon-updated", async (_event, favicons) => {
      for (const url of favicons) {
        if (!this._faviconRequestCache.has(url)) {
          this._faviconRequestCache.set(url, (async () => {
            const response = await webContents2.session.fetch(url, {
              cache: "force-cache"
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch favicon: ${response.status} ${response.statusText}`);
            }
            const type = await response.headers.get("content-type");
            const buffer = await response.arrayBuffer();
            return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
          })());
        }
        try {
          this._lastFavicon = await this._faviconRequestCache.get(url);
          this._onDidChangeFavicon.fire({ favicon: this._lastFavicon });
          return;
        } catch (e) {
        }
      }
      if (this._lastFavicon) {
        this._lastFavicon = void 0;
        this._onDidChangeFavicon.fire({ favicon: this._lastFavicon });
      }
    });
    webContents2.on("page-title-updated", (_event, title) => {
      this._onDidChangeTitle.fire({ title });
    });
    const fireNavigationEvent = /* @__PURE__ */ __name(() => {
      this._onDidNavigate.fire({
        url: webContents2.getURL(),
        title: webContents2.getTitle(),
        canGoBack: webContents2.navigationHistory.canGoBack(),
        canGoForward: webContents2.navigationHistory.canGoForward()
      });
    }, "fireNavigationEvent");
    const fireLoadingEvent = /* @__PURE__ */ __name((loading) => {
      this._onDidChangeLoadingState.fire({ loading, error: this._lastError });
    }, "fireLoadingEvent");
    webContents2.on("did-start-loading", () => {
      this._lastError = void 0;
      fireLoadingEvent(true);
    });
    webContents2.on("did-stop-loading", () => fireLoadingEvent(false));
    webContents2.on("did-fail-load", (e, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame) {
        if (errorCode === -3) {
          fireLoadingEvent(false);
          return;
        }
        this._lastError = {
          url: validatedURL,
          errorCode,
          errorDescription
        };
        fireLoadingEvent(false);
        this._onDidNavigate.fire({
          url: validatedURL,
          title: "",
          canGoBack: webContents2.navigationHistory.canGoBack(),
          canGoForward: webContents2.navigationHistory.canGoForward()
        });
      }
    });
    webContents2.on("did-finish-load", () => fireLoadingEvent(false));
    webContents2.on("render-process-gone", (_event, details) => {
      this._lastError = {
        url: webContents2.getURL(),
        errorCode: details.exitCode,
        errorDescription: `Render process gone: ${details.reason}`
      };
      fireLoadingEvent(false);
    });
    webContents2.on("did-navigate", fireNavigationEvent);
    webContents2.on("did-navigate-in-page", fireNavigationEvent);
    webContents2.on("focus", () => {
      this._onDidChangeFocus.fire({ focused: true });
    });
    webContents2.on("blur", () => {
      this._onDidChangeFocus.fire({ focused: false });
    });
    webContents2.on("before-input-event", async (event, input) => {
      if (input.type === "keyDown" && !this._isSendingKeyEvent) {
        if (this.tryHandleCommand(input)) {
          event.preventDefault();
        }
      }
    });
    webContents2.on("input-event", (_event, input) => {
      switch (input.type) {
        case "rawKeyDown":
        case "keyDown":
        case "mouseDown":
        case "pointerDown":
        case "pointerUp":
        case "touchEnd":
          this._lastUserGestureTimestamp = Date.now();
      }
    });
    webContents2.on("will-prevent-unload", (e) => {
      e.preventDefault();
    });
    webContents2.on("found-in-page", (_event, result) => {
      this._onDidFindInPage.fire({
        activeMatchOrdinal: result.activeMatchOrdinal,
        matches: result.matches,
        selectionArea: result.selectionArea,
        finalUpdate: result.finalUpdate
      });
    });
  }
  consumePopupPermission(location) {
    switch (location) {
      case BrowserNewPageLocation.Foreground:
      case BrowserNewPageLocation.Background:
        return true;
      case BrowserNewPageLocation.NewWindow:
        if (this._lastUserGestureTimestamp > Date.now() - 1e3) {
          this._lastUserGestureTimestamp = -Infinity;
          return true;
        }
        return false;
    }
  }
  get webContents() {
    return this._view.webContents;
  }
  /**
   * Get the current state of this browser view
   */
  getState() {
    const webContents2 = this._view.webContents;
    return {
      url: webContents2.getURL(),
      title: webContents2.getTitle(),
      canGoBack: webContents2.navigationHistory.canGoBack(),
      canGoForward: webContents2.navigationHistory.canGoForward(),
      loading: webContents2.isLoading(),
      focused: webContents2.isFocused(),
      visible: this._view.getVisible(),
      isDevToolsOpen: webContents2.isDevToolsOpened(),
      lastScreenshot: this._lastScreenshot,
      lastFavicon: this._lastFavicon,
      lastError: this._lastError,
      storageScope: this.session.storageScope
    };
  }
  /**
   * Toggle developer tools for this browser view.
   */
  toggleDevTools() {
    this._view.webContents.toggleDevTools();
  }
  /**
   * Update the layout bounds of this view
   */
  layout(bounds) {
    if (this._window?.win?.id !== bounds.windowId) {
      const newWindow = this.windowById(bounds.windowId);
      if (newWindow) {
        this._window?.win?.contentView.removeChildView(this._view);
        this._window = newWindow;
        newWindow.win?.contentView.addChildView(this._view);
      }
    }
    this._view.webContents.setZoomFactor(bounds.zoomFactor);
    this._view.setBounds({
      x: Math.round(bounds.x * bounds.zoomFactor),
      y: Math.round(bounds.y * bounds.zoomFactor),
      width: Math.round(bounds.width * bounds.zoomFactor),
      height: Math.round(bounds.height * bounds.zoomFactor)
    });
  }
  /**
   * Set the visibility of this view
   */
  setVisible(visible) {
    if (this._view.getVisible() === visible) {
      return;
    }
    if (!visible && this._view.webContents.isFocused()) {
      this._window?.win?.webContents.focus();
    }
    this._view.setVisible(visible);
    this._onDidChangeVisibility.fire({ visible });
  }
  /**
   * Load a URL in this view
   */
  async loadURL(url) {
    await this._view.webContents.loadURL(url);
  }
  /**
   * Get the current URL
   */
  getURL() {
    return this._view.webContents.getURL();
  }
  /**
   * Navigate back in history
   */
  goBack() {
    if (this._view.webContents.navigationHistory.canGoBack()) {
      this._view.webContents.navigationHistory.goBack();
    }
  }
  /**
   * Navigate forward in history
   */
  goForward() {
    if (this._view.webContents.navigationHistory.canGoForward()) {
      this._view.webContents.navigationHistory.goForward();
    }
  }
  /**
   * Reload the current page
   */
  reload() {
    this._view.webContents.reload();
  }
  /**
   * Check if the view can navigate back
   */
  canGoBack() {
    return this._view.webContents.navigationHistory.canGoBack();
  }
  /**
   * Check if the view can navigate forward
   */
  canGoForward() {
    return this._view.webContents.navigationHistory.canGoForward();
  }
  /**
   * Capture a screenshot of this view
   */
  async captureScreenshot(options) {
    const quality = options?.quality ?? 80;
    const image = await this._view.webContents.capturePage(options?.rect, {
      stayHidden: true,
      stayAwake: true
    });
    const buffer = image.toJPEG(quality);
    const screenshot = VSBuffer.wrap(buffer);
    if (!options?.rect) {
      this._lastScreenshot = screenshot;
    }
    return screenshot;
  }
  /**
   * Dispatch a keyboard event to this view
   */
  async dispatchKeyEvent(keyEvent) {
    const event = {
      type: "keyDown",
      keyCode: keyEvent.key,
      modifiers: []
    };
    if (keyEvent.ctrlKey) {
      event.modifiers.push("control");
    }
    if (keyEvent.shiftKey) {
      event.modifiers.push("shift");
    }
    if (keyEvent.altKey) {
      event.modifiers.push("alt");
    }
    if (keyEvent.metaKey) {
      event.modifiers.push("meta");
    }
    this._isSendingKeyEvent = true;
    try {
      await this._view.webContents.sendInputEvent(event);
    } finally {
      this._isSendingKeyEvent = false;
    }
  }
  /**
   * Set the zoom factor of this view
   */
  async setZoomFactor(zoomFactor) {
    await this._view.webContents.setZoomFactor(zoomFactor);
  }
  /**
   * Focus this view
   */
  async focus() {
    this._view.webContents.focus();
  }
  /**
   * Find text in the page
   */
  async findInPage(text, options) {
    this._view.webContents.findInPage(text, {
      matchCase: options?.matchCase ?? false,
      forward: options?.forward ?? true,
      // `findNext` is not very clearly named. From Electron docs: `Whether to begin a new text finding session with this request`.
      // It needs to be set to `true` if we want a new search to be performed, such as when the text changes.
      // We name it `recompute` in our internal options to better reflect its purpose / behavior.
      findNext: options?.recompute ?? false
    });
  }
  /**
   * Stop finding in page
   */
  async stopFindInPage(keepSelection) {
    this._view.webContents.stopFindInPage(keepSelection ? "keepSelection" : "clearSelection");
  }
  /**
   * Get the currently selected text in the browser view.
   * Returns immediately with empty string if the page is still loading.
   */
  async getSelectedText() {
    if (this._view.webContents.isLoading()) {
      return "";
    }
    try {
      return await this._view.webContents.executeJavaScriptInIsolatedWorld(browserViewIsolatedWorldId, [{ code: 'window.browserViewAPI?.getSelectedText?.() ?? ""' }]);
    } catch {
      return "";
    }
  }
  /**
   * Clear all storage data for this browser view's session
   */
  async clearStorage() {
    await this.session.electronSession.clearData();
  }
  /**
   * Get the underlying WebContentsView
   */
  getWebContentsView() {
    return this._view;
  }
  // ============ ICDPTarget implementation ============
  /**
   * Get CDP target info using Electron's real targetId.
   */
  getTargetInfo() {
    return this._debugger.getTargetInfo();
  }
  /**
   * Attach to receive debugger events.
   * @returns A connection that can be disposed to detach
   */
  attach() {
    return this._debugger.attach();
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._debugger.dispose();
    this._window?.win?.contentView.removeChildView(this._view);
    this._onDidClose.fire();
    this._view.webContents.close({ waitForBeforeUnload: false });
    super.dispose();
  }
  /**
   * Potentially handle an input event as a VS Code command.
   * Returns `true` if the event was forwarded to VS Code and should not be handled natively.
   */
  tryHandleCommand(input) {
    const eventKeyCode = SCAN_CODE_STR_TO_EVENT_KEY_CODE[input.code] || 0;
    const keyCode = EVENT_KEY_CODE_MAP[eventKeyCode] || 0;
    const isArrowKey = keyCode >= 15 && keyCode <= 18;
    const isNonEditingKey = keyCode === 9 || keyCode >= 59 && keyCode <= 82 || keyCode >= 117;
    const isAltOnlyInput = input.alt && !input.control && !input.meta;
    if (isAltOnlyInput && !isNonEditingKey && !isArrowKey) {
      return false;
    }
    const hasCommandModifier = input.control || input.alt || input.meta;
    if (!hasCommandModifier && !isNonEditingKey) {
      return false;
    }
    const isControlInput = isMacintosh ? input.meta : input.control;
    const modifiedKeyCode = keyCode | (isControlInput ? 2048 : 0) | (input.shift ? 1024 : 0) | (input.alt ? 512 : 0);
    if (nativeShortcuts.has(modifiedKeyCode)) {
      return false;
    }
    this._onDidKeyCommand.fire({
      key: input.key,
      keyCode: eventKeyCode,
      code: input.code,
      ctrlKey: input.control || false,
      shiftKey: input.shift || false,
      altKey: input.alt || false,
      metaKey: input.meta || false,
      repeat: input.isAutoRepeat || false
    });
    return true;
  }
  windowById(windowId) {
    return this.codeWindowById(windowId) ?? this.auxiliaryWindowById(windowId);
  }
  codeWindowById(windowId) {
    if (typeof windowId !== "number") {
      return void 0;
    }
    return this.windowsMainService.getWindowById(windowId);
  }
  auxiliaryWindowById(windowId) {
    if (typeof windowId !== "number") {
      return void 0;
    }
    const contents = webContents.fromId(windowId);
    if (!contents) {
      return void 0;
    }
    return this.auxiliaryWindowsMainService.getWindowByWebContents(contents);
  }
};
BrowserView = __decorate([
  __param(4, IWindowsMainService),
  __param(5, IAuxiliaryWindowsMainService),
  __param(6, ILogService)
], BrowserView);
export {
  BrowserView
};
//# sourceMappingURL=browserView.js.map
