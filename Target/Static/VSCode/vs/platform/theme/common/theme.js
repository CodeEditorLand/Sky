var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ColorScheme = /* @__PURE__ */ ((ColorScheme2) => {
  ColorScheme2["DARK"] = "dark";
  ColorScheme2["LIGHT"] = "light";
  ColorScheme2["HIGH_CONTRAST_DARK"] = "hcDark";
  ColorScheme2["HIGH_CONTRAST_LIGHT"] = "hcLight";
  return ColorScheme2;
})(ColorScheme || {});
var ThemeTypeSelector = /* @__PURE__ */ ((ThemeTypeSelector2) => {
  ThemeTypeSelector2["VS"] = "vs";
  ThemeTypeSelector2["VS_DARK"] = "vs-dark";
  ThemeTypeSelector2["HC_BLACK"] = "hc-black";
  ThemeTypeSelector2["HC_LIGHT"] = "hc-light";
  return ThemeTypeSelector2;
})(ThemeTypeSelector || {});
function isHighContrast(scheme) {
  return scheme === "hcDark" /* HIGH_CONTRAST_DARK */ || scheme === "hcLight" /* HIGH_CONTRAST_LIGHT */;
}
__name(isHighContrast, "isHighContrast");
function isDark(scheme) {
  return scheme === "dark" /* DARK */ || scheme === "hcDark" /* HIGH_CONTRAST_DARK */;
}
__name(isDark, "isDark");
export {
  ColorScheme,
  ThemeTypeSelector,
  isDark,
  isHighContrast
};
//# sourceMappingURL=theme.js.map
