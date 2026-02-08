var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerAttachPromptActions } from "./attachInstructionsAction.js";
import { registerAgentActions } from "./chatModeActions.js";
import { registerRunPromptActions } from "./runPromptAction.js";
import { registerNewPromptFileActions } from "./newPromptFileActions.js";
import { registerSkillActions } from "./skillActions.js";
import { registerHookActions } from "./hookActions.js";
import { registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { SaveAsAgentFileAction, SaveAsInstructionsFileAction, SaveAsPromptFileAction } from "./saveAsPromptFileActions.js";
function registerPromptActions() {
  registerRunPromptActions();
  registerAttachPromptActions();
  registerSkillActions();
  registerHookActions();
  registerAction2(SaveAsPromptFileAction);
  registerAction2(SaveAsInstructionsFileAction);
  registerAction2(SaveAsAgentFileAction);
  registerAgentActions();
  registerNewPromptFileActions();
}
__name(registerPromptActions, "registerPromptActions");
export {
  registerPromptActions
};
//# sourceMappingURL=promptFileActions.js.map
