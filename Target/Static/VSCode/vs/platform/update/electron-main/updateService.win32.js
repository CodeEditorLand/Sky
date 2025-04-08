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
import { spawn } from "child_process";
import * as fs from "fs";
import { tmpdir } from "os";
import { timeout } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { memoize } from "../../../base/common/decorators.js";
import { hash } from "../../../base/common/hash.js";
import * as path from "../../../base/common/path.js";
import { URI } from "../../../base/common/uri.js";
import { checksum } from "../../../base/node/crypto.js";
import * as pfs from "../../../base/node/pfs.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { IFileService } from "../../files/common/files.js";
import { ILifecycleMainService, IRelaunchHandler, IRelaunchOptions } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, IRequestService } from "../../request/common/request.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { AvailableForDownload, DisablementReason, IUpdate, State, StateType, UpdateType } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL, UpdateErrorClassification } from "./abstractUpdateService.js";
async function pollUntil(fn, millis = 1e3) {
  while (!fn()) {
    await timeout(millis);
  }
}
__name(pollUntil, "pollUntil");
let _updateType = void 0;
function getUpdateType() {
  if (typeof _updateType === "undefined") {
    _updateType = fs.existsSync(path.join(path.dirname(process.execPath), "unins000.exe")) ? UpdateType.Setup : UpdateType.Archive;
  }
  return _updateType;
}
__name(getUpdateType, "getUpdateType");
let Win32UpdateService = class extends AbstractUpdateService {
  constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
    this.telemetryService = telemetryService;
    this.fileService = fileService;
    this.nativeHostMainService = nativeHostMainService;
    lifecycleMainService.setRelaunchHandler(this);
  }
  static {
    __name(this, "Win32UpdateService");
  }
  availableUpdate;
  get cachePath() {
    const result = path.join(tmpdir(), `vscode-${this.productService.quality}-${this.productService.target}-${process.arch}`);
    return fs.promises.mkdir(result, { recursive: true }).then(() => result);
  }
  handleRelaunch(options) {
    if (options?.addArgs || options?.removeArgs) {
      return false;
    }
    if (this.state.type !== StateType.Ready || !this.availableUpdate) {
      return false;
    }
    this.logService.trace("update#handleRelaunch(): running raw#quitAndInstall()");
    this.doQuitAndInstall();
    return true;
  }
  async initialize() {
    if (this.productService.target === "user" && await this.nativeHostMainService.isAdmin(void 0)) {
      this.setState(State.Disabled(DisablementReason.RunningAsAdmin));
      this.logService.info("update#ctor - updates are disabled due to running as Admin in user setup");
      return;
    }
    await super.initialize();
  }
  buildUpdateFeedUrl(quality) {
    let platform = `win32-${process.arch}`;
    if (getUpdateType() === UpdateType.Archive) {
      platform += "-archive";
    } else if (this.productService.target === "user") {
      platform += "-user";
    }
    return createUpdateURL(platform, quality, this.productService);
  }
  doCheckForUpdates(context) {
    if (!this.url) {
      return;
    }
    this.setState(State.CheckingForUpdates(context));
    this.requestService.request({ url: this.url }, CancellationToken.None).then(asJson).then((update) => {
      const updateType = getUpdateType();
      if (!update || !update.url || !update.version || !update.productVersion) {
        this.setState(State.Idle(updateType));
        return Promise.resolve(null);
      }
      if (updateType === UpdateType.Archive) {
        this.setState(State.AvailableForDownload(update));
        return Promise.resolve(null);
      }
      this.setState(State.Downloading);
      return this.cleanup(update.version).then(() => {
        return this.getUpdatePackagePath(update.version).then((updatePackagePath) => {
          return pfs.Promises.exists(updatePackagePath).then((exists) => {
            if (exists) {
              return Promise.resolve(updatePackagePath);
            }
            const downloadPath = `${updatePackagePath}.tmp`;
            return this.requestService.request({ url: update.url }, CancellationToken.None).then((context2) => this.fileService.writeFile(URI.file(downloadPath), context2.stream)).then(update.sha256hash ? () => checksum(downloadPath, update.sha256hash) : () => void 0).then(() => pfs.Promises.rename(
              downloadPath,
              updatePackagePath,
              false
              /* no retry */
            )).then(() => updatePackagePath);
          });
        }).then((packagePath) => {
          this.availableUpdate = { packagePath };
          this.setState(State.Downloaded(update));
          const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
          if (fastUpdatesEnabled) {
            if (this.productService.target === "user") {
              this.doApplyUpdate();
            }
          } else {
            this.setState(State.Ready(update));
          }
        });
      });
    }).then(void 0, (err) => {
      this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
      this.logService.error(err);
      const message = !!context ? err.message || err : void 0;
      this.setState(State.Idle(getUpdateType(), message));
    });
  }
  async doDownloadUpdate(state) {
    if (state.update.url) {
      this.nativeHostMainService.openExternal(void 0, state.update.url);
    }
    this.setState(State.Idle(getUpdateType()));
  }
  async getUpdatePackagePath(version) {
    const cachePath = await this.cachePath;
    return path.join(cachePath, `CodeSetup-${this.productService.quality}-${version}.exe`);
  }
  async cleanup(exceptVersion = null) {
    const filter = exceptVersion ? (one) => !new RegExp(`${this.productService.quality}-${exceptVersion}\\.exe$`).test(one) : () => true;
    const cachePath = await this.cachePath;
    const versions = await pfs.Promises.readdir(cachePath);
    const promises = versions.filter(filter).map(async (one) => {
      try {
        await fs.promises.unlink(path.join(cachePath, one));
      } catch (err) {
      }
    });
    await Promise.all(promises);
  }
  async doApplyUpdate() {
    if (this.state.type !== StateType.Downloaded) {
      return Promise.resolve(void 0);
    }
    if (!this.availableUpdate) {
      return Promise.resolve(void 0);
    }
    const update = this.state.update;
    this.setState(State.Updating(update));
    const cachePath = await this.cachePath;
    this.availableUpdate.updateFilePath = path.join(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
    await pfs.Promises.writeFile(this.availableUpdate.updateFilePath, "flag");
    const child = spawn(this.availableUpdate.packagePath, ["/verysilent", "/log", `/update="${this.availableUpdate.updateFilePath}"`, "/nocloseapplications", "/mergetasks=runcode,!desktopicon,!quicklaunchicon"], {
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
      windowsVerbatimArguments: true
    });
    child.once("exit", () => {
      this.availableUpdate = void 0;
      this.setState(State.Idle(getUpdateType()));
    });
    const readyMutexName = `${this.productService.win32MutexName}-ready`;
    const mutex = await import("@vscode/windows-mutex");
    pollUntil(() => mutex.isActive(readyMutexName)).then(() => this.setState(State.Ready(update)));
  }
  doQuitAndInstall() {
    if (this.state.type !== StateType.Ready || !this.availableUpdate) {
      return;
    }
    this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
    if (this.availableUpdate.updateFilePath) {
      fs.unlinkSync(this.availableUpdate.updateFilePath);
    } else {
      spawn(this.availableUpdate.packagePath, ["/silent", "/log", "/mergetasks=runcode,!desktopicon,!quicklaunchicon"], {
        detached: true,
        stdio: ["ignore", "ignore", "ignore"]
      });
    }
  }
  getUpdateType() {
    return getUpdateType();
  }
  async _applySpecificUpdate(packagePath) {
    if (this.state.type !== StateType.Idle) {
      return;
    }
    const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
    const update = { version: "unknown", productVersion: "unknown" };
    this.setState(State.Downloading);
    this.availableUpdate = { packagePath };
    this.setState(State.Downloaded(update));
    if (fastUpdatesEnabled) {
      if (this.productService.target === "user") {
        this.doApplyUpdate();
      }
    } else {
      this.setState(State.Ready(update));
    }
  }
};
__decorateClass([
  memoize
], Win32UpdateService.prototype, "cachePath", 1);
Win32UpdateService = __decorateClass([
  __decorateParam(0, ILifecycleMainService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IEnvironmentMainService),
  __decorateParam(4, IRequestService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IFileService),
  __decorateParam(7, INativeHostMainService),
  __decorateParam(8, IProductService)
], Win32UpdateService);
export {
  Win32UpdateService
};
//# sourceMappingURL=updateService.win32.js.map
