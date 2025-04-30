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
import { h } from "../../../../base/browser/dom.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { groupBy } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, derived } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ActiveEditorContext, ResourceContextKey } from "../../../common/contextkeys.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { ChatMode } from "../../chat/common/constants.js";
import { TEXT_FILE_EDITOR_ID } from "../../files/common/files.js";
import { McpContextKeys } from "../common/mcpContextKeys.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpService, McpConnectionState } from "../common/mcpTypes.js";
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
  constructor() {
    super({
      id: "workbench.mcp.listServer",
      title: localize2("mcp.list", "List Servers"),
      icon: Codicon.server,
      category,
      f1: true,
      menu: {
        when: ContextKeyExpr.and(ContextKeyExpr.or(McpContextKeys.hasUnknownTools, McpContextKeys.hasServersWithErrors), ChatContextKeys.chatMode.isEqualTo(ChatMode.Agent)),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 101
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
      commandService.executeCommand("workbench.mcp.serverOptions", picked.id);
    }
  }
}
class McpServerOptionsCommand extends Action2 {
  static {
    __name(this, "McpServerOptionsCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.serverOptions",
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
let MCPServerActionRendering = class MCPServerActionRendering2 extends Disposable {
  static {
    __name(this, "MCPServerActionRendering");
  }
  constructor(actionViewItemService, mcpService, instaService, commandService) {
    super();
    let DisplayedState;
    (function(DisplayedState2) {
      DisplayedState2[DisplayedState2["None"] = 0] = "None";
      DisplayedState2[DisplayedState2["NewTools"] = 1] = "NewTools";
      DisplayedState2[DisplayedState2["Error"] = 2] = "Error";
      DisplayedState2[DisplayedState2["Refreshing"] = 3] = "Refreshing";
    })(DisplayedState || (DisplayedState = {}));
    const displayedState = derived((reader) => {
      const servers = mcpService.servers.read(reader);
      const serversPerState = [];
      for (const server of servers) {
        let thisState = 0;
        switch (server.toolsState.read(reader)) {
          case 0:
          case 2:
            if (server.trusted.read(reader) === false) {
              thisState = 0;
            } else {
              thisState = server.connectionState.read(reader).state === 3 ? 2 : 1;
            }
            break;
          case 3:
            thisState = 3;
            break;
          default:
            thisState = server.connectionState.read(reader).state === 3 ? 2 : 0;
            break;
        }
        serversPerState[thisState] ??= [];
        serversPerState[thisState].push(server);
      }
      const unknownServerStates = mcpService.lazyCollectionState.read(reader);
      if (unknownServerStates === 1) {
        serversPerState[
          3
          /* DisplayedState.Refreshing */
        ] ??= [];
      } else if (unknownServerStates === 0) {
        serversPerState[
          1
          /* DisplayedState.NewTools */
        ] ??= [];
      }
      const maxState = serversPerState.length - 1;
      return { state: maxState, servers: serversPerState[maxState] || [] };
    });
    this._store.add(actionViewItemService.register(MenuId.ChatInput, "workbench.mcp.listServer", (action, options) => {
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
            container.classList.toggle(
              "chat-mcp-has-action",
              state !== 0
              /* DisplayedState.None */
            );
            if (!root.parentElement) {
              container.appendChild(root);
            }
            root.ariaLabel = this.getLabelForState(displayedState.read(r));
            root.className = "chat-mcp-action";
            icon.className = "";
            if (state === 1) {
              root.classList.add("chat-mcp-action-new");
              icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.refresh));
            } else if (state === 2) {
              root.classList.add("chat-mcp-action-error");
              icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
            } else if (state === 3) {
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
          if (state === 1) {
            servers.forEach((server) => server.stop().then(() => server.start()));
            mcpService.activateCollections();
          } else if (state === 3) {
            servers.at(-1)?.showOutput();
          } else if (state === 2) {
            const server = servers.at(-1);
            if (server) {
              commandService.executeCommand("workbench.mcp.serverOptions", server.definition.id);
            }
          } else {
            commandService.executeCommand(
              "workbench.mcp.listServer"
              /* McpCommandIds.ListServer */
            );
          }
        }
        getTooltip() {
          return this.getLabelForState() || super.getTooltip();
        }
        getLabelForState({ state, servers } = displayedState.get()) {
          if (state === 1) {
            return localize("mcp.newTools", "New tools available ({0})", servers.length || 1);
          } else if (state === 2) {
            return localize("mcp.toolError", "Error loading {0} tool(s)", servers.length || 1);
          } else if (state === 3) {
            return localize("mcp.toolRefresh", "Discovering tools...");
          } else {
            return null;
          }
        }
      }, action, { ...options, keybindingNotRenderedWithLabel: true });
    }, Event.fromObservable(displayedState)));
  }
};
MCPServerActionRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IMcpService),
  __param(2, IInstantiationService),
  __param(3, ICommandService)
], MCPServerActionRendering);
class ResetMcpTrustCommand extends Action2 {
  static {
    __name(this, "ResetMcpTrustCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.resetTrust",
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
  constructor() {
    super({
      id: "workbench.mcp.resetCachedTools",
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
  static {
    this.ID = "workbench.mcp.addConfiguration";
  }
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
        when: ContextKeyExpr.and(ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]mcp\.json$/), ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID))
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
  constructor() {
    super({
      id: "workbench.mcp.removeStoredInput",
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
  constructor() {
    super({
      id: "workbench.mcp.editStoredInput",
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
class ShowConfiguration extends Action2 {
  static {
    __name(this, "ShowConfiguration");
  }
  constructor() {
    super({
      id: "workbench.mcp.showConfiguration",
      title: localize2("mcp.command.showConfiguration", "Show Configuration"),
      category,
      f1: false
    });
  }
  run(accessor, collectionId, serverId) {
    const collection = accessor.get(IMcpRegistry).collections.get().find((c) => c.id === collectionId);
    if (!collection) {
      return;
    }
    const server = collection?.serverDefinitions.get().find((s) => s.id === serverId);
    const editorService = accessor.get(IEditorService);
    if (server?.presentation?.origin) {
      editorService.openEditor({
        resource: server.presentation.origin.uri,
        options: { selection: server.presentation.origin.range }
      });
    } else if (collection.presentation?.origin) {
      editorService.openEditor({
        resource: collection.presentation.origin
      });
    }
  }
}
class ShowOutput extends Action2 {
  static {
    __name(this, "ShowOutput");
  }
  constructor() {
    super({
      id: "workbench.mcp.showOutput",
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
  constructor() {
    super({
      id: "workbench.mcp.restartServer",
      title: localize2("mcp.command.restartServer", "Restart Server"),
      category,
      f1: false
    });
  }
  async run(accessor, serverId) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    s?.showOutput();
    await s?.stop();
    await s?.start(true);
  }
}
class StartServer extends Action2 {
  static {
    __name(this, "StartServer");
  }
  constructor() {
    super({
      id: "workbench.mcp.startServer",
      title: localize2("mcp.command.startServer", "Start Server"),
      category,
      f1: false
    });
  }
  async run(accessor, serverId) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    await s?.start(true);
  }
}
class StopServer extends Action2 {
  static {
    __name(this, "StopServer");
  }
  constructor() {
    super({
      id: "workbench.mcp.stopServer",
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
  constructor() {
    super({
      id: "workbench.mcp.installFromActivation",
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
  ShowConfiguration,
  ShowOutput,
  StartServer,
  StopServer
};
//# sourceMappingURL=mcpCommands.js.map
