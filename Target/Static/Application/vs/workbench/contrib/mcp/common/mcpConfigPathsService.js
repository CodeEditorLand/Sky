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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { observableValue } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { FOLDER_SETTINGS_PATH, IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { mcpConfigurationSection } from "./mcpConfiguration.js";
const IMcpConfigPathsService = createDecorator("IMcpConfigPathsService");
let McpConfigPathsService = class McpConfigPathsService2 extends Disposable {
  static {
    __name(this, "McpConfigPathsService");
  }
  get paths() {
    return this._paths;
  }
  constructor(workspaceContextService, productService, labelService, _environmentService, remoteAgentService, preferencesService) {
    super();
    this._environmentService = _environmentService;
    const workspaceConfig = workspaceContextService.getWorkspace().configuration;
    const initialPaths = [
      {
        id: "usrlocal",
        key: "userLocalValue",
        target: 3,
        label: localize("mcp.configuration.userLocalValue", "Global in {0}", productService.nameShort),
        scope: 0,
        order: 200,
        uri: preferencesService.userSettingsResource,
        section: [mcpConfigurationSection]
      },
      workspaceConfig && {
        id: "workspace",
        key: "workspaceValue",
        target: 5,
        label: basename(workspaceConfig),
        scope: 1,
        order: 100,
        remoteAuthority: _environmentService.remoteAuthority,
        uri: workspaceConfig,
        section: ["settings", mcpConfigurationSection]
      },
      ...workspaceContextService.getWorkspace().folders.map((wf) => this._fromWorkspaceFolder(wf))
    ];
    this._paths = observableValue("mcpConfigPaths", initialPaths.filter(isDefined));
    remoteAgentService.getEnvironment().then((env) => {
      const label = _environmentService.remoteAuthority ? labelService.getHostLabel(Schemas.vscodeRemote, _environmentService.remoteAuthority) : "Remote";
      this._paths.set([
        ...this.paths.get(),
        {
          id: "usrremote",
          key: "userRemoteValue",
          target: 4,
          label,
          scope: 0,
          order: 200 + -50,
          uri: env?.settingsPath,
          remoteAuthority: _environmentService.remoteAuthority,
          section: [mcpConfigurationSection]
        }
      ], void 0);
    });
    this._register(workspaceContextService.onDidChangeWorkspaceFolders((e) => {
      const next = this._paths.get().slice();
      for (const folder of e.added) {
        next.push(this._fromWorkspaceFolder(folder));
      }
      for (const folder of e.removed) {
        const idx = next.findIndex((c) => c.workspaceFolder === folder);
        if (idx !== -1) {
          next.splice(idx, 1);
        }
      }
      this._paths.set(next, void 0);
    }));
  }
  _fromWorkspaceFolder(workspaceFolder) {
    return {
      id: `wf${workspaceFolder.index}`,
      key: "workspaceFolderValue",
      target: 6,
      label: `${workspaceFolder.name}/.vscode/mcp.json`,
      scope: 1,
      remoteAuthority: this._environmentService.remoteAuthority,
      order: 0,
      uri: URI.joinPath(workspaceFolder.uri, FOLDER_SETTINGS_PATH, "../mcp.json"),
      workspaceFolder
    };
  }
};
McpConfigPathsService = __decorate([
  __param(0, IWorkspaceContextService),
  __param(1, IProductService),
  __param(2, ILabelService),
  __param(3, IWorkbenchEnvironmentService),
  __param(4, IRemoteAgentService),
  __param(5, IPreferencesService)
], McpConfigPathsService);
export {
  IMcpConfigPathsService,
  McpConfigPathsService
};
//# sourceMappingURL=mcpConfigPathsService.js.map
