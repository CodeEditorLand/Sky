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
var ChatBarPart_1;
import "./media/chatBarPart.css";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_DRAG_AND_DROP_BORDER, PANEL_INACTIVE_TITLE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_TITLE_BORDER, SIDE_BAR_FOREGROUND } from "../../../workbench/common/theme.js";
import { IViewDescriptorService } from "../../../workbench/common/views.js";
import { IExtensionService } from "../../../workbench/services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../workbench/services/layout/browser/layoutService.js";
import { assertReturnsDefined } from "../../../base/common/types.js";
import { AbstractPaneCompositePart, CompositeBarPosition } from "../../../workbench/browser/parts/paneCompositePart.js";
import { IMenuService } from "../../../platform/actions/common/actions.js";
import { IHoverService } from "../../../platform/hover/browser/hover.js";
import { Extensions } from "../../../workbench/browser/panecomposite.js";
import { Menus } from "../menus.js";
import { ActiveChatBarContext, ChatBarFocusContext } from "../../common/contextkeys.js";
let ChatBarPart = class ChatBarPart2 extends AbstractPaneCompositePart {
  static {
    __name(this, "ChatBarPart");
  }
  static {
    ChatBarPart_1 = this;
  }
  static {
    this.activeViewSettingsKey = "workbench.chatbar.activepanelid";
  }
  static {
    this.pinnedViewsKey = "workbench.chatbar.pinnedPanels";
  }
  static {
    this.placeholderViewContainersKey = "workbench.chatbar.placeholderPanels";
  }
  static {
    this.viewContainersWorkspaceStateKey = "workbench.chatbar.viewContainersWorkspaceState";
  }
  get preferredHeight() {
    return this.layoutService.mainContainerDimension.height * 0.4;
  }
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService) {
    super("workbench.parts.chatbar", {
      hasTitle: false,
      trailingSeparator: true,
      borderWidth: /* @__PURE__ */ __name(() => 0, "borderWidth")
    }, ChatBarPart_1.activeViewSettingsKey, ActiveChatBarContext.bindTo(contextKeyService), ChatBarFocusContext.bindTo(contextKeyService), "chatbar", "chatbar", void 0, SIDE_BAR_TITLE_BORDER, 3, Extensions.ChatBar, Menus.ChatBarTitle, void 0, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 2;
  }
  updateStyles() {
    super.updateStyles();
    const container = assertReturnsDefined(this.getContainer());
    container.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || "";
    container.style.color = this.getColor(SIDE_BAR_FOREGROUND) || "";
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "chatbar",
      pinnedViewContainersKey: ChatBarPart_1.pinnedViewsKey,
      placeholderViewContainersKey: ChatBarPart_1.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: ChatBarPart_1.viewContainersWorkspaceStateKey,
      icon: false,
      orientation: 0,
      recomputeSizes: true,
      activityHoverOptions: {
        position: /* @__PURE__ */ __name(() => 2, "position")
      },
      fillExtraContextMenuActions: /* @__PURE__ */ __name(() => {
      }, "fillExtraContextMenuActions"),
      compositeSize: 0,
      iconSize: 16,
      overflowActionSize: 30,
      colors: /* @__PURE__ */ __name((theme) => ({
        activeBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        inactiveBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
        activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
        inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      }), "colors"),
      compact: true
    };
  }
  shouldShowCompositeBar() {
    return false;
  }
  getCompositeBarPosition() {
    return CompositeBarPosition.TITLE;
  }
  toJSON() {
    return {
      type: "workbench.parts.chatbar"
      /* Parts.CHATBAR_PART */
    };
  }
};
ChatBarPart = ChatBarPart_1 = __decorate([
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
  __param(11, IMenuService)
], ChatBarPart);
export {
  ChatBarPart
};
//# sourceMappingURL=chatBarPart.js.map
