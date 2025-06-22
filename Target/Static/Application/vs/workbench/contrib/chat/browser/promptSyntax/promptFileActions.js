var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerAttachPromptActions } from "./attachInstructionsAction.js";
import { registerChatModeActions } from "./chatModeActions.js";
import { registerRunPromptActions } from "./runPromptAction.js";
import { registerSaveToPromptActions } from "./saveToPromptAction.js";
import { registerNewPromptFileActions } from "./newPromptFileActions.js";
function registerPromptActions() {
  registerRunPromptActions();
  registerAttachPromptActions();
  registerSaveToPromptActions();
  registerChatModeActions();
  registerNewPromptFileActions();
}
__name(registerPromptActions, "registerPromptActions");
export {
  registerPromptActions
};
//# sourceMappingURL=promptFileActions.js.map
