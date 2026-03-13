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
var AuxiliaryTitlebarPart_1;
import "../../../workbench/browser/parts/titlebar/media/titlebarpart.css";
import "./media/titlebarpart.css";
import { MultiWindowParts, Part } from "../../../workbench/browser/part.js";
import { getZoomFactor, isWCOEnabled, getWCOTitlebarAreaRect, isFullscreen, onDidChangeFullscreen } from "../../../base/browser/browser.js";
import { hasCustomTitlebar, hasNativeTitlebar, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getTitleBarStyle, getWindowControlsStyle } from "../../../platform/window/common/window.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { StandardMouseEvent } from "../../../base/browser/mouseEvent.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { WORKBENCH_BACKGROUND } from "../../../workbench/common/theme.js";
import { chatBarTitleBackground, chatBarTitleForeground } from "../../common/theme.js";
import { isMacintosh, isWeb, isNative, platformLocale } from "../../../base/common/platform.js";
import { Color } from "../../../base/common/color.js";
import { EventType, EventHelper, append, $, addDisposableListener, prepend, getWindow, getWindowId } from "../../../base/browser/dom.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IWorkbenchLayoutService } from "../../../workbench/services/layout/browser/layoutService.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IHostService } from "../../../workbench/services/host/browser/host.js";
import { MenuWorkbenchToolBar } from "../../../platform/actions/browser/toolbar.js";
import { mainWindow } from "../../../base/browser/window.js";
import { safeIntl } from "../../../base/common/date.js";
import { Menus } from "../menus.js";
let TitlebarPart = class TitlebarPart2 extends Part {
  static {
    __name(this, "TitlebarPart");
  }
  get minimumHeight() {
    const wcoEnabled = isWeb && isWCOEnabled();
    let value = DEFAULT_CUSTOM_TITLEBAR_HEIGHT;
    if (wcoEnabled) {
      value = Math.max(value, getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0);
    }
    return value / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  constructor(id, targetWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    super(id, { hasTitle: false }, themeService, storageService, layoutService);
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hostService = hostService;
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this._onMenubarVisibilityChange = this._register(new Emitter());
    this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.isInactive = false;
    this.titleBarStyle = getTitleBarStyle(this.configurationService);
    this.registerListeners(getWindowId(targetWindow));
  }
  registerListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFocus((focused) => focused ? this.onFocus() : this.onBlur()));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  updateProperties(_properties) {
  }
  registerVariables(_variables) {
  }
  updateOptions(_options) {
  }
  createContentArea(parent) {
    this.element = parent;
    this.rootContainer = append(parent, $(".titlebar-container.sessions-titlebar-container.has-center"));
    prepend(this.rootContainer, $("div.titlebar-drag-region"));
    this.leftContent = append(this.rootContainer, $(".titlebar-left"));
    this.centerContent = append(this.rootContainer, $(".titlebar-center"));
    this.rightContent = append(this.rootContainer, $(".titlebar-right"));
    if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      let primaryWindowControlsLocation = isMacintosh ? "left" : "right";
      if (isMacintosh && isNative) {
        const localeInfo = safeIntl.Locale(platformLocale).value;
        const textInfo = localeInfo.textInfo;
        if (textInfo?.direction === "rtl") {
          primaryWindowControlsLocation = "right";
        }
      }
      if (isMacintosh && isNative && primaryWindowControlsLocation === "left") {
        const spacer = append(this.leftContent, $("div.window-controls-container"));
        spacer.style.width = "70px";
        spacer.style.flexShrink = "0";
        const updateSpacerVisibility = /* @__PURE__ */ __name(() => {
          spacer.style.display = isFullscreen(mainWindow) ? "none" : "";
        }, "updateSpacerVisibility");
        updateSpacerVisibility();
        this._register(onDidChangeFullscreen((windowId) => {
          if (windowId === getWindowId(mainWindow)) {
            updateSpacerVisibility();
          }
        }));
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
    const leftToolbarContainer = append(this.leftContent, $("div.left-toolbar-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, leftToolbarContainer, Menus.TitleBarLeftLayout, {
      contextMenu: Menus.TitleBarContext,
      telemetrySource: "titlePart.left",
      hiddenItemStrategy: -1,
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") }
    }));
    const windowTitle = append(this.centerContent, $("div.window-title"));
    const centerToolbarContainer = append(windowTitle, $("div.command-center"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, centerToolbarContainer, Menus.CommandCenter, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1,
      telemetrySource: "commandCenter",
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") }
    }));
    const rightToolbarContainer = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-layout-actions-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, rightToolbarContainer, Menus.TitleBarRightLayout, {
      contextMenu: Menus.TitleBarContext,
      telemetrySource: "titlePart.right",
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") }
    }));
    const sessionActionsContainer = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-session-actions-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, sessionActionsContainer, Menus.TitleBarSessionMenu, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1,
      telemetrySource: "titlePart.sessionActions",
      toolbarOptions: { primaryGroup: /* @__PURE__ */ __name(() => true, "primaryGroup") }
    }));
    this._register(addDisposableListener(this.rootContainer, EventType.CONTEXT_MENU, (e) => {
      EventHelper.stop(e);
      this.onContextMenu(e);
    }));
    this.updateStyles();
    return this.element;
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      this.element.classList.toggle("inactive", this.isInactive);
      const titleBackground = this.getColor(chatBarTitleBackground, (color, theme) => {
        return color.isOpaque() ? color : color.makeOpaque(WORKBENCH_BACKGROUND(theme));
      }) || "";
      this.element.style.backgroundColor = titleBackground;
      if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
        this.element.classList.add("light");
      } else {
        this.element.classList.remove("light");
      }
      const titleForeground = this.getColor(chatBarTitleForeground);
      this.element.style.color = titleForeground || "";
    }
  }
  onContextMenu(e) {
    const event = new StandardMouseEvent(getWindow(this.element), e);
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => event, "getAnchor"),
      menuId: Menus.TitleBarContext,
      contextKeyService: this.contextKeyService,
      domForShadowRoot: isMacintosh && isNative ? event.target : void 0
    });
  }
  get hasZoomableElements() {
    return true;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
  }
  layout(width, height) {
    this.updateLayout();
    super.layoutContents(width, height);
  }
  updateLayout() {
    if (!hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      return;
    }
    const zoomFactor = getZoomFactor(getWindow(this.element));
    this.element.style.setProperty("--zoom-factor", zoomFactor.toString());
    this.rootContainer.classList.toggle("counter-zoom", this.preventZoom);
  }
  focus() {
    this.element.querySelector('[tabindex]:not([tabindex="-1"])')?.focus();
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
TitlebarPart = __decorate([
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IStorageService),
  __param(7, IWorkbenchLayoutService),
  __param(8, IContextKeyService),
  __param(9, IHostService)
], TitlebarPart);
let MainTitlebarPart = class MainTitlebarPart2 extends TitlebarPart {
  static {
    __name(this, "MainTitlebarPart");
  }
  constructor(contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    super("workbench.parts.titlebar", mainWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService);
  }
};
MainTitlebarPart = __decorate([
  __param(0, IContextMenuService),
  __param(1, IConfigurationService),
  __param(2, IInstantiationService),
  __param(3, IThemeService),
  __param(4, IStorageService),
  __param(5, IWorkbenchLayoutService),
  __param(6, IContextKeyService),
  __param(7, IHostService)
], MainTitlebarPart);
let AuxiliaryTitlebarPart = class AuxiliaryTitlebarPart2 extends TitlebarPart {
  static {
    __name(this, "AuxiliaryTitlebarPart");
  }
  static {
    AuxiliaryTitlebarPart_1 = this;
  }
  static {
    this.COUNTER = 1;
  }
  get height() {
    return this.minimumHeight;
  }
  constructor(container, mainTitlebar, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    const id = AuxiliaryTitlebarPart_1.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id}`, getWindow(container), contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService);
    this.container = container;
    this.mainTitlebar = mainTitlebar;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};
AuxiliaryTitlebarPart = AuxiliaryTitlebarPart_1 = __decorate([
  __param(2, IContextMenuService),
  __param(3, IConfigurationService),
  __param(4, IInstantiationService),
  __param(5, IThemeService),
  __param(6, IStorageService),
  __param(7, IWorkbenchLayoutService),
  __param(8, IContextKeyService),
  __param(9, IHostService)
], AuxiliaryTitlebarPart);
let TitleService = class TitleService2 extends MultiWindowParts {
  static {
    __name(this, "TitleService");
  }
  constructor(instantiationService, storageService, themeService) {
    super("workbench.agentSessionsTitleService", themeService, storageService);
    this.instantiationService = instantiationService;
    this.mainPart = this._register(this.createMainTitlebarPart());
    this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
    this._register(this.registerPart(this.mainPart));
  }
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainTitlebarPart);
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
    Event.once(titlebarPart.onWillDispose)(() => disposables.dispose());
    return titlebarPart;
  }
  doCreateAuxiliaryTitlebarPart(container, _editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryTitlebarPart, container, this.mainPart);
  }
  updateProperties(properties) {
    for (const part of this.parts) {
      part.updateProperties(properties);
    }
  }
  registerVariables(variables) {
    for (const part of this.parts) {
      part.registerVariables(variables);
    }
  }
};
TitleService = __decorate([
  __param(0, IInstantiationService),
  __param(1, IStorageService),
  __param(2, IThemeService)
], TitleService);
export {
  AuxiliaryTitlebarPart,
  MainTitlebarPart,
  TitleService,
  TitlebarPart
};
//# sourceMappingURL=titlebarPart.js.map
