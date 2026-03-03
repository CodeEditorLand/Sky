var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { TestId } from "../../common/testId.js";
function isCollapsedInSerializedTestTree(serialized, id) {
  if (!(id instanceof TestId)) {
    id = TestId.fromString(id);
  }
  let node = serialized;
  for (const part of id.path) {
    if (!node.children?.hasOwnProperty(part)) {
      return void 0;
    }
    node = node.children[part];
  }
  return node.collapsed;
}
__name(isCollapsedInSerializedTestTree, "isCollapsedInSerializedTestTree");
export {
  isCollapsedInSerializedTestTree
};
//# sourceMappingURL=testingViewState.js.map
