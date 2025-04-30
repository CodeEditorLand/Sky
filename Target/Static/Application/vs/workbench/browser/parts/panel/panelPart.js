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
import "./media/panelpart.css";
import { localize } from "../../../../nls.js";
import { Separator, SubmenuAction, toAction } from "../../../../base/common/actions.js";
import { ActivePanelContext, PanelFocusContext } from "../../../common/contextkeys.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { TogglePanelAction } from "./panelActions.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { PANEL_BACKGROUND, PANEL_BORDER, PANEL_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_DRAG_AND_DROP_BORDER, PANEL_TITLE_BADGE_BACKGROUND, PANEL_TITLE_BADGE_FOREGROUND } from "../../../common/theme.js";
import { contrastBorder } from "../../../../platform/theme/common/colorRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { Dimension } from "../../../../base/browser/dom.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { AbstractPaneCompositePart, CompositeBarPosition } from "../paneCompositePart.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { getContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
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
      return;
    }
    const width = activeComposite.getOptimalWidth();
    if (typeof width !== "number") {
      return;
    }
    return Math.max(width, 300);
  }
  static {
    this.activePanelSettingsKey = "workbench.panelpart.activepanelid";
  }
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService, configurationService) {
    super("workbench.parts.panel", { hasTitle: true }, PanelPart_1.activePanelSettingsKey, ActivePanelContext.bindTo(contextKeyService), PanelFocusContext.bindTo(contextKeyService), "panel", "panel", void 0, PANEL_TITLE_BORDER, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
    this.commandService = commandService;
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
    const container = assertIsDefined(this.getContainer());
    container.style.backgroundColor = this.getColor(PANEL_BACKGROUND) || "";
    const borderColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    container.style.borderLeftColor = borderColor;
    container.style.borderRightColor = borderColor;
    container.style.borderBottomColor = borderColor;
    const title = this.getTitleArea();
    if (title) {
      title.style.borderTopColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    }
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "panel",
      pinnedViewContainersKey: "workbench.panel.pinnedPanels",
      placeholderViewContainersKey: "workbench.panel.placeholderPanels",
      viewContainersWorkspaceStateKey: "workbench.panel.viewContainersWorkspaceState",
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
      // Only applies to icons, not labels
      overflowActionSize: 44,
      colors: /* @__PURE__ */ __name((theme) => ({
        activeBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        inactiveBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
        activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
        inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
        badgeBackground: theme.getColor(PANEL_TITLE_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(PANEL_TITLE_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      }), "colors")
    };
  }
  fillExtraContextMenuActions(actions) {
    if (this.getCompositeBarPosition() === CompositeBarPosition.TITLE) {
      const viewsSubmenuAction = this.getViewsSubmenuAction();
      if (viewsSubmenuAction) {
        actions.push(new Separator());
        actions.push(viewsSubmenuAction);
      }
    }
    const panelPositionMenu = this.menuService.getMenuActions(MenuId.PanelPositionMenu, this.contextKeyService, { shouldForwardArgs: true });
    const panelAlignMenu = this.menuService.getMenuActions(MenuId.PanelAlignmentMenu, this.contextKeyService, { shouldForwardArgs: true });
    const positionActions = getContextMenuActions(panelPositionMenu).secondary;
    const alignActions = getContextMenuActions(panelAlignMenu).secondary;
    const panelShowLabels = this.configurationService.getValue("workbench.panel.showLabels");
    const toggleShowLabelsAction = toAction({
      id: "workbench.action.panel.toggleShowLabels",
      label: panelShowLabels ? localize("showIcons", "Show Icons") : localize("showLabels", "Show Labels"),
      run: /* @__PURE__ */ __name(() => this.configurationService.updateValue("workbench.panel.showLabels", !panelShowLabels), "run")
    });
    actions.push(...[
      new Separator(),
      new SubmenuAction("workbench.action.panel.position", localize("panel position", "Panel Position"), positionActions),
      new SubmenuAction("workbench.action.panel.align", localize("align panel", "Align Panel"), alignActions),
      toggleShowLabelsAction,
      toAction({ id: TogglePanelAction.ID, label: localize("hidePanel", "Hide Panel"), run: /* @__PURE__ */ __name(() => this.commandService.executeCommand(TogglePanelAction.ID), "run") })
    ]);
  }
  layout(width, height, top, left) {
    let dimensions;
    switch (this.layoutService.getPanelPosition()) {
      case 1:
        dimensions = new Dimension(width - 1, height);
        break;
      case 3:
        dimensions = new Dimension(width, height - 1);
        break;
      default:
        dimensions = new Dimension(width, height);
        break;
    }
    super.layout(dimensions.width, dimensions.height, top, left);
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
  __param(11, ICommandService),
  __param(12, IMenuService),
  __param(13, IConfigurationService)
], PanelPart);
export {
  PanelPart
};
//# sourceMappingURL=panelPart.js.map
