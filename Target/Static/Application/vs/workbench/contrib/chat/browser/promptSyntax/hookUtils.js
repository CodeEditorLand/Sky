var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findNodeAtLocation, parseTree } from "../../../../../base/common/json.js";
function offsetToPosition(content, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
__name(offsetToPosition, "offsetToPosition");
function findNthCommandNode(tree, hookType, targetIndex, fieldName) {
  const hookTypeArray = findNodeAtLocation(tree, ["hooks", hookType]);
  if (!hookTypeArray || hookTypeArray.type !== "array" || !hookTypeArray.children) {
    return void 0;
  }
  let currentIndex = 0;
  for (let i = 0; i < hookTypeArray.children.length; i++) {
    const item = hookTypeArray.children[i];
    if (item.type !== "object") {
      continue;
    }
    const nestedHooksNode = findNodeAtLocation(tree, ["hooks", hookType, i, "hooks"]);
    if (nestedHooksNode && nestedHooksNode.type === "array" && nestedHooksNode.children) {
      for (let j = 0; j < nestedHooksNode.children.length; j++) {
        if (currentIndex === targetIndex) {
          return findNodeAtLocation(tree, ["hooks", hookType, i, "hooks", j, fieldName]);
        }
        currentIndex++;
      }
    } else {
      if (currentIndex === targetIndex) {
        return findNodeAtLocation(tree, ["hooks", hookType, i, fieldName]);
      }
      currentIndex++;
    }
  }
  return void 0;
}
__name(findNthCommandNode, "findNthCommandNode");
function findHookCommandSelection(content, hookType, index, fieldName) {
  const tree = parseTree(content);
  if (!tree) {
    return void 0;
  }
  const node = findNthCommandNode(tree, hookType, index, fieldName);
  if (!node || node.type !== "string") {
    return void 0;
  }
  const valueStart = node.offset + 1;
  const valueEnd = node.offset + node.length - 1;
  const start = offsetToPosition(content, valueStart);
  const end = offsetToPosition(content, valueEnd);
  return {
    startLineNumber: start.line,
    startColumn: start.column,
    endLineNumber: end.line,
    endColumn: end.column
  };
}
__name(findHookCommandSelection, "findHookCommandSelection");
export {
  findHookCommandSelection
};
//# sourceMappingURL=hookUtils.js.map
