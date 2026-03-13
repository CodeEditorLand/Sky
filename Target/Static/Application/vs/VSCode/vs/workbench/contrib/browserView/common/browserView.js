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
var BrowserViewModel_1;
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IPlaywrightService } from "../../../../platform/browserView/common/playwrightService.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { localize } from "../../../../nls.js";
import { BrowserViewStorageScope, browserZoomDefaultIndex, browserZoomFactors } from "../../../../platform/browserView/common/browserView.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { isLocalhostAuthority } from "../../../../platform/url/common/trustedDomains.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IBrowserZoomService } from "./browserZoomService.js";
function parseZoomHost(url) {
  const parsed = URL.parse(url);
  if (!parsed?.host || parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return void 0;
  }
  return parsed.host;
}
__name(parseZoomHost, "parseZoomHost");
const IBrowserViewWorkbenchService = createDecorator("browserViewWorkbenchService");
let BrowserViewModel = class BrowserViewModel2 extends Disposable {
  static {
    __name(this, "BrowserViewModel");
  }
  static {
    BrowserViewModel_1 = this;
  }
  constructor(id, browserViewService, workspaceContextService, workspaceTrustManagementService, telemetryService, configurationService, playwrightService, dialogService, storageService, zoomService) {
    super();
    this.id = id;
    this.browserViewService = browserViewService;
    this.workspaceContextService = workspaceContextService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.playwrightService = playwrightService;
    this.dialogService = dialogService;
    this.storageService = storageService;
    this.zoomService = zoomService;
    this._url = "";
    this._title = "";
    this._favicon = void 0;
    this._screenshot = void 0;
    this._loading = false;
    this._focused = false;
    this._visible = false;
    this._isDevToolsOpen = false;
    this._canGoBack = false;
    this._canGoForward = false;
    this._error = void 0;
    this._storageScope = BrowserViewStorageScope.Ephemeral;
    this._isEphemeral = false;
    this._zoomHost = void 0;
    this._sharedWithAgent = false;
    this._browserZoomIndex = browserZoomDefaultIndex;
    this._onDidChangeSharedWithAgent = this._register(new Emitter());
    this.onDidChangeSharedWithAgent = this._onDidChangeSharedWithAgent.event;
    this._onDidChangeZoom = this._register(new Emitter());
    this.onDidChangeZoom = this._onDidChangeZoom.event;
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
  get focused() {
    return this._focused;
  }
  get visible() {
    return this._visible;
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
  get sharedWithAgent() {
    return this._sharedWithAgent;
  }
  get zoomFactor() {
    return browserZoomFactors[this._browserZoomIndex];
  }
  get canZoomIn() {
    return this._browserZoomIndex < browserZoomFactors.length - 1;
  }
  get canZoomOut() {
    return this._browserZoomIndex > 0;
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
  get onDidFindInPage() {
    return this.browserViewService.onDynamicDidFindInPage(this.id);
  }
  get onDidChangeVisibility() {
    return this.browserViewService.onDynamicDidChangeVisibility(this.id);
  }
  get onDidClose() {
    return this.browserViewService.onDynamicDidClose(this.id);
  }
  /**
   * Initialize the model with the current state from the main process.
   * @param create Whether to create the browser view if it doesn't already exist.
   * @throws If the browser view doesn't exist and `create` is false, or if initialization fails
   */
  async initialize(create) {
    const dataStorageSetting = this.configurationService.getValue("workbench.browser.dataStorage") ?? BrowserViewStorageScope.Global;
    await this.workspaceTrustManagementService.workspaceTrustInitialized;
    const isWorkspaceUntrusted = this.workspaceContextService.getWorkbenchState() !== 1 && !this.workspaceTrustManagementService.isWorkspaceTrusted();
    const dataStorage = isWorkspaceUntrusted ? BrowserViewStorageScope.Ephemeral : dataStorageSetting;
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    const state = create ? await this.browserViewService.getOrCreateBrowserView(this.id, dataStorage, workspaceId) : await this.browserViewService.getState(this.id);
    this._url = state.url;
    this._title = state.title;
    this._loading = state.loading;
    this._focused = state.focused;
    this._visible = state.visible;
    this._isDevToolsOpen = state.isDevToolsOpen;
    this._canGoBack = state.canGoBack;
    this._canGoForward = state.canGoForward;
    this._screenshot = state.lastScreenshot;
    this._favicon = state.lastFavicon;
    this._error = state.lastError;
    this._storageScope = state.storageScope;
    this._sharedWithAgent = await this.playwrightService.isPageTracked(this.id);
    this._browserZoomIndex = state.browserZoomIndex;
    this._isEphemeral = this._storageScope === BrowserViewStorageScope.Ephemeral;
    this._zoomHost = parseZoomHost(this._url);
    const effectiveZoomIndex = this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isEphemeral);
    if (effectiveZoomIndex !== this._browserZoomIndex) {
      await this.setBrowserZoomIndex(effectiveZoomIndex);
    }
    this._register(this.zoomService.onDidChangeZoom(({ host, isEphemeralChange }) => {
      if (isEphemeralChange && !this._isEphemeral) {
        return;
      }
      if (host === void 0 || host === this._zoomHost) {
        void this.setBrowserZoomIndex(this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isEphemeral));
      }
    }));
    this._register(this.onDidNavigate((e) => {
      if (URL.parse(e.url)?.host !== URL.parse(this._url)?.host) {
        this._favicon = void 0;
      }
      this._zoomHost = parseZoomHost(e.url);
      this._url = e.url;
      this._title = e.title;
      this._canGoBack = e.canGoBack;
      this._canGoForward = e.canGoForward;
      void this.setBrowserZoomIndex(this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isEphemeral), true);
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
    this._register(this.onDidChangeFocus(({ focused }) => {
      this._focused = focused;
    }));
    this._register(this.onDidChangeVisibility(({ visible }) => {
      this._visible = visible;
    }));
    this._register(this.playwrightService.onDidChangeTrackedPages((ids) => {
      this._setSharedWithAgent(ids.includes(this.id));
    }));
  }
  async layout(bounds) {
    return this.browserViewService.layout(this.id, bounds);
  }
  async setVisible(visible) {
    this._visible = visible;
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
  async reload(hard) {
    this.logNavigationTelemetry("reload", this._url);
    return this.browserViewService.reload(this.id, hard);
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
  async findInPage(text, options) {
    return this.browserViewService.findInPage(this.id, text, options);
  }
  async stopFindInPage(keepSelection) {
    return this.browserViewService.stopFindInPage(this.id, keepSelection);
  }
  async getSelectedText() {
    return this.browserViewService.getSelectedText(this.id);
  }
  async clearStorage() {
    return this.browserViewService.clearStorage(this.id);
  }
  /**
   * @param forceApply When true, the IPC call is made even if the local cached zoom index
   * already matches the requested value. Pass true after cross-document navigation because
   * Chromium resets the zoom to its per-origin default, making the cache stale.
   */
  async setBrowserZoomIndex(zoomIndex, forceApply = false) {
    const clamped = Math.max(0, Math.min(zoomIndex, browserZoomFactors.length - 1));
    if (!forceApply && clamped === this._browserZoomIndex) {
      return;
    }
    this._browserZoomIndex = clamped;
    await this.browserViewService.setBrowserZoomIndex(this.id, this._browserZoomIndex);
    this._onDidChangeZoom.fire();
  }
  async zoomIn() {
    if (!this.canZoomIn) {
      return;
    }
    await this.setBrowserZoomIndex(this._browserZoomIndex + 1);
    if (this._zoomHost) {
      this.zoomService.setHostZoomIndex(this._zoomHost, this._browserZoomIndex, this._isEphemeral);
    }
  }
  async zoomOut() {
    if (!this.canZoomOut) {
      return;
    }
    await this.setBrowserZoomIndex(this._browserZoomIndex - 1);
    if (this._zoomHost) {
      this.zoomService.setHostZoomIndex(this._zoomHost, this._browserZoomIndex, this._isEphemeral);
    }
  }
  async resetZoom() {
    const defaultIndex = this.zoomService.getEffectiveZoomIndex(void 0, false);
    await this.setBrowserZoomIndex(defaultIndex);
    if (this._zoomHost) {
      this.zoomService.setHostZoomIndex(this._zoomHost, defaultIndex, this._isEphemeral);
    }
  }
  static {
    this.SHARE_DONT_ASK_KEY = "browserView.shareWithAgent.dontAskAgain";
  }
  async setSharedWithAgent(shared) {
    if (shared) {
      const storedChoice = this.storageService.getBoolean(
        BrowserViewModel_1.SHARE_DONT_ASK_KEY,
        0
        /* StorageScope.PROFILE */
      );
      if (!storedChoice) {
        const result = await this.dialogService.confirm({
          type: "question",
          title: localize("browserView.shareWithAgent.title", "Share with Agent?"),
          message: localize("browserView.shareWithAgent.message", "Share this browser page with the agent?"),
          detail: localize("browserView.shareWithAgent.detail", "The agent will be able to read and modify browser content and saved data, including cookies."),
          primaryButton: localize("browserView.shareWithAgent.allow", "&&Allow"),
          cancelButton: localize("browserView.shareWithAgent.deny", "Deny"),
          checkbox: { label: localize("browserView.shareWithAgent.dontAskAgain", "Don't ask again"), checked: false }
        });
        if (result.confirmed && result.checkboxChecked) {
          this.storageService.store(
            BrowserViewModel_1.SHARE_DONT_ASK_KEY,
            result.confirmed,
            0,
            0
            /* StorageTarget.USER */
          );
        }
        this.telemetryService.publicLog2("integratedBrowser.shareWithAgent", {
          shared: result.confirmed,
          dontAskAgain: result.checkboxChecked ?? false
        });
        if (!result.confirmed) {
          return;
        }
      } else {
        this.telemetryService.publicLog2("integratedBrowser.shareWithAgent", {
          shared: true,
          dontAskAgain: true
        });
      }
      await this.playwrightService.startTrackingPage(this.id);
    } else {
      await this.playwrightService.stopTrackingPage(this.id);
    }
  }
  _setSharedWithAgent(isShared) {
    if (isShared !== this._sharedWithAgent) {
      this._sharedWithAgent = isShared;
      this._onDidChangeSharedWithAgent.fire(isShared);
    }
  }
  /**
   * Log navigation telemetry event
   */
  logNavigationTelemetry(navigationType, url) {
    let localhost;
    try {
      localhost = isLocalhostAuthority(new URL(url).host);
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
BrowserViewModel = BrowserViewModel_1 = __decorate([
  __param(2, IWorkspaceContextService),
  __param(3, IWorkspaceTrustManagementService),
  __param(4, ITelemetryService),
  __param(5, IConfigurationService),
  __param(6, IPlaywrightService),
  __param(7, IDialogService),
  __param(8, IStorageService),
  __param(9, IBrowserZoomService)
], BrowserViewModel);
export {
  BrowserViewModel,
  IBrowserViewWorkbenchService
};
//# sourceMappingURL=browserView.js.map
