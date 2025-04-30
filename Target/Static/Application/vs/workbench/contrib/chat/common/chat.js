var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function checkModeOption(mode, option) {
  if (option === void 0) {
    return void 0;
  }
  if (typeof option === "function") {
    return option(mode);
  }
  return option;
}
__name(checkModeOption, "checkModeOption");
export {
  checkModeOption
};
//# sourceMappingURL=chat.js.map
