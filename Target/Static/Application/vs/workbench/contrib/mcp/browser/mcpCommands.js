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
import { $, addDisposableListener, disposableWindowInterval, EventType } from "../../../../base/browser/dom.js";
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { findLast } from "../../../../base/common/arraysFind.js";
import { assertNever } from "../../../../base/common/assert.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { groupBy } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { createMarkdownCommandLink, MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, derived, derivedObservableWithCache, observableValue } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { localize, localize2 } from "../../../../nls.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { MenuEntryActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, MenuId, MenuItemAction, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { mcpAutoStartConfig } from "../../../../platform/mcp/common/mcpManagement.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { defaultCheckboxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "../../../browser/actions/workspaceCommands.js";
import { ActiveEditorContext, RemoteNameContext, ResourceContextKey, WorkbenchStateContext, WorkspaceFolderCountContext } from "../../../common/contextkeys.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IAuthenticationQueryService } from "../../../services/authentication/common/authenticationQuery.js";
import { MCP_CONFIGURATION_KEY, WORKSPACE_STANDALONE_CONFIGURATIONS } from "../../../services/configuration/common/configuration.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IRemoteUserDataProfilesService } from "../../../services/userDataProfile/common/remoteUserDataProfiles.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { CHAT_CONFIG_MENU_ID } from "../../chat/browser/actions/chatActions.js";
import { ChatViewId, IChatWidgetService } from "../../chat/browser/chat.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { ChatAgentLocation, ChatModeKind } from "../../chat/common/constants.js";
import { ILanguageModelsService } from "../../chat/common/languageModels.js";
import { ILanguageModelToolsService } from "../../chat/common/tools/languageModelToolsService.js";
import { VIEW_CONTAINER } from "../../extensions/browser/extensions.contribution.js";
import { extensionsFilterSubMenu, IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { TEXT_FILE_EDITOR_ID } from "../../files/common/files.js";
import { McpContextKeys } from "../common/mcpContextKeys.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { HasInstalledMcpServersContext, IMcpSamplingService, IMcpService, InstalledMcpServersViewId, McpConnectionState, mcpPromptPrefix, McpStartServerInteraction } from "../common/mcpTypes.js";
import { McpAddConfigurationCommand, McpInstallFromManifestCommand } from "./mcpCommandsAddConfiguration.js";
import { McpResourceQuickAccess, McpResourceQuickPick } from "./mcpResourceQuickAccess.js";
import { startServerAndWaitForLiveTools } from "../common/mcpTypesUtils.js";
import "./media/mcpServerAction.css";
import { openPanelChatAndGetWidget } from "./openPanelChatAndGetWidget.js";
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
      precondition: ChatContextKeys.Setup.hidden.negate(),
      menu: [{
        when: ContextKeyExpr.and(ContextKeyExpr.or(ContextKeyExpr.and(ContextKeyExpr.equals(
          `config.${mcpAutoStartConfig}`,
          "never"
          /* McpAutoStartValue.Never */
        ), McpContextKeys.hasUnknownTools), McpContextKeys.hasServersWithErrors), ChatContextKeys.chatModeKind.isEqualTo(ChatModeKind.Agent), ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.Setup.hidden.negate()),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 101
      }]
    });
  }
  async run(accessor) {
    const mcpService = accessor.get(IMcpService);
    const commandService = accessor.get(ICommandService);
    const quickInput = accessor.get(IQuickInputService);
    const store = new DisposableStore();
    const pick = quickInput.createQuickPick({ useSeparators: true });
    pick.placeholder = localize("mcp.selectServer", "Select an MCP Server");
    mcpService.activateCollections();
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
class McpConfirmationServerOptionsCommand extends Action2 {
  static {
    __name(this, "McpConfirmationServerOptionsCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.serverOptionsInConfirmation",
      title: localize2("mcp.options", "Server Options"),
      category,
      icon: Codicon.settingsGear,
      f1: false,
      menu: [{
        id: MenuId.ChatConfirmationMenu,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("chatConfirmationPartSource", "mcp"), ContextKeyExpr.or(ContextKeyExpr.equals("chatConfirmationPartType", "chatToolConfirmation"), ContextKeyExpr.equals("chatConfirmationPartType", "elicitation"))),
        group: "navigation"
      }]
    });
  }
  async run(accessor, arg) {
    const toolsService = accessor.get(ILanguageModelToolsService);
    if (arg.kind === "toolInvocation") {
      const tool = toolsService.getTool(arg.toolId);
      if (tool?.source.type === "mcp") {
        accessor.get(ICommandService).executeCommand("workbench.mcp.serverOptions", tool.source.definitionId);
      }
    } else if (arg.kind === "elicitation2") {
      if (arg.source?.type === "mcp") {
        accessor.get(ICommandService).executeCommand("workbench.mcp.serverOptions", arg.source.definitionId);
      }
    } else {
      assertNever(arg);
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
    const authenticationQueryService = accessor.get(IAuthenticationQueryService);
    const authenticationService = accessor.get(IAuthenticationService);
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
    items.push(...this._getAuthActions(authenticationQueryService, server.definition.id));
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
        await server.start({ promptType: "all-untrusted" });
        server.showOutput();
        break;
      case "stop":
        await server.stop();
        break;
      case "restart":
        await server.stop();
        await server.start({ promptType: "all-untrusted" });
        break;
      case "disconnect":
        await server.stop();
        await this._handleAuth(authenticationService, pick.accountQuery, server.definition, false);
        break;
      case "signout":
        await server.stop();
        await this._handleAuth(authenticationService, pick.accountQuery, server.definition, true);
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
        assertNever(pick);
    }
  }
  _getAuthActions(authenticationQueryService, serverId) {
    const result = [];
    for (const [providerId, accountName] of authenticationQueryService.mcpServer(serverId).getAllAccountPreferences()) {
      const accountQuery = authenticationQueryService.provider(providerId).account(accountName);
      if (!accountQuery.mcpServer(serverId).isAccessAllowed()) {
        continue;
      }
      if (accountQuery.entities().getEntityCount().total > 1) {
        result.push({
          action: "disconnect",
          label: localize("mcp.disconnect", "Disconnect Account"),
          description: `(${accountName})`,
          accountQuery
        });
      } else {
        result.push({
          action: "signout",
          label: localize("mcp.signOut", "Sign Out"),
          description: `(${accountName})`,
          accountQuery
        });
      }
    }
    return result;
  }
  async _handleAuth(authenticationService, accountQuery, definition, signOut) {
    const { providerId, accountName } = accountQuery;
    accountQuery.mcpServer(definition.id).setAccessAllowed(false, definition.label);
    if (signOut) {
      const accounts = await authenticationService.getAccounts(providerId);
      const account = accounts.find((a) => a.label === accountName);
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
  constructor(actionViewItemService, mcpService, instaService, commandService, configurationService) {
    super();
    const hoverIsOpen = observableValue(this, false);
    const config = observableConfigValue(mcpAutoStartConfig, "newAndOutdated", configurationService);
    let DisplayedState;
    (function(DisplayedState2) {
      DisplayedState2[DisplayedState2["None"] = 0] = "None";
      DisplayedState2[DisplayedState2["NewTools"] = 1] = "NewTools";
      DisplayedState2[DisplayedState2["Error"] = 2] = "Error";
      DisplayedState2[DisplayedState2["Refreshing"] = 3] = "Refreshing";
    })(DisplayedState || (DisplayedState = {}));
    function isServer(s) {
      return typeof s.start === "function";
    }
    __name(isServer, "isServer");
    const displayedStateCurrent = derived((reader) => {
      const servers = mcpService.servers.read(reader);
      const serversPerState = [];
      for (const server of servers) {
        let thisState = 0;
        switch (server.cacheState.read(reader)) {
          case 0:
          case 2:
            thisState = server.connectionState.read(reader).state === 3 ? 2 : 1;
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
      if (unknownServerStates.state === 1) {
        serversPerState[
          3
          /* DisplayedState.Refreshing */
        ] ??= [];
        serversPerState[
          3
          /* DisplayedState.Refreshing */
        ].push(...unknownServerStates.collections);
      } else if (unknownServerStates.state === 0) {
        serversPerState[
          1
          /* DisplayedState.NewTools */
        ] ??= [];
        serversPerState[
          1
          /* DisplayedState.NewTools */
        ].push(...unknownServerStates.collections);
      }
      let maxState = serversPerState.length - 1;
      if (maxState === 1 && config.read(reader) !== "never") {
        maxState = 0;
      }
      return { state: maxState, servers: serversPerState[maxState] || [] };
    });
    const displayedState = derivedObservableWithCache(this, (reader, last) => {
      if (last && hoverIsOpen.read(reader)) {
        return last;
      } else {
        return displayedStateCurrent.read(reader);
      }
    });
    const actionItemState = displayedState.map((s) => s.state);
    this._store.add(actionViewItemService.register(MenuId.ChatInput, "workbench.mcp.listServer", (action, options) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instaService.createInstance(class extends MenuEntryActionViewItem {
        render(container) {
          super.render(container);
          container.classList.add("chat-mcp");
          container.style.position = "relative";
          const stateIndicator = container.appendChild($(".chat-mcp-state-indicator"));
          stateIndicator.style.display = "none";
          this._register(autorun((r) => {
            const displayed = displayedState.read(r);
            const { state } = displayed;
            this.updateTooltip();
            stateIndicator.ariaLabel = this.getLabelForState(displayed);
            stateIndicator.className = "chat-mcp-state-indicator";
            if (state === 1) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-new", ...ThemeIcon.asClassNameArray(Codicon.refresh));
            } else if (state === 2) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-error", ...ThemeIcon.asClassNameArray(Codicon.warning));
            } else if (state === 3) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-refreshing", ...ThemeIcon.asClassNameArray(spinningLoading));
            } else {
              stateIndicator.style.display = "none";
            }
          }));
        }
        async onClick(e) {
          e.preventDefault();
          e.stopPropagation();
          const { state, servers } = displayedStateCurrent.get();
          if (state === 1) {
            const interaction = new McpStartServerInteraction();
            servers.filter(isServer).forEach((server) => server.stop().then(() => server.start({ interaction })));
            mcpService.activateCollections();
          } else if (state === 3) {
            findLast(servers, isServer)?.showOutput();
          } else if (state === 2) {
            const server = findLast(servers, isServer);
            if (server) {
              await server.showOutput(true);
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
        getHoverContents({ state, servers } = displayedStateCurrent.get()) {
          const link = /* @__PURE__ */ __name((s) => createMarkdownCommandLink({
            title: s.definition.label,
            id: "workbench.mcp.serverOptions",
            arguments: [s.definition.id]
          }), "link");
          const single = servers.length === 1;
          const names = servers.map((s) => isServer(s) ? link(s) : "`" + s.label + "`").map((l) => single ? l : `- ${l}`).join("\n");
          let markdown;
          if (state === 1) {
            markdown = new MarkdownString(single ? localize("mcp.newTools.md.single", "MCP server {0} has been updated and may have new tools available.", names) : localize("mcp.newTools.md.multi", "MCP servers have been updated and may have new tools available:\n\n{0}", names));
          } else if (state === 2) {
            markdown = new MarkdownString(single ? localize("mcp.err.md.single", "MCP server {0} was unable to start successfully.", names) : localize("mcp.err.md.multi", "Multiple MCP servers were unable to start successfully:\n\n{0}", names));
          } else {
            return this.getLabelForState() || void 0;
          }
          return {
            element: /* @__PURE__ */ __name((token) => {
              hoverIsOpen.set(true, void 0);
              const store = new DisposableStore();
              store.add(toDisposable(() => hoverIsOpen.set(false, void 0)));
              store.add(token.onCancellationRequested(() => {
                store.dispose();
              }));
              store.add(disposableWindowInterval(mainWindow, () => {
                if (!container.isConnected) {
                  store.dispose();
                }
              }, 2e3));
              const container = $("div.mcp-hover-contents");
              markdown.isTrusted = true;
              const markdownResult = store.add(renderMarkdown(markdown));
              container.appendChild(markdownResult.element);
              const divider = $("hr.mcp-hover-divider");
              container.appendChild(divider);
              const checkboxContainer = $("div.mcp-hover-setting");
              const settingLabelStr = localize("mcp.autoStart", "Automatically start MCP servers when sending a chat message");
              const checkbox = store.add(new Checkbox(settingLabelStr, config.get() !== "never", { ...defaultCheckboxStyles }));
              checkboxContainer.appendChild(checkbox.domNode);
              const settingLabel = $("span.mcp-hover-setting-label", void 0, settingLabelStr);
              checkboxContainer.appendChild(settingLabel);
              const onChange = /* @__PURE__ */ __name(() => {
                const newValue = checkbox.checked ? "newAndOutdated" : "never";
                configurationService.updateValue(mcpAutoStartConfig, newValue);
              }, "onChange");
              store.add(checkbox.onChange(onChange));
              store.add(addDisposableListener(settingLabel, EventType.CLICK, () => {
                checkbox.checked = !checkbox.checked;
                onChange();
              }));
              container.appendChild(checkboxContainer);
              return container;
            }, "element")
          };
        }
        getLabelForState({ state, servers } = displayedStateCurrent.get()) {
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
    }, Event.fromObservableLight(actionItemState)));
  }
};
MCPServerActionRendering = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IMcpService),
  __param(2, IInstantiationService),
  __param(3, ICommandService),
  __param(4, IConfigurationService)
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
      precondition: ContextKeyExpr.and(McpContextKeys.toolsCount.greater(0), ChatContextKeys.Setup.hidden.negate())
    });
  }
  run(accessor) {
    const mcpService = accessor.get(IMcpService);
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
      precondition: ContextKeyExpr.and(McpContextKeys.toolsCount.greater(0), ChatContextKeys.Setup.hidden.negate())
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
      precondition: ChatContextKeys.Setup.hidden.negate(),
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]mcp\.json$/), ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID), ChatContextKeys.Setup.hidden.negate())
      }
    });
  }
  async run(accessor, configUri) {
    const instantiationService = accessor.get(IInstantiationService);
    const workspaceService = accessor.get(IWorkspaceContextService);
    const target = configUri ? workspaceService.getWorkspaceFolder(URI.parse(configUri)) : void 0;
    return instantiationService.createInstance(McpAddConfigurationCommand, target ?? void 0).run();
  }
}
class InstallFromManifestAction extends Action2 {
  static {
    __name(this, "InstallFromManifestAction");
  }
  constructor() {
    super({
      id: "workbench.mcp.installFromManifest",
      title: localize2("mcp.installFromManifest", "Install Server from Manifest..."),
      metadata: {
        description: localize2("mcp.installFromManifest.description", "Install an MCP server from a JSON manifest file")
      },
      category,
      f1: true,
      precondition: ChatContextKeys.Setup.hidden.negate()
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(McpInstallFromManifestCommand).run();
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
    await s?.start({ promptType: "all-untrusted", ...opts });
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
    let servers = accessor.get(IMcpService).servers.get();
    if (serverId !== "*") {
      servers = servers.filter((s) => s.definition.id === serverId);
    }
    const startOpts = { promptType: "all-untrusted", ...opts };
    if (opts?.waitForLiveTools) {
      await Promise.all(servers.map((s) => startServerAndWaitForLiveTools(s, startOpts)));
    } else {
      await Promise.all(servers.map((s) => s.start(startOpts)));
    }
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
class McpBrowseCommand extends Action2 {
  static {
    __name(this, "McpBrowseCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.browseServers",
      title: localize2("mcp.command.browse", "MCP Servers"),
      tooltip: localize2("mcp.command.browse.tooltip", "Browse MCP Servers"),
      category,
      icon: Codicon.search,
      precondition: ChatContextKeys.Setup.hidden.negate(),
      menu: [{
        id: extensionsFilterSubMenu,
        group: "1_predefined",
        order: 1,
        when: ChatContextKeys.Setup.hidden.negate()
      }, {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", InstalledMcpServersViewId), ChatContextKeys.Setup.hidden.negate()),
        group: "navigation"
      }]
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@mcp ");
  }
}
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.mcp.browseServers",
    title: localize2("mcp.command.browse.mcp", "Browse MCP Servers"),
    category,
    precondition: ChatContextKeys.Setup.hidden.negate()
  }
});
class ShowInstalledMcpServersCommand extends Action2 {
  static {
    __name(this, "ShowInstalledMcpServersCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.showInstalledServers",
      title: localize2("mcp.command.show.installed", "Show Installed Servers"),
      category,
      precondition: ContextKeyExpr.and(HasInstalledMcpServersContext, ChatContextKeys.Setup.hidden.negate()),
      f1: true
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await viewsService.openView(InstalledMcpServersViewId, true);
    if (!view) {
      await viewsService.openViewContainer(VIEW_CONTAINER.id);
      await viewsService.openView(InstalledMcpServersViewId, true);
    }
  }
}
MenuRegistry.appendMenuItem(CHAT_CONFIG_MENU_ID, {
  command: {
    id: "workbench.mcp.showInstalledServers",
    title: localize2("mcp.servers", "MCP Servers")
  },
  when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
  order: 10,
  group: "2_level"
});
class OpenMcpResourceCommand extends Action2 {
  static {
    __name(this, "OpenMcpResourceCommand");
  }
  async run(accessor) {
    const fileService = accessor.get(IFileService);
    const editorService = accessor.get(IEditorService);
    const resource = await this.getURI(accessor);
    if (!await fileService.exists(resource)) {
      await fileService.createFile(resource, VSBuffer.fromString(JSON.stringify({ servers: {} }, null, "	")));
    }
    await editorService.openEditor({ resource });
  }
}
class OpenUserMcpResourceCommand extends OpenMcpResourceCommand {
  static {
    __name(this, "OpenUserMcpResourceCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.openUserMcpJson",
      title: localize2("mcp.command.openUserMcp", "Open User Configuration"),
      category,
      f1: true,
      precondition: ChatContextKeys.Setup.hidden.negate()
    });
  }
  getURI(accessor) {
    const userDataProfileService = accessor.get(IUserDataProfileService);
    return Promise.resolve(userDataProfileService.currentProfile.mcpResource);
  }
}
class OpenRemoteUserMcpResourceCommand extends OpenMcpResourceCommand {
  static {
    __name(this, "OpenRemoteUserMcpResourceCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.openRemoteUserMcpJson",
      title: localize2("mcp.command.openRemoteUserMcp", "Open Remote User Configuration"),
      category,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), RemoteNameContext.notEqualsTo(""))
    });
  }
  async getURI(accessor) {
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const remoteUserDataProfileService = accessor.get(IRemoteUserDataProfilesService);
    const remoteProfile = await remoteUserDataProfileService.getRemoteProfile(userDataProfileService.currentProfile);
    return remoteProfile.mcpResource;
  }
}
class OpenWorkspaceFolderMcpResourceCommand extends Action2 {
  static {
    __name(this, "OpenWorkspaceFolderMcpResourceCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.openWorkspaceFolderMcpJson",
      title: localize2("mcp.command.openWorkspaceFolderMcp", "Open Workspace Folder MCP Configuration"),
      category,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), WorkspaceFolderCountContext.notEqualsTo(0))
    });
  }
  async run(accessor) {
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const commandService = accessor.get(ICommandService);
    const editorService = accessor.get(IEditorService);
    const workspaceFolders = workspaceContextService.getWorkspace().folders;
    const workspaceFolder = workspaceFolders.length === 1 ? workspaceFolders[0] : await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
    if (workspaceFolder) {
      await editorService.openEditor({ resource: workspaceFolder.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]) });
    }
  }
}
class OpenWorkspaceMcpResourceCommand extends Action2 {
  static {
    __name(this, "OpenWorkspaceMcpResourceCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.openWorkspaceMcpJson",
      title: localize2("mcp.command.openWorkspaceMcp", "Open Workspace MCP Configuration"),
      category,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), WorkbenchStateContext.isEqualTo("workspace"))
    });
  }
  async run(accessor) {
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const editorService = accessor.get(IEditorService);
    const workspaceConfiguration = workspaceContextService.getWorkspace().configuration;
    if (workspaceConfiguration) {
      await editorService.openEditor({ resource: workspaceConfiguration });
    }
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
      precondition: ContextKeyExpr.and(McpContextKeys.serverCount.greater(0), ChatContextKeys.Setup.hidden.negate()),
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
        description: model.tooltip,
        id,
        picked: existingIds.size ? existingIds.has(id) : model.isDefaultForLocation[ChatAgentLocation.Chat]
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
class McpSkipCurrentAutostartCommand extends Action2 {
  static {
    __name(this, "McpSkipCurrentAutostartCommand");
  }
  constructor() {
    super({
      id: "workbench.mcp.skipAutostart",
      title: localize2("mcp.skipCurrentAutostart", "Skip Current Autostart"),
      category,
      f1: false
    });
  }
  async run(accessor) {
    accessor.get(IMcpService).cancelAutostart();
  }
}
export {
  AddConfigurationAction,
  EditStoredInput,
  InstallFromManifestAction,
  ListMcpServerCommand,
  MCPServerActionRendering,
  McpBrowseCommand,
  McpBrowseResourcesCommand,
  McpConfigureSamplingModels,
  McpConfirmationServerOptionsCommand,
  McpServerOptionsCommand,
  McpSkipCurrentAutostartCommand,
  McpStartPromptingServerCommand,
  OpenRemoteUserMcpResourceCommand,
  OpenUserMcpResourceCommand,
  OpenWorkspaceFolderMcpResourceCommand,
  OpenWorkspaceMcpResourceCommand,
  RemoveStoredInput,
  ResetMcpCachedTools,
  ResetMcpTrustCommand,
  RestartServer,
  ShowConfiguration,
  ShowInstalledMcpServersCommand,
  ShowOutput,
  StartServer,
  StopServer
};
//# sourceMappingURL=mcpCommands.js.map
