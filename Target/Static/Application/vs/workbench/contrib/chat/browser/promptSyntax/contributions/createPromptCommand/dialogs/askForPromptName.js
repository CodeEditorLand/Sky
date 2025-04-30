var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../nls.js";
import { getPromptFileExtension } from "../../../../../../../../platform/prompts/common/constants.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import Severity from "../../../../../../../../base/common/severity.js";
import { isValidBasename } from "../../../../../../../../base/common/extpath.js";
const askForPromptFileName = /* @__PURE__ */ __name(async (type, selectedFolder, quickInputService, fileService) => {
  const placeHolder = type === "instructions" ? localize("askForInstructionsFileName.placeholder", "Enter the name of the instructions file") : localize("askForPromptFileName.placeholder", "Enter the name of the prompt file");
  const sanitizeInput = /* @__PURE__ */ __name((input) => {
    const trimmedName = input.trim();
    if (!trimmedName) {
      return void 0;
    }
    const fileExtension = getPromptFileExtension(type);
    return trimmedName.endsWith(fileExtension) ? trimmedName : `${trimmedName}${fileExtension}`;
  }, "sanitizeInput");
  const validateInput = /* @__PURE__ */ __name(async (value) => {
    const fileName = sanitizeInput(value);
    if (!fileName) {
      return {
        content: localize("askForPromptFileName.error.empty", "Please enter a name."),
        severity: Severity.Warning
      };
    }
    if (!isValidBasename(fileName)) {
      return {
        content: localize("askForPromptFileName.error.invalid", "The name contains invalid characters."),
        severity: Severity.Error
      };
    }
    const fileUri = URI.joinPath(selectedFolder, fileName);
    if (await fileService.exists(fileUri)) {
      return {
        content: localize("askForPromptFileName.error.exists", "A file for the given name already exists."),
        severity: Severity.Error
      };
    }
    return void 0;
  }, "validateInput");
  const result = await quickInputService.input({ placeHolder, validateInput });
  if (!result) {
    return void 0;
  }
  return sanitizeInput(result);
}, "askForPromptFileName");
export {
  askForPromptFileName
};
//# sourceMappingURL=askForPromptName.js.map
