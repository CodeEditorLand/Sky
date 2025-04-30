var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const flatten = /* @__PURE__ */ __name((treeRoot) => {
  const result = [];
  result.push(treeRoot);
  for (const child of treeRoot.children ?? []) {
    result.push(...flatten(child));
  }
  return result;
}, "flatten");
const forEach = /* @__PURE__ */ __name((callback, treeRoot) => {
  const shouldStop = callback(treeRoot);
  if (shouldStop === true) {
    return true;
  }
  for (const child of treeRoot.children ?? []) {
    const shouldStop2 = forEach(callback, child);
    if (shouldStop2 === true) {
      return true;
    }
  }
  return false;
}, "forEach");
const map = /* @__PURE__ */ __name((callback, treeRoot) => {
  if (treeRoot.children === void 0) {
    return callback(treeRoot, void 0);
  }
  const newChildren = treeRoot.children.map(curry(map, callback));
  const newNode = callback(treeRoot, newChildren);
  if ("children" in newNode) {
    return newNode;
  }
  newNode.children = newChildren;
  return newNode;
}, "map");
const curry = /* @__PURE__ */ __name((callback, arg1) => {
  return (...args) => {
    return callback(arg1, ...args);
  };
}, "curry");
export {
  curry,
  flatten,
  forEach,
  map
};
//# sourceMappingURL=treeUtils.js.map
