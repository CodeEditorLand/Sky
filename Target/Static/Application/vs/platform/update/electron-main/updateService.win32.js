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
import { spawn } from "child_process";
import { app } from "electron";
import { existsSync, unlinkSync } from "fs";
import { mkdir, readFile, unlink } from "fs/promises";
import { release, tmpdir } from "os";
import { Delayer, ProcessTimeRunOnceScheduler, timeout } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { memoize } from "../../../base/common/decorators.js";
import { hash } from "../../../base/common/hash.js";
import * as path from "../../../base/common/path.js";
import { basename } from "../../../base/common/path.js";
import { transform } from "../../../base/common/stream.js";
import { URI } from "../../../base/common/uri.js";
import { checksum } from "../../../base/node/crypto.js";
import * as pfs from "../../../base/node/pfs.js";
import { killTree } from "../../../base/node/processes.js";
import { getWindowsRelease } from "../../../base/node/windowsVersion.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { IFileService } from "../../files/common/files.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IMeteredConnectionService } from "../../meteredConnection/common/meteredConnection.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, IRequestService } from "../../request/common/request.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { State } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL, getUpdateRequestHeaders } from "./abstractUpdateService.js";
let _updateType = void 0;
function getUpdateType() {
  if (typeof _updateType === "undefined") {
    _updateType = existsSync(path.join(path.dirname(process.execPath), "unins000.exe")) ? 0 : 1;
  }
  return _updateType;
}
__name(getUpdateType, "getUpdateType");
let Win32UpdateService = class Win32UpdateService2 extends AbstractUpdateService {
  static {
    __name(this, "Win32UpdateService");
  }
  get cachePath() {
    const result = path.join(tmpdir(), `vscode-${this.productService.quality}-${this.productService.target}-${process.arch}`);
    return mkdir(result, { recursive: true }).then(() => result);
  }
  constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, fileService, nativeHostMainService, productService, meteredConnectionService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, meteredConnectionService, true);
    this.telemetryService = telemetryService;
    this.fileService = fileService;
    this.nativeHostMainService = nativeHostMainService;
    lifecycleMainService.setRelaunchHandler(this);
  }
  handleRelaunch(options) {
    if (options?.addArgs || options?.removeArgs) {
      return false;
    }
    if (this.state.type !== "ready" || !this.availableUpdate) {
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
    if (this.productService.win32VersionedUpdate) {
      const cachePath = await this.cachePath;
      app.setPath("appUpdate", cachePath);
      await this.unlink(path.join(cachePath, "session-ending.flag"));
    }
    const osRelease = await getWindowsRelease();
    const osNodeRelease = release();
    this.telemetryService.publicLog2("windowsUpdateInit", { osRelease, osNodeRelease });
    if (this.productService.target === "user" && await this.nativeHostMainService.isAdmin(void 0)) {
      this.setState(State.Disabled(
        5
        /* DisablementReason.RunningAsAdmin */
      ));
      this.logService.info("update#ctor - updates are disabled due to running as Admin in user setup");
      return;
    }
    await super.initialize();
  }
  async postInitialize() {
    if (!this.productService.win32VersionedUpdate) {
      return;
    }
    const exePath = app.getPath("exe");
    const exeDir = path.dirname(exePath);
    const updatingVersionPath = path.join(exeDir, "updating_version");
    if (await pfs.Promises.exists(updatingVersionPath)) {
      try {
        const updatingVersion = (await readFile(updatingVersionPath, "utf8")).trim();
        this.logService.info(`update#doCheckForUpdates - application was updating to version ${updatingVersion}`);
        const updatePackagePath = await this.getUpdatePackagePath(updatingVersion);
        if (await pfs.Promises.exists(updatePackagePath)) {
          await this._applySpecificUpdate(updatePackagePath);
          this.logService.info(`update#doCheckForUpdates - successfully applied update to version ${updatingVersion}`);
        }
      } catch (e) {
        this.logService.error(`update#doCheckForUpdates - could not read ${updatingVersionPath}`, e);
      } finally {
      }
    } else {
      const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
      if (fastUpdatesEnabled && this.productService.target === "user" && this.productService.commit) {
        const versionedResourcesFolder = this.productService.commit.substring(0, 10);
        const innoUpdater = path.join(exeDir, versionedResourcesFolder, "tools", "inno_updater.exe");
        await new Promise((resolve) => {
          const child = spawn(innoUpdater, ["--gc", exePath, versionedResourcesFolder], {
            stdio: ["ignore", "ignore", "ignore"],
            windowsHide: true,
            timeout: 2 * 60 * 1e3
          });
          child.once("exit", () => resolve());
        });
      }
    }
  }
  buildUpdateFeedUrl(quality, commit, options) {
    let platform = `win32-${process.arch}`;
    if (getUpdateType() === 1) {
      platform += "-archive";
    } else if (this.productService.target === "user") {
      platform += "-user";
    }
    return createUpdateURL(this.productService.updateUrl, platform, quality, commit, options);
  }
  doCheckForUpdates(explicit, pendingCommit) {
    if (!this.quality) {
      return;
    }
    const internalOrg = this.getInternalOrg();
    const background = !explicit && !internalOrg;
    const url = this.buildUpdateFeedUrl(this.quality, pendingCommit ?? this.productService.commit, { background, internalOrg });
    if (this.state.type !== "overwriting") {
      this.setState(State.CheckingForUpdates(explicit));
    }
    const headers = getUpdateRequestHeaders(this.productService.version);
    this.requestService.request({ url, headers }, CancellationToken.None).then(asJson).then((update) => {
      const updateType = getUpdateType();
      if (!update || !update.url || !update.version || !update.productVersion) {
        if (this.state.type === "overwriting") {
          this._overwrite = false;
          this.setState(State.Ready(this.state.update, this.state.explicit, false));
        } else {
          this.setState(State.Idle(updateType));
        }
        return Promise.resolve(null);
      }
      if (updateType === 1) {
        this.setState(State.AvailableForDownload(update));
        return Promise.resolve(null);
      }
      if (!explicit && this.meteredConnectionService.isConnectionMetered) {
        this.logService.info("update#doCheckForUpdates - update available but skipping download because connection is metered");
        this.setState(State.AvailableForDownload(update));
        return Promise.resolve(null);
      }
      const startTime = Date.now();
      this.setState(State.Downloading(update, explicit, this._overwrite, 0, void 0, startTime));
      return this.cleanup(update.version).then(() => {
        return this.getUpdatePackagePath(update.version).then((updatePackagePath) => {
          return pfs.Promises.exists(updatePackagePath).then((exists) => {
            if (exists) {
              return Promise.resolve(updatePackagePath);
            }
            const downloadPath = `${updatePackagePath}.tmp`;
            return this.requestService.request({ url: update.url }, CancellationToken.None).then((context) => {
              const contentLengthHeader = context.res.headers["content-length"];
              const contentLength = typeof contentLengthHeader === "string" ? contentLengthHeader : void 0;
              const totalBytes = contentLength ? parseInt(contentLength, 10) : void 0;
              let downloadedBytes = 0;
              const progressDelayer = new Delayer(500);
              const progressStream = transform(context.stream, {
                data: /* @__PURE__ */ __name((data) => {
                  downloadedBytes += data.byteLength;
                  progressDelayer.trigger(() => {
                    this.setState(State.Downloading(update, explicit, this._overwrite, downloadedBytes, totalBytes, startTime));
                  });
                  return data;
                }, "data")
              }, (chunks) => VSBuffer.concat(chunks));
              return this.fileService.writeFile(URI.file(downloadPath), progressStream).finally(() => progressDelayer.dispose());
            }).then(update.sha256hash ? () => checksum(downloadPath, update.sha256hash) : () => void 0).then(() => pfs.Promises.rename(
              downloadPath,
              updatePackagePath,
              false
              /* no retry */
            )).then(() => updatePackagePath);
          });
        }).then((packagePath) => {
          this.availableUpdate = { packagePath };
          this.saveUpdateMetadata(update);
          this.setState(State.Downloaded(update, explicit, this._overwrite));
          const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
          if (fastUpdatesEnabled && this.productService.target === "user") {
            this.doApplyUpdate();
          } else {
            this.setState(State.Ready(update, explicit, this._overwrite));
          }
        });
      });
    }).then(void 0, (err) => {
      this.telemetryService.publicLog2("update:error", { messageHash: String(hash(String(err))) });
      this.logService.error(err);
      const message = explicit ? err.message || err : void 0;
      if (this.state.type === "overwriting") {
        this._overwrite = false;
        this.setState(State.Ready(this.state.update, this.state.explicit, false));
      } else {
        this.setState(State.Idle(getUpdateType(), message));
      }
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
    const promises = versions.filter(filter).map((one) => this.unlink(path.join(cachePath, one)));
    await Promise.all(promises);
  }
  async doApplyUpdate() {
    if (this.state.type !== "downloaded") {
      return Promise.resolve(void 0);
    }
    if (!this.availableUpdate) {
      return Promise.resolve(void 0);
    }
    const update = this.state.update;
    const explicit = this.state.explicit;
    this.setState(State.Updating(update));
    const cachePath = await this.cachePath;
    const sessionEndFlagPath = path.join(cachePath, "session-ending.flag");
    const cancelFilePath = path.join(cachePath, `cancel.flag`);
    await this.unlink(cancelFilePath);
    const progressFilePath = path.join(cachePath, `update-progress`);
    await this.unlink(progressFilePath);
    this.availableUpdate.updateFilePath = path.join(cachePath, `CodeSetup-${this.productService.quality}-${update.version}.flag`);
    this.availableUpdate.cancelFilePath = cancelFilePath;
    await pfs.Promises.writeFile(this.availableUpdate.updateFilePath, "flag");
    const child = spawn(this.availableUpdate.packagePath, [
      "/verysilent",
      "/log",
      `/update="${this.availableUpdate.updateFilePath}"`,
      `/progress="${progressFilePath}"`,
      `/sessionend="${sessionEndFlagPath}"`,
      `/cancel="${cancelFilePath}"`,
      "/nocloseapplications",
      "/mergetasks=runcode,!desktopicon,!quicklaunchicon"
    ], {
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
      windowsVerbatimArguments: true,
      env: { ...process.env, __COMPAT_LAYER: "RunAsInvoker" }
    });
    this.availableUpdate.updateProcess = child;
    child.once("exit", () => {
      this.availableUpdate = void 0;
      this.setState(State.Idle(getUpdateType()));
    });
    const readyMutexName = `${this.productService.win32MutexName}-ready`;
    const mutex = await import("@vscode/windows-mutex");
    this.updateCancellationTokenSource?.dispose(true);
    const cts = this.updateCancellationTokenSource = new CancellationTokenSource();
    const token = cts.token;
    const poll = /* @__PURE__ */ __name(async () => {
      while (this.state.type === "updating" && !token.isCancellationRequested) {
        if (mutex.isActive(readyMutexName)) {
          this.setState(State.Ready(update, explicit, this._overwrite));
          return;
        }
        try {
          const progressContent = await readFile(progressFilePath, "utf8");
          if (!token.isCancellationRequested) {
            const [currentStr, maxStr] = progressContent.split(",");
            const currentProgress = parseInt(currentStr, 10);
            const maxProgress = parseInt(maxStr, 10);
            if (!isNaN(currentProgress) && !isNaN(maxProgress) && this.state.type === "updating") {
              if (this.state.currentProgress !== currentProgress || this.state.maxProgress !== maxProgress) {
                this.setState(State.Updating(update, currentProgress, maxProgress));
              }
            }
          }
        } catch {
        }
        await timeout(500);
      }
    }, "poll");
    const cancelTimeout = new ProcessTimeRunOnceScheduler(() => {
      this.logService.warn("update#doApplyUpdate: polling timed out waiting for update to be ready");
      this.setState(State.Idle(getUpdateType(), "Update did not complete within expected time"));
    }, 60 * 60 * 1e3);
    cancelTimeout.schedule();
    poll().finally(() => {
      cancelTimeout.dispose();
      if (this.updateCancellationTokenSource === cts) {
        this.updateCancellationTokenSource = void 0;
      }
      cts.dispose();
    });
  }
  async cancelPendingUpdate() {
    if (!this.availableUpdate) {
      return;
    }
    this.updateCancellationTokenSource?.dispose(true);
    this.updateCancellationTokenSource = void 0;
    this.logService.trace("update#cancelPendingUpdate: cancelling pending update");
    const { updateProcess, updateFilePath, cancelFilePath } = this.availableUpdate;
    if (updateProcess && updateProcess.exitCode === null) {
      updateProcess.removeAllListeners();
      const exitPromise = new Promise((resolve) => updateProcess.once("exit", () => resolve(true)));
      if (cancelFilePath) {
        try {
          await pfs.Promises.writeFile(cancelFilePath, "cancel");
        } catch (err) {
          this.logService.warn("update#cancelPendingUpdate: failed to write cancel file", err);
        }
      }
      const pid = updateProcess.pid;
      const exited = await Promise.race([exitPromise, timeout(30 * 1e3).then(() => false)]);
      if (pid && !exited) {
        this.logService.trace("update#cancelPendingUpdate: process did not exit gracefully, killing process tree");
        await killTree(pid, true);
      }
    }
    await this.unlink(updateFilePath);
    await this.unlink(cancelFilePath);
    this.availableUpdate = void 0;
  }
  doQuitAndInstall() {
    if (this.state.type !== "ready" || !this.availableUpdate) {
      return;
    }
    this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
    if (this.availableUpdate.updateFilePath) {
      try {
        unlinkSync(this.availableUpdate.updateFilePath);
      } catch {
      }
    } else {
      spawn(this.availableUpdate.packagePath, ["/silent", "/log", "/mergetasks=runcode,!desktopicon,!quicklaunchicon"], {
        detached: true,
        stdio: ["ignore", "ignore", "ignore"],
        env: { ...process.env, __COMPAT_LAYER: "RunAsInvoker" }
      });
    }
  }
  async saveUpdateMetadata(update) {
    try {
      const cachePath = await this.cachePath;
      const metadataPath = path.join(cachePath, "update-metadata.json");
      await pfs.Promises.writeFile(metadataPath, JSON.stringify(update));
    } catch (e) {
      this.logService.error("update#saveUpdateMetadata: failed to save", e);
    }
  }
  async loadUpdateMetadata() {
    try {
      const cachePath = await this.cachePath;
      const metadataPath = path.join(cachePath, "update-metadata.json");
      if (await pfs.Promises.exists(metadataPath)) {
        const content = await readFile(metadataPath, "utf8");
        return JSON.parse(content);
      }
    } catch (e) {
      this.logService.error("update#loadUpdateMetadata: failed to load", e);
    }
    return void 0;
  }
  getUpdateType() {
    return getUpdateType();
  }
  async _applySpecificUpdate(packagePath) {
    if (this.state.type !== "idle") {
      return;
    }
    const fastUpdatesEnabled = this.configurationService.getValue("update.enableWindowsBackgroundUpdates");
    const update = await this.loadUpdateMetadata() ?? { version: "unknown", productVersion: "unknown" };
    this.setState(State.Downloading(update, true, false));
    this.availableUpdate = { packagePath };
    this.setState(State.Downloaded(update, true, false));
    if (fastUpdatesEnabled && this.productService.target === "user") {
      this.doApplyUpdate();
    } else {
      this.setState(State.Ready(update, true, false));
    }
  }
  async unlink(path2) {
    if (path2) {
      try {
        await unlink(path2);
      } catch (err) {
        const error = err;
        if (error && error.code === "ENOENT") {
          return;
        } else {
          this.logService.warn(`update#unlink: failed to unlink ${basename(path2)}`, err);
        }
      }
    }
  }
};
__decorate([
  memoize
], Win32UpdateService.prototype, "cachePath", null);
Win32UpdateService = __decorate([
  __param(0, ILifecycleMainService),
  __param(1, IConfigurationService),
  __param(2, ITelemetryService),
  __param(3, IEnvironmentMainService),
  __param(4, IRequestService),
  __param(5, ILogService),
  __param(6, IFileService),
  __param(7, INativeHostMainService),
  __param(8, IProductService),
  __param(9, IMeteredConnectionService)
], Win32UpdateService);
export {
  Win32UpdateService
};
//# sourceMappingURL=updateService.win32.js.map
