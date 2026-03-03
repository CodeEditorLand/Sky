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
import { appendUpdateMenuItems as registerUpdateMenuItems, CONTEXT_UPDATE_STATE } from "../../../../workbench/contrib/update/browser/update.js";
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
import { asCssVariable } from "../../../../platform/theme/common/colorUtils.js";
import { sessionsUpdateButtonDownloadingBackground, sessionsUpdateButtonDownloadedBackground } from "../../../common/theme.js";
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
  constructor(action, options, defaultAccountService, contextMenuService, menuService, contextKeyService) {
    super(void 0, action, { ...options, icon: false, label: false });
    this.defaultAccountService = defaultAccountService;
    this.contextMenuService = contextMenuService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.viewItemDisposables = this._register(new DisposableStore());
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
    this.updateAccountButton();
    this.viewItemDisposables.add(this.defaultAccountService.onDidChangeDefaultAccount(() => this.updateAccountButton()));
    this.viewItemDisposables.add(this.accountButton.onDidClick((e) => {
      e?.preventDefault();
      e?.stopPropagation();
      this.showAccountMenu(this.accountButton.element);
    }));
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
  onClick() {
  }
};
AccountWidget = __decorate([
  __param(2, IDefaultAccountService),
  __param(3, IContextMenuService),
  __param(4, IMenuService),
  __param(5, IContextKeyService)
], AccountWidget);
let UpdateWidget = class UpdateWidget2 extends ActionViewItem {
  static {
    __name(this, "UpdateWidget");
  }
  constructor(action, options, updateService) {
    super(void 0, action, { ...options, icon: false, label: false });
    this.updateService = updateService;
    this.viewItemDisposables = this._register(new DisposableStore());
  }
  getTooltip() {
    return void 0;
  }
  render(container) {
    super.render(container);
    container.classList.add("update-widget", "sidebar-action");
    const updateContainer = append(container, $(".update-widget-action"));
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
    this.updateButton.element.classList.add("update-widget-button", "sidebar-action-button");
    this.viewItemDisposables.add(this.updateButton.onDidClick(() => this.update()));
    this.updateUpdateButton();
    this.viewItemDisposables.add(this.updateService.onStateChange(() => this.updateUpdateButton()));
  }
  isUpdateReady() {
    return this.updateService.state.type === "ready";
  }
  isUpdatePending() {
    const type = this.updateService.state.type;
    return type === "available for download" || type === "checking for updates" || type === "downloading" || type === "downloaded" || type === "updating" || type === "overwriting";
  }
  updateUpdateButton() {
    if (!this.updateButton) {
      return;
    }
    const state = this.updateService.state;
    if (this.isUpdatePending() && !this.isUpdateReady()) {
      this.updateButton.enabled = false;
      this.updateButton.label = `$(${Codicon.loading.id}~spin) ${this.getUpdateProgressMessage(state.type)}`;
      this.updateDownloadProgress(state);
    } else {
      this.updateButton.enabled = true;
      this.updateButton.label = `$(${Codicon.debugRestart.id}) ${localize("update", "Update")}`;
      const el = this.updateButton.element;
      if (state.type === "ready") {
        const color = asCssVariable(sessionsUpdateButtonDownloadedBackground);
        el.style.backgroundImage = `linear-gradient(to right, ${color} 100%, transparent 100%)`;
      } else {
        el.style.backgroundImage = "";
      }
    }
  }
  updateDownloadProgress(state) {
    if (!this.updateButton) {
      return;
    }
    const el = this.updateButton.element;
    if (state.type === "downloading") {
      const { downloadedBytes, totalBytes } = state;
      if (downloadedBytes !== void 0 && totalBytes && totalBytes > 0) {
        const percent = Math.min(100, Math.round(downloadedBytes / totalBytes * 100));
        const color = asCssVariable(sessionsUpdateButtonDownloadingBackground);
        el.style.backgroundImage = `linear-gradient(to right, ${color} ${percent}%, transparent ${percent}%)`;
      } else {
        const color = asCssVariable(sessionsUpdateButtonDownloadingBackground);
        el.style.backgroundImage = `linear-gradient(to right, ${color} 0%, transparent 100%)`;
      }
    } else if (state.type === "downloaded") {
      const color = asCssVariable(sessionsUpdateButtonDownloadedBackground);
      el.style.backgroundImage = `linear-gradient(to right, ${color} 100%, transparent 100%)`;
    } else {
      this.clearDownloadProgress();
    }
  }
  clearDownloadProgress() {
    if (this.updateButton) {
      this.updateButton.element.style.backgroundImage = "";
    }
  }
  getUpdateProgressMessage(type) {
    switch (type) {
      case "checking for updates":
        return localize("checkingForUpdates", "Checking for Updates...");
      case "downloading":
        return localize("downloadingUpdate", "Downloading Update...");
      case "downloaded":
        return localize("installingUpdate", "Installing Update...");
      case "updating":
        return localize("updatingApp", "Updating...");
      case "overwriting":
        return localize("overwritingUpdate", "Downloading Update...");
      default:
        return localize("updating", "Updating...");
    }
  }
  async update() {
    await this.updateService.quitAndInstall();
  }
  onClick() {
  }
};
UpdateWidget = __decorate([
  __param(2, IUpdateService)
], UpdateWidget);
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
    const sessionsUpdateWidgetAction = "sessions.action.updateWidget";
    this._register(actionViewItemService.register(Menus.SidebarFooter, sessionsUpdateWidgetAction, (action, options) => {
      return instantiationService.createInstance(UpdateWidget, action, options);
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
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: sessionsUpdateWidgetAction,
          title: localize2("sessionsUpdateWidget", "Sessions Update"),
          menu: {
            id: Menus.SidebarFooter,
            group: "navigation",
            order: 0,
            when: ContextKeyExpr.or(CONTEXT_UPDATE_STATE.isEqualTo(
              "ready"
              /* StateType.Ready */
            ), CONTEXT_UPDATE_STATE.isEqualTo(
              "available for download"
              /* StateType.AvailableForDownload */
            ), CONTEXT_UPDATE_STATE.isEqualTo(
              "downloading"
              /* StateType.Downloading */
            ), CONTEXT_UPDATE_STATE.isEqualTo(
              "downloaded"
              /* StateType.Downloaded */
            ), CONTEXT_UPDATE_STATE.isEqualTo(
              "updating"
              /* StateType.Updating */
            ), CONTEXT_UPDATE_STATE.isEqualTo(
              "overwriting"
              /* StateType.Overwriting */
            ))
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
  UpdateWidget
};
//# sourceMappingURL=account.contribution.js.map
