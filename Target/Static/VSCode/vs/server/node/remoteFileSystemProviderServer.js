var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../base/common/event.js";
import { URI, UriComponents } from "../../base/common/uri.js";
import { IURITransformer } from "../../base/common/uriIpc.js";
import { IFileChange } from "../../platform/files/common/files.js";
import { ILogService } from "../../platform/log/common/log.js";
import { createURITransformer } from "../../workbench/api/node/uriTransformer.js";
import { RemoteAgentConnectionContext } from "../../platform/remote/common/remoteAgentEnvironment.js";
import { DiskFileSystemProvider } from "../../platform/files/node/diskFileSystemProvider.js";
import { posix, delimiter } from "../../base/common/path.js";
import { IServerEnvironmentService } from "./serverEnvironmentService.js";
import { AbstractDiskFileSystemProviderChannel, AbstractSessionFileWatcher, ISessionFileWatcher } from "../../platform/files/node/diskFileSystemProviderServer.js";
import { IRecursiveWatcherOptions } from "../../platform/files/common/watcher.js";
import { IConfigurationService } from "../../platform/configuration/common/configuration.js";
class RemoteAgentFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel {
  constructor(logService, environmentService, configurationService) {
    super(new DiskFileSystemProvider(logService), logService);
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this._register(this.provider);
  }
  static {
    __name(this, "RemoteAgentFileSystemProviderChannel");
  }
  uriTransformerCache = /* @__PURE__ */ new Map();
  getUriTransformer(ctx) {
    let transformer = this.uriTransformerCache.get(ctx.remoteAuthority);
    if (!transformer) {
      transformer = createURITransformer(ctx.remoteAuthority);
      this.uriTransformerCache.set(ctx.remoteAuthority, transformer);
    }
    return transformer;
  }
  transformIncoming(uriTransformer, _resource, supportVSCodeResource = false) {
    if (supportVSCodeResource && _resource.path === "/vscode-resource" && _resource.query) {
      const requestResourcePath = JSON.parse(_resource.query).requestResourcePath;
      return URI.from({ scheme: "file", path: requestResourcePath });
    }
    return URI.revive(uriTransformer.transformIncoming(_resource));
  }
  //#region File Watching
  createSessionFileWatcher(uriTransformer, emitter) {
    return new SessionFileWatcher(uriTransformer, emitter, this.logService, this.environmentService, this.configurationService);
  }
  //#endregion
}
class SessionFileWatcher extends AbstractSessionFileWatcher {
  static {
    __name(this, "SessionFileWatcher");
  }
  constructor(uriTransformer, sessionEmitter, logService, environmentService, configurationService) {
    super(uriTransformer, sessionEmitter, logService, environmentService);
  }
  getRecursiveWatcherOptions(environmentService) {
    const fileWatcherPolling = environmentService.args["file-watcher-polling"];
    if (fileWatcherPolling) {
      const segments = fileWatcherPolling.split(delimiter);
      const pollingInterval = Number(segments[0]);
      if (pollingInterval > 0) {
        const usePolling = segments.length > 1 ? segments.slice(1) : true;
        return { usePolling, pollingInterval };
      }
    }
    return void 0;
  }
  getExtraExcludes(environmentService) {
    if (environmentService.extensionsPath) {
      return [posix.join(environmentService.extensionsPath, "**")];
    }
    return void 0;
  }
}
export {
  RemoteAgentFileSystemProviderChannel
};
//# sourceMappingURL=remoteFileSystemProviderServer.js.map
