var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { h } from "../../../../base/browser/dom.js";
import { assertNever } from "../../../../base/common/assert.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { groupBy } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, derived } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize, localize2 } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, MenuId, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionsLocalizedLabel } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMcpGalleryService } from "../../../../platform/mcp/common/mcpManagement.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ActiveEditorContext, ResourceContextKey } from "../../../common/contextkeys.js";
import { IAuthenticationAccessService } from "../../../services/authentication/browser/authenticationAccessService.js";
import { IAuthenticationMcpAccessService } from "../../../services/authentication/browser/authenticationMcpAccessService.js";
import { IAuthenticationMcpService } from "../../../services/authentication/browser/authenticationMcpService.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IChatWidgetService } from "../../chat/browser/chat.js";
import { ChatContextKeys } from "../../chat/common/chatContextKeys.js";
import { ChatMode } from "../../chat/common/constants.js";
import { ILanguageModelsService } from "../../chat/common/languageModels.js";
import { extensionsFilterSubMenu, IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { TEXT_FILE_EDITOR_ID } from "../../files/common/files.js";
import { McpContextKeys } from "../common/mcpContextKeys.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpSamplingService, IMcpService, IMcpWorkbenchService, InstalledMcpServersViewId, McpConnectionState, mcpPromptPrefix, McpServersGalleryEnabledContext } from "../common/mcpTypes.js";
import { McpAddConfigurationCommand } from "./mcpCommandsAddConfiguration.js";
import { McpResourceQuickAccess, McpResourceQuickPick } from "./mcpResourceQuickAccess.js";
import { McpUrlHandler } from "./mcpUrlHandler.js";
import { openPanelChatAndGetWidget } from "./openPanelChatAndGetWidget.js";
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
        id: MenuId.ChatExecute,
        group: "navigation",
        order: 2
      }
    });
  }
  async run(accessor) {
    const mcpService = accessor.get(IMcpService);
    const commandService = accessor.get(ICommandService);
    const quickInput = accessor.get(IQuickInputService);
    const mcpWorkbenchService = accessor.get(IMcpWorkbenchService);
    const extensionWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const viewsService = accessor.get(IViewsService);
    const mcpGalleryService = accessor.get(IMcpGalleryService);
    if (mcpGalleryService.isEnabled()) {
      if (mcpWorkbenchService.local.length) {
        return viewsService.openView(InstalledMcpServersViewId, true);
      } else {
        return extensionWorkbenchService.openSearch("@mcp");
      }
    }
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
      commandService.executeCommand(
        "workbench.mcp.addConfiguration"
        /* McpCommandIds.AddConfiguration */
      );
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
    const commandService = accessor.get(ICommandService);
    const samplingService = accessor.get(IMcpSamplingService);
    const authenticationMcpService = accessor.get(IAuthenticationMcpService);
    const authenticationMcpAccessService = accessor.get(IAuthenticationMcpAccessService);
    const authenticationExtensionAccessService = accessor.get(IAuthenticationAccessService);
    const authenticationService = accessor.get(IAuthenticationService);
    const productService = accessor.get(IProductService);
    const server = mcpService.servers.get().find((s) => s.definition.id === id);
    if (!server) {
      return;
    }
    const collection = mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
    const serverDefinition = collection?.serverDefinitions.get().find((s) => s.id === server.definition.id);
    const items = [];
    const serverState = server.connectionState.get();
    items.push({ type: "separator", label: localize("mcp.actions.status", "Status") });
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
    const item = this._getAuthAction(mcpRegistry, authenticationMcpService, authenticationMcpAccessService, authenticationExtensionAccessService, productService, server.definition.id);
    if (item) {
      items.push(item);
    }
    const configTarget = serverDefinition?.presentation?.origin || collection?.presentation?.origin;
    if (configTarget) {
      items.push({
        label: localize("mcp.config", "Show Configuration"),
        action: "config"
      });
    }
    items.push({
      label: localize("mcp.showOutput", "Show Output"),
      action: "showOutput"
    });
    items.push({ type: "separator", label: localize("mcp.actions.sampling", "Sampling") }, {
      label: localize("mcp.configAccess", "Configure Model Access"),
      description: localize("mcp.showOutput.description", "Set the models the server can use via MCP sampling"),
      action: "configSampling"
    });
    if (samplingService.hasLogs(server)) {
      items.push({
        label: localize("mcp.samplingLog", "Show Sampling Requests"),
        description: localize("mcp.samplingLog.description", "Show the sampling requests for this server"),
        action: "samplingLog"
      });
    }
    const capabilities = server.capabilities.get();
    if (capabilities === void 0 || capabilities & 16) {
      items.push({ type: "separator", label: localize("mcp.actions.resources", "Resources") });
      items.push({
        label: localize("mcp.resources", "Browse Resources"),
        action: "resources"
      });
    }
    const pick = await quickInputService.pick(items, {
      placeHolder: localize("mcp.selectAction", "Select action for '{0}'", server.definition.label)
    });
    if (!pick) {
      return;
    }
    switch (pick.action) {
      case "start":
        await server.start({ isFromInteraction: true });
        server.showOutput();
        break;
      case "stop":
        await server.stop();
        break;
      case "restart":
        await server.stop();
        await server.start({ isFromInteraction: true });
        break;
      case "disconnect":
        await this._handleAuth(mcpRegistry, authenticationMcpService, authenticationMcpAccessService, authenticationService, server, false);
        break;
      case "signout":
        await this._handleAuth(mcpRegistry, authenticationMcpService, authenticationMcpAccessService, authenticationService, server, true);
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
      case "configSampling":
        return commandService.executeCommand("workbench.mcp.configureSamplingModels", server);
      case "resources":
        return commandService.executeCommand("workbench.mcp.browseResources", server);
      case "samplingLog":
        editorService.openEditor({
          resource: void 0,
          contents: samplingService.getLogText(server),
          label: localize("mcp.samplingLog.title", "MCP Sampling: {0}", server.definition.label)
        });
        break;
      default:
        assertNever(pick.action);
    }
  }
  _getAuthAction(mcpRegistry, authenticationMcpService, authenticationMcpAccessService, authenticationAccessService, productService, serverId) {
    const providerId = mcpRegistry.getAuthenticationUsage(serverId);
    if (!providerId) {
      return void 0;
    }
    const preference = authenticationMcpService.getAccountPreference(serverId, providerId);
    if (!preference) {
      return void 0;
    }
    if (!authenticationMcpAccessService.isAccessAllowed(providerId, preference, serverId)) {
      return void 0;
    }
    const allowedServers = this._getAllAllowedItems(authenticationMcpAccessService, authenticationAccessService, productService, providerId, preference);
    if (allowedServers.length > 1) {
      return {
        action: "disconnect",
        label: localize("mcp.disconnect", "Disconnect Account"),
        description: `(${preference})`
      };
    }
    return {
      action: "signout",
      label: localize("mcp.signOut", "Sign Out"),
      description: `(${preference})`
    };
  }
  // TODO@TylerLeonhardt: The fact that this function exists means that these classes could really use some refactoring...
  _getAllAllowedItems(authenticationMcpAccessService, authenticationAccessService, productService, providerId, preference) {
    const trustedExtensionAuth = Array.isArray(productService.trustedExtensionAuthAccess) || !productService.trustedExtensionAuthAccess ? [] : productService.trustedExtensionAuthAccess[providerId] ?? [];
    const trustedMcpAuth = Array.isArray(productService.trustedMcpAuthAccess) || !productService.trustedMcpAuthAccess ? [] : productService.trustedMcpAuthAccess[providerId] ?? [];
    return [
      ...authenticationMcpAccessService.readAllowedMcpServers(providerId, preference).filter((s) => !s.trusted),
      ...authenticationAccessService.readAllowedExtensions(providerId, preference).filter((e) => !e.trusted),
      ...trustedExtensionAuth,
      ...trustedMcpAuth
    ];
  }
  async _handleAuth(mcpRegistry, authenticationMcpService, authenticationMcpAccessService, authenticationService, server, signOut) {
    const providerId = mcpRegistry.getAuthenticationUsage(server.definition.id);
    if (!providerId) {
      return;
    }
    const preference = authenticationMcpService.getAccountPreference(server.definition.id, providerId);
    if (!preference) {
      return;
    }
    authenticationMcpAccessService.updateAllowedMcpServers(providerId, preference, [
      {
        id: server.definition.id,
        name: server.definition.label,
        allowed: false
      }
    ]);
    if (signOut) {
      const accounts = await authenticationService.getAccounts(providerId);
      const account = accounts.find((a) => a.label === preference);
      if (account) {
        const sessions = await authenticationService.getSessions(providerId, void 0, { account });
        for (const session of sessions) {
          await authenticationService.removeSession(providerId, session.id);
        }
      }
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
        switch (server.cacheState.read(reader)) {
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
    this._store.add(actionViewItemService.register(MenuId.ChatExecute, "workbench.mcp.listServer", (action, options) => {
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
  constructor() {
    super({
      id: "workbench.mcp.addConfiguration",
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
  async run(accessor, serverId, opts) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    s?.showOutput();
    await s?.stop();
    await s?.start({ isFromInteraction: true, ...opts });
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
  async run(accessor, serverId, opts) {
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    await s?.start({ isFromInteraction: true, ...opts });
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
class McpBrowseCommand extends Action2 {
  static {
    __name(this, "McpBrowseCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.browseServers",
      title: localize2("mcp.command.browse", "MCP Servers"),
      category: ExtensionsLocalizedLabel,
      menu: [{
        id: MenuId.CommandPalette,
        when: McpServersGalleryEnabledContext
      }, {
        id: extensionsFilterSubMenu,
        when: McpServersGalleryEnabledContext,
        group: "1_predefined",
        order: 1
      }]
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@mcp ");
  }
}
class McpBrowseResourcesCommand extends Action2 {
  static {
    __name(this, "McpBrowseResourcesCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.browseResources",
      title: localize2("mcp.browseResources", "Browse Resources..."),
      category,
      precondition: McpContextKeys.serverCount.greater(0),
      f1: true
    });
  }
  run(accessor, server) {
    if (server) {
      accessor.get(IInstantiationService).createInstance(McpResourceQuickPick, server).pick();
    } else {
      accessor.get(IQuickInputService).quickAccess.show(McpResourceQuickAccess.PREFIX);
    }
  }
}
class McpConfigureSamplingModels extends Action2 {
  static {
    __name(this, "McpConfigureSamplingModels");
  }
  constructor() {
    super({
      id: "workbench.mcp.configureSamplingModels",
      title: localize2("mcp.configureSamplingModels", "Configure SamplingModel"),
      category
    });
  }
  async run(accessor, server) {
    const quickInputService = accessor.get(IQuickInputService);
    const lmService = accessor.get(ILanguageModelsService);
    const mcpSampling = accessor.get(IMcpSamplingService);
    const existingIds = new Set(mcpSampling.getConfig(server).allowedModels);
    const allItems = lmService.getLanguageModelIds().map((id) => {
      const model = lmService.lookupLanguageModel(id);
      if (!model.isUserSelectable) {
        return void 0;
      }
      return {
        label: model.name,
        description: model.description,
        id,
        picked: existingIds.size ? existingIds.has(id) : model.isDefault
      };
    }).filter(isDefined);
    allItems.sort((a, b) => (b.picked ? 1 : 0) - (a.picked ? 1 : 0) || a.label.localeCompare(b.label));
    const picked = await quickInputService.pick(allItems, {
      placeHolder: localize("mcp.configureSamplingModels.ph", "Pick the models {0} can access via MCP sampling", server.definition.label),
      canPickMany: true
    });
    if (picked) {
      await mcpSampling.updateConfig(server, (c) => c.allowedModels = picked.map((p) => p.id));
    }
    return picked?.length || 0;
  }
}
class McpStartPromptingServerCommand extends Action2 {
  static {
    __name(this, "McpStartPromptingServerCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.startPromptForServer",
      title: localize2("mcp.startPromptingServer", "Start Prompting Server"),
      category,
      f1: false
    });
  }
  async run(accessor, server) {
    const widget = await openPanelChatAndGetWidget(accessor.get(IViewsService), accessor.get(IChatWidgetService));
    if (!widget) {
      return;
    }
    const editor = widget.inputEditor;
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const range = (editor.getSelection() || model.getFullModelRange()).collapseToEnd();
    const text = mcpPromptPrefix(server.definition) + ".";
    model.applyEdits([{ range, text }]);
    editor.setSelection(Range.fromPositions(range.getEndPosition().delta(0, text.length)));
    widget.focusInput();
    SuggestController.get(editor)?.triggerSuggest();
  }
}
export {
  AddConfigurationAction,
  EditStoredInput,
  InstallFromActivation,
  ListMcpServerCommand,
  MCPServerActionRendering,
  McpBrowseCommand,
  McpBrowseResourcesCommand,
  McpConfigureSamplingModels,
  McpServerOptionsCommand,
  McpStartPromptingServerCommand,
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
