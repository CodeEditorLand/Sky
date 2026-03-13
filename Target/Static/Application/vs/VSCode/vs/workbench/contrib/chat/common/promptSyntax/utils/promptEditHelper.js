var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const isSimpleNameRegex = /^[\w\/\.-]+$/;
function formatArrayValue(name, quotePreference) {
  switch (quotePreference) {
    case "'":
      return `'${name}'`;
    case '"':
      return `"${name}"`;
  }
  return isSimpleNameRegex.test(name) ? name : `'${name}'`;
}
__name(formatArrayValue, "formatArrayValue");
function getQuotePreference(arrayValue, model) {
  const firstStringItem = arrayValue.items.find((item) => item.type === "scalar" && isSimpleNameRegex.test(item.value));
  const firstChar = firstStringItem ? model.getValueInRange(firstStringItem.range).charAt(0) : void 0;
  if (firstChar === `'` || firstChar === `"`) {
    return firstChar;
  }
  return "";
}
__name(getQuotePreference, "getQuotePreference");
export {
  formatArrayValue,
  getQuotePreference
};
//# sourceMappingURL=promptEditHelper.js.map
