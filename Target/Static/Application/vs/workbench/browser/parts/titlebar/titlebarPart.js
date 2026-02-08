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
var AuxiliaryBrowserTitlebarPart_1;
import "./media/titlebarpart.css";
import { localize, localize2 } from "../../../../nls.js";
import { MultiWindowParts, Part } from "../../part.js";
import { getWCOTitlebarAreaRect, getZoomFactor, isWCOEnabled } from "../../../../base/browser/browser.js";
import { getTitleBarStyle, getMenuBarVisibility, hasCustomTitlebar, hasNativeTitlebar, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getWindowControlsStyle, hasNativeMenu } from "../../../../platform/window/common/window.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_BACKGROUND, TITLE_BAR_BORDER, WORKBENCH_BACKGROUND } from "../../../common/theme.js";
import { isMacintosh, isWindows, isLinux, isWeb, isNative, platformLocale } from "../../../../base/common/platform.js";
import { Color } from "../../../../base/common/color.js";
import { EventType, EventHelper, Dimension, append, $, addDisposableListener, prepend, reset, getWindow, getWindowId, isAncestor, getActiveDocument, isHTMLElement } from "../../../../base/browser/dom.js";
import { CustomMenubarControl } from "./menubarControl.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { createActionViewItem, fillInActionBarActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, IMenuService, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { WindowTitle } from "./windowTitle.js";
import { CommandCenterControl } from "./commandCenterControl.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "../../../common/activity.js";
import { AccountsActivityActionViewItem, isAccountsActionVisible, SimpleAccountActivityActionViewItem, SimpleGlobalActivityActionViewItem } from "../globalCompositeBar.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { prepareActions } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { EDITOR_CORE_NAVIGATION_COMMANDS } from "../editor/editorCommands.js";
import { EditorPane } from "../editor/editorPane.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { EditorCommandsContextActionRunner } from "../editor/editorTabsControl.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { ACCOUNTS_ACTIVITY_TILE_ACTION, GLOBAL_ACTIVITY_TITLE_ACTION } from "./titlebarActions.js";
import { createInstantHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { safeIntl } from "../../../../base/common/date.js";
import { IsCompactTitleBarContext, TitleBarVisibleContext } from "../../../common/contextkeys.js";
let BrowserTitleService = class BrowserTitleService2 extends MultiWindowParts {
  static {
    __name(this, "BrowserTitleService");
  }
  constructor(instantiationService, storageService, themeService) {
    super("workbench.titleService", themeService, storageService);
    this.instantiationService = instantiationService;
    this.properties = void 0;
    this.variables = /* @__PURE__ */ new Map();
    this.mainPart = this._register(this.createMainTitlebarPart());
    this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
    this._register(this.registerPart(this.mainPart));
    this.registerActions();
    this.registerAPICommands();
  }
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainBrowserTitlebarPart);
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class FocusTitleBar extends Action2 {
      static {
        __name(this, "FocusTitleBar");
      }
      constructor() {
        super({
          id: `workbench.action.focusTitleBar`,
          title: localize2("focusTitleBar", "Focus Title Bar"),
          category: Categories.View,
          f1: true,
          precondition: TitleBarVisibleContext
        });
      }
      run() {
        that.getPartByDocument(getActiveDocument())?.focus();
      }
    }));
  }
  registerAPICommands() {
    this._register(CommandsRegistry.registerCommand({
      id: "registerWindowTitleVariable",
      handler: /* @__PURE__ */ __name((accessor, name, contextKey) => {
        this.registerVariables([{ name, contextKey }]);
      }, "handler"),
      metadata: {
        description: "Registers a new title variable",
        args: [
          { name: "name", schema: { type: "string" }, description: "The name of the variable to register" },
          { name: "contextKey", schema: { type: "string" }, description: "The context key to use for the value of the variable" }
        ]
      }
    }));
  }
  //#region Auxiliary Titlebar Parts
  createAuxiliaryTitlebarPart(container, editorGroupsContainer, instantiationService) {
    const titlebarPartContainer = $(".part.titlebar", { role: "none" });
    titlebarPartContainer.style.position = "relative";
    container.insertBefore(titlebarPartContainer, container.firstChild);
    const disposables = new DisposableStore();
    const titlebarPart = this.doCreateAuxiliaryTitlebarPart(titlebarPartContainer, editorGroupsContainer, instantiationService);
    disposables.add(this.registerPart(titlebarPart));
    disposables.add(Event.runAndSubscribe(titlebarPart.onDidChange, () => titlebarPartContainer.style.height = `${titlebarPart.height}px`));
    titlebarPart.create(titlebarPartContainer);
    if (this.properties) {
      titlebarPart.updateProperties(this.properties);
    }
    if (this.variables.size) {
      titlebarPart.registerVariables(Array.from(this.variables.values()));
    }
    Event.once(titlebarPart.onWillDispose)(() => disposables.dispose());
    return titlebarPart;
  }
  doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryBrowserTitlebarPart, container, editorGroupsContainer, this.mainPart);
  }
  updateProperties(properties) {
    this.properties = properties;
    for (const part of this.parts) {
      part.updateProperties(properties);
    }
  }
  registerVariables(variables) {
    const newVariables = [];
    for (const variable of variables) {
      if (!this.variables.has(variable.name)) {
        this.variables.set(variable.name, variable);
        newVariables.push(variable);
      }
    }
    for (const part of this.parts) {
      part.registerVariables(newVariables);
    }
  }
};
BrowserTitleService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IStorageService),
  __param(2, IThemeService)
], BrowserTitleService);
let BrowserTitlebarPart = class BrowserTitlebarPart2 extends Part {
  static {
    __name(this, "BrowserTitlebarPart");
  }
  get minimumHeight() {
    const wcoEnabled = isWeb && isWCOEnabled();
    let value = this.isCommandCenterVisible || wcoEnabled ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : 30;
    if (wcoEnabled) {
      value = Math.max(value, getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0);
    }
    return value / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService) {
    super(id, { hasTitle: false }, themeService, storageService, layoutService);
    this.editorGroupsContainer = editorGroupsContainer;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.hostService = hostService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.keybindingService = keybindingService;
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this._onMenubarVisibilityChange = this._register(new Emitter());
    this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.customMenubar = this._register(new MutableDisposable());
    this.actionToolBarDisposable = this._register(new DisposableStore());
    this.editorActionsChangeDisposable = this._register(new DisposableStore());
    this.globalToolbarMenuDisposables = this._register(new DisposableStore());
    this.editorToolbarMenuDisposables = this._register(new DisposableStore());
    this.layoutToolbarMenuDisposables = this._register(new DisposableStore());
    this.activityToolbarDisposables = this._register(new DisposableStore());
    this.titleDisposables = this._register(new DisposableStore());
    this.isInactive = false;
    this.isCompact = false;
    this.isAuxiliary = targetWindow.vscodeWindowId !== mainWindow.vscodeWindowId;
    this.isCompactContextKey = IsCompactTitleBarContext.bindTo(this.contextKeyService);
    this.titleBarStyle = getTitleBarStyle(this.configurationService);
    this.windowTitle = this._register(instantiationService.createInstance(WindowTitle, targetWindow));
    this.hoverDelegate = this._register(createInstantHoverDelegate());
    this.registerListeners(getWindowId(targetWindow));
  }
  registerListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFocus((focused) => focused ? this.onFocus() : this.onBlur()));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationChanged(e)));
    this._register(this.editorGroupsContainer.onDidChangeEditorPartOptions((e) => this.onEditorPartConfigurationChange(e)));
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  onEditorPartConfigurationChange({ oldPartOptions, newPartOptions }) {
    if (oldPartOptions.editorActionsLocation !== newPartOptions.editorActionsLocation || oldPartOptions.showTabs !== newPartOptions.showTabs) {
      if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
        this.createActionToolBar();
        this.createActionToolBarMenus({ editorActions: true });
        this._onDidChange.fire(void 0);
      }
    }
  }
  onConfigurationChanged(event) {
    if (!this.isAuxiliary && !hasNativeMenu(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb)) {
      if (event.affectsConfiguration(
        "window.menuBarVisibility"
        /* MenuSettings.MenuBarVisibility */
      )) {
        if (this.currentMenubarVisibility === "compact") {
          this.uninstallMenubar();
        } else {
          this.installMenubar();
        }
      }
    }
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
      const affectsLayoutControl = event.affectsConfiguration(
        "workbench.layoutControl.enabled"
        /* LayoutSettings.LAYOUT_ACTIONS */
      );
      const affectsActivityControl = event.affectsConfiguration(
        "workbench.activityBar.location"
        /* LayoutSettings.ACTIVITY_BAR_LOCATION */
      );
      if (affectsLayoutControl || affectsActivityControl) {
        this.createActionToolBarMenus({ layoutActions: affectsLayoutControl, activityActions: affectsActivityControl });
        this._onDidChange.fire(void 0);
      }
    }
    if (event.affectsConfiguration(
      "window.commandCenter"
      /* LayoutSettings.COMMAND_CENTER */
    )) {
      this.recreateTitle();
    }
  }
  recreateTitle() {
    this.createTitle();
    this._onDidChange.fire(void 0);
  }
  updateOptions(options) {
    const oldIsCompact = this.isCompact;
    this.isCompact = options.compact;
    this.isCompactContextKey.set(this.isCompact);
    if (oldIsCompact !== this.isCompact) {
      this.recreateTitle();
      this.createActionToolBarMenus(true);
    }
  }
  installMenubar() {
    if (this.menubar) {
      return;
    }
    this.customMenubar.value = this.instantiationService.createInstance(CustomMenubarControl);
    this.menubar = append(this.leftContent, $("div.menubar"));
    this.menubar.setAttribute("role", "menubar");
    this._register(this.customMenubar.value.onVisibilityChange((e) => this.onMenubarVisibilityChanged(e)));
    this.customMenubar.value.create(this.menubar);
  }
  uninstallMenubar() {
    this.customMenubar.value = void 0;
    this.menubar?.remove();
    this.menubar = void 0;
    this.onMenubarVisibilityChanged(false);
  }
  onMenubarVisibilityChanged(visible) {
    if (isWeb || isWindows || isLinux) {
      if (this.lastLayoutDimensions) {
        this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
      }
      this._onMenubarVisibilityChange.fire(visible);
    }
  }
  updateProperties(properties) {
    this.windowTitle.updateProperties(properties);
  }
  registerVariables(variables) {
    this.windowTitle.registerVariables(variables);
  }
  createContentArea(parent) {
    this.element = parent;
    this.rootContainer = append(parent, $(".titlebar-container"));
    this.leftContent = append(this.rootContainer, $(".titlebar-left"));
    this.centerContent = append(this.rootContainer, $(".titlebar-center"));
    this.rightContent = append(this.rootContainer, $(".titlebar-right"));
    if ((isWindows || isLinux) && !hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      this.appIcon = prepend(this.leftContent, $("a.window-appicon"));
    }
    this.dragRegion = prepend(this.rootContainer, $("div.titlebar-drag-region"));
    if (!this.isAuxiliary && !hasNativeMenu(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb) && this.currentMenubarVisibility !== "compact") {
      this.installMenubar();
    }
    this.title = append(this.centerContent, $("div.window-title"));
    this.createTitle();
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      this.actionToolBarElement = append(this.rightContent, $("div.action-toolbar-container"));
      this.createActionToolBar();
      this.createActionToolBarMenus();
    }
    if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      let primaryWindowControlsLocation = isMacintosh ? "left" : "right";
      if (isMacintosh && isNative) {
        const localeInfo = safeIntl.Locale(platformLocale).value;
        const textInfo = localeInfo.textInfo;
        if (textInfo && typeof textInfo === "object" && "direction" in textInfo && textInfo.direction === "rtl") {
          primaryWindowControlsLocation = "right";
        }
      }
      if (isMacintosh && isNative && primaryWindowControlsLocation === "left") {
      } else if (getWindowControlsStyle(this.configurationService) === "hidden") {
      } else {
        this.windowControlsContainer = append(primaryWindowControlsLocation === "left" ? this.leftContent : this.rightContent, $("div.window-controls-container"));
        if (isWeb) {
          append(primaryWindowControlsLocation === "left" ? this.rightContent : this.leftContent, $("div.window-controls-container"));
        }
        if (isWCOEnabled()) {
          this.windowControlsContainer.classList.add("wco-enabled");
        }
      }
    }
    {
      this._register(addDisposableListener(this.rootContainer, EventType.CONTEXT_MENU, (e) => {
        EventHelper.stop(e);
        let targetMenu;
        if (isMacintosh && isHTMLElement(e.target) && isAncestor(e.target, this.title)) {
          targetMenu = MenuId.TitleBarTitleContext;
        } else {
          targetMenu = MenuId.TitleBarContext;
        }
        this.onContextMenu(e, targetMenu);
      }));
      if (isMacintosh) {
        this._register(addDisposableListener(
          this.title,
          EventType.MOUSE_DOWN,
          (e) => {
            if (e.metaKey) {
              EventHelper.stop(
                e,
                true
                /* stop bubbling to prevent command center from opening */
              );
              this.onContextMenu(e, MenuId.TitleBarTitleContext);
            }
          },
          true
          /* capture phase to prevent command center from opening */
        ));
      }
    }
    this.updateStyles();
    return this.element;
  }
  createTitle() {
    this.titleDisposables.clear();
    const isShowingTitleInNativeTitlebar = hasNativeTitlebar(this.configurationService, this.titleBarStyle);
    if (!this.isCommandCenterVisible) {
      if (!isShowingTitleInNativeTitlebar) {
        this.title.textContent = this.windowTitle.value;
        this.titleDisposables.add(this.windowTitle.onDidChange(() => {
          this.title.textContent = this.windowTitle.value;
          if (this.lastLayoutDimensions) {
            this.updateLayout(this.lastLayoutDimensions);
          }
        }));
      } else {
        reset(this.title);
      }
    } else {
      const commandCenter = this.instantiationService.createInstance(CommandCenterControl, this.windowTitle, this.hoverDelegate);
      reset(this.title, commandCenter.element);
      this.titleDisposables.add(commandCenter);
    }
  }
  actionViewItemProvider(action, options) {
    if (!this.isAuxiliary) {
      if (action.id === GLOBAL_ACTIVITY_ID) {
        return this.instantiationService.createInstance(SimpleGlobalActivityActionViewItem, {
          position: /* @__PURE__ */ __name(() => 2, "position")
          /* HoverPosition.BELOW */
        }, options);
      }
      if (action.id === ACCOUNTS_ACTIVITY_ID) {
        return this.instantiationService.createInstance(SimpleAccountActivityActionViewItem, {
          position: /* @__PURE__ */ __name(() => 2, "position")
          /* HoverPosition.BELOW */
        }, options);
      }
    }
    const activeEditorPane = this.editorGroupsContainer.activeGroup?.activeEditorPane;
    if (activeEditorPane && activeEditorPane instanceof EditorPane) {
      const result = activeEditorPane.getActionViewItem(action, options);
      if (result) {
        return result;
      }
    }
    return createActionViewItem(this.instantiationService, action, { ...options, menuAsChild: false });
  }
  getKeybinding(action) {
    const editorPaneAwareContextKeyService = this.editorGroupsContainer.activeGroup?.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
    return this.keybindingService.lookupKeybinding(action.id, editorPaneAwareContextKeyService);
  }
  createActionToolBar() {
    this.actionToolBarDisposable.clear();
    this.actionToolBar = this.actionToolBarDisposable.add(this.instantiationService.createInstance(WorkbenchToolBar, this.actionToolBarElement, {
      contextMenu: MenuId.TitleBarContext,
      orientation: 0,
      ariaLabel: localize("ariaLabelTitleActions", "Title actions"),
      getKeyBinding: /* @__PURE__ */ __name((action) => this.getKeybinding(action), "getKeyBinding"),
      overflowBehavior: { maxItems: 9, exempted: [ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID, ...EDITOR_CORE_NAVIGATION_COMMANDS] },
      anchorAlignmentProvider: /* @__PURE__ */ __name(() => 1, "anchorAlignmentProvider"),
      telemetrySource: "titlePart",
      highlightToggledItems: this.editorActionsEnabled || this.isAuxiliary,
      // Only show toggled state for editor actions or auxiliary title bars
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => this.actionViewItemProvider(action, options), "actionViewItemProvider"),
      hoverDelegate: this.hoverDelegate
    }));
    if (this.editorActionsEnabled) {
      this.actionToolBarDisposable.add(this.editorGroupsContainer.onDidChangeActiveGroup(() => this.createActionToolBarMenus({ editorActions: true })));
    }
  }
  createActionToolBarMenus(update = true) {
    if (update === true) {
      update = { editorActions: true, layoutActions: true, globalActions: true, activityActions: true };
    }
    const updateToolBarActions = /* @__PURE__ */ __name(() => {
      const actions = { primary: [], secondary: [] };
      if (this.editorActionsEnabled) {
        this.editorActionsChangeDisposable.clear();
        const activeGroup = this.editorGroupsContainer.activeGroup;
        if (activeGroup) {
          const editorActions = activeGroup.createEditorActions(this.editorActionsChangeDisposable, this.isAuxiliary && this.isCompact ? MenuId.CompactWindowEditorTitle : MenuId.EditorTitle);
          actions.primary.push(...editorActions.actions.primary);
          actions.secondary.push(...editorActions.actions.secondary);
          this.editorActionsChangeDisposable.add(editorActions.onDidChange(() => updateToolBarActions()));
        }
      }
      if (this.globalToolbarMenu) {
        fillInActionBarActions(this.globalToolbarMenu.getActions(), actions);
      }
      if (this.layoutToolbarMenu) {
        fillInActionBarActions(
          this.layoutToolbarMenu.getActions(),
          actions,
          () => !this.editorActionsEnabled || this.isCompact
          // layout actions move to "..." if editor actions are enabled unless compact
        );
      }
      if (this.activityActionsEnabled) {
        if (isAccountsActionVisible(this.storageService)) {
          actions.primary.push(ACCOUNTS_ACTIVITY_TILE_ACTION);
        }
        actions.primary.push(GLOBAL_ACTIVITY_TITLE_ACTION);
      }
      this.actionToolBar.setActions(prepareActions(actions.primary), prepareActions(actions.secondary));
    }, "updateToolBarActions");
    if (update.editorActions) {
      this.editorToolbarMenuDisposables.clear();
      if (this.editorActionsEnabled && this.editorService.activeEditor !== void 0) {
        const context = { groupId: this.editorGroupsContainer.activeGroup.id };
        this.actionToolBar.actionRunner = this.editorToolbarMenuDisposables.add(new EditorCommandsContextActionRunner(context));
        this.actionToolBar.context = context;
      } else {
        this.actionToolBar.actionRunner = this.editorToolbarMenuDisposables.add(new ActionRunner());
        this.actionToolBar.context = void 0;
      }
    }
    if (update.layoutActions) {
      this.layoutToolbarMenuDisposables.clear();
      if (this.layoutControlEnabled) {
        this.layoutToolbarMenu = this.menuService.createMenu(MenuId.LayoutControlMenu, this.contextKeyService);
        this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu);
        this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu.onDidChange(() => updateToolBarActions()));
      } else {
        this.layoutToolbarMenu = void 0;
      }
    }
    if (update.globalActions) {
      this.globalToolbarMenuDisposables.clear();
      if (this.globalActionsEnabled) {
        this.globalToolbarMenu = this.menuService.createMenu(MenuId.TitleBar, this.contextKeyService);
        this.globalToolbarMenuDisposables.add(this.globalToolbarMenu);
        this.globalToolbarMenuDisposables.add(this.globalToolbarMenu.onDidChange(() => updateToolBarActions()));
      } else {
        this.globalToolbarMenu = void 0;
      }
    }
    if (update.activityActions) {
      this.activityToolbarDisposables.clear();
      if (this.activityActionsEnabled) {
        this.activityToolbarDisposables.add(this.storageService.onDidChangeValue(0, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => updateToolBarActions()));
      }
    }
    updateToolBarActions();
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      if (this.isInactive) {
        this.element.classList.add("inactive");
      } else {
        this.element.classList.remove("inactive");
      }
      const titleBackground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_BACKGROUND : TITLE_BAR_ACTIVE_BACKGROUND, (color, theme) => {
        return color.isOpaque() ? color : color.makeOpaque(WORKBENCH_BACKGROUND(theme));
      }) || "";
      this.element.style.backgroundColor = titleBackground;
      if (this.appIconBadge) {
        this.appIconBadge.style.backgroundColor = titleBackground;
      }
      if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
        this.element.classList.add("light");
      } else {
        this.element.classList.remove("light");
      }
      const titleForeground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_FOREGROUND : TITLE_BAR_ACTIVE_FOREGROUND);
      this.element.style.color = titleForeground || "";
      const titleBorder = this.getColor(TITLE_BAR_BORDER);
      this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : "";
    }
  }
  onContextMenu(e, menuId) {
    const event = new StandardMouseEvent(getWindow(this.element), e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      menuId,
      contextKeyService: this.contextKeyService,
      domForShadowRoot: isMacintosh && isNative ? event.target : void 0
    });
  }
  get currentMenubarVisibility() {
    if (this.isAuxiliary) {
      return "hidden";
    }
    return getMenuBarVisibility(this.configurationService);
  }
  get layoutControlEnabled() {
    return this.configurationService.getValue(
      "workbench.layoutControl.enabled"
      /* LayoutSettings.LAYOUT_ACTIONS */
    ) !== false;
  }
  get isCommandCenterVisible() {
    return !this.isCompact && this.configurationService.getValue(
      "window.commandCenter"
      /* LayoutSettings.COMMAND_CENTER */
    ) !== false;
  }
  get editorActionsEnabled() {
    return this.editorGroupsContainer.partOptions.editorActionsLocation === "titleBar" || this.editorGroupsContainer.partOptions.editorActionsLocation === "default" && this.editorGroupsContainer.partOptions.showTabs === "none";
  }
  get activityActionsEnabled() {
    const activityBarPosition = this.configurationService.getValue(
      "workbench.activityBar.location"
      /* LayoutSettings.ACTIVITY_BAR_LOCATION */
    );
    return !this.isCompact && !this.isAuxiliary && (activityBarPosition === "top" || activityBarPosition === "bottom");
  }
  get globalActionsEnabled() {
    return !this.isCompact;
  }
  get hasZoomableElements() {
    const hasMenubar = !(this.currentMenubarVisibility === "hidden" || this.currentMenubarVisibility === "compact" || !isWeb && isMacintosh);
    const hasCommandCenter = this.isCommandCenterVisible;
    const hasToolBarActions = this.globalActionsEnabled || this.layoutControlEnabled || this.editorActionsEnabled || this.activityActionsEnabled;
    return hasMenubar || hasCommandCenter || hasToolBarActions;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
  }
  layout(width, height) {
    this.updateLayout(new Dimension(width, height));
    super.layoutContents(width, height);
  }
  updateLayout(dimension) {
    this.lastLayoutDimensions = dimension;
    if (!hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      return;
    }
    const zoomFactor = getZoomFactor(getWindow(this.element));
    this.element.style.setProperty("--zoom-factor", zoomFactor.toString());
    this.rootContainer.classList.toggle("counter-zoom", this.preventZoom);
    if (this.customMenubar.value) {
      const menubarDimension = new Dimension(0, dimension.height);
      this.customMenubar.value.layout(menubarDimension);
    }
    const hasCenter = this.isCommandCenterVisible || this.title.textContent !== "";
    this.rootContainer.classList.toggle("has-center", hasCenter);
  }
  focus() {
    if (this.customMenubar.value) {
      this.customMenubar.value.toggleFocus();
    } else {
      this.element.querySelector('[tabindex]:not([tabindex="-1"])')?.focus();
    }
  }
  toJSON() {
    return {
      type: "workbench.parts.titlebar"
      /* Parts.TITLEBAR_PART */
    };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};
BrowserTitlebarPart = __decorate([
  __param(3, IContextMenuService),
  __param(4, IConfigurationService),
  __param(5, IBrowserWorkbenchEnvironmentService),
  __param(6, IInstantiationService),
  __param(7, IThemeService),
  __param(8, IStorageService),
  __param(9, IWorkbenchLayoutService),
  __param(10, IContextKeyService),
  __param(11, IHostService),
  __param(12, IEditorService),
  __param(13, IMenuService),
  __param(14, IKeybindingService)
], BrowserTitlebarPart);
let MainBrowserTitlebarPart = class MainBrowserTitlebarPart2 extends BrowserTitlebarPart {
  static {
    __name(this, "MainBrowserTitlebarPart");
  }
  constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
    super("workbench.parts.titlebar", mainWindow, editorGroupService.mainPart, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService);
  }
};
MainBrowserTitlebarPart = __decorate([
  __param(0, IContextMenuService),
  __param(1, IConfigurationService),
  __param(2, IBrowserWorkbenchEnvironmentService),
  __param(3, IInstantiationService),
  __param(4, IThemeService),
  __param(5, IStorageService),
  __param(6, IWorkbenchLayoutService),
  __param(7, IContextKeyService),
  __param(8, IHostService),
  __param(9, IEditorGroupsService),
  __param(10, IEditorService),
  __param(11, IMenuService),
  __param(12, IKeybindingService)
], MainBrowserTitlebarPart);
let AuxiliaryBrowserTitlebarPart = class AuxiliaryBrowserTitlebarPart2 extends BrowserTitlebarPart {
  static {
    __name(this, "AuxiliaryBrowserTitlebarPart");
  }
  static {
    AuxiliaryBrowserTitlebarPart_1 = this;
  }
  static {
    this.COUNTER = 1;
  }
  get height() {
    return this.minimumHeight;
  }
  constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
    const id = AuxiliaryBrowserTitlebarPart_1.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id}`, getWindow(container), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService);
    this.container = container;
    this.mainTitlebar = mainTitlebar;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};
AuxiliaryBrowserTitlebarPart = AuxiliaryBrowserTitlebarPart_1 = __decorate([
  __param(3, IContextMenuService),
  __param(4, IConfigurationService),
  __param(5, IBrowserWorkbenchEnvironmentService),
  __param(6, IInstantiationService),
  __param(7, IThemeService),
  __param(8, IStorageService),
  __param(9, IWorkbenchLayoutService),
  __param(10, IContextKeyService),
  __param(11, IHostService),
  __param(12, IEditorGroupsService),
  __param(13, IEditorService),
  __param(14, IMenuService),
  __param(15, IKeybindingService)
], AuxiliaryBrowserTitlebarPart);
export {
  AuxiliaryBrowserTitlebarPart,
  BrowserTitleService,
  BrowserTitlebarPart,
  MainBrowserTitlebarPart
};
//# sourceMappingURL=titlebarPart.js.map
