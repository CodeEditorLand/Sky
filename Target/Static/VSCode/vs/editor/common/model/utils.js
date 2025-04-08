var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../base/common/charCode.js";
function computeIndentLevel(line, tabSize) {
  let indent = 0;
  let i = 0;
  const len = line.length;
  while (i < len) {
    const chCode = line.charCodeAt(i);
    if (chCode === CharCode.Space) {
      indent++;
    } else if (chCode === CharCode.Tab) {
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
