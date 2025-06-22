var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function computeIndentLevel(line, tabSize) {
  let indent = 0;
  let i = 0;
  const len = line.length;
  while (i < len) {
    const chCode = line.charCodeAt(i);
    if (chCode === 32) {
      indent++;
    } else if (chCode === 9) {
      indent = indent - indent % tabSize + tabSize;
    } else {
      break;
    }
    i++;
  }
  if (i === len) {
    return -1;
  }
  return indent;
}
__name(computeIndentLevel, "computeIndentLevel");
export {
  computeIndentLevel
};
//# sourceMappingURL=utils.js.map
