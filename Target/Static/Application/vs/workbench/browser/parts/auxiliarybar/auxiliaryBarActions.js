var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { AuxiliaryBarVisibleContext, IsAuxiliaryTitleBarContext } from "../../../common/contextkeys.js";
import { ViewContainerLocationToString } from "../../../common/views.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { SwitchCompositeViewAction } from "../compositeBarActions.js";
import { closeIcon } from "../panel/panelActions.js";
const auxiliaryBarRightIcon = registerIcon("auxiliarybar-right-layout-icon", Codicon.layoutSidebarRight, localize("toggleAuxiliaryIconRight", "Icon to toggle the auxiliary bar off in its right position."));
const auxiliaryBarRightOffIcon = registerIcon("auxiliarybar-right-off-layout-icon", Codicon.layoutSidebarRightOff, localize("toggleAuxiliaryIconRightOn", "Icon to toggle the auxiliary bar on in its right position."));
const auxiliaryBarLeftIcon = registerIcon("auxiliarybar-left-layout-icon", Codicon.layoutSidebarLeft, localize("toggleAuxiliaryIconLeft", "Icon to toggle the auxiliary bar in its left position."));
const auxiliaryBarLeftOffIcon = registerIcon("auxiliarybar-left-off-layout-icon", Codicon.layoutSidebarLeftOff, localize("toggleAuxiliaryIconLeftOn", "Icon to toggle the auxiliary bar on in its left position."));
class ToggleAuxiliaryBarAction extends Action2 {
  static {
    __name(this, "ToggleAuxiliaryBarAction");
  }
  static {
    this.ID = "workbench.action.toggleAuxiliaryBar";
  }
  static {
    this.LABEL = localize2("toggleAuxiliaryBar", "Toggle Secondary Side Bar Visibility");
  }
  constructor() {
    super({
      id: ToggleAuxiliaryBarAction.ID,
      title: ToggleAuxiliaryBarAction.LABEL,
      toggled: {
        condition: AuxiliaryBarVisibleContext,
        title: localize("closeSecondarySideBar", "Hide Secondary Side Bar"),
        icon: closeIcon,
        mnemonicTitle: localize({ key: "secondary sidebar mnemonic", comment: ["&& denotes a mnemonic"] }, "Secondary Si&&de Bar")
      },
      icon: closeIcon,
      // Ensures no flickering when using toggled.icon
      category: Categories.View,
      metadata: {
        description: localize("openAndCloseAuxiliaryBar", "Open/Show and Close/Hide Secondary Side Bar")
      },
      f1: true,
      keybinding: {
        weight: 200,
        primary: 2048 | 512 | 32
        /* KeyCode.KeyB */
      },
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 1
        },
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 2
        },
        {
          id: MenuId.AuxiliaryBarTitle,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.equals(
            `config.${"workbench.activityBar.location"}`,
            "default"
            /* ActivityBarPosition.DEFAULT */
          )
        }
      ]
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(
      layoutService.isVisible(
        "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      ),
      "workbench.parts.auxiliarybar"
      /* Parts.AUXILIARYBAR_PART */
    );
  }
}
registerAction2(ToggleAuxiliaryBarAction);
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeAuxiliaryBar",
      title: localize2("closeSecondarySideBar", "Hide Secondary Side Bar"),
      category: Categories.View,
      precondition: AuxiliaryBarVisibleContext,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).setPartHidden(
      true,
      "workbench.parts.auxiliarybar"
      /* Parts.AUXILIARYBAR_PART */
    );
  }
});
registerAction2(class FocusAuxiliaryBarAction extends Action2 {
  static {
    __name(this, "FocusAuxiliaryBarAction");
  }
  static {
    this.ID = "workbench.action.focusAuxiliaryBar";
  }
  static {
    this.LABEL = localize2("focusAuxiliaryBar", "Focus into Secondary Side Bar");
  }
  constructor() {
    super({
      id: FocusAuxiliaryBarAction.ID,
      title: FocusAuxiliaryBarAction.LABEL,
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    if (!layoutService.isVisible(
      "workbench.parts.auxiliarybar"
      /* Parts.AUXILIARYBAR_PART */
    )) {
      layoutService.setPartHidden(
        false,
        "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      );
    }
    const composite = paneCompositeService.getActivePaneComposite(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    );
    composite?.focus();
  }
});
MenuRegistry.appendMenuItems([
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "2_pane_toggles",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize("toggleSecondarySideBar", "Toggle Secondary Side Bar"),
        toggled: { condition: AuxiliaryBarVisibleContext, icon: auxiliaryBarLeftIcon },
        icon: auxiliaryBarLeftOffIcon
      },
      when: ContextKeyExpr.and(IsAuxiliaryTitleBarContext.negate(), ContextKeyExpr.or(ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"), ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")), ContextKeyExpr.equals("config.workbench.sideBar.location", "right")),
      order: 0
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "2_pane_toggles",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize("toggleSecondarySideBar", "Toggle Secondary Side Bar"),
        toggled: { condition: AuxiliaryBarVisibleContext, icon: auxiliaryBarRightIcon },
        icon: auxiliaryBarRightOffIcon
      },
      when: ContextKeyExpr.and(IsAuxiliaryTitleBarContext.negate(), ContextKeyExpr.or(ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"), ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")), ContextKeyExpr.equals("config.workbench.sideBar.location", "left")),
      order: 2
    }
  },
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize2("hideAuxiliaryBar", "Hide Secondary Side Bar")
      },
      when: ContextKeyExpr.and(AuxiliaryBarVisibleContext, ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(
        2
        /* ViewContainerLocation.AuxiliaryBar */
      ))),
      order: 2
    }
  }
]);
registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.previousAuxiliaryBarView",
      title: localize2("previousAuxiliaryBarView", "Previous Secondary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 2, -1);
  }
});
registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.nextAuxiliaryBarView",
      title: localize2("nextAuxiliaryBarView", "Next Secondary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 2, 1);
  }
});
export {
  ToggleAuxiliaryBarAction
};
//# sourceMappingURL=auxiliaryBarActions.js.map
