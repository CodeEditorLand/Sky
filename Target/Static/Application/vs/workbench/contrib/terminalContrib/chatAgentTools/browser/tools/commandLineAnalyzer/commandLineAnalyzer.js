var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function isAutoApproveRule(rule) {
  return !!rule && "sourceText" in rule;
}
__name(isAutoApproveRule, "isAutoApproveRule");
function isNpmScriptAutoApproveRule(rule) {
  return !!rule && "type" in rule && rule.type === "npmScript";
}
__name(isNpmScriptAutoApproveRule, "isNpmScriptAutoApproveRule");
export {
  isAutoApproveRule,
  isNpmScriptAutoApproveRule
};
//# sourceMappingURL=commandLineAnalyzer.js.map
