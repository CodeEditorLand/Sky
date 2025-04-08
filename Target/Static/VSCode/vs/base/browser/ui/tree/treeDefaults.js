var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AsyncDataTree } from "./asyncDataTree.js";
import { Action } from "../../../common/actions.js";
import * as nls from "../../../../nls.js";
class CollapseAllAction extends Action {
  constructor(viewer, enabled) {
    super("vs.tree.collapse", nls.localize("collapse all", "Collapse All"), "collapse-all", enabled);
    this.viewer = viewer;
  }
  static {
    __name(this, "CollapseAllAction");
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
