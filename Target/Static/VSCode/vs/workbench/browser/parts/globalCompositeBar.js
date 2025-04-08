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
import { localize } from "../../../nls.js";
import { ActionBar, ActionsOrientation } from "../../../base/browser/ui/actionbar/actionbar.js";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "../../common/activity.js";
import { IActivityService } from "../../services/activity/common/activity.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { DisposableStore, Disposable } from "../../../base/common/lifecycle.js";
import { IColorTheme, IThemeService } from "../../../platform/theme/common/themeService.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { CompositeBarActionViewItem, CompositeBarAction, IActivityHoverOptions, ICompositeBarActionViewItemOptions, ICompositeBarColors } from "./compositeBarActions.js";
import { Codicon } from "../../../base/common/codicons.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { registerIcon } from "../../../platform/theme/common/iconRegistry.js";
import { Action, IAction, Separator, SubmenuAction, toAction } from "../../../base/common/actions.js";
import { IMenu, IMenuService, MenuId } from "../../../platform/actions/common/actions.js";
import { addDisposableListener, EventType, append, clearNode, hide, show, EventHelper, $, runWhenWindowIdle, getWindow } from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { EventType as TouchEventType, GestureEvent } from "../../../base/browser/touch.js";
import { AnchorAlignment, AnchorAxisAlignment } from "../../../base/browser/ui/contextview/contextview.js";
import { Lazy } from "../../../base/common/lazy.js";
import { getActionBarActions } from "../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import { ISecretStorageService } from "../../../platform/secrets/common/secrets.js";
import { AuthenticationSessionInfo, getCurrentAuthenticationSessionInfo } from "../../services/authentication/browser/authenticationService.js";
import { AuthenticationSessionAccount, IAuthenticationService } from "../../services/authentication/common/authentication.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { ILifecycleService, LifecyclePhase } from "../../services/lifecycle/common/lifecycle.js";
import { IUserDataProfileService } from "../../services/userDataProfile/common/userDataProfile.js";
import { DEFAULT_ICON } from "../../services/userDataProfile/common/userDataProfileIcons.js";
import { isString } from "../../../base/common/types.js";
import { KeyCode } from "../../../base/common/keyCodes.js";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND } from "../../common/theme.js";
import { IBaseActionViewItemOptions } from "../../../base/browser/ui/actionbar/actionViewItems.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
let GlobalCompositeBar = class extends Disposable {
  constructor(contextMenuActionsProvider, colors, activityHoverOptions, configurationService, instantiationService, storageService, extensionService) {
    super();
    this.contextMenuActionsProvider = contextMenuActionsProvider;
    this.colors = colors;
    this.activityHoverOptions = activityHoverOptions;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.element = $("div");
    const contextMenuAlignmentOptions = /* @__PURE__ */ __name(() => ({
      anchorAlignment: configurationService.getValue("workbench.sideBar.location") === "left" ? AnchorAlignment.RIGHT : AnchorAlignment.LEFT,
      anchorAxisAlignment: AnchorAxisAlignment.HORIZONTAL
    }), "contextMenuAlignmentOptions");
    this.globalActivityActionBar = this._register(new ActionBar(this.element, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => {
        if (action.id === GLOBAL_ACTIVITY_ID) {
          return this.instantiationService.createInstance(GlobalActivityActionViewItem, this.contextMenuActionsProvider, { ...options, colors: this.colors, hoverOptions: this.activityHoverOptions }, contextMenuAlignmentOptions);
        }
        if (action.id === ACCOUNTS_ACTIVITY_ID) {
          return this.instantiationService.createInstance(
            AccountsActivityActionViewItem,
            this.contextMenuActionsProvider,
            {
              ...options,
              colors: this.colors,
              hoverOptions: this.activityHoverOptions
            },
            contextMenuAlignmentOptions,
            (actions) => {
              actions.unshift(...[
                toAction({ id: "hideAccounts", label: localize("hideAccounts", "Hide Accounts"), run: /* @__PURE__ */ __name(() => setAccountsActionVisible(storageService, false), "run") }),
                new Separator()
              ]);
            }
          );
        }
        throw new Error(`No view item for action '${action.id}'`);
      }, "actionViewItemProvider"),
      orientation: ActionsOrientation.VERTICAL,
      ariaLabel: localize("manage", "Manage"),
      preventLoopNavigation: true
    }));
    if (this.accountsVisibilityPreference) {
      this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar.ACCOUNTS_ACTION_INDEX });
    }
    this.globalActivityActionBar.push(this.globalActivityAction);
    this.registerListeners();
  }
  static {
    __name(this, "GlobalCompositeBar");
  }
  static ACCOUNTS_ACTION_INDEX = 0;
  static ACCOUNTS_ICON = registerIcon("accounts-view-bar-icon", Codicon.account, localize("accountsViewBarIcon", "Accounts icon in the view bar."));
  element;
  globalActivityAction = this._register(new Action(GLOBAL_ACTIVITY_ID));
  accountAction = this._register(new Action(ACCOUNTS_ACTIVITY_ID));
  globalActivityActionBar;
  registerListeners() {
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (!this._store.isDisposed) {
        this._register(this.storageService.onDidChangeValue(StorageScope.PROFILE, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => this.toggleAccountsActivity()));
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
      this.globalActivityActionBar.pull(GlobalCompositeBar.ACCOUNTS_ACTION_INDEX);
    } else {
      this.globalActivityActionBar.push(this.accountAction, { index: GlobalCompositeBar.ACCOUNTS_ACTION_INDEX });
    }
  }
  get accountsVisibilityPreference() {
    return isAccountsActionVisible(this.storageService);
  }
  set accountsVisibilityPreference(value) {
    setAccountsActionVisible(this.storageService, value);
  }
};
GlobalCompositeBar = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IExtensionService)
], GlobalCompositeBar);
let AbstractGlobalActivityActionViewItem = class extends CompositeBarActionViewItem {
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
  static {
    __name(this, "AbstractGlobalActivityActionViewItem");
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
      if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
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
AbstractGlobalActivityActionViewItem = __decorateClass([
  __decorateParam(5, IThemeService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IActivityService)
], AbstractGlobalActivityActionViewItem);
let AccountsActivityActionViewItem = class extends AbstractGlobalActivityActionViewItem {
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
    this._register(action);
    this.registerListeners();
    this.initialize();
  }
  static {
    __name(this, "AccountsActivityActionViewItem");
  }
  static ACCOUNTS_VISIBILITY_PREFERENCE_KEY = "workbench.activity.showAccounts";
  groupedAccounts = /* @__PURE__ */ new Map();
  problematicProviders = /* @__PURE__ */ new Set();
  initialized = false;
  sessionFromEmbedder = new Lazy(() => getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService));
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
    await this.lifecycleService.when(LifecyclePhase.Restored);
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
    const providers = this.authenticationService.getProviderIds();
    const otherCommands = accountsMenu.getActions();
    let menus = [];
    for (const providerId of providers) {
      if (!this.initialized) {
        const noAccountsAvailableAction = disposables.add(new Action("noAccountsAvailable", localize("loading", "Loading..."), void 0, false));
        menus.push(noAccountsAvailableAction);
        break;
      }
      const providerLabel = this.authenticationService.getProvider(providerId).label;
      const accounts = this.groupedAccounts.get(providerId);
      if (!accounts) {
        if (this.problematicProviders.has(providerId)) {
          const providerUnavailableAction = disposables.add(new Action("providerUnavailable", localize("authProviderUnavailable", "{0} is currently unavailable", providerLabel), void 0, false));
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
        const manageExtensionsAction = toAction({
          id: `configureSessions${account.label}`,
          label: localize("manageTrustedExtensions", "Manage Trusted Extensions"),
          enabled: true,
          run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_manageTrustedExtensionsForAccount", { providerId, accountLabel: account.label }), "run")
        });
        const providerSubMenuActions = [manageExtensionsAction];
        if (account.canSignOut) {
          providerSubMenuActions.push(toAction({
            id: "signOut",
            label: localize("signOut", "Sign Out"),
            enabled: true,
            run: /* @__PURE__ */ __name(() => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel: account.label }), "run")
          }));
        }
        const providerSubMenu = new SubmenuAction("activitybar.submenu", `${account.label} (${providerLabel})`, providerSubMenuActions);
        menus.push(providerSubMenu);
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
    if (sessionFromEmbedder && !sessionFromEmbedder.canSignOut && (await this.authenticationService.getSessions(providerId)).some(
      (s) => s.id === sessionFromEmbedder.id && s.account.id === account.id
    )) {
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
  //#endregion
};
AccountsActivityActionViewItem = __decorateClass([
  __decorateParam(4, IThemeService),
  __decorateParam(5, ILifecycleService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IAuthenticationService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IProductService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, ISecretStorageService),
  __decorateParam(16, ILogService),
  __decorateParam(17, IActivityService),
  __decorateParam(18, IInstantiationService),
  __decorateParam(19, ICommandService)
], AccountsActivityActionViewItem);
let GlobalActivityActionViewItem = class extends AbstractGlobalActivityActionViewItem {
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
  static {
    __name(this, "GlobalActivityActionViewItem");
  }
  profileBadge;
  profileBadgeContent;
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
GlobalActivityActionViewItem = __decorateClass([
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IActivityService)
], GlobalActivityActionViewItem);
let SimpleAccountActivityActionViewItem = class extends AccountsActivityActionViewItem {
  static {
    __name(this, "SimpleAccountActivityActionViewItem");
  }
  constructor(hoverOptions, options, themeService, lifecycleService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, keybindingService, secretStorageService, storageService, logService, activityService, instantiationService, commandService) {
    super(
      () => simpleActivityContextMenuActions(storageService, true),
      {
        ...options,
        colors: /* @__PURE__ */ __name((theme) => ({
          badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
          badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
        }), "colors"),
        hoverOptions,
        compact: true
      },
      () => void 0,
      (actions) => actions,
      themeService,
      lifecycleService,
      hoverService,
      contextMenuService,
      menuService,
      contextKeyService,
      authenticationService,
      environmentService,
      productService,
      configurationService,
      keybindingService,
      secretStorageService,
      logService,
      activityService,
      instantiationService,
      commandService
    );
  }
};
SimpleAccountActivityActionViewItem = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IAuthenticationService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IKeybindingService),
  __decorateParam(13, ISecretStorageService),
  __decorateParam(14, IStorageService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IActivityService),
  __decorateParam(17, IInstantiationService),
  __decorateParam(18, ICommandService)
], SimpleAccountActivityActionViewItem);
let SimpleGlobalActivityActionViewItem = class extends GlobalActivityActionViewItem {
  static {
    __name(this, "SimpleGlobalActivityActionViewItem");
  }
  constructor(hoverOptions, options, userDataProfileService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService, instantiationService, activityService, storageService) {
    super(
      () => simpleActivityContextMenuActions(storageService, false),
      {
        ...options,
        colors: /* @__PURE__ */ __name((theme) => ({
          badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
          badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND)
        }), "colors"),
        hoverOptions,
        compact: true
      },
      () => void 0,
      userDataProfileService,
      themeService,
      hoverService,
      menuService,
      contextMenuService,
      contextKeyService,
      configurationService,
      environmentService,
      keybindingService,
      instantiationService,
      activityService
    );
  }
};
SimpleGlobalActivityActionViewItem = __decorateClass([
  __decorateParam(2, IUserDataProfileService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IActivityService),
  __decorateParam(13, IStorageService)
], SimpleGlobalActivityActionViewItem);
function simpleActivityContextMenuActions(storageService, isAccount) {
  const currentElementContextMenuActions = [];
  if (isAccount) {
    currentElementContextMenuActions.push(
      toAction({ id: "hideAccounts", label: localize("hideAccounts", "Hide Accounts"), run: /* @__PURE__ */ __name(() => setAccountsActionVisible(storageService, false), "run") }),
      new Separator()
    );
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
  return storageService.getBoolean(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, StorageScope.PROFILE, true);
}
__name(isAccountsActionVisible, "isAccountsActionVisible");
function setAccountsActionVisible(storageService, visible) {
  storageService.store(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, visible, StorageScope.PROFILE, StorageTarget.USER);
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
