var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mapFindFirst } from "../../../../base/common/arraysFind.js";
import { assertNever } from "../../../../base/common/assert.js";
import { disposableTimeout } from "../../../../base/common/async.js";
import { parse as parseJsonc } from "../../../../base/common/jsonc.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { autorun } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { getConfigValueInTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IMcpGalleryService } from "../../../../platform/mcp/common/mcpManagement.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IJSONEditingService } from "../../../services/configuration/common/jsonEditing.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { mcpConfigurationSection, mcpStdioServerSchema } from "../common/mcpConfiguration.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpService } from "../common/mcpTypes.js";
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
var AddConfigurationType;
(function(AddConfigurationType2) {
  AddConfigurationType2[AddConfigurationType2["Stdio"] = 0] = "Stdio";
  AddConfigurationType2[AddConfigurationType2["HTTP"] = 1] = "HTTP";
  AddConfigurationType2[AddConfigurationType2["NpmPackage"] = 2] = "NpmPackage";
  AddConfigurationType2[AddConfigurationType2["PipPackage"] = 3] = "PipPackage";
  AddConfigurationType2[AddConfigurationType2["DockerImage"] = 4] = "DockerImage";
})(AddConfigurationType || (AddConfigurationType = {}));
const assistedTypes = {
  [
    2
    /* AddConfigurationType.NpmPackage */
  ]: {
    title: localize("mcp.npm.title", "Enter NPM Package Name"),
    placeholder: localize("mcp.npm.placeholder", "Package name (e.g., @org/package)"),
    pickLabel: localize("mcp.serverType.npm", "NPM Package"),
    pickDescription: localize("mcp.serverType.npm.description", "Install from an NPM package name")
  },
  [
    3
    /* AddConfigurationType.PipPackage */
  ]: {
    title: localize("mcp.pip.title", "Enter Pip Package Name"),
    placeholder: localize("mcp.pip.placeholder", "Package name (e.g., package-name)"),
    pickLabel: localize("mcp.serverType.pip", "Pip Package"),
    pickDescription: localize("mcp.serverType.pip.description", "Install from a Pip package name")
  },
  [
    4
    /* AddConfigurationType.DockerImage */
  ]: {
    title: localize("mcp.docker.title", "Enter Docker Image Name"),
    placeholder: localize("mcp.docker.placeholder", "Image name (e.g., mcp/imagename)"),
    pickLabel: localize("mcp.serverType.docker", "Docker Image"),
    pickDescription: localize("mcp.serverType.docker.description", "Install from a Docker image")
  }
};
var AddConfigurationCopilotCommand;
(function(AddConfigurationCopilotCommand2) {
  AddConfigurationCopilotCommand2["IsSupported"] = "github.copilot.chat.mcp.setup.check";
  AddConfigurationCopilotCommand2["ValidatePackage"] = "github.copilot.chat.mcp.setup.validatePackage";
  AddConfigurationCopilotCommand2["StartFlow"] = "github.copilot.chat.mcp.setup.flow";
})(AddConfigurationCopilotCommand || (AddConfigurationCopilotCommand = {}));
let McpAddConfigurationCommand = class McpAddConfigurationCommand2 {
  static {
    __name(this, "McpAddConfigurationCommand");
  }
  constructor(_explicitConfigUri, _quickInputService, _configurationService, _jsonEditingService, _workspaceService, _environmentService, _commandService, _mcpRegistry, _openerService, _editorService, _fileService, _notificationService, _telemetryService, _mcpService, _mcpGalleryService, _label) {
    this._explicitConfigUri = _explicitConfigUri;
    this._quickInputService = _quickInputService;
    this._configurationService = _configurationService;
    this._jsonEditingService = _jsonEditingService;
    this._workspaceService = _workspaceService;
    this._environmentService = _environmentService;
    this._commandService = _commandService;
    this._mcpRegistry = _mcpRegistry;
    this._openerService = _openerService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this._notificationService = _notificationService;
    this._telemetryService = _telemetryService;
    this._mcpService = _mcpService;
    this._mcpGalleryService = _mcpGalleryService;
    this._label = _label;
  }
  async getServerType() {
    const items = [
      { kind: 0, label: localize("mcp.serverType.command", "Command (stdio)"), description: localize("mcp.serverType.command.description", "Run a local command that implements the MCP protocol") },
      { kind: 1, label: localize("mcp.serverType.http", "HTTP (HTTP or Server-Sent Events)"), description: localize("mcp.serverType.http.description", "Connect to a remote HTTP server that implements the MCP protocol") }
    ];
    let aiSupported;
    try {
      aiSupported = await this._commandService.executeCommand(
        "github.copilot.chat.mcp.setup.check"
        /* AddConfigurationCopilotCommand.IsSupported */
      );
    } catch {
    }
    if (aiSupported) {
      items.unshift({ type: "separator", label: localize("mcp.serverType.manual", "Manual Install") });
      items.push({ type: "separator", label: localize("mcp.serverType.copilot", "Model-Assisted") }, ...Object.entries(assistedTypes).map(([type, { pickLabel, pickDescription }]) => ({
        kind: Number(type),
        label: pickLabel,
        description: pickDescription
      })));
    }
    if (this._mcpGalleryService.isEnabled()) {
      items.push({ type: "separator" }, {
        kind: "browse",
        label: localize("mcp.servers.browse", "Browse MCP Servers...")
      });
    }
    const result = await this._quickInputService.pick(items, {
      placeHolder: localize("mcp.serverType.placeholder", "Choose the type of MCP server to add")
    });
    if (result?.kind === "browse") {
      this._commandService.executeCommand(
        "workbench.mcp.browseServers"
        /* McpCommandIds.Browse */
      );
      return void 0;
    }
    return result?.kind;
  }
  async getStdioConfig() {
    const command = await this._quickInputService.input({
      title: localize("mcp.command.title", "Enter Command"),
      placeHolder: localize("mcp.command.placeholder", "Command to run (with optional arguments)"),
      ignoreFocusLost: true
    });
    if (!command) {
      return void 0;
    }
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType: "stdio"
    });
    const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g);
    return {
      type: "stdio",
      command: parts[0].replace(/"/g, ""),
      args: parts.slice(1).map((arg) => arg.replace(/"/g, ""))
    };
  }
  async getSSEConfig() {
    const url = await this._quickInputService.input({
      title: localize("mcp.url.title", "Enter Server URL"),
      placeHolder: localize("mcp.url.placeholder", "URL of the MCP server (e.g., http://localhost:3000)"),
      ignoreFocusLost: true
    });
    if (!url) {
      return void 0;
    }
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType: "sse"
    });
    return { url };
  }
  async getServerId(suggestion = `my-mcp-server-${generateUuid().split("-")[0]}`) {
    const id = await this._quickInputService.input({
      title: localize("mcp.serverId.title", "Enter Server ID"),
      placeHolder: localize("mcp.serverId.placeholder", "Unique identifier for this server"),
      value: suggestion,
      ignoreFocusLost: true
    });
    return id;
  }
  async getConfigurationTarget() {
    const options = [
      { target: 2, label: localize("mcp.target.user", "User Settings"), description: localize("mcp.target.user.description", "Available in all workspaces, runs locally") }
    ];
    const raLabel = this._environmentService.remoteAuthority && this._label.getHostLabel(Schemas.vscodeRemote, this._environmentService.remoteAuthority);
    if (raLabel) {
      options.push({ target: 4, label: localize("mcp.target.remote", "Remote Settings"), description: localize("mcp.target..remote.description", "Available on this remote machine, runs on {0}", raLabel) });
    }
    if (this._workspaceService.getWorkspace().folders.length > 0) {
      if (this._environmentService.remoteAuthority) {
        options.push({ target: 5, label: localize("mcp.target.workspace", "Workspace Settings"), description: localize("mcp.target.workspace.description.remote", "Available in this workspace, runs on {0}", raLabel) });
      } else {
        options.push({ target: 5, label: localize("mcp.target.workspace", "Workspace Settings"), description: localize("mcp.target.workspace.description", "Available in this workspace, runs locally") });
      }
    }
    if (options.length === 1) {
      return options[0].target;
    }
    const targetPick = await this._quickInputService.pick(options, {
      title: localize("mcp.target.title", "Choose where to save the configuration")
    });
    return targetPick?.target;
  }
  async getAssistedConfig(type) {
    const packageName = await this._quickInputService.input({
      ignoreFocusLost: true,
      title: assistedTypes[type].title,
      placeHolder: assistedTypes[type].placeholder
    });
    if (!packageName) {
      return void 0;
    }
    let LoadAction;
    (function(LoadAction2) {
      LoadAction2["Retry"] = "retry";
      LoadAction2["Cancel"] = "cancel";
      LoadAction2["Allow"] = "allow";
    })(LoadAction || (LoadAction = {}));
    const loadingQuickPickStore = new DisposableStore();
    const loadingQuickPick = loadingQuickPickStore.add(this._quickInputService.createQuickPick());
    loadingQuickPick.title = localize("mcp.loading.title", "Loading package details...");
    loadingQuickPick.busy = true;
    loadingQuickPick.ignoreFocusOut = true;
    const packageType = this.getPackageType(type);
    this._telemetryService.publicLog2("mcp.addserver", {
      packageType
    });
    this._commandService.executeCommand("github.copilot.chat.mcp.setup.validatePackage", {
      type: packageType,
      name: packageName,
      targetConfig: {
        ...mcpStdioServerSchema,
        properties: {
          ...mcpStdioServerSchema.properties,
          name: {
            type: "string",
            description: "Suggested name of the server, alphanumeric and hyphen only"
          }
        },
        required: [...mcpStdioServerSchema.required || [], "name"]
      }
    }).then((result) => {
      if (!result || result.state === "error") {
        loadingQuickPick.title = result?.error || "Unknown error loading package";
        loadingQuickPick.items = [{ id: "retry", label: localize("mcp.error.retry", "Try a different package") }, { id: "cancel", label: localize("cancel", "Cancel") }];
      } else {
        loadingQuickPick.title = localize("mcp.confirmPublish", "Install {0} from {1}?", packageName, result.publisher);
        loadingQuickPick.items = [
          { id: "allow", label: localize("allow", "Allow") },
          { id: "cancel", label: localize("cancel", "Cancel") }
        ];
      }
      loadingQuickPick.busy = false;
    });
    const loadingAction = await new Promise((resolve) => {
      loadingQuickPick.onDidAccept(() => resolve(loadingQuickPick.selectedItems[0]?.id));
      loadingQuickPick.onDidHide(() => resolve(void 0));
      loadingQuickPick.show();
    }).finally(() => loadingQuickPick.dispose());
    switch (loadingAction) {
      case "retry":
        return this.getAssistedConfig(type);
      case "allow":
        break;
      case "cancel":
      default:
        return void 0;
    }
    return await this._commandService.executeCommand("github.copilot.chat.mcp.setup.flow", {
      name: packageName,
      type: packageType
    });
  }
  /** Shows the location of a server config once it's discovered. */
  showOnceDiscovered(name) {
    const store = new DisposableStore();
    store.add(autorun((reader) => {
      const colls = this._mcpRegistry.collections.read(reader);
      const servers = this._mcpService.servers.read(reader);
      const match = mapFindFirst(colls, (collection) => mapFindFirst(collection.serverDefinitions.read(reader), (server2) => server2.label === name ? { server: server2, collection } : void 0));
      const server = match && servers.find((s) => s.definition.id === match.server.id);
      if (match && server) {
        if (match.collection.presentation?.origin) {
          this._openerService.openEditor({
            resource: match.collection.presentation.origin,
            options: {
              selection: match.server.presentation?.origin?.range,
              preserveFocus: true
            }
          });
        } else {
          this._commandService.executeCommand("workbench.mcp.serverOptions", name);
        }
        server.start({ isFromInteraction: true }).then((state) => {
          if (state.state === 3) {
            server.showOutput();
          }
        });
        store.dispose();
      }
    }));
    store.add(disposableTimeout(() => store.dispose(), 5e3));
  }
  writeToUserSetting(name, config, target, inputs) {
    const settings = { ...getConfigValueInTarget(this._configurationService.inspect(mcpConfigurationSection), target) };
    settings.servers = { ...settings.servers, [name]: config };
    if (inputs) {
      settings.inputs = [...settings.inputs || [], ...inputs];
    }
    return this._configurationService.updateValue(mcpConfigurationSection, settings, target);
  }
  async run() {
    const serverType = await this.getServerType();
    if (serverType === void 0) {
      return;
    }
    let serverConfig;
    let suggestedName;
    let inputs;
    let inputValues;
    switch (serverType) {
      case 0:
        serverConfig = await this.getStdioConfig();
        break;
      case 1:
        serverConfig = await this.getSSEConfig();
        break;
      case 2:
      case 3:
      case 4: {
        const r = await this.getAssistedConfig(serverType);
        serverConfig = r?.server;
        suggestedName = r?.name;
        inputs = r?.inputs;
        inputValues = r?.inputValues;
        break;
      }
      default:
        assertNever(serverType);
    }
    if (!serverConfig) {
      return;
    }
    const serverId = await this.getServerId(suggestedName);
    if (!serverId) {
      return;
    }
    let target;
    const workspace = this._workspaceService.getWorkspace();
    if (!this._explicitConfigUri) {
      target = await this.getConfigurationTarget();
      if (!target) {
        return;
      }
    }
    const writeToUriDirect = this._explicitConfigUri ? URI.parse(this._explicitConfigUri) : target === 5 && workspace.folders.length === 1 ? URI.joinPath(workspace.folders[0].uri, ".vscode", "mcp.json") : void 0;
    if (writeToUriDirect) {
      await this._jsonEditingService.write(writeToUriDirect, [
        {
          path: ["servers", serverId],
          value: serverConfig
        },
        ...(inputs || []).map((i) => ({
          path: ["inputs", -1],
          value: i
        }))
      ], true);
    } else {
      await this.writeToUserSetting(serverId, serverConfig, target, inputs);
    }
    if (inputValues) {
      for (const [key, value] of Object.entries(inputValues)) {
        await this._mcpRegistry.setSavedInput(key, target ?? 5, value);
      }
    }
    const packageType = this.getPackageType(serverType);
    if (packageType) {
      this._telemetryService.publicLog2("mcp.addserver.completed", {
        packageType,
        serverType: serverConfig.type,
        target: target === 5 ? "workspace" : "user"
      });
    }
    this.showOnceDiscovered(serverId);
  }
  async pickForUrlHandler(resource, showIsPrimary = false) {
    const name = decodeURIComponent(basename(resource)).replace(/\.json$/, "");
    const placeHolder = localize("install.title", "Install MCP server {0}", name);
    const items = [
      { id: "install", label: localize("install.start", "Install Server"), description: localize("install.description", "Install in your user settings") },
      { id: "show", label: localize("install.show", "Show Configuration", name) },
      { id: "rename", label: localize("install.rename", 'Rename "{0}"', name) },
      { id: "cancel", label: localize("cancel", "Cancel") }
    ];
    if (showIsPrimary) {
      [items[0], items[1]] = [items[1], items[0]];
    }
    const pick = await this._quickInputService.pick(items, { placeHolder, ignoreFocusLost: true });
    const getEditors = /* @__PURE__ */ __name(() => this._editorService.findEditors(resource), "getEditors");
    switch (pick?.id) {
      case "show":
        await this._editorService.openEditor({ resource });
        break;
      case "install":
        await this._editorService.save(getEditors());
        try {
          const contents = await this._fileService.readFile(resource);
          const { inputs, ...config } = parseJsonc(contents.value.toString());
          await this.writeToUserSetting(name, config, 3, inputs);
          this._editorService.closeEditors(getEditors());
          this.showOnceDiscovered(name);
        } catch (e) {
          this._notificationService.error(localize("install.error", "Error installing MCP server {0}: {1}", name, e.message));
          await this._editorService.openEditor({ resource });
        }
        break;
      case "rename": {
        const newName = await this._quickInputService.input({ placeHolder: localize("install.newName", "Enter new name"), value: name });
        if (newName) {
          const newURI = resource.with({ path: `/${encodeURIComponent(newName)}.json` });
          await this._editorService.save(getEditors());
          await this._fileService.move(resource, newURI);
          return this.pickForUrlHandler(newURI, showIsPrimary);
        }
        break;
      }
    }
  }
  getPackageType(serverType) {
    switch (serverType) {
      case 2:
        return "npm";
      case 3:
        return "pip";
      case 4:
        return "docker";
      case 0:
        return "stdio";
      case 1:
        return "sse";
      default:
        return void 0;
    }
  }
};
McpAddConfigurationCommand = __decorate([
  __param(1, IQuickInputService),
  __param(2, IConfigurationService),
  __param(3, IJSONEditingService),
  __param(4, IWorkspaceContextService),
  __param(5, IWorkbenchEnvironmentService),
  __param(6, ICommandService),
  __param(7, IMcpRegistry),
  __param(8, IEditorService),
  __param(9, IEditorService),
  __param(10, IFileService),
  __param(11, INotificationService),
  __param(12, ITelemetryService),
  __param(13, IMcpService),
  __param(14, IMcpGalleryService),
  __param(15, ILabelService)
], McpAddConfigurationCommand);
export {
  McpAddConfigurationCommand
};
//# sourceMappingURL=mcpCommandsAddConfiguration.js.map
