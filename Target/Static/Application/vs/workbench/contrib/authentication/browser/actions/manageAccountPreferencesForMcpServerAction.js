var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "../../../../services/authentication/common/authentication.js";
import { IAuthenticationMcpService } from "../../../../services/authentication/browser/authenticationMcpService.js";
import { IMcpService } from "../../../mcp/common/mcpTypes.js";
import { IAuthenticationMcpUsageService } from "../../../../services/authentication/browser/authenticationMcpUsageService.js";
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
class ManageAccountPreferencesForMcpServerAction extends Action2 {
  static {
    __name(this, "ManageAccountPreferencesForMcpServerAction");
  }
  constructor() {
    super({
      id: "_manageAccountPreferencesForMcpServer",
      title: localize2("manageAccountPreferenceForMcpServer", "Manage MCP Server Account Preferences"),
      category: localize2("accounts", "Accounts"),
      f1: false
    });
  }
  run(accessor, mcpServerId, providerId) {
    return accessor.get(IInstantiationService).createInstance(ManageAccountPreferenceForMcpServerActionImpl).run(mcpServerId, providerId);
  }
}
let ManageAccountPreferenceForMcpServerActionImpl = class ManageAccountPreferenceForMcpServerActionImpl2 {
  static {
    __name(this, "ManageAccountPreferenceForMcpServerActionImpl");
  }
  constructor(_authenticationService, _quickInputService, _dialogService, _authenticationUsageService, _authenticationMcpServersService, _mcpService, _logService) {
    this._authenticationService = _authenticationService;
    this._quickInputService = _quickInputService;
    this._dialogService = _dialogService;
    this._authenticationUsageService = _authenticationUsageService;
    this._authenticationMcpServersService = _authenticationMcpServersService;
    this._mcpService = _mcpService;
    this._logService = _logService;
  }
  async run(mcpServerId, providerId) {
    if (!mcpServerId) {
      return;
    }
    const mcpServer = this._mcpService.servers.get().find((s) => s.definition.id === mcpServerId);
    if (!mcpServer) {
      throw new Error(`No MCP server with id ${mcpServerId}`);
    }
    const providerIds = new Array();
    const providerIdToAccounts = /* @__PURE__ */ new Map();
    if (providerId) {
      providerIds.push(providerId);
      providerIdToAccounts.set(providerId, await this._authenticationService.getAccounts(providerId));
    } else {
      for (const providerId2 of this._authenticationService.getProviderIds()) {
        if (providerId2.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
          continue;
        }
        const accounts2 = await this._authenticationService.getAccounts(providerId2);
        for (const account of accounts2) {
          const usage = this._authenticationUsageService.readAccountUsages(providerId2, account.label).find((u) => u.mcpServerId === mcpServerId);
          if (usage) {
            providerIds.push(providerId2);
            providerIdToAccounts.set(providerId2, accounts2);
            break;
          }
        }
      }
    }
    let chosenProviderId = providerIds[0];
    if (providerIds.length > 1) {
      const result = await this._quickInputService.pick(providerIds.map((providerId2) => ({
        label: this._authenticationService.getProvider(providerId2).label,
        id: providerId2
      })), {
        placeHolder: localize("selectProvider", "Select an authentication provider to manage account preferences for"),
        title: localize("pickAProviderTitle", "Manage MCP Server Account Preferences")
      });
      chosenProviderId = result?.id;
    }
    if (!chosenProviderId) {
      await this._dialogService.info(localize("noAccountUsage", "This MCP server has not used any accounts yet."));
      return;
    }
    const currentAccountNamePreference = this._authenticationMcpServersService.getAccountPreference(mcpServerId, chosenProviderId);
    const accounts = providerIdToAccounts.get(chosenProviderId);
    const items = this._getItems(accounts, chosenProviderId, currentAccountNamePreference);
    const provider = this._authenticationService.getProvider(chosenProviderId);
    if (provider.supportsMultipleAccounts) {
      const lastUsedScopes = accounts.flatMap((account) => this._authenticationUsageService.readAccountUsages(chosenProviderId, account.label).find((u) => u.mcpServerId === mcpServerId)).filter((usage) => !!usage).sort((a, b) => b.lastUsed - a.lastUsed)?.[0]?.scopes;
      if (lastUsedScopes) {
        items.push({ type: "separator" });
        items.push({
          providerId: chosenProviderId,
          scopes: lastUsedScopes,
          label: localize("use new account", "Use a new account...")
        });
      }
    }
    const disposables = new DisposableStore();
    const picker = this._createQuickPick(disposables, mcpServerId, mcpServer.definition.label, provider.label);
    if (items.length === 0) {
      disposables.add(this._handleNoAccounts(picker));
      return;
    }
    picker.items = items;
    picker.show();
  }
  _createQuickPick(disposableStore, mcpServerId, mcpServerLabel, providerLabel) {
    const picker = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    disposableStore.add(picker.onDidHide(() => {
      disposableStore.dispose();
    }));
    picker.placeholder = localize("placeholder v2", "Manage '{0}' account preferences for {1}...", mcpServerLabel, providerLabel);
    picker.title = localize("title", "'{0}' Account Preferences For This Workspace", mcpServerLabel);
    picker.sortByLabel = false;
    disposableStore.add(picker.onDidAccept(async () => {
      picker.hide();
      await this._accept(mcpServerId, picker.selectedItems);
    }));
    return picker;
  }
  _getItems(accounts, providerId, currentAccountNamePreference) {
    return accounts.map((a) => currentAccountNamePreference === a.label ? {
      label: a.label,
      account: a,
      providerId,
      description: localize("currentAccount", "Current account"),
      picked: true
    } : {
      label: a.label,
      account: a,
      providerId
    });
  }
  _handleNoAccounts(picker) {
    picker.validationMessage = localize("noAccounts", "No accounts are currently used by this MCP server.");
    picker.buttons = [this._quickInputService.backButton];
    picker.show();
    return Event.filter(picker.onDidTriggerButton, (e) => e === this._quickInputService.backButton)(() => this.run());
  }
  async _accept(mcpServerId, selectedItems) {
    for (const item of selectedItems) {
      let account;
      if (!item.account) {
        try {
          const session = await this._authenticationService.createSession(item.providerId, item.scopes);
          account = session.account;
        } catch (e) {
          this._logService.error(e);
          continue;
        }
      } else {
        account = item.account;
      }
      const providerId = item.providerId;
      const currentAccountName = this._authenticationMcpServersService.getAccountPreference(mcpServerId, providerId);
      if (currentAccountName === account.label) {
        continue;
      }
      this._authenticationMcpServersService.updateAccountPreference(mcpServerId, providerId, account);
    }
  }
};
ManageAccountPreferenceForMcpServerActionImpl = __decorate([
  __param(0, IAuthenticationService),
  __param(1, IQuickInputService),
  __param(2, IDialogService),
  __param(3, IAuthenticationMcpUsageService),
  __param(4, IAuthenticationMcpService),
  __param(5, IMcpService),
  __param(6, ILogService)
], ManageAccountPreferenceForMcpServerActionImpl);
export {
  ManageAccountPreferencesForMcpServerAction
};
//# sourceMappingURL=manageAccountPreferencesForMcpServerAction.js.map
