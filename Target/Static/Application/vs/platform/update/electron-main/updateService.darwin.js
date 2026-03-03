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
import * as electron from "electron";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { memoize } from "../../../base/common/decorators.js";
import { Event } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, IRequestService } from "../../request/common/request.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { State } from "../common/update.js";
import { IMeteredConnectionService } from "../../meteredConnection/common/meteredConnection.js";
import { AbstractUpdateService, createUpdateURL, getUpdateRequestHeaders } from "./abstractUpdateService.js";
let DarwinUpdateService = class DarwinUpdateService2 extends AbstractUpdateService {
  static {
    __name(this, "DarwinUpdateService");
  }
  get onRawError() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "error", (_, message) => message);
  }
  get onRawCheckingForUpdate() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "checking-for-update");
  }
  get onRawUpdateNotAvailable() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-not-available");
  }
  get onRawUpdateAvailable() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-available");
  }
  get onRawUpdateDownloaded() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-downloaded", (_, version, productVersion, releaseDate) => ({
      version,
      productVersion,
      timestamp: releaseDate instanceof Date ? releaseDate.getTime() || void 0 : releaseDate
    }));
  }
  constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService, meteredConnectionService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, meteredConnectionService, true);
    this.telemetryService = telemetryService;
    this.disposables = new DisposableStore();
    lifecycleMainService.setRelaunchHandler(this);
  }
  handleRelaunch(options) {
    if (options?.addArgs || options?.removeArgs) {
      return false;
    }
    if (this.state.type !== "ready") {
      return false;
    }
    this.logService.trace("update#handleRelaunch(): running raw#quitAndInstall()");
    this.doQuitAndInstall();
    return true;
  }
  async initialize() {
    if (process.isEmbeddedApp) {
      this.setState(State.Disabled(
        6
        /* DisablementReason.EmbeddedApp */
      ));
      this.logService.info("update#ctor - updates are disabled from embedded app");
      return;
    }
    await super.initialize();
    this.onRawError(this.onError, this, this.disposables);
    this.onRawCheckingForUpdate(this.onCheckingForUpdate, this, this.disposables);
    this.onRawUpdateAvailable(this.onUpdateAvailable, this, this.disposables);
    this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this.disposables);
    this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this.disposables);
  }
  onCheckingForUpdate() {
    this.logService.trace("update#onCheckingForUpdate - Electron autoUpdater is checking for updates");
  }
  onError(err) {
    this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
    this.logService.error("UpdateService error:", err);
    const message = this.state.type === "checking for updates" && this.state.explicit ? err : void 0;
    this.setState(State.Idle(1, message));
  }
  buildUpdateFeedUrl(quality, commit, options) {
    const assetID = this.productService.darwinUniversalAssetId ?? (process.arch === "x64" ? "darwin" : "darwin-arm64");
    const url = createUpdateURL(this.productService.updateUrl, assetID, quality, commit, options);
    const headers = getUpdateRequestHeaders(this.productService.version);
    try {
      this.logService.trace("update#buildUpdateFeedUrl - setting feed URL for Electron autoUpdater", { url, assetID, quality, commit, headers });
      electron.autoUpdater.setFeedURL({ url, headers });
    } catch (e) {
      this.logService.error("Failed to set update feed URL", e);
      return void 0;
    }
    return url;
  }
  async checkForUpdates(explicit) {
    this.logService.trace("update#checkForUpdates, state = ", this.state.type);
    if (this.state.type !== "idle") {
      return;
    }
    this.doCheckForUpdates(explicit);
  }
  doCheckForUpdates(explicit, pendingCommit) {
    if (!this.quality) {
      return;
    }
    this.setState(State.CheckingForUpdates(explicit));
    const internalOrg = this.getInternalOrg();
    const background = !explicit && !internalOrg;
    const url = this.buildUpdateFeedUrl(this.quality, pendingCommit ?? this.productService.commit, { background, internalOrg });
    if (!url) {
      return;
    }
    if (!explicit && this.meteredConnectionService.isConnectionMetered) {
      this.logService.info("update#doCheckForUpdates - checking for update without auto-download because connection is metered");
      this.checkForUpdateNoDownload(url);
      return;
    }
    this.logService.trace("update#doCheckForUpdates - using Electron autoUpdater", { url, explicit, background });
    electron.autoUpdater.checkForUpdates();
  }
  /**
   * Manually check the update feed URL without triggering Electron's auto-download.
   * Used when connection is metered to show update availability without downloading.
   */
  async checkForUpdateNoDownload(url) {
    const headers = getUpdateRequestHeaders(this.productService.version);
    this.logService.trace("update#checkForUpdateNoDownload - checking update server", { url, headers });
    try {
      const context = await this.requestService.request({ url, headers }, CancellationToken.None);
      const statusCode = context.res.statusCode;
      this.logService.trace("update#checkForUpdateNoDownload - response", { statusCode });
      const update = await asJson(context);
      if (!update || !update.url || !update.version || !update.productVersion) {
        this.logService.trace("update#checkForUpdateNoDownload - no update available");
        this.setState(State.Idle(
          1
          /* UpdateType.Archive */
        ));
      } else {
        this.logService.trace("update#checkForUpdateNoDownload - update available", { version: update.version, productVersion: update.productVersion });
        this.setState(State.AvailableForDownload(update));
      }
    } catch (err) {
      this.logService.error("update#checkForUpdateNoDownload - failed to check for update", err);
      this.setState(State.Idle(
        1
        /* UpdateType.Archive */
      ));
    }
  }
  onUpdateAvailable() {
    this.logService.trace("update#onUpdateAvailable - Electron autoUpdater reported update available");
    if (this.state.type !== "checking for updates" && this.state.type !== "overwriting") {
      return;
    }
    this.setState(State.Downloading(this.state.type === "overwriting" ? this.state.update : void 0, this.state.explicit, this._overwrite));
  }
  onUpdateDownloaded(update) {
    if (this.state.type !== "downloading") {
      return;
    }
    this.setState(State.Downloaded(update, this.state.explicit, this._overwrite));
    this.logService.info(`Update downloaded: ${JSON.stringify(update)}`);
    this.setState(State.Ready(update, this.state.explicit, this._overwrite));
  }
  onUpdateNotAvailable() {
    this.logService.trace("update#onUpdateNotAvailable - Electron autoUpdater reported no update available");
    if (this.state.type !== "checking for updates") {
      return;
    }
    this.setState(State.Idle(
      1
      /* UpdateType.Archive */
    ));
  }
  async doDownloadUpdate(state) {
    this.buildUpdateFeedUrl(this.quality, state.update.version, { internalOrg: this.getInternalOrg() });
    this.setState(State.CheckingForUpdates(true));
    electron.autoUpdater.checkForUpdates();
  }
  doQuitAndInstall() {
    this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
    electron.autoUpdater.quitAndInstall();
  }
  dispose() {
    this.disposables.dispose();
  }
};
__decorate([
  memoize
], DarwinUpdateService.prototype, "onRawError", null);
__decorate([
  memoize
], DarwinUpdateService.prototype, "onRawCheckingForUpdate", null);
__decorate([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", null);
__decorate([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateAvailable", null);
__decorate([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateDownloaded", null);
DarwinUpdateService = __decorate([
  __param(0, ILifecycleMainService),
  __param(1, IConfigurationService),
  __param(2, ITelemetryService),
  __param(3, IEnvironmentMainService),
  __param(4, IRequestService),
  __param(5, ILogService),
  __param(6, IProductService),
  __param(7, IMeteredConnectionService)
], DarwinUpdateService);
export {
  DarwinUpdateService
};
//# sourceMappingURL=updateService.darwin.js.map
