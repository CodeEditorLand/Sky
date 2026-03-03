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
var PanelPart_1;
import "../../../workbench/browser/parts/panel/media/panelpart.css";
import "./media/panelPart.css";
import { ActivePanelContext, PanelFocusContext } from "../../../workbench/common/contextkeys.js";
import { IWorkbenchLayoutService } from "../../../workbench/services/layout/browser/layoutService.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { PANEL_BACKGROUND, PANEL_BORDER, PANEL_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_DRAG_AND_DROP_BORDER, PANEL_TITLE_BADGE_BACKGROUND, PANEL_TITLE_BADGE_FOREGROUND } from "../../../workbench/common/theme.js";
import { contrastBorder } from "../../../platform/theme/common/colorRegistry.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { assertReturnsDefined } from "../../../base/common/types.js";
import { IExtensionService } from "../../../workbench/services/extensions/common/extensions.js";
import { IViewDescriptorService } from "../../../workbench/common/views.js";
import { IMenuService } from "../../../platform/actions/common/actions.js";
import { Menus } from "../menus.js";
import { AbstractPaneCompositePart, CompositeBarPosition } from "../../../workbench/browser/parts/paneCompositePart.js";
import { Part } from "../../../workbench/browser/part.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { Extensions } from "../../../workbench/browser/panecomposite.js";
let PanelPart = class PanelPart2 extends AbstractPaneCompositePart {
  static {
    __name(this, "PanelPart");
  }
  static {
    PanelPart_1 = this;
  }
  get preferredHeight() {
    return this.layoutService.mainContainerDimension.height * 0.4;
  }
  get preferredWidth() {
    const activeComposite = this.getActivePaneComposite();
    if (!activeComposite) {
      return void 0;
    }
    const width = activeComposite.getOptimalWidth();
    if (typeof width !== "number") {
      return void 0;
    }
    return Math.max(width, 300);
  }
  static {
    this.activePanelSettingsKey = "workbench.agentsession.panelpart.activepanelid";
  }
  static {
    this.MARGIN_BOTTOM = 8;
  }
  static {
    this.MARGIN_LEFT = 8;
  }
  static {
    this.MARGIN_RIGHT = 8;
  }
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService, configurationService) {
    super("workbench.parts.panel", { hasTitle: true, trailingSeparator: true }, PanelPart_1.activePanelSettingsKey, ActivePanelContext.bindTo(contextKeyService), PanelFocusContext.bindTo(contextKeyService), "panel", "panel", void 0, PANEL_TITLE_BORDER, 1, Extensions.Panels, Menus.PanelTitle, void 0, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
    this.configurationService = configurationService;
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 77;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.panel.showLabels")) {
        this.updateCompositeBar(true);
      }
    }));
  }
  updateStyles() {
    super.updateStyles();
    const container = assertReturnsDefined(this.getContainer());
    container.style.setProperty("--part-background", this.getColor(PANEL_BACKGROUND) || "");
    container.style.setProperty("--part-border-color", this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "transparent");
    container.style.backgroundColor = "transparent";
    container.style.borderTopColor = "";
    container.style.borderTopStyle = "";
    container.style.borderTopWidth = "";
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "panel",
      pinnedViewContainersKey: "workbench.agentsession.panel.pinnedPanels",
      placeholderViewContainersKey: "workbench.agentsession.panel.placeholderPanels",
      viewContainersWorkspaceStateKey: "workbench.agentsession.panel.viewContainersWorkspaceState",
      icon: this.configurationService.getValue("workbench.panel.showLabels") === false,
      orientation: 0,
      recomputeSizes: true,
      activityHoverOptions: {
        position: /* @__PURE__ */ __name(() => this.layoutService.getPanelPosition() === 2 && !this.layoutService.isPanelMaximized() ? 3 : 2, "position")
      },
      fillExtraContextMenuActions: /* @__PURE__ */ __name((actions) => this.fillExtraContextMenuActions(actions), "fillExtraContextMenuActions"),
      compositeSize: 0,
      iconSize: 16,
      compact: true,
      overflowActionSize: 44,
      colors: /* @__PURE__ */ __name((theme) => ({
        activeBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        inactiveBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
        activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
        inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
        badgeBackground: theme.getColor(PANEL_TITLE_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(PANEL_TITLE_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      }), "colors")
    };
  }
  fillExtraContextMenuActions(_actions) {
  }
  layout(width, height, top, left) {
    if (!this.layoutService.isVisible(
      "workbench.parts.panel"
      /* Parts.PANEL_PART */
    )) {
      return;
    }
    super.layout(width - PanelPart_1.MARGIN_LEFT - PanelPart_1.MARGIN_RIGHT, height - PanelPart_1.MARGIN_BOTTOM, top, left);
    Part.prototype.layout.call(this, width, height, top, left);
  }
  shouldShowCompositeBar() {
    return true;
  }
  getCompositeBarPosition() {
    return CompositeBarPosition.TITLE;
  }
  toJSON() {
    return {
      type: "workbench.parts.panel"
      /* Parts.PANEL_PART */
    };
  }
};
PanelPart = PanelPart_1 = __decorate([
  __param(0, INotificationService),
  __param(1, IStorageService),
  __param(2, IContextMenuService),
  __param(3, IWorkbenchLayoutService),
  __param(4, IKeybindingService),
  __param(5, IHoverService),
  __param(6, IInstantiationService),
  __param(7, IThemeService),
  __param(8, IViewDescriptorService),
  __param(9, IContextKeyService),
  __param(10, IExtensionService),
  __param(11, IMenuService),
  __param(12, IConfigurationService)
], PanelPart);
export {
  PanelPart
};
//# sourceMappingURL=panelPart.js.map
