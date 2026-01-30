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
import { memoize } from "../../../base/common/decorators.js";
import { Event } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRequestService } from "../../request/common/request.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { State } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL } from "./abstractUpdateService.js";
let DarwinUpdateService = class DarwinUpdateService2 extends AbstractUpdateService {
  static {
    __name(this, "DarwinUpdateService");
  }
  get onRawError() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "error", (_, message) => message);
  }
  get onRawUpdateNotAvailable() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-not-available");
  }
  get onRawUpdateAvailable() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-available");
  }
  get onRawUpdateDownloaded() {
    return Event.fromNodeEventEmitter(electron.autoUpdater, "update-downloaded", (_, releaseNotes, version, timestamp) => ({ version, productVersion: version, timestamp }));
  }
  constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
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
    await super.initialize();
    this.onRawError(this.onError, this, this.disposables);
    this.onRawUpdateAvailable(this.onUpdateAvailable, this, this.disposables);
    this.onRawUpdateDownloaded(this.onUpdateDownloaded, this, this.disposables);
    this.onRawUpdateNotAvailable(this.onUpdateNotAvailable, this, this.disposables);
  }
  onError(err) {
    this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
    this.logService.error("UpdateService error:", err);
    const message = this.state.type === "checking for updates" && this.state.explicit ? err : void 0;
    this.setState(State.Idle(1, message));
  }
  buildUpdateFeedUrl(quality) {
    let assetID;
    if (!this.productService.darwinUniversalAssetId) {
      assetID = process.arch === "x64" ? "darwin" : "darwin-arm64";
    } else {
      assetID = this.productService.darwinUniversalAssetId;
    }
    const url = createUpdateURL(assetID, quality, this.productService);
    try {
      electron.autoUpdater.setFeedURL({ url });
    } catch (e) {
      this.logService.error("Failed to set update feed URL", e);
      return void 0;
    }
    return url;
  }
  doCheckForUpdates(explicit) {
    if (!this.url) {
      return;
    }
    this.setState(State.CheckingForUpdates(explicit));
    const url = explicit ? this.url : `${this.url}?bg=true`;
    electron.autoUpdater.setFeedURL({ url });
    electron.autoUpdater.checkForUpdates();
  }
  onUpdateAvailable() {
    if (this.state.type !== "checking for updates") {
      return;
    }
    this.setState(State.Downloading);
  }
  onUpdateDownloaded(update) {
    if (this.state.type !== "downloading") {
      return;
    }
    this.setState(State.Downloaded(update));
    this.telemetryService.publicLog2("update:downloaded", { newVersion: update.version });
    this.setState(State.Ready(update));
  }
  onUpdateNotAvailable() {
    if (this.state.type !== "checking for updates") {
      return;
    }
    this.setState(State.Idle(
      1
      /* UpdateType.Archive */
    ));
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
  __param(6, IProductService)
], DarwinUpdateService);
export {
  DarwinUpdateService
};
//# sourceMappingURL=updateService.darwin.js.map
