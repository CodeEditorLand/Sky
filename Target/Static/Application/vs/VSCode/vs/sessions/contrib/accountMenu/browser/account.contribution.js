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
import "../../../browser/media/sidebarActionButton.css";
import "./media/accountWidget.css";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuRegistry, registerAction2, IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IDefaultAccountService } from "../../../../platform/defaultAccount/common/defaultAccount.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { appendUpdateMenuItems as registerUpdateMenuItems } from "../../../../workbench/contrib/update/browser/update.js";
import { Menus } from "../../../browser/menus.js";
import { IActionViewItemService } from "../../../../platform/actions/browser/actionViewItemService.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { fillInActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { $, append } from "../../../../base/browser/dom.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IUpdateService } from "../../../../platform/update/common/update.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IHostService } from "../../../../workbench/services/host/browser/host.js";
import { URI } from "../../../../base/common/uri.js";
import { UpdateHoverWidget } from "./updateHoverWidget.js";
const AccountMenu = new MenuId("SessionsAccountMenu");
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.agenticSignIn",
      title: localize2("signIn", "Sign In"),
      menu: {
        id: AccountMenu,
        when: ContextKeyExpr.notEquals("defaultAccountStatus", "available"),
        group: "1_account",
        order: 1
      }
    });
  }
  async run(accessor) {
    const defaultAccountService = accessor.get(IDefaultAccountService);
    await defaultAccountService.signIn();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.agenticSignOut",
      title: localize2("signOut", "Sign Out"),
      menu: {
        id: AccountMenu,
        when: ContextKeyExpr.equals("defaultAccountStatus", "available"),
        group: "1_account",
        order: 1
      }
    });
  }
  async run(accessor) {
    const defaultAccountService = accessor.get(IDefaultAccountService);
    await defaultAccountService.signOut();
  }
});
MenuRegistry.appendMenuItem(AccountMenu, {
  command: {
    id: "workbench.action.openSettings",
    title: localize("settings", "Settings")
  },
  group: "2_settings",
  order: 1
});
registerUpdateMenuItems(AccountMenu, "3_updates");
let AccountWidget = class AccountWidget2 extends ActionViewItem {
  static {
    __name(this, "AccountWidget");
  }
  constructor(action, options, defaultAccountService, updateService, contextMenuService, menuService, contextKeyService, hoverService, productService, openerService, dialogService, hostService) {
    super(void 0, action, { ...options, icon: false, label: false });
    this.defaultAccountService = defaultAccountService;
    this.updateService = updateService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this.productService = productService;
    this.openerService = openerService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.viewItemDisposables = this._register(new DisposableStore());
    this.updateHoverWidget = new UpdateHoverWidget(this.updateService, this.productService, this.hoverService);
  }
  getTooltip() {
    return void 0;
  }
  render(container) {
    super.render(container);
    container.classList.add("account-widget", "sidebar-action");
    const accountContainer = append(container, $(".account-widget-account"));
    this.accountButton = this.viewItemDisposables.add(new Button(accountContainer, {
      ...defaultButtonStyles,
      secondary: true,
      title: false,
      supportIcons: true,
      buttonSecondaryBackground: "transparent",
      buttonSecondaryHoverBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryBorder: void 0
    }));
    this.accountButton.element.classList.add("account-widget-account-button", "sidebar-action-button");
    const updateContainer = append(container, $(".account-widget-update"));
    this.updateButton = this.viewItemDisposables.add(new Button(updateContainer, {
      ...defaultButtonStyles,
      secondary: true,
      title: false,
      supportIcons: true,
      buttonSecondaryBackground: "transparent",
      buttonSecondaryHoverBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryBorder: void 0
    }));
    this.updateButton.element.classList.add("account-widget-update-button", "sidebar-action-button");
    this.viewItemDisposables.add(this.updateHoverWidget.attachTo(this.updateButton.element));
    this.updateAccountButton();
    this.viewItemDisposables.add(this.defaultAccountService.onDidChangeDefaultAccount(() => this.updateAccountButton()));
    this.updateUpdateButton();
    this.viewItemDisposables.add(this.updateService.onStateChange(() => this.updateUpdateButton()));
    this.viewItemDisposables.add(this.accountButton.onDidClick((e) => {
      e?.preventDefault();
      e?.stopPropagation();
      this.showAccountMenu(this.accountButton.element);
    }));
    this.viewItemDisposables.add(this.updateButton.onDidClick(() => this.update()));
  }
  showAccountMenu(anchor) {
    const menu = this.menuService.createMenu(AccountMenu, this.contextKeyService);
    const actions = [];
    fillInActionBarActions(menu.getActions(), actions);
    menu.dispose();
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions")
    });
  }
  async updateAccountButton() {
    if (!this.accountButton) {
      return;
    }
    this.accountButton.label = `$(${Codicon.loading.id}~spin) ${localize("loadingAccount", "Loading account...")}`;
    this.accountButton.enabled = false;
    const account = await this.defaultAccountService.getDefaultAccount();
    this.accountButton.enabled = true;
    this.accountButton.label = account ? `$(${Codicon.account.id}) ${account.accountName} (${account.authenticationProvider.name})` : `$(${Codicon.account.id}) ${localize("signInLabel", "Sign In")}`;
  }
  updateUpdateButton() {
    if (!this.updateButton) {
      return;
    }
    const state = this.updateService.state;
    if (state.type === "available for download" && state.canInstall === false) {
      this.updateButton.element.classList.remove("hidden");
      this.updateButton.element.classList.remove("account-widget-update-button-ready");
      this.updateButton.element.classList.add("account-widget-update-button-hint");
      this.updateButton.enabled = true;
      this.updateButton.label = localize("updateAvailable", "Update Available");
      this.updateButton.element.title = localize("updateInVSCodeHover", "Updates are managed by VS Code. Click to open VS Code.");
      return;
    }
    if (this.shouldHideUpdateButton(state.type)) {
      this.clearUpdateButtonStyling();
      this.updateButton.element.classList.add("hidden");
      return;
    }
    this.updateButton.element.classList.remove("hidden");
    this.updateButton.element.style.backgroundImage = "";
    this.updateButton.enabled = state.type === "ready";
    this.updateButton.label = this.getUpdateProgressMessage(state.type);
    if (state.type === "ready") {
      this.updateButton.element.classList.add("account-widget-update-button-ready");
      return;
    }
    this.updateButton.element.classList.remove("account-widget-update-button-ready");
  }
  shouldHideUpdateButton(type) {
    return type === "uninitialized" || type === "idle" || type === "disabled" || type === "checking for updates";
  }
  clearUpdateButtonStyling() {
    if (this.updateButton) {
      this.updateButton.element.style.backgroundImage = "";
      this.updateButton.element.classList.remove("account-widget-update-button-ready");
    }
  }
  getUpdateProgressMessage(type) {
    switch (type) {
      case "ready":
        return localize("update", "Update");
      case "available for download":
      case "downloading":
      case "overwriting":
        return localize("downloadingUpdate", "Downloading...");
      case "downloaded":
        return localize("installingUpdate", "Installing...");
      case "updating":
        return localize("updatingApp", "Updating...");
      default:
        return localize("updating", "Updating...");
    }
  }
  async update() {
    const state = this.updateService.state;
    if (state.type === "available for download" && state.canInstall === false) {
      const { confirmed } = await this.dialogService.confirm({
        message: localize("updateFromVSCode.title", "Update from VS Code"),
        detail: localize("updateFromVSCode.detail", "This will close the Sessions app and open VS Code so you can install the update.\n\nLaunch Sessions again after the update is complete."),
        primaryButton: localize("updateFromVSCode.open", "Close and Open VS Code")
      });
      if (confirmed) {
        await this.openVSCode();
        await this.hostService.close();
      }
      return;
    }
    await this.updateService.quitAndInstall();
  }
  async openVSCode() {
    await this.openerService.open(URI.from({
      scheme: this.productService.urlProtocol,
      query: "windowId=_blank"
    }), { openExternal: true });
  }
  onClick() {
  }
};
AccountWidget = __decorate([
  __param(2, IDefaultAccountService),
  __param(3, IUpdateService),
  __param(4, IContextMenuService),
  __param(5, IMenuService),
  __param(6, IContextKeyService),
  __param(7, IHoverService),
  __param(8, IProductService),
  __param(9, IOpenerService),
  __param(10, IDialogService),
  __param(11, IHostService)
], AccountWidget);
let AccountWidgetContribution = class AccountWidgetContribution2 extends Disposable {
  static {
    __name(this, "AccountWidgetContribution");
  }
  static {
    this.ID = "workbench.contrib.sessionsWidget";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    const sessionsAccountWidgetAction = "sessions.action.accountWidget";
    this._register(actionViewItemService.register(Menus.SidebarFooter, sessionsAccountWidgetAction, (action, options) => {
      return instantiationService.createInstance(AccountWidget, action, options);
    }, void 0));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: sessionsAccountWidgetAction,
          title: localize2("sessionsAccountWidget", "Sessions Account"),
          menu: {
            id: Menus.SidebarFooter,
            group: "navigation",
            order: 1
          }
        });
      }
      async run() {
      }
    }));
  }
};
AccountWidgetContribution = __decorate([
  __param(0, IActionViewItemService),
  __param(1, IInstantiationService)
], AccountWidgetContribution);
registerWorkbenchContribution2(
  AccountWidgetContribution.ID,
  AccountWidgetContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
export {
  AccountWidget
};
//# sourceMappingURL=account.contribution.js.map
