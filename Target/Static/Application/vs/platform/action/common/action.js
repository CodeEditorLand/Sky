var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function isLocalizedString(thing) {
  return thing && typeof thing === "object" && typeof thing.original === "string" && typeof thing.value === "string";
}
__name(isLocalizedString, "isLocalizedString");
function isICommandActionToggleInfo(thing) {
  return thing ? thing.condition !== void 0 : false;
}
__name(isICommandActionToggleInfo, "isICommandActionToggleInfo");
export {
  isICommandActionToggleInfo,
  isLocalizedString
};
//# sourceMappingURL=action.js.map
