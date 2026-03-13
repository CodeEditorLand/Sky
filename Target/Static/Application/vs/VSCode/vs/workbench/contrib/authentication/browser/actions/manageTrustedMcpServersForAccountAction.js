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
import { Codicon } from "../../../../../base/common/codicons.js";
import { fromNow } from "../../../../../base/common/date.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IAuthenticationService } from "../../../../services/authentication/common/authentication.js";
import { IAuthenticationQueryService } from "../../../../services/authentication/common/authenticationQuery.js";
import { ChatContextKeys } from "../../../chat/common/actions/chatContextKeys.js";
import { IMcpService } from "../../../mcp/common/mcpTypes.js";
class ManageTrustedMcpServersForAccountAction extends Action2 {
  static {
    __name(this, "ManageTrustedMcpServersForAccountAction");
  }
  constructor() {
    super({
      id: "_manageTrustedMCPServersForAccount",
      title: localize2("manageTrustedMcpServersForAccount", "Manage Trusted MCP Servers For Account"),
      category: localize2("accounts", "Accounts"),
      f1: true,
      precondition: ChatContextKeys.Setup.hidden.negate()
    });
  }
  run(accessor, options) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageTrustedMcpServersForAccountActionImpl).run(options);
  }
}
let ManageTrustedMcpServersForAccountActionImpl = class ManageTrustedMcpServersForAccountActionImpl2 {
  static {
    __name(this, "ManageTrustedMcpServersForAccountActionImpl");
  }
  constructor(_mcpServerService, _dialogService, _quickInputService, _mcpServerAuthenticationService, _authenticationQueryService, _commandService) {
    this._mcpServerService = _mcpServerService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._mcpServerAuthenticationService = _mcpServerAuthenticationService;
    this._authenticationQueryService = _authenticationQueryService;
    this._commandService = _commandService;
  }
  async run(options) {
    const accountQuery = await this._resolveAccountQuery(options?.providerId, options?.accountLabel);
    if (!accountQuery) {
      return;
    }
    const items = await this._getItems(accountQuery);
    if (!items.length) {
      return;
    }
    const picker = this._createQuickPick(accountQuery);
    picker.items = items;
    picker.selectedItems = items.filter((i) => i.type !== "separator" && !!i.picked);
    picker.show();
  }
  //#region Account Query Resolution
  async _resolveAccountQuery(providerId, accountLabel) {
    if (providerId && accountLabel) {
      return this._authenticationQueryService.provider(providerId).account(accountLabel);
    }
    const accounts = await this._getAllAvailableAccounts();
    const pick = await this._quickInputService.pick(accounts, {
      placeHolder: localize("pickAccount", "Pick an account to manage trusted MCP servers for"),
      matchOnDescription: true
    });
    return pick ? this._authenticationQueryService.provider(pick.providerId).account(pick.label) : void 0;
  }
  async _getAllAvailableAccounts() {
    const accounts = [];
    for (const providerId of this._mcpServerAuthenticationService.getProviderIds()) {
      const provider = this._mcpServerAuthenticationService.getProvider(providerId);
      const sessions = await this._mcpServerAuthenticationService.getSessions(providerId);
      const uniqueLabels = /* @__PURE__ */ new Set();
      for (const session of sessions) {
        if (!uniqueLabels.has(session.account.label)) {
          uniqueLabels.add(session.account.label);
          accounts.push({
            providerId,
            label: session.account.label,
            description: provider.label
          });
        }
      }
    }
    return accounts;
  }
  //#endregion
  //#region Item Retrieval and Quick Pick Creation
  async _getItems(accountQuery) {
    const allowedMcpServers = accountQuery.mcpServers().getAllowedMcpServers();
    const serverIdToLabel = new Map(this._mcpServerService.servers.get().map((s) => [s.definition.id, s.definition.label]));
    const filteredMcpServers = allowedMcpServers.filter((server) => serverIdToLabel.has(server.id)).map((server) => {
      const usage = accountQuery.mcpServer(server.id).getUsage();
      return {
        ...server,
        // Use the server name from the MCP service
        name: serverIdToLabel.get(server.id),
        lastUsed: usage.length > 0 ? Math.max(...usage.map((u) => u.lastUsed)) : server.lastUsed
      };
    });
    if (!filteredMcpServers.length) {
      this._dialogService.info(localize("noTrustedMcpServers", "This account has not been used by any MCP servers."));
      return [];
    }
    const trustedServers = filteredMcpServers.filter((s) => s.trusted);
    const otherServers = filteredMcpServers.filter((s) => !s.trusted);
    const sortByLastUsed = /* @__PURE__ */ __name((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0), "sortByLastUsed");
    return [
      ...otherServers.sort(sortByLastUsed).map(this._toQuickPickItem),
      { type: "separator", label: localize("trustedMcpServers", "Trusted by Microsoft") },
      ...trustedServers.sort(sortByLastUsed).map(this._toQuickPickItem)
    ];
  }
  _toQuickPickItem(mcpServer) {
    const lastUsed = mcpServer.lastUsed;
    const description = lastUsed ? localize({ key: "accountLastUsedDate", comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", fromNow(lastUsed, true)) : localize("notUsed", "Has not used this account");
    let tooltip;
    let disabled;
    if (mcpServer.trusted) {
      tooltip = localize("trustedMcpServerTooltip", "This MCP server is trusted by Microsoft and\nalways has access to this account");
      disabled = true;
    }
    return {
      label: mcpServer.name,
      mcpServer,
      description,
      tooltip,
      disabled,
      buttons: [{
        tooltip: localize("accountPreferences", "Manage account preferences for this MCP server"),
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear)
      }],
      picked: mcpServer.allowed === void 0 || mcpServer.allowed
    };
  }
  _createQuickPick(accountQuery) {
    const disposableStore = new DisposableStore();
    const quickPick = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.canSelectMany = true;
    quickPick.customButton = true;
    quickPick.customLabel = localize("manageTrustedMcpServers.cancel", "Cancel");
    quickPick.customButtonSecondary = true;
    quickPick.title = localize("manageTrustedMcpServers", "Manage Trusted MCP Servers");
    quickPick.placeholder = localize("manageMcpServers", "Choose which MCP servers can access this account");
    disposableStore.add(quickPick.onDidAccept(() => {
      quickPick.hide();
      const allServers = quickPick.items.filter((item) => item.type !== "separator").map((i) => i.mcpServer);
      const selectedServers = new Set(quickPick.selectedItems.map((i) => i.mcpServer));
      for (const mcpServer of allServers) {
        const isAllowed = selectedServers.has(mcpServer);
        accountQuery.mcpServer(mcpServer.id).setAccessAllowed(isAllowed, mcpServer.name);
      }
    }));
    disposableStore.add(quickPick.onDidHide(() => disposableStore.dispose()));
    disposableStore.add(quickPick.onDidCustom(() => quickPick.hide()));
    disposableStore.add(quickPick.onDidTriggerItemButton((e) => this._commandService.executeCommand("_manageAccountPreferencesForMcpServer", e.item.mcpServer.id, accountQuery.providerId)));
    return quickPick;
  }
};
ManageTrustedMcpServersForAccountActionImpl = __decorate([
  __param(0, IMcpService),
  __param(1, IDialogService),
  __param(2, IQuickInputService),
  __param(3, IAuthenticationService),
  __param(4, IAuthenticationQueryService),
  __param(5, ICommandService)
], ManageTrustedMcpServersForAccountActionImpl);
export {
  ManageTrustedMcpServersForAccountAction
};
//# sourceMappingURL=manageTrustedMcpServersForAccountAction.js.map
