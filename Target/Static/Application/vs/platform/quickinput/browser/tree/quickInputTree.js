var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function getParentNodeState(parentChildren) {
  let containsChecks = false;
  let containsUnchecks = false;
  let containsMixed = false;
  for (const element of parentChildren) {
    switch (element.element?.checked) {
      case "mixed":
        containsMixed = true;
        break;
      case true:
        containsChecks = true;
        break;
      default:
        containsUnchecks = true;
        break;
    }
    if (containsChecks && containsUnchecks && containsMixed) {
      break;
    }
  }
  const newState = containsUnchecks ? containsMixed ? "mixed" : containsChecks ? "mixed" : false : containsMixed ? "mixed" : containsChecks;
  return newState;
}
__name(getParentNodeState, "getParentNodeState");
export {
  getParentNodeState
};
//# sourceMappingURL=quickInputTree.js.map
