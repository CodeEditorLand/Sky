var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/sidebarpart.css";
import { localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { SideBarVisibleContext } from "../../../common/contextkeys.js";
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeSidebar",
      title: localize2("closeSidebar", "Close Primary Side Bar"),
      category: Categories.View,
      f1: true,
      precondition: SideBarVisibleContext
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).setPartHidden(
      true,
      "workbench.parts.sidebar"
      /* Parts.SIDEBAR_PART */
    );
  }
});
class FocusSideBarAction extends Action2 {
  static {
    __name(this, "FocusSideBarAction");
  }
  constructor() {
    super({
      id: "workbench.action.focusSideBar",
      title: localize2("focusSideBar", "Focus into Primary Side Bar"),
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200,
        when: null,
        primary: 2048 | 21
        /* KeyCode.Digit0 */
      }
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    if (!layoutService.isVisible(
      "workbench.parts.sidebar"
      /* Parts.SIDEBAR_PART */
    )) {
      layoutService.setPartHidden(
        false,
        "workbench.parts.sidebar"
        /* Parts.SIDEBAR_PART */
      );
    }
    const viewlet = paneCompositeService.getActivePaneComposite(
      0
      /* ViewContainerLocation.Sidebar */
    );
    viewlet?.focus();
  }
}
registerAction2(FocusSideBarAction);
export {
  FocusSideBarAction
};
//# sourceMappingURL=sidebarActions.js.map
