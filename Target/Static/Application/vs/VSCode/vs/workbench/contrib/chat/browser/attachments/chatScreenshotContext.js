var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../nls.js";
const ScreenshotVariableId = "screenshot-focused-window";
function convertBufferToScreenshotVariable(buffer) {
  return {
    id: ScreenshotVariableId,
    name: localize("screenshot", "Screenshot"),
    value: buffer.buffer,
    kind: "image"
  };
}
__name(convertBufferToScreenshotVariable, "convertBufferToScreenshotVariable");
export {
  ScreenshotVariableId,
  convertBufferToScreenshotVariable
};
//# sourceMappingURL=chatScreenshotContext.js.map
