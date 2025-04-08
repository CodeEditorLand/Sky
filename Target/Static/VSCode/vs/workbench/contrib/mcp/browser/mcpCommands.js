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
import { h } from "../../../../base/browser/dom.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { groupBy } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, derived } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { ILocalizedString, localize, localize2 } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { StorageScope } from "../../../../platform/storage/common/storage.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ActiveEditorContext, ResourceContextKey } from "../../../common/contextkeys.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { ChatMode } from "../../chat/common/constants.js";
import { TEXT_FILE_EDITOR_ID } from "../../files/common/files.js";
import { McpContextKeys } from "../common/mcpContextKeys.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpServer, IMcpService, LazyCollectionState, McpConnectionState, McpServerToolsState } from "../common/mcpTypes.js";
import { McpAddConfigurationCommand } from "./mcpCommandsAddConfiguration.js";
import { McpUrlHandler } from "./mcpUrlHandler.js";
const category = {
  original: "MCP",
  value: "MCP"
};
class ListMcpServerCommand extends Action2 {
  static {
    __name(this, "ListMcpServerCommand");
  }
  static id = "workbench.mcp.listServer";
  constructor() {
    super({
      id: ListMcpServerCommand.id,
      title: localize2("mcp.list", "List Servers"),
      icon: Codicon.server,
      category,
      f1: true,
      menu: {
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(McpContextKeys.hasUnknownTools, McpContextKeys.hasServersWithErrors),
          ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent)
        ),
        id: MenuId.ChatInputAttachmentToolbar,
        group: "navigation",
        order: 0
      }
    });
  }
  async run(accessor) {
    const mcpService = accessor.get(IMcpService);
    const commandService = accessor.get(ICommandService);
    const quickInput = accessor.get(IQuickInputService);
    const store = new DisposableStore();
    const pick = quickInput.createQuickPick({ useSeparators: true });
    pick.placeholder = localize("mcp.selectServer", "Select an MCP Server");
    store.add(pick);
    store.add(autorun((reader) => {
      const servers = groupBy(mcpService.servers.read(reader).slice().sort((a, b) => (a.collection.presentation?.order || 0) - (b.collection.presentation?.order || 0)), (s) => s.collection.id);
      const firstRun = pick.items.length === 0;
      pick.items = [
        { id: "$add", label: localize("mcp.addServer", "Add Server"), description: localize("mcp.addServer.description", "Add a new server configuration"), alwaysShow: true, iconClass: ThemeIcon.asClassName(Codicon.add) },
        ...Object.values(servers).filter((s) => s.length).flatMap((servers2) => [
          { type: "separator", label: servers2[0].collection.label, id: servers2[0].collection.id },
          ...servers2.map((server) => ({
            id: server.definition.id,
            label: server.definition.label,
            description: McpConnectionState.toString(server.connectionState.read(reader))
          }))
        ])
      ];
      if (firstRun && pick.items.length > 3) {
        pick.activeItems = pick.items.slice(2, 3);
      }
    }));
    const picked = await new Promise((resolve) => {
      store.add(pick.onDidAccept(() => {
        resolve(pick.activeItems[0]);
      }));
      store.add(pick.onDidHide(() => {
        resolve(void 0);
      }));
      pick.show();
    });
    store.dispose();
    if (!picked) {
    } else if (picked.id === "$add") {
      commandService.executeCommand(AddConfigurationAction.ID);
    } else {
      commandService.executeCommand(McpServerOptionsCommand.id, picked.id);
    }
  }
}
class McpServerOptionsCommand extends Action2 {
  static {
    __name(this, "McpServerOptionsCommand");
  }
  static id = "workbench.mcp.serverOptions";
  constructor() {
    super({
      id: McpServerOptionsCommand.id,
      title: localize2("mcp.options", "Server Options"),
      category,
      f1: false
    });
  }
  async run(accessor, id) {
    const mcpService = accessor.get(IMcpService);
    const quickInputService = accessor.get(IQuickInputService);
    const mcpRegistry = accessor.get(IMcpRegistry);
    const editorService = accessor.get(IEditorService);
    const server = mcpService.servers.get().find((s) => s.definition.id === id);
    if (!server) {
      return;
    }
    const collection = mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
    const serverDefinition = collection?.serverDefinitions.get().find((s) => s.id === server.definition.id);
    const items = [];
    const serverState = server.connectionState.get();
    if (McpConnectionState.canBeStarted(serverState.state)) {
      items.push({
        label: localize("mcp.start", "Start Server"),
        action: "start"
      });
    } else {
      items.push({
        label: localize("mcp.stop", "Stop Server"),
        action: "stop"
      });
      items.push({
        label: localize("mcp.restart", "Restart Server"),
        action: "restart"
      });
    }
    items.push({
      label: localize("mcp.showOutput", "Show Output"),
      action: "showOutput"
    });
    const configTarget = serverDefinition?.presentation?.origin || collection?.presentation?.origin;
    if (configTarget) {
      items.push({
        label: localize("mcp.config", "Show Configuration"),
        action: "config"
      });
    }
    const pick = await quickInputService.pick(items, {
      title: server.definition.label,
      placeHolder: localize("mcp.selectAction", "Select Server Action")
    });
    if (!pick) {
      return;
    }
    switch (pick.action) {
      case "start":
        await server.start(true);
        server.showOutput();
        break;
      case "stop":
        await server.stop();
        break;
      case "restart":
        await server.stop();
        await server.start(true);
        break;
      case "showOutput":
        server.showOutput();
        break;
      case "config":
        editorService.openEditor({
          resource: URI.isUri(configTarget) ? configTarget : configTarget.uri,
          options: { selection: URI.isUri(configTarget) ? void 0 : configTarget.range }
        });
        break;
      default:
        assertNever(pick.action);
    }
  }
}
let MCPServerActionRendering = class extends Disposable {
  static {
    __name(this, "MCPServerActionRendering");
  }
  static ID = "workbench.contrib.mcp.discovery";
  constructor(actionViewItemService, mcpService, instaService, commandService) {
    super();
    let DisplayedState;
    ((DisplayedState2) => {
      DisplayedState2[DisplayedState2["None"] = 0] = "None";
      DisplayedState2[DisplayedState2["NewTools"] = 1] = "NewTools";
      DisplayedState2[DisplayedState2["Error"] = 2] = "Error";
      DisplayedState2[DisplayedState2["Refreshing"] = 3] = "Refreshing";
    })(DisplayedState || (DisplayedState = {}));
    const displayedState = derived((reader) => {
      const servers = mcpService.servers.read(reader);
      const serversPerState = [];
      for (const server of servers) {
        let thisState = 0 /* None */;
        switch (server.toolsState.read(reader)) {
          case McpServerToolsState.Unknown:
            if (server.trusted.read(reader) === false) {
              thisState = 0 /* None */;
            } else {
              thisState = server.connectionState.read(reader).state === McpConnectionState.Kind.Error ? 2 /* Error */ : 1 /* NewTools */;
            }
            break;
          case McpServerToolsState.RefreshingFromUnknown:
            thisState = 3 /* Refreshing */;
            break;
          default:
            thisState = server.connectionState.read(reader).state === McpConnectionState.Kind.Error ? 2 /* Error */ : 0 /* None */;
            break;
        }
        serversPerState[thisState] ??= [];
        serversPerState[thisState].push(server);
      }
      const unknownServerStates = mcpService.lazyCollectionState.read(reader);
      if (unknownServerStates === LazyCollectionState.LoadingUnknown) {
        serversPerState[3 /* Refreshing */] ??= [];
      } else if (unknownServerStates === LazyCollectionState.HasUnknown) {
        serversPerState[1 /* NewTools */] ??= [];
      }
      const maxState = serversPerState.length - 1;
      return { state: maxState, servers: serversPerState[maxState] || [] };
    });
    this._store.add(actionViewItemService.register(MenuId.ChatInputAttachmentToolbar, ListMcpServerCommand.id, (action, options) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instaService.createInstance(class extends MenuEntryActionViewItem {
        render(container) {
          super.render(container);
          container.classList.add("chat-mcp");
          const action2 = h("button.chat-mcp-action", [h("span@icon")]);
          this._register(autorun((r) => {
            const { state } = displayedState.read(r);
            const { root, icon } = action2;
            this.updateTooltip();
            container.classList.toggle("chat-mcp-has-action", state !== 0 /* None */);
            if (!root.parentElement) {
              container.appendChild(root);
            }
            root.ariaLabel = this.getLabelForState(displayedState.read(r));
            root.className = "chat-mcp-action";
            icon.className = "";
            if (state === 1 /* NewTools */) {
              root.classList.add("chat-mcp-action-new");
              icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.refresh));
            } else if (state === 2 /* Error */) {
              root.classList.add("chat-mcp-action-error");
              icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
            } else if (state === 3 /* Refreshing */) {
              root.classList.add("chat-mcp-action-refreshing");
              icon.classList.add(...ThemeIcon.asClassNameArray(spinningLoading));
            } else {
              root.remove();
            }
          }));
        }
        async onClick(e) {
          e.preventDefault();
          e.stopPropagation();
          const { state, servers } = displayedState.get();
          if (state === 1 /* NewTools */) {
            servers.forEach((server) => server.start());
            mcpService.activateCollections();
          } else if (state === 3 /* Refreshing */) {
            servers.at(-1)?.showOutput();
          } else if (state === 2 /* Error */) {
            const server = servers.at(-1);
            if (server) {
              commandService.executeCommand(McpServerOptionsCommand.id, server.definition.id);
            }
          } else {
            commandService.executeCommand(ListMcpServerCommand.id);
          }
        }
        getTooltip() {
          return this.getLabelForState() || super.getTooltip();
        }
        getLabelForState({ state, servers } = displayedState.get()) {
          if (state === 1 /* NewTools */) {
            return localize("mcp.newTools", "New tools available ({0})", servers.length || 1);
          } else if (state === 2 /* Error */) {
            return localize("mcp.toolError", "Error loading {0} tool(s)", servers.length || 1);
          } else if (state === 3 /* Refreshing */) {
            return localize("mcp.toolRefresh", "Discovering tools...");
          } else {
            return null;
          }
        }
      }, action, { ...options, keybindingNotRenderedWithLabel: true });
    }, Event.fromObservable(displayedState)));
  }
};
MCPServerActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IMcpService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ICommandService)
], MCPServerActionRendering);
class ResetMcpTrustCommand extends Action2 {
  static {
    __name(this, "ResetMcpTrustCommand");
  }
  static ID = "workbench.mcp.resetTrust";
  constructor() {
    super({
      id: ResetMcpTrustCommand.ID,
      title: localize2("mcp.resetTrust", "Reset Trust"),
      category,
      f1: true,
      precondition: McpContextKeys.toolsCount.greater(0)
    });
  }
  run(accessor) {
    const mcpService = accessor.get(IMcpRegistry);
    mcpService.resetTrust();
  }
}
class ResetMcpCachedTools extends Action2 {
  static {
    __name(this, "ResetMcpCachedTools");
  }
  static ID = "workbench.mcp.resetCachedTools";
  constructor() {
    super({
      id: ResetMcpCachedTools.ID,
      title: localize2("mcp.resetCachedTools", "Reset Cached Tools"),
      category,
      f1: true,
      precondition: McpContextKeys.toolsCount.greater(0)
    });
  }
  run(accessor) {
    const mcpService = accessor.get(IMcpService);
    mcpService.resetCaches();
  }
}
class AddConfigurationAction extends Action2 {
  static {
    __name(this, "AddConfigurationAction");
  }
  static ID = "workbench.mcp.addConfiguration";
  constructor() {
    super({
      id: AddConfigurationAction.ID,
      title: localize2("mcp.addConfiguration", "Add Server..."),
      metadata: {
        description: localize2("mcp.addConfiguration.description", "Installs a new Model Context protocol to the mcp.json settings")
      },
      category,
      f1: true,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(
          ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]mcp\.json$/),
          ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID)
        )
      }
    });
  }
  async run(accessor, configUri) {
    return accessor.get(IInstantiationService).createInstance(McpAddConfigurationCommand, configUri).run();
  }
}
class RemoveStoredInput extends Action2 {
  static {
    __name(this, "RemoveStoredInput");
  }
  static ID = "workbench.mcp.removeStoredInput";
  constructor() {
    super({
      id: RemoveStoredInput.ID,
      title: localize2("mcp.resetCachedTools", "Reset Cached Tools"),
      category,
      f1: false
    });
  }
  run(accessor, scope, id) {
    accessor.get(IMcpRegistry).clearSavedInputs(scope, id);
  }
}
class EditStoredInput extends Action2 {
  static {
    __name(this, "EditStoredInput");
  }
  static ID = "workbench.mcp.editStoredInput";
  constructor() {
    super({
      id: EditStoredInput.ID,
      title: localize2("mcp.editStoredInput", "Edit Stored Input"),
      category,
      f1: false
    });
  }
  run(accessor, inputId, uri, configSection, target) {
    const workspaceFolder = uri && accessor.get(IWorkspaceContextService).getWorkspaceFolder(uri);
    accessor.get(IMcpRegistry).editSavedInput(inputId, workspaceFolder || void 0, configSection, target);
  }
}
class ShowOutput extends Action2 {
  static {
    __name(this, "ShowOutput");
  }
  static ID = "workbench.mcp.showOutput";
  constructor() {
    super({
      id: ShowOutput.ID,
      title: localize2("mcp.command.showOutput", "Show Output"),
      category,
      f1: false
    });
  }
  run(accessor, serverId) {
    accessor.get(IMcpService).servers.get().find((s) => s.definition.id === serverId)?.showOutput();
  }
}
class RestartServer extends Action2 {
  static {
    __name(this, "RestartServer");
  }
  static ID = "workbench.mcp.restartServer";
  constructor() {
    super({
      id: RestartServer.ID,
      title: localize2("mcp.command.restartServer", "Restart Server"),
      category,
      f1: false
    });
  }
  async run(accessor, serverId) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    s?.showOutput();
    await s?.stop();
    await s?.start();
  }
}
class StartServer extends Action2 {
  static {
    __name(this, "StartServer");
  }
  static ID = "workbench.mcp.startServer";
  constructor() {
    super({
      id: StartServer.ID,
      title: localize2("mcp.command.startServer", "Start Server"),
      category,
      f1: false
    });
  }
  async run(accessor, serverId) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    await s?.start();
  }
}
class StopServer extends Action2 {
  static {
    __name(this, "StopServer");
  }
  static ID = "workbench.mcp.stopServer";
  constructor() {
    super({
      id: StopServer.ID,
      title: localize2("mcp.command.stopServer", "Stop Server"),
      category,
      f1: false
    });
  }
  async run(accessor, serverId) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    await s?.stop();
  }
}
class InstallFromActivation extends Action2 {
  static {
    __name(this, "InstallFromActivation");
  }
  static ID = "workbench.mcp.installFromActivation";
  constructor() {
    super({
      id: InstallFromActivation.ID,
      title: localize2("mcp.command.installFromActivation", "Install..."),
      category,
      f1: false,
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.equals("resourceScheme", McpUrlHandler.scheme)
      }
    });
  }
  async run(accessor, uri) {
    const addConfigHelper = accessor.get(IInstantiationService).createInstance(McpAddConfigurationCommand, void 0);
    addConfigHelper.pickForUrlHandler(uri);
  }
}
export {
  AddConfigurationAction,
  EditStoredInput,
  InstallFromActivation,
  ListMcpServerCommand,
  MCPServerActionRendering,
  McpServerOptionsCommand,
  RemoveStoredInput,
  ResetMcpCachedTools,
  ResetMcpTrustCommand,
  RestartServer,
  ShowOutput,
  StartServer,
  StopServer
};
//# sourceMappingURL=mcpCommands.js.map
