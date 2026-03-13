var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { truncateOutputKeepingTail } from "./runInTerminalHelpers.js";
const MAX_OUTPUT_LENGTH = 16e3;
function getOutput(instance, startMarker) {
  if (!instance.xterm || !instance.xterm.raw) {
    return "";
  }
  const buffer = instance.xterm.raw.buffer.active;
  const startLine = Math.max(startMarker?.line ?? 0, 0);
  const endLine = buffer.length;
  const lines = new Array(endLine - startLine);
  for (let y = startLine; y < endLine; y++) {
    const line = buffer.getLine(y);
    lines[y - startLine] = line ? line.translateToString(true) : "";
  }
  let output = lines.join("\n");
  if (output.length > MAX_OUTPUT_LENGTH) {
    output = truncateOutputKeepingTail(output, MAX_OUTPUT_LENGTH);
  }
  return output;
}
__name(getOutput, "getOutput");
export {
  getOutput
};
//# sourceMappingURL=outputHelpers.js.map
