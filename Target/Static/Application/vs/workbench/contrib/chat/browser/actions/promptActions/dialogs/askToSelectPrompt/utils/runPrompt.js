var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getChatWidgetObject } from "./attachInstructions.js";
import { getPromptCommandName } from "../../../../../../common/promptSyntax/service/promptsService.js";
const runPromptFile = /* @__PURE__ */ __name(async (file, options) => {
  const widget = await getChatWidgetObject(options);
  widget.setInput(`/${getPromptCommandName(file.path)}`);
  await widget.acceptInput();
  return { widget };
}, "runPromptFile");
export {
  runPromptFile
};
//# sourceMappingURL=runPrompt.js.map
