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
import { Codicon } from "../../../../../base/common/codicons.js";
import { fromNow } from "../../../../../base/common/date.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../../platform/quickinput/common/quickInput.js";
import { IAuthenticationAccessService } from "../../../../services/authentication/browser/authenticationAccessService.js";
import { IAuthenticationUsageService } from "../../../../services/authentication/browser/authenticationUsageService.js";
import { AllowedExtension, IAuthenticationService } from "../../../../services/authentication/common/authentication.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
class ManageTrustedExtensionsForAccountAction extends Action2 {
  static {
    __name(this, "ManageTrustedExtensionsForAccountAction");
  }
  constructor() {
    super({
      id: "_manageTrustedExtensionsForAccount",
      title: localize2("manageTrustedExtensionsForAccount", "Manage Trusted Extensions For Account"),
      category: localize2("accounts", "Accounts"),
      f1: true
    });
  }
  run(accessor, options) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageTrustedExtensionsForAccountActionImpl).run(options);
  }
}
let ManageTrustedExtensionsForAccountActionImpl = class {
  constructor(_productService, _extensionService, _dialogService, _quickInputService, _authenticationService, _authenticationUsageService, _authenticationAccessService, _commandService) {
    this._productService = _productService;
    this._extensionService = _extensionService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._authenticationService = _authenticationService;
    this._authenticationUsageService = _authenticationUsageService;
    this._authenticationAccessService = _authenticationAccessService;
    this._commandService = _commandService;
  }
  static {
    __name(this, "ManageTrustedExtensionsForAccountActionImpl");
  }
  async run(options) {
    const { providerId, accountLabel } = await this._resolveProviderAndAccountLabel(options?.providerId, options?.accountLabel);
    if (!providerId || !accountLabel) {
      return;
    }
    const items = await this._getItems(providerId, accountLabel);
    if (!items.length) {
      return;
    }
    const disposables = new DisposableStore();
    const picker = this._createQuickPick(disposables, providerId, accountLabel);
    picker.items = items;
    picker.selectedItems = items.filter((i) => i.type !== "separator" && !!i.picked);
    picker.show();
  }
  async _resolveProviderAndAccountLabel(providerId, accountLabel) {
    if (!providerId || !accountLabel) {
      const accounts = new Array();
      for (const id of this._authenticationService.getProviderIds()) {
        const providerLabel = this._authenticationService.getProvider(id).label;
        const sessions = await this._authenticationService.getSessions(id);
        const uniqueAccountLabels = /* @__PURE__ */ new Set();
        for (const session of sessions) {
          if (!uniqueAccountLabels.has(session.account.label)) {
            uniqueAccountLabels.add(session.account.label);
            accounts.push({ providerId: id, providerLabel, accountLabel: session.account.label });
          }
        }
      }
      const pick = await this._quickInputService.pick(
        accounts.map((account) => ({
          providerId: account.providerId,
          label: account.accountLabel,
          description: account.providerLabel
        })),
        {
          placeHolder: localize("pickAccount", "Pick an account to manage trusted extensions for"),
          matchOnDescription: true
        }
      );
      if (pick) {
        providerId = pick.providerId;
        accountLabel = pick.label;
      } else {
        return { providerId: void 0, accountLabel: void 0 };
      }
    }
    return { providerId, accountLabel };
  }
  async _getItems(providerId, accountLabel) {
    let allowedExtensions = this._authenticationAccessService.readAllowedExtensions(providerId, accountLabel);
    const resolvedExtensions = await Promise.all(allowedExtensions.map((ext) => this._extensionService.getExtension(ext.id)));
    allowedExtensions = resolvedExtensions.map((ext, i) => ext ? allowedExtensions[i] : void 0).filter((ext) => !!ext);
    const trustedExtensionAuthAccess = this._productService.trustedExtensionAuthAccess;
    const trustedExtensionIds = (
      // Case 1: trustedExtensionAuthAccess is an array
      Array.isArray(trustedExtensionAuthAccess) ? trustedExtensionAuthAccess : typeof trustedExtensionAuthAccess === "object" ? trustedExtensionAuthAccess[providerId] ?? [] : []
    );
    for (const extensionId of trustedExtensionIds) {
      const allowedExtension = allowedExtensions.find((ext) => ext.id === extensionId);
      if (!allowedExtension) {
        const extension = await this._extensionService.getExtension(extensionId);
        if (extension) {
          allowedExtensions.push({
            id: extensionId,
            name: extension.displayName || extension.name,
            allowed: true,
            trusted: true
          });
        }
      } else {
        allowedExtension.allowed = true;
        allowedExtension.trusted = true;
      }
    }
    if (!allowedExtensions.length) {
      this._dialogService.info(localize("noTrustedExtensions", "This account has not been used by any extensions."));
      return [];
    }
    const usages = this._authenticationUsageService.readAccountUsages(providerId, accountLabel);
    const trustedExtensions = [];
    const otherExtensions = [];
    for (const extension of allowedExtensions) {
      const usage = usages.find((usage2) => extension.id === usage2.extensionId);
      extension.lastUsed = usage?.lastUsed;
      if (extension.trusted) {
        trustedExtensions.push(extension);
      } else {
        otherExtensions.push(extension);
      }
    }
    const sortByLastUsed = /* @__PURE__ */ __name((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0), "sortByLastUsed");
    const items = [
      ...otherExtensions.sort(sortByLastUsed).map(this._toQuickPickItem),
      { type: "separator", label: localize("trustedExtensions", "Trusted by Microsoft") },
      ...trustedExtensions.sort(sortByLastUsed).map(this._toQuickPickItem)
    ];
    return items;
  }
  _toQuickPickItem(extension) {
    const lastUsed = extension.lastUsed;
    const description = lastUsed ? localize({ key: "accountLastUsedDate", comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", fromNow(lastUsed, true)) : localize("notUsed", "Has not used this account");
    let tooltip;
    let disabled;
    if (extension.trusted) {
      tooltip = localize("trustedExtensionTooltip", "This extension is trusted by Microsoft and\nalways has access to this account");
      disabled = true;
    }
    return {
      label: extension.name,
      extension,
      description,
      tooltip,
      disabled,
      buttons: [{
        tooltip: localize("accountPreferences", "Manage account preferences for this extension"),
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear)
      }],
      picked: extension.allowed === void 0 || extension.allowed
    };
  }
  _createQuickPick(disposableStore, providerId, accountLabel) {
    const quickPick = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.canSelectMany = true;
    quickPick.customButton = true;
    quickPick.customLabel = localize("manageTrustedExtensions.cancel", "Cancel");
    quickPick.title = localize("manageTrustedExtensions", "Manage Trusted Extensions");
    quickPick.placeholder = localize("manageExtensions", "Choose which extensions can access this account");
    disposableStore.add(quickPick.onDidAccept(() => {
      const updatedAllowedList = quickPick.items.filter((item) => item.type !== "separator").map((i) => i.extension);
      const allowedExtensionsSet = new Set(quickPick.selectedItems.map((i) => i.extension));
      updatedAllowedList.forEach((extension) => {
        extension.allowed = allowedExtensionsSet.has(extension);
      });
      this._authenticationAccessService.updateAllowedExtensions(providerId, accountLabel, updatedAllowedList);
      quickPick.hide();
    }));
    disposableStore.add(quickPick.onDidHide(() => {
      disposableStore.dispose();
    }));
    disposableStore.add(quickPick.onDidCustom(() => {
      quickPick.hide();
    }));
    disposableStore.add(quickPick.onDidTriggerItemButton(
      (e) => this._commandService.executeCommand("_manageAccountPreferencesForExtension", e.item.extension.id, providerId)
    ));
    return quickPick;
  }
};
ManageTrustedExtensionsForAccountActionImpl = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IAuthenticationService),
  __decorateParam(5, IAuthenticationUsageService),
  __decorateParam(6, IAuthenticationAccessService),
  __decorateParam(7, ICommandService)
], ManageTrustedExtensionsForAccountActionImpl);
export {
  ManageTrustedExtensionsForAccountAction
};
//# sourceMappingURL=manageTrustedExtensionsForAccountAction.js.map
