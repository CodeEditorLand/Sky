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
import * as electron from "electron";
import { memoize } from "../../../base/common/decorators.js";
import { Event } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService, IRelaunchHandler, IRelaunchOptions } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRequestService } from "../../request/common/request.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUpdate, State, StateType, UpdateType } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL, UpdateErrorClassification } from "./abstractUpdateService.js";
let DarwinUpdateService = class extends AbstractUpdateService {
  constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, productService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
    this.telemetryService = telemetryService;
    lifecycleMainService.setRelaunchHandler(this);
  }
  static {
    __name(this, "DarwinUpdateService");
  }
  disposables = new DisposableStore();
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
  handleRelaunch(options) {
    if (options?.addArgs || options?.removeArgs) {
      return false;
    }
    if (this.state.type !== StateType.Ready) {
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
    const message = this.state.type === StateType.CheckingForUpdates && this.state.explicit ? err : void 0;
    this.setState(State.Idle(UpdateType.Archive, message));
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
  doCheckForUpdates(context) {
    this.setState(State.CheckingForUpdates(context));
    electron.autoUpdater.checkForUpdates();
  }
  onUpdateAvailable() {
    if (this.state.type !== StateType.CheckingForUpdates) {
      return;
    }
    this.setState(State.Downloading);
  }
  onUpdateDownloaded(update) {
    if (this.state.type !== StateType.Downloading) {
      return;
    }
    this.setState(State.Downloaded(update));
    this.telemetryService.publicLog2("update:downloaded", { newVersion: update.version });
    this.setState(State.Ready(update));
  }
  onUpdateNotAvailable() {
    if (this.state.type !== StateType.CheckingForUpdates) {
      return;
    }
    this.setState(State.Idle(UpdateType.Archive));
  }
  doQuitAndInstall() {
    this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
    electron.autoUpdater.quitAndInstall();
  }
  dispose() {
    this.disposables.dispose();
  }
};
__decorateClass([
  memoize
], DarwinUpdateService.prototype, "onRawError", 1);
__decorateClass([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateNotAvailable", 1);
__decorateClass([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateAvailable", 1);
__decorateClass([
  memoize
], DarwinUpdateService.prototype, "onRawUpdateDownloaded", 1);
DarwinUpdateService = __decorateClass([
  __decorateParam(0, ILifecycleMainService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IEnvironmentMainService),
  __decorateParam(4, IRequestService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IProductService)
], DarwinUpdateService);
export {
  DarwinUpdateService
};
//# sourceMappingURL=updateService.darwin.js.map
