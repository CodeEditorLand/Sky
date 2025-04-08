var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function isManagedHoverTooltipMarkdownString(obj) {
  const candidate = obj;
  return typeof candidate === "object" && "markdown" in candidate && "markdownNotSupportedFallback" in candidate;
}
__name(isManagedHoverTooltipMarkdownString, "isManagedHoverTooltipMarkdownString");
function isManagedHoverTooltipHTMLElement(obj) {
  const candidate = obj;
  return typeof candidate === "object" && "element" in candidate;
}
__name(isManagedHoverTooltipHTMLElement, "isManagedHoverTooltipHTMLElement");
export {
  isManagedHoverTooltipHTMLElement,
  isManagedHoverTooltipMarkdownString
};
//# sourceMappingURL=hover.js.map
