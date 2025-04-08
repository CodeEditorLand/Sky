var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IListVirtualDelegate } from "../list/list.js";
import { AbstractTree, IAbstractTreeOptions } from "./abstractTree.js";
import { IndexTreeModel } from "./indexTreeModel.js";
import { ITreeElement, ITreeModel, ITreeRenderer, TreeError } from "./tree.js";
import { Iterable } from "../../../common/iterator.js";
import "./media/tree.css";
class IndexTree extends AbstractTree {
  constructor(user, container, delegate, renderers, rootElement, options = {}) {
    super(user, container, delegate, renderers, options);
    this.user = user;
    this.rootElement = rootElement;
  }
  static {
    __name(this, "IndexTree");
  }
  splice(location, deleteCount, toInsert = Iterable.empty()) {
    this.model.splice(location, deleteCount, toInsert);
  }
  rerender(location) {
    if (location === void 0) {
      this.view.rerender();
      return;
    }
    this.model.rerender(location);
  }
  updateElementHeight(location, height) {
    if (location.length === 0) {
      throw new TreeError(this.user, `Update element height failed: invalid location`);
    }
    const elementIndex = this.model.getListIndex(location);
    if (elementIndex === -1) {
      return;
    }
    this.view.updateElementHeight(elementIndex, height);
  }
  createModel(user, options) {
    return new IndexTreeModel(user, this.rootElement, options);
  }
}
export {
  IndexTree
};
//# sourceMappingURL=indexTree.js.map
