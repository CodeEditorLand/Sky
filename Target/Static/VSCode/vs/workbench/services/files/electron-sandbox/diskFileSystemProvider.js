var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { Event } from "../../../../base/common/event.js";
import { isLinux } from "../../../../base/common/platform.js";
import { FileSystemProviderCapabilities, IFileDeleteOptions, IStat, FileType, IFileReadStreamOptions, IFileWriteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileAtomicReadOptions, IFileSystemProviderWithFileCloneCapability, IFileChange } from "../../../../platform/files/common/files.js";
import { AbstractDiskFileSystemProvider } from "../../../../platform/files/common/diskFileSystemProvider.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ReadableStreamEvents } from "../../../../base/common/stream.js";
import { URI } from "../../../../base/common/uri.js";
import { DiskFileSystemProviderClient, LOCAL_FILE_SYSTEM_CHANNEL_NAME } from "../../../../platform/files/common/diskFileSystemProviderClient.js";
import { ILogMessage, AbstractUniversalWatcherClient } from "../../../../platform/files/common/watcher.js";
import { UniversalWatcherClient } from "./watcherClient.js";
import { ILoggerService, ILogService } from "../../../../platform/log/common/log.js";
import { IUtilityProcessWorkerWorkbenchService } from "../../utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService.js";
import { LogService } from "../../../../platform/log/common/logService.js";
class DiskFileSystemProvider extends AbstractDiskFileSystemProvider {
  constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService, loggerService) {
    super(logService, { watcher: {
      forceUniversal: true
      /* send all requests to universal watcher process */
    } });
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.loggerService = loggerService;
    this.provider = this._register(new DiskFileSystemProviderClient(mainProcessService.getChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: isLinux, trash: true }));
    this.registerListeners();
  }
  static {
    __name(this, "DiskFileSystemProvider");
  }
  provider;
  registerListeners() {
    this._register(this.provider.onDidChangeFile((changes) => this._onDidChangeFile.fire(changes)));
    this._register(this.provider.onDidWatchError((error) => this._onDidWatchError.fire(error)));
  }
  //#region File Capabilities
  get onDidChangeCapabilities() {
    return this.provider.onDidChangeCapabilities;
  }
  get capabilities() {
    return this.provider.capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  stat(resource) {
    return this.provider.stat(resource);
  }
  readdir(resource) {
    return this.provider.readdir(resource);
  }
  //#endregion
  //#region File Reading/Writing
  readFile(resource, opts) {
    return this.provider.readFile(resource, opts);
  }
  readFileStream(resource, opts, token) {
    return this.provider.readFileStream(resource, opts, token);
  }
  writeFile(resource, content, opts) {
    return this.provider.writeFile(resource, content, opts);
  }
  open(resource, opts) {
    return this.provider.open(resource, opts);
  }
  close(fd) {
    return this.provider.close(fd);
  }
  read(fd, pos, data, offset, length) {
    return this.provider.read(fd, pos, data, offset, length);
  }
  write(fd, pos, data, offset, length) {
    return this.provider.write(fd, pos, data, offset, length);
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  mkdir(resource) {
    return this.provider.mkdir(resource);
  }
  delete(resource, opts) {
    return this.provider.delete(resource, opts);
  }
  rename(from, to, opts) {
    return this.provider.rename(from, to, opts);
  }
  copy(from, to, opts) {
    return this.provider.copy(from, to, opts);
  }
  //#endregion
  //#region Clone File
  cloneFile(from, to) {
    return this.provider.cloneFile(from, to);
  }
  //#endregion
  //#region File Watching
  createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
    return new UniversalWatcherClient((changes) => onChange(changes), (msg) => onLogMessage(msg), verboseLogging, this.utilityProcessWorkerWorkbenchService);
  }
  createNonRecursiveWatcher() {
    throw new Error("Method not implemented in sandbox.");
  }
  _watcherLogService = void 0;
  get watcherLogService() {
    if (!this._watcherLogService) {
      this._watcherLogService = new LogService(this.loggerService.createLogger("fileWatcher", { name: localize("fileWatcher", "File Watcher") }));
    }
    return this._watcherLogService;
  }
  logWatcherMessage(msg) {
    this.watcherLogService[msg.type](msg.message);
    if (msg.type !== "trace" && msg.type !== "debug") {
      super.logWatcherMessage(msg);
    }
  }
  //#endregion
}
export {
  DiskFileSystemProvider
};
//# sourceMappingURL=diskFileSystemProvider.js.map
