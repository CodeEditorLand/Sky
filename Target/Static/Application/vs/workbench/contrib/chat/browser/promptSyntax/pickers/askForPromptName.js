var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { getPromptFileExtension } from "../../../common/promptSyntax/config/promptFileLocations.js";
import { PromptsType } from "../../../common/promptSyntax/promptTypes.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { URI } from "../../../../../../base/common/uri.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import Severity from "../../../../../../base/common/severity.js";
import { isValidBasename } from "../../../../../../base/common/extpath.js";
async function askForPromptFileName(accessor, type, selectedFolder, existingFileName) {
  const quickInputService = accessor.get(IQuickInputService);
  const fileService = accessor.get(IFileService);
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
  const placeHolder = existingFileName ? getPlaceholderStringForRename(type) : getPlaceholderStringForNew(type);
  const result = await quickInputService.input({ placeHolder, validateInput, value: existingFileName });
  if (!result) {
    return void 0;
  }
  return sanitizeInput(result);
}
__name(askForPromptFileName, "askForPromptFileName");
function getPlaceholderStringForNew(type) {
  switch (type) {
    case PromptsType.instructions:
      return localize("askForInstructionsFileName.placeholder", "Enter the name of the instructions file");
    case PromptsType.prompt:
      return localize("askForPromptFileName.placeholder", "Enter the name of the prompt file");
    case PromptsType.mode:
      return localize("askForModeFileName.placeholder", "Enter the name of the custom chat mode file");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPlaceholderStringForNew, "getPlaceholderStringForNew");
function getPlaceholderStringForRename(type) {
  switch (type) {
    case PromptsType.instructions:
      return localize("askForRenamedInstructionsFileName.placeholder", "Enter a new name of the instructions file");
    case PromptsType.prompt:
      return localize("askForRenamedPromptFileName.placeholder", "Enter a new name of the prompt file");
    case PromptsType.mode:
      return localize("askForRenamedModeFileName.placeholder", "Enter a new name of the custom chat mode file");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPlaceholderStringForRename, "getPlaceholderStringForRename");
export {
  askForPromptFileName
};
//# sourceMappingURL=askForPromptName.js.map
