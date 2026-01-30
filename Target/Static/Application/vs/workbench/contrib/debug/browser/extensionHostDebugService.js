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
var BrowserExtensionHostDebugService_1;
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IExtensionHostDebugService } from "../../../../platform/debug/common/extensionHostDebug.js";
import { ExtensionHostDebugBroadcastChannel, ExtensionHostDebugChannelClient } from "../../../../platform/debug/common/extensionHostDebugIpc.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { isFolderToOpen, isWorkspaceToOpen } from "../../../../platform/window/common/window.js";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier, hasWorkspaceFileExtension } from "../../../../platform/workspace/common/workspace.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
let BrowserExtensionHostDebugService = class BrowserExtensionHostDebugService2 extends ExtensionHostDebugChannelClient {
  static {
    __name(this, "BrowserExtensionHostDebugService");
  }
  static {
    BrowserExtensionHostDebugService_1 = this;
  }
  static {
    this.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY = "debug.lastExtensionDevelopmentWorkspace";
  }
  constructor(remoteAgentService, environmentService, logService, hostService, contextService, storageService, fileService) {
    const connection = remoteAgentService.getConnection();
    let channel;
    if (connection) {
      channel = connection.getChannel(ExtensionHostDebugBroadcastChannel.ChannelName);
    } else {
      channel = { call: /* @__PURE__ */ __name(async () => Promise.resolve(void 0), "call"), listen: /* @__PURE__ */ __name(() => Event.None, "listen") };
    }
    super(channel);
    this.storageService = storageService;
    this.fileService = fileService;
    if (environmentService.options && environmentService.options.workspaceProvider) {
      this.workspaceProvider = environmentService.options.workspaceProvider;
    } else {
      this.workspaceProvider = { open: /* @__PURE__ */ __name(async () => true, "open"), workspace: void 0, trusted: void 0 };
      logService.warn("Extension Host Debugging not available due to missing workspace provider.");
    }
    this._register(this.onReload((event) => {
      if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
        hostService.reload();
      }
    }));
    this._register(this.onClose((event) => {
      if (environmentService.isExtensionDevelopment && environmentService.debugExtensionHost.debugId === event.sessionId) {
        hostService.close();
      }
    }));
    if (environmentService.isExtensionDevelopment && !environmentService.extensionTestsLocationURI) {
      const workspaceId = toWorkspaceIdentifier(contextService.getWorkspace());
      if (isSingleFolderWorkspaceIdentifier(workspaceId) || isWorkspaceIdentifier(workspaceId)) {
        const serializedWorkspace = isSingleFolderWorkspaceIdentifier(workspaceId) ? { folderUri: workspaceId.uri.toJSON() } : { workspaceUri: workspaceId.configPath.toJSON() };
        storageService.store(
          BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,
          JSON.stringify(serializedWorkspace),
          0,
          1
          /* StorageTarget.MACHINE */
        );
      } else {
        storageService.remove(
          BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,
          0
          /* StorageScope.PROFILE */
        );
      }
    }
  }
  async openExtensionDevelopmentHostWindow(args, _debugRenderer) {
    const environment = /* @__PURE__ */ new Map();
    const fileUriArg = this.findArgument("file-uri", args);
    if (fileUriArg && !hasWorkspaceFileExtension(fileUriArg)) {
      environment.set("openFile", fileUriArg);
    }
    const copyArgs = [
      "extensionDevelopmentPath",
      "extensionTestsPath",
      "extensionEnvironment",
      "debugId",
      "inspect-brk-extensions",
      "inspect-extensions"
    ];
    for (const argName of copyArgs) {
      const value = this.findArgument(argName, args);
      if (value) {
        environment.set(argName, value);
      }
    }
    let debugWorkspace = void 0;
    const folderUriArg = this.findArgument("folder-uri", args);
    if (folderUriArg) {
      debugWorkspace = { folderUri: URI.parse(folderUriArg) };
    } else {
      const fileUriArg2 = this.findArgument("file-uri", args);
      if (fileUriArg2 && hasWorkspaceFileExtension(fileUriArg2)) {
        debugWorkspace = { workspaceUri: URI.parse(fileUriArg2) };
      }
    }
    const extensionTestsPath = this.findArgument("extensionTestsPath", args);
    if (!debugWorkspace && !extensionTestsPath) {
      const lastExtensionDevelopmentWorkspace = this.storageService.get(
        BrowserExtensionHostDebugService_1.LAST_EXTENSION_DEVELOPMENT_WORKSPACE_KEY,
        0
        /* StorageScope.PROFILE */
      );
      if (lastExtensionDevelopmentWorkspace) {
        try {
          const serializedWorkspace = JSON.parse(lastExtensionDevelopmentWorkspace);
          if (serializedWorkspace.workspaceUri) {
            debugWorkspace = { workspaceUri: URI.revive(serializedWorkspace.workspaceUri) };
          } else if (serializedWorkspace.folderUri) {
            debugWorkspace = { folderUri: URI.revive(serializedWorkspace.folderUri) };
          }
        } catch (error) {
        }
      }
    }
    if (debugWorkspace) {
      const debugWorkspaceResource = isFolderToOpen(debugWorkspace) ? debugWorkspace.folderUri : isWorkspaceToOpen(debugWorkspace) ? debugWorkspace.workspaceUri : void 0;
      if (debugWorkspaceResource) {
        const workspaceExists = await this.fileService.exists(debugWorkspaceResource);
        if (!workspaceExists) {
          debugWorkspace = void 0;
        }
      }
    }
    const success = await this.workspaceProvider.open(debugWorkspace, {
      reuse: false,
      // debugging always requires a new window
      payload: Array.from(environment.entries())
      // mandatory properties to enable debugging
    });
    return { success };
  }
  findArgument(key, args) {
    for (const a of args) {
      const k = `--${key}=`;
      if (a.indexOf(k) === 0) {
        return a.substring(k.length);
      }
    }
    return void 0;
  }
};
BrowserExtensionHostDebugService = BrowserExtensionHostDebugService_1 = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IBrowserWorkbenchEnvironmentService),
  __param(2, ILogService),
  __param(3, IHostService),
  __param(4, IWorkspaceContextService),
  __param(5, IStorageService),
  __param(6, IFileService)
], BrowserExtensionHostDebugService);
registerSingleton(
  IExtensionHostDebugService,
  BrowserExtensionHostDebugService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=extensionHostDebugService.js.map
