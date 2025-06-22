var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../nls.js";
import { ActionBar } from "../../../base/browser/ui/actionbar/actionbar.js";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "../../common/activity.js";
import { IActivityService } from "../../services/activity/common/activity.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { DisposableStore, Disposable } from "../../../base/common/lifecycle.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { CompositeBarActionViewItem, CompositeBarAction } from "./compositeBarActions.js";
import { Codicon } from "../../../base/common/codicons.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { registerIcon } from "../../../platform/theme/common/iconRegistry.js";
import { Action, Separator, SubmenuAction, toAction } from "../../../base/common/actions.js";
import { IMenuService, MenuId } from "../../../platform/actions/common/actions.js";
import { addDisposableListener, EventType, append, clearNode, hide, show, EventHelper, $, runWhenWindowIdle, getWindow } from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { EventType as TouchEventType } from "../../../base/browser/touch.js";
import { Lazy } from "../../../base/common/lazy.js";
import { getActionBarActions } from "../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import { ISecretStorageService } from "../../../platform/secrets/common/secrets.js";
import { getCurrentAuthenticationSessionInfo } from "../../services/authentication/browser/authenticationService.js";
import { IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from "../../services/authentication/common/authentication.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { ILifecycleService } from "../../services/lifecycle/common/lifecycle.js";
import { IUserDataProfileService } from "../../services/userDataProfile/common/userDataProfile.js";
import { DEFAULT_ICON } from "../../services/userDataProfile/common/userDataProfileIcons.js";
import { isString } from "../../../base/common/types.js";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND } from "../../common/theme.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
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
var GlobalCompositeBar_1;
let GlobalCompositeBar = class GlobalCompositeBar2 extends Disposable {
  static {
    __name(this, "GlobalCompositeBar");
  }
  static {
    GlobalCompositeBar_1 = this;
  }
  static {
    this.ACCOUNTS_ACTION_INDEX = 0;
  }
  static {
    this.ACCOUNTS_ICON = registerIcon("accounts-view-bar-icon", Codicon.account, localize("accountsViewBarIcon", "Accounts icon in the view bar."));
  }
  constructor(contextMenuActionsProvider, colors, activityHoverOptions, configurationService, instantiationService, storageService, extensionService) {
    super();
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.colors = colors;
    this.activityHoverOptions = activityHoverOptions;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.globalActivityAction = this._register(new Action(GLOBAL_ACTIVITY_ID));
    this.accountAction = this._register(new Action(ACCOUNTS_ACTIVITY_ID));
    this.element = $("div");
    const contextMenuAlignmentOptions = /* @__PURE__ */ __name(() => ({
      anchorAlignment: configurationService.getValue("workbench.sideBar.location") === "left" ? 1 : 0,
      anchorAxisAlignment: 1
      /* AnchorAxisAlignment.HORIZONTAL */
    }), "contextMenuAlignmentOptions");
    this.globalActivityActionBar = this._register(new ActionBar(this.element, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action.id === GLOBAL_ACTIVITY_ID) {
          return this.instantiationService.createInstance(GlobalActivityActionViewItem, this.contextMenuActionsProvider, { ...options, colors: this.colors, hoverOptions: this.activityHoverOptions }, contextMenuAlignmentOptions);
        }
        if (action.id === ACCOUNTS_ACTIVITY_ID) {
          return this.instantiationService.createInstance(AccountsActivityActionViewItem, this.contextMenuActionsProvider, {
            ...options,
            colors: this.colors,
            hoverOptions: this.activityHoverOptions
          }, contextMenuAlignmentOptions, (actions) => {
            actions.unshift(...[
              toAction({ id: "hideAccounts", label: localize("hideAccounts", "Hide Accounts"), run: /* @__PURE__ */ __name(() => setAccountsActionVisible(storageService, false), "run") }),
              new Separator()
            ]);
          });
        }
        throw new Error(`No view item for action '${action.id}'`);
      }, "actionViewItemProvider"),
      orientation: 1,
      ariaLabel: localize("manage", "Manage"),
      preventLoopNavigation: true
    }));
    if (this.accountsVisibilityPreference) {
      this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX });
    }
    this.globalActivityActionBar.push(this.globalActivityAction);
    this.registerListeners();
  }
  registerListeners() {
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (!this._store.isDisposed) {
        this._register(this.storageService.onDidChangeValue(0, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => this.toggleAccountsActivity()));
      }
    });
  }
  create(parent) {
    parent.appendChild(this.element);
  }
  focus() {
    this.globalActivityActionBar.focus(true);
  }
  size() {
    return this.globalActivityActionBar.viewItems.length;
  }
  getContextMenuActions() {
    return [toAction({ id: "toggleAccountsVisibility", label: localize("accounts", "Accounts"), checked: this.accountsVisibilityPreference, run: /* @__PURE__ */ __name(() => this.accountsVisibilityPreference = !this.accountsVisibilityPreference, "run") })];
  }
  toggleAccountsActivity() {
    if (this.globalActivityActionBar.length() === 2 && this.accountsVisibilityPreference) {
      return;
    }
    if (this.globalActivityActionBar.length() === 2) {
      this.globalActivityActionBar.pull(GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX);
    } else {
      this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar_1.ACCOUNTS_ACTION_INDEX });
    }
  }
  get accountsVisibilityPreference() {
    return isAccountsActionVisible(this.storageService);
  }
  set accountsVisibilityPreference(value) {
    setAccountsActionVisible(this.storageService, value);
  }
};
GlobalCompositeBar = GlobalCompositeBar_1 = __decorate([
  __param(3, IConfigurationService),
  __param(4, IInstantiationService),
  __param(5, IStorageService),
  __param(6, IExtensionService)
], GlobalCompositeBar);
let AbstractGlobalActivityActionViewItem = class AbstractGlobalActivityActionViewItem2 extends CompositeBarActionViewItem {
  static {
    __name(this, "AbstractGlobalActivityActionViewItem");
  }
  constructor(menuId, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService) {
    super(action, { draggable: false, icon: true, hasPopup: true, ...options }, () => true, themeService, hoverService, configurationService, keybindingService);
    this.menuId = menuId;
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.contextMenuAlignmentOptions = contextMenuAlignmentOptions;
    this.menuService = menuService;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.activityService = activityService;
    this.updateItemActivity();
    this._register(this.activityService.onDidChangeActivity((viewContainerOrAction) => {
      if (isString(viewContainerOrAction) && viewContainerOrAction === this.compositeBarActionItem.id) {
        this.updateItemActivity();
      }
    }));
  }
  updateItemActivity() {
    this.action.activities = this.activityService.getActivity(this.compositeBarActionItem.id);
  }
  render(container) {
    super.render(container);
    this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, async (e) => {
      EventHelper.stop(e, true);
      const isLeftClick = e?.button !== 2;
      if (isLeftClick) {
        this.run();
      }
    }));
    this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, async (e) => {
      e.stopPropagation();
      const disposables = new DisposableStore();
      const actions = await this.resolveContextMenuActions(disposables);
      const event = new StandardMouseEvent(getWindow(this.container), e);
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
        onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide")
      });
    }));
    this._register(addDisposableListener(this.container, EventType.KEY_UP, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(
        3
        /* KeyCode.Enter */
      ) || event.equals(
        10
        /* KeyCode.Space */
      )) {
        EventHelper.stop(e, true);
        this.run();
      }
    }));
    this._register(addDisposableListener(this.container, TouchEventType.Tap, (e) => {
      EventHelper.stop(e, true);
      this.run();
    }));
  }
  async resolveContextMenuActions(disposables) {
    return this.contextMenuActionsProvider();
  }
  async run() {
    const disposables = new DisposableStore();
    const menu = disposables.add(this.menuService.createMenu(this.menuId, this.contextKeyService));
    const actions = await this.resolveMainMenuActions(menu, disposables);
    const { anchorAlignment, anchorAxisAlignment } = this.contextMenuAlignmentOptions() ?? { anchorAlignment: void 0, anchorAxisAlignment: void 0 };
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => this.label, "getAnchor"),
      anchorAlignment,
      anchorAxisAlignment,
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      onHide: /* @__PURE__ */ __name(() => disposables.dispose(), "onHide"),
      menuActionOptions: { renderShortTitle: true }
    });
  }
  async resolveMainMenuActions(menu, _disposable) {
    return getActionBarActions(menu.getActions({ renderShortTitle: true })).secondary;
  }
};
AbstractGlobalActivityActionViewItem = __decorate([
  __param(5, IThemeService),
  __param(6, IHoverService),
  __param(7, IMenuService),
  __param(8, IContextMenuService),
  __param(9, IContextKeyService),
  __param(10, IConfigurationService),
  __param(11, IKeybindingService),
  __param(12, IActivityService)
], AbstractGlobalActivityActionViewItem);
let AccountsActivityActionViewItem = class AccountsActivityActionViewItem2 extends AbstractGlobalActivityActionViewItem {
  static {
    __name(this, "AccountsActivityActionViewItem");
  }
  static {
    this.ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
  }
  constructor(contextMenuActionsProvider, options, contextMenuAlignmentOptions, fillContextMenuActions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService, commandService) {
    const action = instantiationService.createInstance(CompositeBarAction, {
      id: ACCOUNTS_ACTIVITY_ID,
      name: localize("accounts", "Accounts"),
      classNames: ThemeIcon.asClassNameArray(GlobalCompositeBar.ACCOUNTS_ICON)
    });
    super(MenuId.AccountsContext, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
    this.fillContextMenuActions = fillContextMenuActions;
    this.lifecycleService = lifecycleService;
    this.authenticationService = authenticationService;
    this.productService = productService;
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this.commandService = commandService;
    this.groupedAccounts = /* @__PURE__ */ new Map();
    this.problematicProviders = /* @__PURE__ */ new Set();
    this.initialized = false;
    this.sessionFromEmbedder = new Lazy(() => getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService));
    this._register(action);
    this.registerListeners();
    this.initialize();
  }
  registerListeners() {
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
      await this.addAccountsFromProvider(e.id);
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e) => {
      this.groupedAccounts.delete(e.id);
      this.problematicProviders.delete(e.id);
    }));
    this._register(this.authenticationService.onDidChangeSessions(async (e) => {
      if (e.event.removed) {
        for (const removed of e.event.removed) {
          this.removeAccount(e.providerId, removed.account);
        }
      }
      for (const changed of [...e.event.changed ?? [], ...e.event.added ?? []]) {
        try {
          await this.addOrUpdateAccount(e.providerId, changed.account);
        } catch (e2) {
          this.logService.error(e2);
        }
      }
    }));
  }
  // This function exists to ensure that the accounts are added for auth providers that had already been registered
  // before the menu was created.
  async initialize() {
    await this.lifecycleService.when(
      3
      /* LifecyclePhase.Restored */
    );
    if (this._store.isDisposed) {
      return;
    }
    const disposable = this._register(runWhenWindowIdle(getWindow(this.element), async () => {
      await this.doInitialize();
      disposable.dispose();
    }));
  }
  async doInitialize() {
    const providerIds = this.authenticationService.getProviderIds();
    const results = await Promise.allSettled(providerIds.map((providerId) => this.addAccountsFromProvider(providerId)));
    for (const result of results) {
      if (result.status === "rejected") {
        this.logService.error(result.reason);
      }
    }
    this.initialized = true;
  }
  //#region overrides
  async resolveMainMenuActions(accountsMenu, disposables) {
    await super.resolveMainMenuActions(accountsMenu, disposables);
    const providers = this.authenticationService.getProviderIds().filter((p) => !p.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX));
    const otherCommands = accountsMenu.getActions();
    let menus = [];
    const registeredProviders = providers.filter((providerId) => !this.authenticationService.isDynamicAuthenticationProvider(providerId));
    const dynamicProviders = providers.filter((providerId) => this.authenticationService.isDynamicAuthenticationProvider(providerId));
    if (!this.initialized) {
      const noAccountsAvailableAction = disposables.add(new Action("noAccountsAvailable", localize("loading", "Loading..."), void 0, false));
      menus.push(noAccountsAvailableAction);
    } else {
      for (const providerId of registeredProviders) {
        const provider = this.authenticationService.getProvider(providerId);
        const accounts = this.groupedAccounts.get(providerId);
        if (!accounts) {
          if (this.problematicProviders.has(providerId)) {
            const providerUnavailableAction = disposables.add(new Action("providerUnavailable", localize("authProviderUnavailable", "{0} is currently unavailable", provider.label), void 0, false));
            menus.push(providerUnavailableAction);
            try {
              await this.addAccountsFromProvider(providerId);
            } catch (e) {
              this.logService.error(e);
            }
          }
          continue;
        }
        const canUseMcp = !!provider.authorizationServers?.length;
        for (const account of accounts) {
          const manageExtensionsAction = toAction({
            id: `configureSessions${account.label}`,
            label: localize("manageTrustedExtensions", "Manage Trusted Extensions"),
            enabled: true,
            run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedExtensionsForAccount", { providerId, accountLabel: account.label }), "run")
          });
          const providerSubMenuActions = [manageExtensionsAction];
          if (canUseMcp) {
            const manageMCPAction = toAction({
              id: `configureSessions${account.label}`,
              label: localize("manageTrustedMCPServers", "Manage Trusted MCP Servers"),
              enabled: true,
              run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel: account.label }), "run")
            });
            providerSubMenuActions.push(manageMCPAction);
          }
          if (account.canSignOut) {
            providerSubMenuActions.push(toAction({
              id: "signOut",
              label: localize("signOut", "Sign Out"),
              enabled: true,
              run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel: account.label }), "run")
            }));
          }
          const providerSubMenu = new SubmenuAction("activitybar.submenu", `${account.label} (${provider.label})`, providerSubMenuActions);
          menus.push(providerSubMenu);
        }
      }
      if (dynamicProviders.length && registeredProviders.length) {
        menus.push(new Separator());
      }
      for (const providerId of dynamicProviders) {
        const provider = this.authenticationService.getProvider(providerId);
        const accounts = this.groupedAccounts.get(providerId);
        if (!accounts) {
          if (this.problematicProviders.has(providerId)) {
            const providerUnavailableAction = disposables.add(new Action("providerUnavailable", localize("authProviderUnavailable", "{0} is currently unavailable", provider.label), void 0, false));
            menus.push(providerUnavailableAction);
            try {
              await this.addAccountsFromProvider(providerId);
            } catch (e) {
              this.logService.error(e);
            }
          }
          continue;
        }
        for (const account of accounts) {
          const providerSubMenuActions = [];
          const manageMCPAction = toAction({
            id: `configureSessions${account.label}`,
            label: localize("manageTrustedMCPServers", "Manage Trusted MCP Servers"),
            enabled: true,
            run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel: account.label }), "run")
          });
          providerSubMenuActions.push(manageMCPAction);
          if (account.canSignOut) {
            providerSubMenuActions.push(toAction({
              id: "signOut",
              label: localize("signOut", "Sign Out"),
              enabled: true,
              run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel: account.label }), "run")
            }));
          }
          const providerSubMenu = new SubmenuAction("activitybar.submenu", `${account.label} (${provider.label})`, providerSubMenuActions);
          menus.push(providerSubMenu);
        }
      }
    }
    if (menus.length && otherCommands.length) {
      menus.push(new Separator());
    }
    otherCommands.forEach((group, i) => {
      const actions = group[1];
      menus = menus.concat(actions);
      if (i !== otherCommands.length - 1) {
        menus.push(new Separator());
      }
    });
    return menus;
  }
  async resolveContextMenuActions(disposables) {
    const actions = await super.resolveContextMenuActions(disposables);
    this.fillContextMenuActions(actions);
    return actions;
  }
  //#endregion
  //#region groupedAccounts helpers
  async addOrUpdateAccount(providerId, account) {
    let accounts = this.groupedAccounts.get(providerId);
    if (!accounts) {
      accounts = [];
      this.groupedAccounts.set(providerId, accounts);
    }
    const sessionFromEmbedder = await this.sessionFromEmbedder.value;
    let canSignOut = true;
    if (sessionFromEmbedder && !sessionFromEmbedder.canSignOut && (await this.authenticationService.getSessions(providerId)).some((s) => s.id === sessionFromEmbedder.id && s.account.id === account.id)) {
      canSignOut = false;
    }
    const existingAccount = accounts.find((a) => a.label === account.label);
    if (existingAccount) {
      if (!canSignOut) {
        existingAccount.canSignOut = canSignOut;
      }
    } else {
      accounts.push({ ...account, canSignOut });
    }
  }
  removeAccount(providerId, account) {
    const accounts = this.groupedAccounts.get(providerId);
    if (!accounts) {
      return;
    }
    const index = accounts.findIndex((a) => a.id === account.id);
    if (index === -1) {
      return;
    }
    accounts.splice(index, 1);
    if (accounts.length === 0) {
      this.groupedAccounts.delete(providerId);
    }
  }
  async addAccountsFromProvider(providerId) {
    try {
      const sessions = await this.authenticationService.getSessions(providerId);
      this.problematicProviders.delete(providerId);
      for (const session of sessions) {
        try {
          await this.addOrUpdateAccount(providerId, session.account);
        } catch (e) {
          this.logService.error(e);
        }
      }
    } catch (e) {
      this.logService.error(e);
      this.problematicProviders.add(providerId);
    }
  }
};
AccountsActivityActionViewItem = __decorate([
  __param(4, IThemeService),
  __param(5, ILifecycleService),
  __param(6, IHoverService),
  __param(7, IContextMenuService),
  __param(8, IMenuService),
  __param(9, IContextKeyService),
  __param(10, IAuthenticationService),
  __param(11, IWorkbenchEnvironmentService),
  __param(12, IProductService),
  __param(13, IConfigurationService),
  __param(14, IKeybindingService),
  __param(15, ISecretStorageService),
  __param(16, ILogService),
  __param(17, IActivityService),
  __param(18, IInstantiationService),
  __param(19, ICommandService)
], AccountsActivityActionViewItem);
let GlobalActivityActionViewItem = class GlobalActivityActionViewItem2 extends AbstractGlobalActivityActionViewItem {
  static {
    __name(this, "GlobalActivityActionViewItem");
  }
  constructor(contextMenuActionsProvider, options, contextMenuAlignmentOptions, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService) {
    const action = instantiationService.createInstance(CompositeBarAction, {
      id: GLOBAL_ACTIVITY_ID,
      name: localize("manage", "Manage"),
      classNames: ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : DEFAULT_ICON)
    });
    super(MenuId.GlobalActivity, action, options, contextMenuActionsProvider, contextMenuAlignmentOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, keybindingService, activityService);
    this.userDataProfileService = userDataProfileService;
    this._register(action);
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => {
      action.compositeBarActionItem = {
        ...action.compositeBarActionItem,
        classNames: ThemeIcon.asClassNameArray(userDataProfileService.currentProfile.icon ? ThemeIcon.fromId(userDataProfileService.currentProfile.icon) : DEFAULT_ICON)
      };
    }));
  }
  render(container) {
    super.render(container);
    this.profileBadge = append(container, $(".profile-badge"));
    this.profileBadgeContent = append(this.profileBadge, $(".profile-badge-content"));
    this.updateProfileBadge();
  }
  updateProfileBadge() {
    if (!this.profileBadge || !this.profileBadgeContent) {
      return;
    }
    clearNode(this.profileBadgeContent);
    hide(this.profileBadge);
    if (this.userDataProfileService.currentProfile.isDefault) {
      return;
    }
    if (this.userDataProfileService.currentProfile.icon && this.userDataProfileService.currentProfile.icon !== DEFAULT_ICON.id) {
      return;
    }
    if (this.action.activities.length > 0) {
      return;
    }
    show(this.profileBadge);
    this.profileBadgeContent.classList.add("profile-text-overlay");
    this.profileBadgeContent.textContent = this.userDataProfileService.currentProfile.name.substring(0, 2).toUpperCase();
  }
  updateActivity() {
    super.updateActivity();
    this.updateProfileBadge();
  }
  computeTitle() {
    return this.userDataProfileService.currentProfile.isDefault ? super.computeTitle() : localize("manage profile", "Manage {0} (Profile)", this.userDataProfileService.currentProfile.name);
  }
};
GlobalActivityActionViewItem = __decorate([
  __param(3, IUserDataProfileService),
  __param(4, IThemeService),
  __param(5, IHoverService),
  __param(6, IMenuService),
  __param(7, IContextMenuService),
  __param(8, IContextKeyService),
  __param(9, IConfigurationService),
  __param(10, IWorkbenchEnvironmentService),
  __param(11, IKeybindingService),
  __param(12, IInstantiationService),
  __param(13, IActivityService)
], GlobalActivityActionViewItem);
let SimpleAccountActivityActionViewItem = class SimpleAccountActivityActionViewItem2 extends AccountsActivityActionViewItem {
  static {
    __name(this, "SimpleAccountActivityActionViewItem");
  }
  constructor(hoverOptions, options, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, storageService, logService, activityService, instantiationService, commandService) {
    super(() => simpleActivityContextMenuActions(storageService, true), {
      ...options,
      colors: /* @__PURE__ */ __name((theme) => ({
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
      }), "colors"),
      hoverOptions,
      compact: true
    }, () => void 0, (actions) => actions, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, logService, activityService, instantiationService, commandService);
  }
};
SimpleAccountActivityActionViewItem = __decorate([
  __param(2, IThemeService),
  __param(3, ILifecycleService),
  __param(4, IHoverService),
  __param(5, IContextMenuService),
  __param(6, IMenuService),
  __param(7, IContextKeyService),
  __param(8, IAuthenticationService),
  __param(9, IWorkbenchEnvironmentService),
  __param(10, IProductService),
  __param(11, IConfigurationService),
  __param(12, IKeybindingService),
  __param(13, ISecretStorageService),
  __param(14, IStorageService),
  __param(15, ILogService),
  __param(16, IActivityService),
  __param(17, IInstantiationService),
  __param(18, ICommandService)
], SimpleAccountActivityActionViewItem);
let SimpleGlobalActivityActionViewItem = class SimpleGlobalActivityActionViewItem2 extends GlobalActivityActionViewItem {
  static {
    __name(this, "SimpleGlobalActivityActionViewItem");
  }
  constructor(hoverOptions, options, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService, storageService) {
    super(() => simpleActivityContextMenuActions(storageService, false), {
      ...options,
      colors: /* @__PURE__ */ __name((theme) => ({
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
      }), "colors"),
      hoverOptions,
      compact: true
    }, () => void 0, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService);
  }
};
SimpleGlobalActivityActionViewItem = __decorate([
  __param(2, IUserDataProfileService),
  __param(3, IThemeService),
  __param(4, IHoverService),
  __param(5, IMenuService),
  __param(6, IContextMenuService),
  __param(7, IContextKeyService),
  __param(8, IConfigurationService),
  __param(9, IWorkbenchEnvironmentService),
  __param(10, IKeybindingService),
  __param(11, IInstantiationService),
  __param(12, IActivityService),
  __param(13, IStorageService)
], SimpleGlobalActivityActionViewItem);
function simpleActivityContextMenuActions(storageService, isAccount) {
  const currentElementContextMenuActions = [];
  if (isAccount) {
    currentElementContextMenuActions.push(toAction({ id: "hideAccounts", label: localize("hideAccounts", "Hide Accounts"), run: /* @__PURE__ */ __name(() => setAccountsActionVisible(storageService, false), "run") }), new Separator());
  }
  return [
    ...currentElementContextMenuActions,
    toAction({ id: "toggle.hideAccounts", label: localize("accounts", "Accounts"), checked: isAccountsActionVisible(storageService), run: /* @__PURE__ */ __name(() => setAccountsActionVisible(storageService, !isAccountsActionVisible(storageService)), "run") }),
    toAction({ id: "toggle.hideManage", label: localize("manage", "Manage"), checked: true, enabled: false, run: /* @__PURE__ */ __name(() => {
      throw new Error('"Manage" can not be hidden');
    }, "run") })
  ];
}
__name(simpleActivityContextMenuActions, "simpleActivityContextMenuActions");
function isAccountsActionVisible(storageService) {
  return storageService.getBoolean(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0, true);
}
__name(isAccountsActionVisible, "isAccountsActionVisible");
function setAccountsActionVisible(storageService, visible) {
  storageService.store(
    AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY,
    visible,
    0,
    0
    /* StorageTarget.USER */
  );
}
__name(setAccountsActionVisible, "setAccountsActionVisible");
export {
  AccountsActivityActionViewItem,
  GlobalActivityActionViewItem,
  GlobalCompositeBar,
  SimpleAccountActivityActionViewItem,
  SimpleGlobalActivityActionViewItem,
  isAccountsActionVisible
};
//# sourceMappingURL=globalCompositeBar.js.map
