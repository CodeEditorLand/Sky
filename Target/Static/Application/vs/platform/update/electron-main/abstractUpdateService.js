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
import * as os from "os";
import { IntervalTimer, timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { isMacintosh, isWindows } from "../../../base/common/platform.js";
import { getWindowsReleaseSync } from "../../../base/node/windowsVersion.js";
import { IMeteredConnectionService } from "../../meteredConnection/common/meteredConnection.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRequestService } from "../../request/common/request.js";
import { State } from "../common/update.js";
function createUpdateURL(baseUpdateUrl, platform, quality, commit, options) {
  const url = new URL(`${baseUpdateUrl}/api/update/${platform}/${quality}/${commit}`);
  if (options?.background) {
    url.searchParams.set("bg", "true");
  }
  url.searchParams.set("u", options?.internalOrg ?? "none");
  return url.toString();
}
__name(createUpdateURL, "createUpdateURL");
function getUpdateRequestHeaders(productVersion) {
  if (isMacintosh) {
    const darwinVersion = os.release();
    return {
      "User-Agent": `Code/${productVersion} Darwin/${darwinVersion}`
    };
  }
  if (isWindows) {
    const match = getWindowsReleaseSync().match(/^(\d+\.\d+)/);
    if (match) {
      return {
        "User-Agent": `Code/${productVersion} Electron/${process.versions.electron} Windows NT ${match[1]}`
      };
    }
  }
  return void 0;
}
__name(getUpdateRequestHeaders, "getUpdateRequestHeaders");
let AbstractUpdateService = class AbstractUpdateService2 {
  static {
    __name(this, "AbstractUpdateService");
  }
  get state() {
    return this._state;
  }
  setState(state) {
    this.logService.info("update#setState", state.type);
    this._state = state;
    this._onStateChange.fire(state);
    if (this.supportsUpdateOverwrite) {
      if (state.type === "ready") {
        this.overwriteUpdatesCheckInterval.cancelAndSet(() => this.checkForOverwriteUpdates(), 5 * 60 * 1e3);
      } else {
        this.overwriteUpdatesCheckInterval.cancel();
      }
    }
  }
  constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, meteredConnectionService, supportsUpdateOverwrite) {
    this.lifecycleMainService = lifecycleMainService;
    this.configurationService = configurationService;
    this.environmentMainService = environmentMainService;
    this.requestService = requestService;
    this.logService = logService;
    this.productService = productService;
    this.meteredConnectionService = meteredConnectionService;
    this.supportsUpdateOverwrite = supportsUpdateOverwrite;
    this._state = State.Uninitialized;
    this._overwrite = false;
    this._hasCheckedForOverwriteOnQuit = false;
    this.overwriteUpdatesCheckInterval = new IntervalTimer();
    this._internalOrg = void 0;
    this._onStateChange = new Emitter();
    this.onStateChange = this._onStateChange.event;
    lifecycleMainService.when(
      3
      /* LifecycleMainPhase.AfterWindowOpen */
    ).finally(() => this.initialize());
  }
  /**
   * This must be called before any other call. This is a performance
   * optimization, to avoid using extra CPU cycles before first window open.
   * https://github.com/microsoft/vscode/issues/89784
   */
  async initialize() {
    if (!this.environmentMainService.isBuilt) {
      this.setState(State.Disabled(
        0
        /* DisablementReason.NotBuilt */
      ));
      return;
    }
    if (this.environmentMainService.disableUpdates) {
      this.setState(State.Disabled(
        1
        /* DisablementReason.DisabledByEnvironment */
      ));
      this.logService.info("update#ctor - updates are disabled by the environment");
      return;
    }
    if (!this.productService.updateUrl || !this.productService.commit) {
      this.setState(State.Disabled(
        3
        /* DisablementReason.MissingConfiguration */
      ));
      this.logService.info("update#ctor - updates are disabled as there is no update URL");
      return;
    }
    const updateMode = this.configurationService.getValue("update.mode");
    const quality = this.getProductQuality(updateMode);
    if (!quality) {
      this.setState(State.Disabled(
        2
        /* DisablementReason.ManuallyDisabled */
      ));
      this.logService.info("update#ctor - updates are disabled by user preference");
      return;
    }
    if (!this.buildUpdateFeedUrl(quality, this.productService.commit)) {
      this.setState(State.Disabled(
        4
        /* DisablementReason.InvalidConfiguration */
      ));
      this.logService.info("update#ctor - updates are disabled as the update URL is badly formed");
      return;
    }
    this.quality = quality;
    this.setState(State.Idle(this.getUpdateType()));
    await this.postInitialize();
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
    if (this.state.type !== "idle") {
      return;
    }
    this.doCheckForUpdates(explicit);
  }
  async downloadUpdate(explicit) {
    this.logService.trace("update#downloadUpdate, state = ", this.state.type);
    if (this.state.type !== "available for download") {
      return;
    }
    if (!explicit && this.meteredConnectionService.isConnectionMetered) {
      this.logService.info("update#downloadUpdate - skipping download because connection is metered");
      return;
    }
    await this.doDownloadUpdate(this.state);
  }
  async doDownloadUpdate(state) {
  }
  async applyUpdate() {
    this.logService.trace("update#applyUpdate, state = ", this.state.type);
    if (this.state.type !== "downloaded") {
      return;
    }
    await this.doApplyUpdate();
  }
  async doApplyUpdate() {
  }
  async quitAndInstall() {
    this.logService.trace("update#quitAndInstall, state = ", this.state.type);
    if (this.state.type !== "ready") {
      return void 0;
    }
    if (this.supportsUpdateOverwrite && !this._hasCheckedForOverwriteOnQuit) {
      this._hasCheckedForOverwriteOnQuit = true;
      const didOverwrite = await this.checkForOverwriteUpdates(true);
      if (didOverwrite) {
        this.logService.info("update#quitAndInstall(): overwrite update detected, postponing quitAndInstall");
        return;
      }
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
  async checkForOverwriteUpdates(explicit = false) {
    if (this._state.type !== "ready") {
      return false;
    }
    const pendingUpdateCommit = this._state.update.version;
    let isLatest;
    try {
      const cts = new CancellationTokenSource();
      const timeoutPromise = timeout(2e3).then(() => {
        cts.cancel();
        return void 0;
      });
      isLatest = await Promise.race([this.isLatestVersion(pendingUpdateCommit, cts.token), timeoutPromise]);
      cts.dispose();
    } catch (error) {
      this.logService.warn("update#checkForOverwriteUpdates(): failed to check for updates, proceeding with restart");
      this.logService.warn(error);
      return false;
    }
    if (isLatest === false && this._state.type === "ready") {
      this.logService.info("update#readyStateCheck: newer update available, restarting update machinery");
      try {
        await this.cancelPendingUpdate();
      } catch (error) {
        this.logService.error("update#checkForOverwriteUpdates(): failed to cancel pending update, aborting overwrite");
        this.logService.error(error);
        return false;
      }
      this._overwrite = true;
      this.setState(State.Overwriting(this._state.update, explicit));
      this.doCheckForUpdates(explicit, pendingUpdateCommit);
      return true;
    }
    return false;
  }
  async isLatestVersion(commit, token = CancellationToken.None) {
    if (!this.quality) {
      return void 0;
    }
    const mode = this.configurationService.getValue("update.mode");
    if (mode === "none") {
      return void 0;
    }
    const url = this.buildUpdateFeedUrl(this.quality, commit ?? this.productService.commit);
    if (!url) {
      return void 0;
    }
    const headers = getUpdateRequestHeaders(this.productService.version);
    this.logService.trace("update#isLatestVersion() - checking update server", { url, headers });
    try {
      const context = await this.requestService.request({ url, headers }, token);
      const statusCode = context.res.statusCode;
      this.logService.trace("update#isLatestVersion() - response", { statusCode });
      return statusCode === 204;
    } catch (error) {
      this.logService.error("update#isLatestVersion(): failed to check for updates");
      this.logService.error(error);
      return void 0;
    }
  }
  async _applySpecificUpdate(packagePath) {
  }
  async setInternalOrg(internalOrg) {
    if (this._internalOrg === internalOrg) {
      return;
    }
    this.logService.info("update#setInternalOrg", internalOrg);
    this._internalOrg = internalOrg;
  }
  getInternalOrg() {
    return this._internalOrg;
  }
  getUpdateType() {
    return 1;
  }
  doQuitAndInstall() {
  }
  async postInitialize() {
  }
  async cancelPendingUpdate() {
  }
};
AbstractUpdateService = __decorate([
  __param(0, ILifecycleMainService),
  __param(1, IConfigurationService),
  __param(2, IEnvironmentMainService),
  __param(3, IRequestService),
  __param(4, ILogService),
  __param(5, IProductService),
  __param(6, IMeteredConnectionService)
], AbstractUpdateService);
export {
  AbstractUpdateService,
  createUpdateURL,
  getUpdateRequestHeaders
};
//# sourceMappingURL=abstractUpdateService.js.map
