var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../../nls.js";
import { ISelectPromptOptions } from "../askToSelectPrompt.js";
import { SUPER_KEY_NAME } from "../constants.js";
const createPlaceholderText = /* @__PURE__ */ __name((options) => {
  const { widget } = options;
  let text = localize(
    "commands.prompts.use.select-dialog.placeholder",
    "Select a prompt to use"
  );
  if (widget === void 0) {
    const superModifierNote = localize(
      "commands.prompts.use.select-dialog.super-modifier-note",
      "{0}-key to use in new chat",
      SUPER_KEY_NAME
    );
    text += localize(
      "commands.prompts.use.select-dialog.modifier-notes",
      " (hold {0})",
      superModifierNote
    );
  }
  return text;
}, "createPlaceholderText");
export {
  createPlaceholderText
};
//# sourceMappingURL=createPlaceholderText.js.map
