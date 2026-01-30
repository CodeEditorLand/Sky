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
var BrowserViewMainService_1;
import { session } from "electron";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { BrowserViewStorageScope } from "../common/browserView.js";
import { joinPath } from "../../../base/common/resources.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { createDecorator, IInstantiationService } from "../../instantiation/common/instantiation.js";
import { BrowserView } from "./browserView.js";
import { generateUuid } from "../../../base/common/uuid.js";
const IBrowserViewMainService = createDecorator("browserViewMainService");
const allowedPermissions = /* @__PURE__ */ new Set([
  "pointerLock",
  "notifications",
  "clipboard-read",
  "clipboard-sanitized-write"
]);
let BrowserViewMainService = class BrowserViewMainService2 extends Disposable {
  static {
    __name(this, "BrowserViewMainService");
  }
  static {
    BrowserViewMainService_1 = this;
  }
  static {
    this.knownSessions = /* @__PURE__ */ new WeakSet();
  }
  static isBrowserViewWebContents(contents) {
    return BrowserViewMainService_1.knownSessions.has(contents.session);
  }
  constructor(environmentMainService, instantiationService) {
    super();
    this.environmentMainService = environmentMainService;
    this.instantiationService = instantiationService;
    this.browserViews = this._register(new DisposableMap());
  }
  /**
   * Get the session for a browser view based on data storage setting and workspace
   */
  getSession(requestedScope, viewId, workspaceId) {
    switch (requestedScope) {
      case "global":
        return { session: session.fromPartition("persist:vscode-browser"), resolvedScope: BrowserViewStorageScope.Global };
      case "workspace":
        if (workspaceId) {
          const storage = joinPath(this.environmentMainService.workspaceStorageHome, workspaceId, "browserStorage");
          return { session: session.fromPath(storage.fsPath), resolvedScope: BrowserViewStorageScope.Workspace };
        }
      // fallthrough
      case "ephemeral":
      default:
        return { session: session.fromPartition(`vscode-browser-${viewId ?? generateUuid()}`), resolvedScope: BrowserViewStorageScope.Ephemeral };
    }
  }
  configureSession(viewSession) {
    viewSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      return callback(allowedPermissions.has(permission));
    });
    viewSession.setPermissionCheckHandler((_webContents, permission, _origin) => {
      return allowedPermissions.has(permission);
    });
  }
  async getOrCreateBrowserView(id, scope, workspaceId) {
    if (this.browserViews.has(id)) {
      const view2 = this.browserViews.get(id);
      return view2.getState();
    }
    const { session: session2, resolvedScope } = this.getSession(scope, id, workspaceId);
    this.configureSession(session2);
    BrowserViewMainService_1.knownSessions.add(session2);
    const view = this.instantiationService.createInstance(BrowserView, session2, resolvedScope);
    this.browserViews.set(id, view);
    return view.getState();
  }
  tryGetBrowserView(id) {
    return this.browserViews.get(id);
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
  onDynamicDidClose(id) {
    return this._getBrowserView(id).onDidClose;
  }
  async destroyBrowserView(id) {
    this.browserViews.deleteAndDispose(id);
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
  async clearGlobalStorage() {
    const { session: session2, resolvedScope } = this.getSession(BrowserViewStorageScope.Global);
    if (resolvedScope !== BrowserViewStorageScope.Global) {
      throw new Error("Failed to resolve global storage session");
    }
    await session2.clearData();
  }
  async clearWorkspaceStorage(workspaceId) {
    const { session: session2, resolvedScope } = this.getSession(BrowserViewStorageScope.Workspace, void 0, workspaceId);
    if (resolvedScope !== BrowserViewStorageScope.Workspace) {
      throw new Error("Failed to resolve workspace storage session");
    }
    await session2.clearData();
  }
};
BrowserViewMainService = BrowserViewMainService_1 = __decorate([
  __param(0, IEnvironmentMainService),
  __param(1, IInstantiationService)
], BrowserViewMainService);
export {
  BrowserViewMainService,
  IBrowserViewMainService
};
//# sourceMappingURL=browserViewMainService.js.map
