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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { createDecorator, IInstantiationService } from "../../instantiation/common/instantiation.js";
import { BrowserView } from "./browserView.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { BrowserViewUri } from "../common/browserViewUri.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { BrowserSession } from "./browserSession.js";
import { IProductService } from "../../product/common/productService.js";
import { CDPBrowserProxy } from "../common/cdp/proxy.js";
import { logBrowserOpen } from "../common/browserViewTelemetry.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
const IBrowserViewMainService = createDecorator("browserViewMainService");
let BrowserViewMainService = class BrowserViewMainService2 extends Disposable {
  static {
    __name(this, "BrowserViewMainService");
  }
  /**
   * Check if a webContents belongs to an integrated browser view.
   * Delegates to {@link BrowserSession.isBrowserViewWebContents}.
   */
  static isBrowserViewWebContents(contents) {
    return BrowserSession.isBrowserViewWebContents(contents);
  }
  constructor(environmentMainService, instantiationService, windowsMainService, productService, telemetryService) {
    super();
    this.environmentMainService = environmentMainService;
    this.instantiationService = instantiationService;
    this.windowsMainService = windowsMainService;
    this.productService = productService;
    this.telemetryService = telemetryService;
    this.browserViews = this._register(new DisposableMap());
    this._onTargetCreated = this._register(new Emitter());
    this.onTargetCreated = this._onTargetCreated.event;
    this._onTargetDestroyed = this._register(new Emitter());
    this.onTargetDestroyed = this._onTargetDestroyed.event;
  }
  /**
   * Create a browser view backed by the given {@link BrowserSession}.
   */
  createBrowserView(id, browserSession, options) {
    if (this.browserViews.has(id)) {
      throw new Error(`Browser view with id ${id} already exists`);
    }
    const view = this.instantiationService.createInstance(
      BrowserView,
      id,
      browserSession,
      // Recursive factory for nested windows (child views share the same session)
      (childOptions) => this.createBrowserView(generateUuid(), browserSession, childOptions),
      options
    );
    this.browserViews.set(id, view);
    this._onTargetCreated.fire(view);
    Event.once(view.onDidClose)(() => {
      this._onTargetDestroyed.fire(view);
      this.browserViews.deleteAndDispose(id);
    });
    return view;
  }
  async getOrCreateBrowserView(id, scope, workspaceId) {
    if (this.browserViews.has(id)) {
      const view2 = this.browserViews.get(id);
      return view2.getState();
    }
    const browserSession = BrowserSession.getOrCreate(id, scope, this.environmentMainService.workspaceStorageHome, workspaceId);
    const view = this.createBrowserView(id, browserSession);
    return view.getState();
  }
  tryGetBrowserView(id) {
    return this.browserViews.get(id);
  }
  // ICDPBrowserTarget implementation
  getVersion() {
    return {
      protocolVersion: "1.3",
      product: `${this.productService.nameShort}/${this.productService.version}`,
      revision: this.productService.commit || "unknown",
      userAgent: "Electron",
      jsVersion: process.versions.v8
    };
  }
  getWindowForTarget(target) {
    if (!(target instanceof BrowserView)) {
      throw new Error("Can only get window for targets created by this service");
    }
    const view = target.getWebContentsView();
    const viewBounds = view.getBounds();
    return {
      windowId: 1,
      bounds: {
        left: viewBounds.x,
        top: viewBounds.y,
        width: viewBounds.width,
        height: viewBounds.height,
        windowState: "normal"
      }
    };
  }
  async attach() {
    return new CDPBrowserProxy(this);
  }
  async getTargetInfo() {
    return {
      targetId: "browser",
      type: "browser",
      title: this.getVersion().product,
      url: "",
      attached: true,
      canAccessOpener: false
    };
  }
  getTargets() {
    return this.browserViews.values();
  }
  async createTarget(url, browserContextId) {
    const targetId = generateUuid();
    const browserSession = browserContextId && BrowserSession.get(browserContextId) || BrowserSession.getOrCreateEphemeral(targetId);
    const view = this.createBrowserView(targetId, browserSession);
    logBrowserOpen(this.telemetryService, "cdpCreated");
    this.windowsMainService.sendToFocused("vscode:runAction", {
      id: "vscode.open",
      args: [BrowserViewUri.forUrl(url, targetId)]
    });
    return view;
  }
  async activateTarget(target) {
    if (!(target instanceof BrowserView)) {
      throw new Error("Can only activate targets created by this service");
    }
  }
  async closeTarget(target) {
    if (!(target instanceof BrowserView)) {
      throw new Error("Can only close targets created by this service");
    }
    await this.destroyBrowserView(target.id);
    return true;
  }
  // Browser context management
  getBrowserContexts() {
    return BrowserSession.getBrowserContextIds();
  }
  async createBrowserContext() {
    const browserSession = BrowserSession.getOrCreateEphemeral(generateUuid(), "cdp-created");
    return browserSession.id;
  }
  async disposeBrowserContext(browserContextId) {
    if (!browserContextId.startsWith("cdp-created:")) {
      throw new Error("Can only dispose browser contexts created via CDP");
    }
    const browserSession = BrowserSession.get(browserContextId);
    if (!browserSession) {
      throw new Error(`Browser context ${browserContextId} not found`);
    }
    for (const view of this.browserViews.values()) {
      if (view.session === browserSession) {
        await this.destroyBrowserView(view.id);
      }
    }
    browserSession.dispose();
  }
  /**
   * Get a browser view or throw if not found
   */
  _getBrowserView(id) {
    const view = this.browserViews.get(id);
    if (!view) {
      throw new Error(`Browser view ${id} not found`);
    }
    return view;
  }
  onDynamicDidNavigate(id) {
    return this._getBrowserView(id).onDidNavigate;
  }
  onDynamicDidChangeLoadingState(id) {
    return this._getBrowserView(id).onDidChangeLoadingState;
  }
  onDynamicDidChangeFocus(id) {
    return this._getBrowserView(id).onDidChangeFocus;
  }
  onDynamicDidChangeVisibility(id) {
    return this._getBrowserView(id).onDidChangeVisibility;
  }
  onDynamicDidChangeDevToolsState(id) {
    return this._getBrowserView(id).onDidChangeDevToolsState;
  }
  onDynamicDidKeyCommand(id) {
    return this._getBrowserView(id).onDidKeyCommand;
  }
  onDynamicDidChangeTitle(id) {
    return this._getBrowserView(id).onDidChangeTitle;
  }
  onDynamicDidChangeFavicon(id) {
    return this._getBrowserView(id).onDidChangeFavicon;
  }
  onDynamicDidRequestNewPage(id) {
    return this._getBrowserView(id).onDidRequestNewPage;
  }
  onDynamicDidFindInPage(id) {
    return this._getBrowserView(id).onDidFindInPage;
  }
  onDynamicDidClose(id) {
    return this._getBrowserView(id).onDidClose;
  }
  async destroyBrowserView(id) {
    return this.browserViews.deleteAndDispose(id);
  }
  async layout(id, bounds) {
    return this._getBrowserView(id).layout(bounds);
  }
  async setVisible(id, visible) {
    return this._getBrowserView(id).setVisible(visible);
  }
  async loadURL(id, url) {
    return this._getBrowserView(id).loadURL(url);
  }
  async getURL(id) {
    return this._getBrowserView(id).getURL();
  }
  async goBack(id) {
    return this._getBrowserView(id).goBack();
  }
  async goForward(id) {
    return this._getBrowserView(id).goForward();
  }
  async reload(id) {
    return this._getBrowserView(id).reload();
  }
  async toggleDevTools(id) {
    return this._getBrowserView(id).toggleDevTools();
  }
  async canGoBack(id) {
    return this._getBrowserView(id).canGoBack();
  }
  async canGoForward(id) {
    return this._getBrowserView(id).canGoForward();
  }
  async captureScreenshot(id, options) {
    return this._getBrowserView(id).captureScreenshot(options);
  }
  async dispatchKeyEvent(id, keyEvent) {
    return this._getBrowserView(id).dispatchKeyEvent(keyEvent);
  }
  async setZoomFactor(id, zoomFactor) {
    return this._getBrowserView(id).setZoomFactor(zoomFactor);
  }
  async focus(id) {
    return this._getBrowserView(id).focus();
  }
  async findInPage(id, text, options) {
    return this._getBrowserView(id).findInPage(text, options);
  }
  async stopFindInPage(id, keepSelection) {
    return this._getBrowserView(id).stopFindInPage(keepSelection);
  }
  async getSelectedText(id) {
    return this._getBrowserView(id).getSelectedText();
  }
  async clearStorage(id) {
    return this._getBrowserView(id).clearStorage();
  }
  async clearGlobalStorage() {
    const browserSession = BrowserSession.getOrCreateGlobal();
    await browserSession.electronSession.clearData();
  }
  async clearWorkspaceStorage(workspaceId) {
    const browserSession = BrowserSession.getOrCreateWorkspace(workspaceId, this.environmentMainService.workspaceStorageHome);
    await browserSession.electronSession.clearData();
  }
};
BrowserViewMainService = __decorate([
  __param(0, IEnvironmentMainService),
  __param(1, IInstantiationService),
  __param(2, IWindowsMainService),
  __param(3, IProductService),
  __param(4, ITelemetryService)
], BrowserViewMainService);
export {
  BrowserViewMainService,
  IBrowserViewMainService
};
//# sourceMappingURL=browserViewMainService.js.map
