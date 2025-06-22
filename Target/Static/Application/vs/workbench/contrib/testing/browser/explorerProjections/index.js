var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ObjectTreeElementCollapseState } from "../../../../../base/browser/ui/tree/tree.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { isCollapsedInSerializedTestTree } from "./testingViewState.js";
import { InternalTestItem } from "../../common/testTypes.js";
let idCounter = 0;
const getId = /* @__PURE__ */ __name(() => String(idCounter++), "getId");
class TestItemTreeElement {
  static {
    __name(this, "TestItemTreeElement");
  }
  constructor(test, parent = null) {
    this.test = test;
    this.parent = parent;
    this.changeEmitter = new Emitter();
    this.onChange = this.changeEmitter.event;
    this.children = /* @__PURE__ */ new Set();
    this.treeId = getId();
    this.retired = false;
    this.state = 0;
    this.depth = parent ? parent.depth + 1 : 0;
  }
  toJSON() {
    if (this.depth === 0) {
      return { controllerId: this.test.controllerId };
    }
    const context = {
      $mid: 16,
      tests: [InternalTestItem.serialize(this.test)]
    };
    for (let p = this.parent; p && p.depth > 0; p = p.parent) {
      context.tests.unshift(InternalTestItem.serialize(p.test));
    }
    return context;
  }
}
class TestTreeErrorMessage {
  static {
    __name(this, "TestTreeErrorMessage");
  }
  get description() {
    return typeof this.message === "string" ? this.message : this.message.value;
  }
  constructor(message, parent) {
    this.message = message;
    this.parent = parent;
    this.treeId = getId();
    this.children = /* @__PURE__ */ new Set();
  }
}
const testIdentityProvider = {
  getId(element) {
    const expandComponent = element instanceof TestTreeErrorMessage ? "error" : element.test.expand === 0 ? !!element.children.size : element.test.expand;
    return element.treeId + "\0" + expandComponent;
  }
};
const getChildrenForParent = /* @__PURE__ */ __name((serialized, rootsWithChildren, node) => {
  let it;
  if (node === null) {
    const rootsWithChildrenArr = [...rootsWithChildren];
    if (rootsWithChildrenArr.length === 1) {
      return getChildrenForParent(serialized, rootsWithChildrenArr, rootsWithChildrenArr[0]);
    }
    it = rootsWithChildrenArr;
  } else {
    it = node.children;
  }
  return Iterable.map(it, (element) => element instanceof TestTreeErrorMessage ? { element } : {
    element,
    collapsible: element.test.expand !== 0,
    collapsed: element.test.item.error ? ObjectTreeElementCollapseState.PreserveOrExpanded : isCollapsedInSerializedTestTree(serialized, element.test.item.extId) ?? element.depth > 0 ? ObjectTreeElementCollapseState.PreserveOrCollapsed : ObjectTreeElementCollapseState.PreserveOrExpanded,
    children: getChildrenForParent(serialized, rootsWithChildren, element)
  });
}, "getChildrenForParent");
export {
  TestItemTreeElement,
  TestTreeErrorMessage,
  getChildrenForParent,
  testIdentityProvider
};
//# sourceMappingURL=index.js.map
