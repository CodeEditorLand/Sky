var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../common/actions.js";
import * as nls from "../../../../nls.js";
class CollapseAllAction extends Action {
  static {
    __name(this, "CollapseAllAction");
  }
  constructor(viewer, enabled) {
    super("vs.tree.collapse", nls.localize("collapse all", "Collapse All"), "collapse-all", enabled);
    this.viewer = viewer;
  }
  async run() {
    this.viewer.collapseAll();
    this.viewer.setSelection([]);
    this.viewer.setFocus([]);
  }
}
export {
  CollapseAllAction
};
//# sourceMappingURL=treeDefaults.js.map
