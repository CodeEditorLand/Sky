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
import { Disposable } from "../../../base/common/lifecycle.js";
import { Emitter } from "../../../base/common/event.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { EVENT_KEY_CODE_MAP, SCAN_CODE_STR_TO_EVENT_KEY_CODE } from "../../../base/common/keyCodes.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { IAuxiliaryWindowsMainService } from "../../auxiliaryWindow/electron-main/auxiliaryWindows.js";
import { isMacintosh } from "../../../base/common/platform.js";
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
  constructor(viewSession, storageScope, windowsMainService, auxiliaryWindowsMainService) {
    super();
    this.storageScope = storageScope;
    this.windowsMainService = windowsMainService;
    this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
    this._faviconRequestCache = /* @__PURE__ */ new Map();
    this._lastScreenshot = void 0;
    this._lastFavicon = void 0;
    this._lastError = void 0;
    this._isSendingKeyEvent = false;
    this._onDidNavigate = this._register(new Emitter());
    this.onDidNavigate = this._onDidNavigate.event;
    this._onDidChangeLoadingState = this._register(new Emitter());
    this.onDidChangeLoadingState = this._onDidChangeLoadingState.event;
    this._onDidChangeFocus = this._register(new Emitter());
    this.onDidChangeFocus = this._onDidChangeFocus.event;
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
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._view = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webviewTag: false,
        session: viewSession
      }
    });
    this._view.webContents.setWindowOpenHandler((details) => {
      if (details.disposition === "background-tab" || details.disposition === "foreground-tab") {
        this._onDidRequestNewPage.fire({
          url: details.url,
          name: details.frameName || void 0,
          background: details.disposition === "background-tab"
        });
        return { action: "deny" };
      }
      return { action: "deny" };
    });
    this._view.webContents.on("destroyed", () => {
      this._onDidClose.fire();
    });
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
      if (!favicons || favicons.length === 0) {
        return;
      }
      const found = favicons.find((f) => this._faviconRequestCache.get(f));
      if (found) {
        this._lastFavicon = await this._faviconRequestCache.get(found);
        this._onDidChangeFavicon.fire({ favicon: this._lastFavicon });
        return;
      }
      for (const url of favicons) {
        const request = (async () => {
          const response = await webContents2.session.fetch(url, {
            cache: "force-cache"
          });
          const type = await response.headers.get("content-type");
          const buffer = await response.arrayBuffer();
          return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
        })();
        this._faviconRequestCache.set(url, request);
        try {
          this._lastFavicon = await request;
          this._onDidChangeFavicon.fire({ favicon: this._lastFavicon });
          return;
        } catch (e) {
          this._faviconRequestCache.delete(url);
        }
      }
    });
    webContents2.on("page-title-updated", (_event, title) => {
      this._onDidChangeTitle.fire({ title });
    });
    const fireNavigationEvent = /* @__PURE__ */ __name(() => {
      this._onDidNavigate.fire({
        url: webContents2.getURL(),
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
        this._lastError = {
          url: validatedURL,
          errorCode,
          errorDescription
        };
        fireLoadingEvent(false);
        this._onDidNavigate.fire({
          url: validatedURL,
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
    webContents2.on("will-prevent-unload", (e) => {
      e.preventDefault();
    });
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
      isDevToolsOpen: webContents2.isDevToolsOpened(),
      lastScreenshot: this._lastScreenshot,
      lastFavicon: this._lastFavicon,
      lastError: this._lastError,
      storageScope: this.storageScope
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
    if (!visible && this._view.webContents.isFocused()) {
      this._window?.win?.webContents.focus();
    }
    this._view.setVisible(visible);
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
   * Get the underlying WebContentsView
   */
  getWebContentsView() {
    return this._view;
  }
  dispose() {
    this._window?.win?.contentView.removeChildView(this._view);
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
  __param(2, IWindowsMainService),
  __param(3, IAuxiliaryWindowsMainService)
], BrowserView);
export {
  BrowserView
};
//# sourceMappingURL=browserView.js.map
