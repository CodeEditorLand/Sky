var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerRunPromptActions } from "./chatRunPromptAction.js";
import { registerSaveToPromptActions } from "./chatSaveToPromptAction.js";
import { registerAttachPromptActions } from "./chatAttachInstructionsAction.js";
import { runAttachInstructionsAction } from "./chatAttachInstructionsAction.js";
const registerPromptActions = /* @__PURE__ */ __name(() => {
  registerRunPromptActions();
  registerAttachPromptActions();
  registerSaveToPromptActions();
}, "registerPromptActions");
export {
  registerPromptActions,
  runAttachInstructionsAction
};
//# sourceMappingURL=index.js.map
