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
import { timeout } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService, LifecycleMainPhase } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRequestService } from "../../request/common/request.js";
import { AvailableForDownload, DisablementReason, IUpdateService, State, StateType, UpdateType } from "../common/update.js";
function createUpdateURL(platform, quality, productService) {
  return `${productService.updateUrl}/api/update/${platform}/${quality}/${productService.commit}`;
}
__name(createUpdateURL, "createUpdateURL");
let AbstractUpdateService = class {
  constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService) {
    this.lifecycleMainService = lifecycleMainService;
    this.configurationService = configurationService;
    this.environmentMainService = environmentMainService;
    this.requestService = requestService;
    this.logService = logService;
    this.productService = productService;
    lifecycleMainService.when(LifecycleMainPhase.AfterWindowOpen).finally(() => this.initialize());
  }
  static {
    __name(this, "AbstractUpdateService");
  }
  url;
  _state = State.Uninitialized;
  _onStateChange = new Emitter();
  onStateChange = this._onStateChange.event;
  get state() {
    return this._state;
  }
  setState(state) {
    this.logService.info("update#setState", state.type);
    this._state = state;
    this._onStateChange.fire(state);
  }
  /**
   * This must be called before any other call. This is a performance
   * optimization, to avoid using extra CPU cycles before first window open.
   * https://github.com/microsoft/vscode/issues/89784
   */
  async initialize() {
    if (!this.environmentMainService.isBuilt) {
      this.setState(State.Disabled(DisablementReason.NotBuilt));
      return;
    }
    if (this.environmentMainService.disableUpdates) {
      this.setState(State.Disabled(DisablementReason.DisabledByEnvironment));
      this.logService.info("update#ctor - updates are disabled by the environment");
      return;
    }
    if (!this.productService.updateUrl || !this.productService.commit) {
      this.setState(State.Disabled(DisablementReason.MissingConfiguration));
      this.logService.info("update#ctor - updates are disabled as there is no update URL");
      return;
    }
    const updateMode = this.configurationService.getValue("update.mode");
    const quality = this.getProductQuality(updateMode);
    if (!quality) {
      this.setState(State.Disabled(DisablementReason.ManuallyDisabled));
      this.logService.info("update#ctor - updates are disabled by user preference");
      return;
    }
    this.url = this.buildUpdateFeedUrl(quality);
    if (!this.url) {
      this.setState(State.Disabled(DisablementReason.InvalidConfiguration));
      this.logService.info("update#ctor - updates are disabled as the update URL is badly formed");
      return;
    }
    if (this.configurationService.getValue("_update.prss")) {
      const url = new URL(this.url);
      url.searchParams.set("prss", "true");
      this.url = url.toString();
    }
    this.setState(State.Idle(this.getUpdateType()));
    if (updateMode === "manual") {
      this.logService.info("update#ctor - manual checks only; automatic updates are disabled by user preference");
      return;
    }
    if (updateMode === "start") {
      this.logService.info("update#ctor - startup checks only; automatic updates are disabled by user preference");
      setTimeout(() => this.checkForUpdates(false), 30 * 1e3);
    } else {
      this.scheduleCheckForUpdates(30 * 1e3).then(void 0, (err) => this.logService.error(err));
    }
  }
  getProductQuality(updateMode) {
    return updateMode === "none" ? void 0 : this.productService.quality;
  }
  scheduleCheckForUpdates(delay = 60 * 60 * 1e3) {
    return timeout(delay).then(() => this.checkForUpdates(false)).then(() => {
      return this.scheduleCheckForUpdates(60 * 60 * 1e3);
    });
  }
  async checkForUpdates(explicit) {
    this.logService.trace("update#checkForUpdates, state = ", this.state.type);
    if (this.state.type !== StateType.Idle) {
      return;
    }
    this.doCheckForUpdates(explicit);
  }
  async downloadUpdate() {
    this.logService.trace("update#downloadUpdate, state = ", this.state.type);
    if (this.state.type !== StateType.AvailableForDownload) {
      return;
    }
    await this.doDownloadUpdate(this.state);
  }
  async doDownloadUpdate(state) {
  }
  async applyUpdate() {
    this.logService.trace("update#applyUpdate, state = ", this.state.type);
    if (this.state.type !== StateType.Downloaded) {
      return;
    }
    await this.doApplyUpdate();
  }
  async doApplyUpdate() {
  }
  quitAndInstall() {
    this.logService.trace("update#quitAndInstall, state = ", this.state.type);
    if (this.state.type !== StateType.Ready) {
      return Promise.resolve(void 0);
    }
    this.logService.trace("update#quitAndInstall(): before lifecycle quit()");
    this.lifecycleMainService.quit(
      true
      /* will restart */
    ).then((vetod) => {
      this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
      if (vetod) {
        return;
      }
      this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
      this.doQuitAndInstall();
    });
    return Promise.resolve(void 0);
  }
  async isLatestVersion() {
    if (!this.url) {
      return void 0;
    }
    const mode = this.configurationService.getValue("update.mode");
    if (mode === "none") {
      return false;
    }
    try {
      const context = await this.requestService.request({ url: this.url }, CancellationToken.None);
      return context.res.statusCode === 204;
    } catch (error) {
      this.logService.error("update#isLatestVersion(): failed to check for updates");
      this.logService.error(error);
      return void 0;
    }
  }
  async _applySpecificUpdate(packagePath) {
  }
  getUpdateType() {
    return UpdateType.Archive;
  }
  doQuitAndInstall() {
  }
};
AbstractUpdateService = __decorateClass([
  __decorateParam(0, ILifecycleMainService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEnvironmentMainService),
  __decorateParam(3, IRequestService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IProductService)
], AbstractUpdateService);
export {
  AbstractUpdateService,
  createUpdateURL
};
//# sourceMappingURL=abstractUpdateService.js.map
