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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { isLocalhost } from "../../../../platform/tunnel/common/tunnel.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
const IBrowserViewWorkbenchService = createDecorator("browserViewWorkbenchService");
let BrowserViewModel = class BrowserViewModel2 extends Disposable {
  static {
    __name(this, "BrowserViewModel");
  }
  constructor(id, browserViewService, workspaceContextService, workspaceTrustManagementService, telemetryService, configurationService) {
    super();
    this.id = id;
    this.browserViewService = browserViewService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this._url = "";
    this._title = "";
    this._favicon = void 0;
    this._screenshot = void 0;
    this._loading = false;
    this._isDevToolsOpen = false;
    this._canGoBack = false;
    this._canGoForward = false;
    this._error = void 0;
    this._storageScope = BrowserViewStorageScope.Ephemeral;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
  }
  get url() {
    return this._url;
  }
  get title() {
    return this._title;
  }
  get favicon() {
    return this._favicon;
  }
  get loading() {
    return this._loading;
  }
  get isDevToolsOpen() {
    return this._isDevToolsOpen;
  }
  get canGoBack() {
    return this._canGoBack;
  }
  get canGoForward() {
    return this._canGoForward;
  }
  get screenshot() {
    return this._screenshot;
  }
  get error() {
    return this._error;
  }
  get storageScope() {
    return this._storageScope;
  }
  get onDidNavigate() {
    return this.browserViewService.onDynamicDidNavigate(this.id);
  }
  get onDidChangeLoadingState() {
    return this.browserViewService.onDynamicDidChangeLoadingState(this.id);
  }
  get onDidChangeFocus() {
    return this.browserViewService.onDynamicDidChangeFocus(this.id);
  }
  get onDidChangeDevToolsState() {
    return this.browserViewService.onDynamicDidChangeDevToolsState(this.id);
  }
  get onDidKeyCommand() {
    return this.browserViewService.onDynamicDidKeyCommand(this.id);
  }
  get onDidChangeTitle() {
    return this.browserViewService.onDynamicDidChangeTitle(this.id);
  }
  get onDidChangeFavicon() {
    return this.browserViewService.onDynamicDidChangeFavicon(this.id);
  }
  get onDidRequestNewPage() {
    return this.browserViewService.onDynamicDidRequestNewPage(this.id);
  }
  get onDidClose() {
    return this.browserViewService.onDynamicDidClose(this.id);
  }
  /**
   * Initialize the model with the current state from the main process
   */
  async initialize() {
    const dataStorageSetting = this.configurationService.getValue("workbench.browser.dataStorage") ?? BrowserViewStorageScope.Global;
    await this.workspaceTrustManagementService.workspaceTrustInitialized;
    const isWorkspaceUntrusted = this.workspaceContextService.getWorkbenchState() !== 1 && !this.workspaceTrustManagementService.isWorkspaceTrusted();
    const dataStorage = isWorkspaceUntrusted ? BrowserViewStorageScope.Ephemeral : dataStorageSetting;
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    const state = await this.browserViewService.getOrCreateBrowserView(this.id, dataStorage, workspaceId);
    this._url = state.url;
    this._title = state.title;
    this._loading = state.loading;
    this._isDevToolsOpen = state.isDevToolsOpen;
    this._canGoBack = state.canGoBack;
    this._canGoForward = state.canGoForward;
    this._screenshot = state.lastScreenshot;
    this._favicon = state.lastFavicon;
    this._error = state.lastError;
    this._storageScope = state.storageScope;
    this._register(this.onDidNavigate((e) => {
      if (URL.parse(e.url)?.host !== URL.parse(this._url)?.host) {
        this._favicon = void 0;
      }
      this._url = e.url;
      this._canGoBack = e.canGoBack;
      this._canGoForward = e.canGoForward;
    }));
    this._register(this.onDidChangeLoadingState((e) => {
      this._loading = e.loading;
      this._error = e.error;
    }));
    this._register(this.onDidChangeDevToolsState((e) => {
      this._isDevToolsOpen = e.isDevToolsOpen;
    }));
    this._register(this.onDidChangeTitle((e) => {
      this._title = e.title;
    }));
    this._register(this.onDidChangeFavicon((e) => {
      this._favicon = e.favicon;
    }));
  }
  async layout(bounds) {
    return this.browserViewService.layout(this.id, bounds);
  }
  async setVisible(visible) {
    return this.browserViewService.setVisible(this.id, visible);
  }
  async loadURL(url) {
    this.logNavigationTelemetry("urlInput", url);
    return this.browserViewService.loadURL(this.id, url);
  }
  async goBack() {
    this.logNavigationTelemetry("goBack", this._url);
    return this.browserViewService.goBack(this.id);
  }
  async goForward() {
    this.logNavigationTelemetry("goForward", this._url);
    return this.browserViewService.goForward(this.id);
  }
  async reload() {
    this.logNavigationTelemetry("reload", this._url);
    return this.browserViewService.reload(this.id);
  }
  async toggleDevTools() {
    return this.browserViewService.toggleDevTools(this.id);
  }
  async captureScreenshot(options) {
    const result = await this.browserViewService.captureScreenshot(this.id, options);
    if (!options?.rect) {
      this._screenshot = result;
    }
    return result;
  }
  async dispatchKeyEvent(keyEvent) {
    return this.browserViewService.dispatchKeyEvent(this.id, keyEvent);
  }
  async focus() {
    return this.browserViewService.focus(this.id);
  }
  /**
   * Log navigation telemetry event
   */
  logNavigationTelemetry(navigationType, url) {
    let localhost;
    try {
      localhost = isLocalhost(new URL(url).hostname);
    } catch {
      localhost = false;
    }
    this.telemetryService.publicLog2("integratedBrowser.navigation", {
      navigationType,
      isLocalhost: localhost
    });
  }
  dispose() {
    this._onWillDispose.fire();
    void this.browserViewService.destroyBrowserView(this.id);
    super.dispose();
  }
};
BrowserViewModel = __decorate([
  __param(2, IWorkspaceContextService),
  __param(3, IWorkspaceTrustManagementService),
  __param(4, ITelemetryService),
  __param(5, IConfigurationService)
], BrowserViewModel);
export {
  BrowserViewModel,
  IBrowserViewWorkbenchService
};
//# sourceMappingURL=browserView.js.map
