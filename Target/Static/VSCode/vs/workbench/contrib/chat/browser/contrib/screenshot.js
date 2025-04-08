var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { localize } from "../../../../../nls.js";
import { IChatRequestVariableEntry } from "../../common/chatModel.js";
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
//# sourceMappingURL=screenshot.js.map
