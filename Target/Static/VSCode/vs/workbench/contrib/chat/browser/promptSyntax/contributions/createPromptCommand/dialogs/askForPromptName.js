var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../nls.js";
import { PROMPT_FILE_EXTENSION } from "../../../../../../../../platform/prompts/common/constants.js";
import { IQuickInputService } from "../../../../../../../../platform/quickinput/common/quickInput.js";
const askForPromptName = /* @__PURE__ */ __name(async (_type, quickInputService) => {
  const result = await quickInputService.input(
    {
      placeHolder: localize(
        "commands.prompts.create.ask-name.placeholder",
        "Provide a prompt name",
        PROMPT_FILE_EXTENSION
      )
    }
  );
  if (!result) {
    return void 0;
  }
  const trimmedName = result.trim();
  if (!trimmedName) {
    return void 0;
  }
  const cleanName = trimmedName.endsWith(PROMPT_FILE_EXTENSION) ? trimmedName : `${trimmedName}${PROMPT_FILE_EXTENSION}`;
  return cleanName;
}, "askForPromptName");
export {
  askForPromptName
};
//# sourceMappingURL=askForPromptName.js.map
