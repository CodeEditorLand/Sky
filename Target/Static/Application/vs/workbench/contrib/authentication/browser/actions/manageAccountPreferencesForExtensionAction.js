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
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IAuthenticationUsageService } from "../../../../services/authentication/browser/authenticationUsageService.js";
import { IAuthenticationExtensionsService, IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "../../../../services/authentication/common/authentication.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
class ManageAccountPreferencesForExtensionAction extends Action2 {
  static {
    __name(this, "ManageAccountPreferencesForExtensionAction");
  }
  constructor() {
    super({
      id: "_manageAccountPreferencesForExtension",
      title: localize2("manageAccountPreferenceForExtension", "Manage Extension Account Preferences"),
      category: localize2("accounts", "Accounts"),
      f1: false
    });
  }
  run(accessor, extensionId, providerId) {
    return accessor.get(IInstantiationService).createInstance(ManageAccountPreferenceForExtensionActionImpl).run(extensionId, providerId);
  }
}
let ManageAccountPreferenceForExtensionActionImpl = class ManageAccountPreferenceForExtensionActionImpl2 {
  static {
    __name(this, "ManageAccountPreferenceForExtensionActionImpl");
  }
  constructor(_authenticationService, _quickInputService, _dialogService, _authenticationUsageService, _authenticationExtensionsService, _extensionService, _logService) {
    this._authenticationService = _authenticationService;
    this._quickInputService = _quickInputService;
    this._dialogService = _dialogService;
    this._authenticationUsageService = _authenticationUsageService;
    this._authenticationExtensionsService = _authenticationExtensionsService;
    this._extensionService = _extensionService;
    this._logService = _logService;
  }
  async run(extensionId, providerId) {
    if (!extensionId) {
      return;
    }
    const extension = await this._extensionService.getExtension(extensionId);
    if (!extension) {
      throw new Error(`No extension with id ${extensionId}`);
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
          const usage = this._authenticationUsageService.readAccountUsages(providerId2, account.label).find((u) => ExtensionIdentifier.equals(u.extensionId, extensionId));
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
        title: localize("pickAProviderTitle", "Manage Extension Account Preferences")
      });
      chosenProviderId = result?.id;
    }
    if (!chosenProviderId) {
      await this._dialogService.info(localize("noAccountUsage", "This extension has not used any accounts yet."));
      return;
    }
    const currentAccountNamePreference = this._authenticationExtensionsService.getAccountPreference(extensionId, chosenProviderId);
    const accounts = providerIdToAccounts.get(chosenProviderId);
    const items = this._getItems(accounts, chosenProviderId, currentAccountNamePreference);
    const provider = this._authenticationService.getProvider(chosenProviderId);
    if (provider.supportsMultipleAccounts) {
      const lastUsedScopes = accounts.flatMap((account) => this._authenticationUsageService.readAccountUsages(chosenProviderId, account.label).find((u) => ExtensionIdentifier.equals(u.extensionId, extensionId))).filter((usage) => !!usage).sort((a, b) => b.lastUsed - a.lastUsed)?.[0]?.scopes;
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
    const picker = this._createQuickPick(disposables, extensionId, extension.displayName ?? extension.name, provider.label);
    if (items.length === 0) {
      disposables.add(this._handleNoAccounts(picker));
      return;
    }
    picker.items = items;
    picker.show();
  }
  _createQuickPick(disposableStore, extensionId, extensionLabel, providerLabel) {
    const picker = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    disposableStore.add(picker.onDidHide(() => {
      disposableStore.dispose();
    }));
    picker.placeholder = localize("placeholder v2", "Manage '{0}' account preferences for {1}...", extensionLabel, providerLabel);
    picker.title = localize("title", "'{0}' Account Preferences For This Workspace", extensionLabel);
    picker.sortByLabel = false;
    disposableStore.add(picker.onDidAccept(async () => {
      picker.hide();
      await this._accept(extensionId, picker.selectedItems);
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
    picker.validationMessage = localize("noAccounts", "No accounts are currently used by this extension.");
    picker.buttons = [this._quickInputService.backButton];
    picker.show();
    return Event.filter(picker.onDidTriggerButton, (e) => e === this._quickInputService.backButton)(() => this.run());
  }
  async _accept(extensionId, selectedItems) {
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
      const currentAccountName = this._authenticationExtensionsService.getAccountPreference(extensionId, providerId);
      if (currentAccountName === account.label) {
        continue;
      }
      this._authenticationExtensionsService.updateAccountPreference(extensionId, providerId, account);
    }
  }
};
ManageAccountPreferenceForExtensionActionImpl = __decorate([
  __param(0, IAuthenticationService),
  __param(1, IQuickInputService),
  __param(2, IDialogService),
  __param(3, IAuthenticationUsageService),
  __param(4, IAuthenticationExtensionsService),
  __param(5, IExtensionService),
  __param(6, ILogService)
], ManageAccountPreferenceForExtensionActionImpl);
export {
  ManageAccountPreferencesForExtensionAction
};
//# sourceMappingURL=manageAccountPreferencesForExtensionAction.js.map
