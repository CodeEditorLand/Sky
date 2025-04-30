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
import { DisposableMap } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { joinPath } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { FilesystemMcpDiscovery } from "./nativeMcpDiscoveryAbstract.js";
import { claudeConfigToServerDefinition } from "./nativeMcpDiscoveryAdapters.js";
let CursorWorkspaceMcpDiscoveryAdapter = class CursorWorkspaceMcpDiscoveryAdapter2 extends FilesystemMcpDiscovery {
  static {
    __name(this, "CursorWorkspaceMcpDiscoveryAdapter");
  }
  constructor(fileService, _workspaceContextService, mcpRegistry, configurationService, _remoteAgentService) {
    super(configurationService, fileService, mcpRegistry);
    this._workspaceContextService = _workspaceContextService;
    this._remoteAgentService = _remoteAgentService;
    this._collections = this._register(new DisposableMap());
  }
  start() {
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders((e) => {
      for (const removed of e.removed) {
        this._collections.deleteAndDispose(removed.uri.toString());
      }
      for (const added of e.added) {
        this.watchFolder(added);
      }
    }));
    for (const folder of this._workspaceContextService.getWorkspace().folders) {
      this.watchFolder(folder);
    }
  }
  watchFolder(folder) {
    const configFile = joinPath(folder.uri, ".cursor", "mcp.json");
    const collection = {
      id: `cursor-workspace.${folder.index}`,
      label: `${folder.name}/.cursor/mcp.json`,
      remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority || null,
      scope: 1,
      isTrustedByDefault: false,
      serverDefinitions: observableValue(this, []),
      presentation: {
        origin: configFile,
        order: 0 + 1
      }
    };
    this._collections.set(folder.uri.toString(), this.watchFile(URI.joinPath(folder.uri, ".cursor", "mcp.json"), collection, "cursor-workspace", (contents) => {
      const defs = claudeConfigToServerDefinition(collection.id, contents, folder.uri);
      defs?.forEach((d) => d.roots = [folder.uri]);
      return defs;
    }));
  }
};
CursorWorkspaceMcpDiscoveryAdapter = __decorate([
  __param(0, IFileService),
  __param(1, IWorkspaceContextService),
  __param(2, IMcpRegistry),
  __param(3, IConfigurationService),
  __param(4, IRemoteAgentService)
], CursorWorkspaceMcpDiscoveryAdapter);
export {
  CursorWorkspaceMcpDiscoveryAdapter
};
//# sourceMappingURL=workspaceMcpDiscoveryAdapter.js.map
