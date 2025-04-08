var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IIdentityProvider } from "../../../../../base/browser/ui/list/list.js";
import { ObjectTree } from "../../../../../base/browser/ui/tree/objectTree.js";
import { IObjectTreeElement, ObjectTreeElementCollapseState } from "../../../../../base/browser/ui/tree/tree.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { FuzzyScore } from "../../../../../base/common/filters.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../../base/common/marshallingIds.js";
import { ISerializedTestTreeCollapseState, isCollapsedInSerializedTestTree } from "./testingViewState.js";
import { ITestItemContext, InternalTestItem, TestItemExpandState, TestResultState } from "../../common/testTypes.js";
let idCounter = 0;
const getId = /* @__PURE__ */ __name(() => String(idCounter++), "getId");
class TestItemTreeElement {
  constructor(test, parent = null) {
    this.test = test;
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
  }
  static {
    __name(this, "TestItemTreeElement");
  }
  changeEmitter = new Emitter();
  /**
   * Fired whenever the element or test properties change.
   */
  onChange = this.changeEmitter.event;
  /**
   * Tree children of this item.
   */
  children = /* @__PURE__ */ new Set();
  /**
   * Unique ID of the element in the tree.
   */
  treeId = getId();
  /**
   * Depth of the element in the tree.
   */
  depth;
  /**
   * Whether the node's test result is 'retired' -- from an outdated test run.
   */
  retired = false;
  /**
   * State to show on the item. This is generally the item's computed state
   * from its children.
   */
  state = TestResultState.Unset;
  /**
   * Time it took this test/item to run.
   */
  duration;
  toJSON() {
    if (this.depth === 0) {
      return { controllerId: this.test.controllerId };
    }
    const context = {
      $mid: MarshalledId.TestItemContext,
      tests: [InternalTestItem.serialize(this.test)]
    };
    for (let p = this.parent; p && p.depth > 0; p = p.parent) {
      context.tests.unshift(InternalTestItem.serialize(p.test));
    }
    return context;
  }
}
class TestTreeErrorMessage {
  constructor(message, parent) {
    this.message = message;
    this.parent = parent;
  }
  static {
    __name(this, "TestTreeErrorMessage");
  }
  treeId = getId();
  children = /* @__PURE__ */ new Set();
  get description() {
    return typeof this.message === "string" ? this.message : this.message.value;
  }
}
const testIdentityProvider = {
  getId(element) {
    const expandComponent = element instanceof TestTreeErrorMessage ? "error" : element.test.expand === TestItemExpandState.NotExpandable ? !!element.children.size : element.test.expand;
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
    collapsible: element.test.expand !== TestItemExpandState.NotExpandable,
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
