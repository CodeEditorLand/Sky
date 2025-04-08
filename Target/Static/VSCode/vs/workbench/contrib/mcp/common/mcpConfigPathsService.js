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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { IObservable, ISettableObservable, observableValue } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService, IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { FOLDER_SETTINGS_PATH, IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { mcpConfigurationSection } from "./mcpConfiguration.js";
import { McpCollectionSortOrder } from "./mcpTypes.js";
const IMcpConfigPathsService = createDecorator("IMcpConfigPathsService");
let McpConfigPathsService = class extends Disposable {
  constructor(workspaceContextService, productService, labelService, _environmentService, remoteAgentService, preferencesService) {
    super();
    this._environmentService = _environmentService;
    const workspaceConfig = workspaceContextService.getWorkspace().configuration;
    const initialPaths = [
      {
        id: "usrlocal",
        key: "userLocalValue",
        target: ConfigurationTarget.USER_LOCAL,
        label: localize("mcp.configuration.userLocalValue", "Global in {0}", productService.nameShort),
        scope: StorageScope.PROFILE,
        order: McpCollectionSortOrder.User,
        uri: preferencesService.userSettingsResource,
        section: [mcpConfigurationSection]
      },
      workspaceConfig && {
        id: "workspace",
        key: "workspaceValue",
        target: ConfigurationTarget.WORKSPACE,
        label: basename(workspaceConfig),
        scope: StorageScope.WORKSPACE,
        order: McpCollectionSortOrder.Workspace,
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
          target: ConfigurationTarget.USER_REMOTE,
          label,
          scope: StorageScope.PROFILE,
          order: McpCollectionSortOrder.User + McpCollectionSortOrder.RemoteBoost,
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
  static {
    __name(this, "McpConfigPathsService");
  }
  _serviceBrand;
  _paths;
  get paths() {
    return this._paths;
  }
  _fromWorkspaceFolder(workspaceFolder) {
    return {
      id: `wf${workspaceFolder.index}`,
      key: "workspaceFolderValue",
      target: ConfigurationTarget.WORKSPACE_FOLDER,
      label: `${workspaceFolder.name}/.vscode/mcp.json`,
      scope: StorageScope.WORKSPACE,
      remoteAuthority: this._environmentService.remoteAuthority,
      order: McpCollectionSortOrder.WorkspaceFolder,
      uri: URI.joinPath(workspaceFolder.uri, FOLDER_SETTINGS_PATH, "../mcp.json"),
      workspaceFolder
    };
  }
};
McpConfigPathsService = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IRemoteAgentService),
  __decorateParam(5, IPreferencesService)
], McpConfigPathsService);
export {
  IMcpConfigPathsService,
  McpConfigPathsService
};
//# sourceMappingURL=mcpConfigPathsService.js.map
