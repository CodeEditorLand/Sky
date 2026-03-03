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
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { BrowserView } from "./browserView.js";
import { CDPBrowserProxy } from "../common/cdp/proxy.js";
import { IBrowserViewCDPProxyServer } from "./browserViewCDPProxyServer.js";
import { IBrowserViewMainService } from "./browserViewMainService.js";
let BrowserViewGroup = class BrowserViewGroup2 extends Disposable {
  static {
    __name(this, "BrowserViewGroup");
  }
  constructor(id, browserViewMainService, cdpProxyServer) {
    super();
    this.id = id;
    this.browserViewMainService = browserViewMainService;
    this.cdpProxyServer = cdpProxyServer;
    this.views = /* @__PURE__ */ new Map();
    this.viewListeners = this._register(new DisposableStore());
    this.knownContextIds = /* @__PURE__ */ new Set();
    this.ownedContextIds = /* @__PURE__ */ new Set();
    this._onTargetCreated = this._register(new Emitter());
    this.onTargetCreated = this._onTargetCreated.event;
    this._onTargetDestroyed = this._register(new Emitter());
    this.onTargetDestroyed = this._onTargetDestroyed.event;
    this._onDidAddView = this._register(new Emitter());
    this.onDidAddView = this._onDidAddView.event;
    this._onDidRemoveView = this._register(new Emitter());
    this.onDidRemoveView = this._onDidRemoveView.event;
    this._onDidDestroy = this._register(new Emitter());
    this.onDidDestroy = this._onDidDestroy.event;
  }
  // #region View management
  /**
   * Add a {@link BrowserView} to this group.
   * Fires {@link onDidAddView} and {@link onTargetCreated}.
   * Automatically removes the view when it closes.
   */
  async addView(viewId) {
    if (this.views.has(viewId)) {
      return;
    }
    const view = this.browserViewMainService.tryGetBrowserView(viewId);
    if (!view) {
      throw new Error(`Browser view ${viewId} not found`);
    }
    this.views.set(view.id, view);
    this.knownContextIds.add(view.session.id);
    this._onDidAddView.fire({ viewId: view.id });
    this._onTargetCreated.fire(view);
    this.viewListeners.add(Event.once(view.onDidClose)(() => {
      this.removeView(viewId);
    }));
  }
  /**
   * Remove a {@link BrowserView} from this group.
   * Fires {@link onDidRemoveView} and {@link onTargetDestroyed} if the view was tracked.
   */
  async removeView(viewId) {
    const view = this.views.get(viewId);
    if (view && this.views.delete(viewId)) {
      if (!this.ownedContextIds.has(view.session.id) && ![...this.views.values()].some((v) => v.session.id === view.session.id)) {
        this.knownContextIds.delete(view.session.id);
      }
      this._onDidRemoveView.fire({ viewId: view.id });
      this._onTargetDestroyed.fire(view);
    }
  }
  // #endregion
  // #region ICDPBrowserTarget implementation
  getVersion() {
    return this.browserViewMainService.getVersion();
  }
  getWindowForTarget(target) {
    return this.browserViewMainService.getWindowForTarget(target);
  }
  async attach() {
    return new CDPBrowserProxy(this);
  }
  async getTargetInfo() {
    return {
      targetId: this.id,
      type: "browser",
      title: this.getVersion().product,
      url: "",
      attached: true,
      canAccessOpener: false
    };
  }
  getTargets() {
    return this.views.values();
  }
  async createTarget(url, browserContextId) {
    if (browserContextId && !this.knownContextIds.has(browserContextId)) {
      throw new Error(`Unknown browser context ${browserContextId}`);
    }
    const target = await this.browserViewMainService.createTarget(url, browserContextId);
    if (target instanceof BrowserView) {
      await this.addView(target.id);
    }
    return target;
  }
  async activateTarget(target) {
    return this.browserViewMainService.activateTarget(target);
  }
  async closeTarget(target) {
    if (target instanceof BrowserView) {
      await this.removeView(target.id);
    }
    return this.browserViewMainService.closeTarget(target);
  }
  // Browser context management
  /**
   * Returns only the browser context IDs that are visible to this group,
   * i.e. contexts used by views currently in the group.
   */
  getBrowserContexts() {
    return [...this.knownContextIds];
  }
  async createBrowserContext() {
    const contextId = await this.browserViewMainService.createBrowserContext();
    this.knownContextIds.add(contextId);
    this.ownedContextIds.add(contextId);
    return contextId;
  }
  async disposeBrowserContext(browserContextId) {
    if (!this.ownedContextIds.has(browserContextId)) {
      throw new Error("Can only dispose browser contexts created by this group");
    }
    for (const view of this.views.values()) {
      if (view.session.id === browserContextId) {
        await this.removeView(view.id);
      }
    }
    this.knownContextIds.delete(browserContextId);
    this.ownedContextIds.delete(browserContextId);
    return this.browserViewMainService.disposeBrowserContext(browserContextId);
  }
  // #endregion
  // #region CDP endpoint
  /**
   * Get a WebSocket endpoint URL for connecting to this group's CDP
   * session. The URL contains a short-lived, single-use token.
   */
  async getDebugWebSocketEndpoint() {
    return this.cdpProxyServer.getWebSocketEndpointForTarget(this);
  }
  // #endregion
  dispose() {
    this._onDidDestroy.fire();
    this.cdpProxyServer.removeTarget(this);
    super.dispose();
  }
};
BrowserViewGroup = __decorate([
  __param(1, IBrowserViewMainService),
  __param(2, IBrowserViewCDPProxyServer)
], BrowserViewGroup);
export {
  BrowserViewGroup
};
//# sourceMappingURL=browserViewGroup.js.map
