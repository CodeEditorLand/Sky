var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { shell } from "electron";
import { localize } from "../../../nls.js";
import { isWindows } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { createFileSystemProviderError, FileSystemProviderErrorCode } from "../common/files.js";
import { basename, normalize } from "../../../base/common/path.js";
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher } from "../node/diskFileSystemProviderServer.js";
import { DefaultURITransformer } from "../../../base/common/uriIpc.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel {
  static {
    __name(this, "DiskFileSystemProviderChannel");
  }
  constructor(provider, logService, environmentService) {
    super(provider, logService);
    this.environmentService = environmentService;
  }
  getUriTransformer(ctx) {
    return DefaultURITransformer;
  }
  transformIncoming(uriTransformer, _resource) {
    return URI.revive(_resource);
  }
  //#region Delete: override to support Electron's trash support
  async delete(uriTransformer, _resource, opts) {
    if (!opts.useTrash) {
      return super.delete(uriTransformer, _resource, opts);
    }
    const resource = this.transformIncoming(uriTransformer, _resource);
    const filePath = normalize(resource.fsPath);
    try {
      await shell.trashItem(filePath);
    } catch (error) {
      throw createFileSystemProviderError(isWindows ? localize("binFailed", "Failed to move '{0}' to the recycle bin ({1})", basename(filePath), toErrorMessage(error)) : localize("trashFailed", "Failed to move '{0}' to the trash ({1})", basename(filePath), toErrorMessage(error)), FileSystemProviderErrorCode.Unknown);
    }
  }
  //#endregion
  //#region File Watching
  createSessionFileWatcher(uriTransformer, emitter) {
    return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService);
  }
}
class SessionFileWatcher extends AbstractSessionFileWatcher {
  static {
    __name(this, "SessionFileWatcher");
  }
  watch(req, resource, opts) {
    if (opts.recursive) {
      throw createFileSystemProviderError("Recursive file watching is not supported from main process for performance reasons.", FileSystemProviderErrorCode.Unavailable);
    }
    return super.watch(req, resource, opts);
  }
}
export {
  DiskFileSystemProviderChannel
};
//# sourceMappingURL=diskFileSystemProviderServer.js.map
