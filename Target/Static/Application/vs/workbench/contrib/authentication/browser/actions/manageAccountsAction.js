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
import { Lazy } from "../../../../../base/common/lazy.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ISecretStorageService } from "../../../../../platform/secrets/common/secrets.js";
import { getCurrentAuthenticationSessionInfo } from "../../../../services/authentication/browser/authenticationService.js";
import { IAuthenticationService } from "../../../../services/authentication/common/authentication.js";
class ManageAccountsAction extends Action2 {
  static {
    __name(this, "ManageAccountsAction");
  }
  constructor() {
    super({
      id: "workbench.action.manageAccounts",
      title: localize2("manageAccounts", "Manage Accounts"),
      category: localize2("accounts", "Accounts"),
      f1: true
    });
  }
  run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageAccountsActionImpl).run();
  }
}
let ManageAccountsActionImpl = class ManageAccountsActionImpl2 {
  static {
    __name(this, "ManageAccountsActionImpl");
  }
  constructor(quickInputService, authenticationService, commandService, secretStorageService, productService) {
    this.quickInputService = quickInputService;
    this.authenticationService = authenticationService;
    this.commandService = commandService;
    this.secretStorageService = secretStorageService;
    this.productService = productService;
  }
  async run() {
    const placeHolder = localize("pickAccount", "Select an account to manage");
    const accounts = await this.listAccounts();
    if (!accounts.length) {
      await this.quickInputService.pick([{ label: localize("noActiveAccounts", "There are no active accounts.") }], { placeHolder });
      return;
    }
    const account = await this.quickInputService.pick(accounts, { placeHolder, matchOnDescription: true });
    if (!account) {
      return;
    }
    await this.showAccountActions(account);
  }
  async listAccounts() {
    const activeSession = new Lazy(() => getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService));
    const accounts = [];
    for (const providerId of this.authenticationService.getProviderIds()) {
      const provider = this.authenticationService.getProvider(providerId);
      for (const { label, id } of await this.authenticationService.getAccounts(providerId)) {
        accounts.push({
          label,
          description: provider.label,
          providerId,
          canUseMcp: !!provider.authorizationServers?.length,
          canSignOut: /* @__PURE__ */ __name(async () => this.canSignOut(provider, id, await activeSession.value), "canSignOut")
        });
      }
    }
    return accounts;
  }
  async canSignOut(provider, accountId, session) {
    if (session && !session.canSignOut && session.providerId === provider.id) {
      const sessions = await this.authenticationService.getSessions(provider.id);
      return !sessions.some((o) => o.id === session.id && o.account.id === accountId);
    }
    return true;
  }
  async showAccountActions(account) {
    const { providerId, label: accountLabel, canUseMcp, canSignOut } = account;
    const store = new DisposableStore();
    const quickPick = store.add(this.quickInputService.createQuickPick());
    quickPick.title = localize("manageAccount", "Manage '{0}'", accountLabel);
    quickPick.placeholder = localize("selectAction", "Select an action");
    quickPick.buttons = [this.quickInputService.backButton];
    const items = [{
      label: localize("manageTrustedExtensions", "Manage Trusted Extensions"),
      action: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedExtensionsForAccount", { providerId, accountLabel }), "action")
    }];
    if (canUseMcp) {
      items.push({
        label: localize("manageTrustedMCPServers", "Manage Trusted MCP Servers"),
        action: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel }), "action")
      });
    }
    if (await canSignOut()) {
      items.push({
        label: localize("signOut", "Sign Out"),
        action: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel }), "action")
      });
    }
    quickPick.items = items;
    store.add(quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      if (selected) {
        quickPick.hide();
        selected.action();
      }
    }));
    store.add(quickPick.onDidTriggerButton((button) => {
      if (button === this.quickInputService.backButton) {
        void this.run();
      }
    }));
    store.add(quickPick.onDidHide(() => store.dispose()));
    quickPick.show();
  }
};
ManageAccountsActionImpl = __decorate([
  __param(0, IQuickInputService),
  __param(1, IAuthenticationService),
  __param(2, ICommandService),
  __param(3, ISecretStorageService),
  __param(4, IProductService)
], ManageAccountsActionImpl);
export {
  ManageAccountsAction
};
//# sourceMappingURL=manageAccountsAction.js.map
