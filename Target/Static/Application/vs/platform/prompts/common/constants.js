var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../base/common/path.js";
const PROMPT_FILE_EXTENSION = ".prompt.md";
const INSTRUCTION_FILE_EXTENSION = ".instructions.md";
const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
const CONFIG_KEY = "chat.promptFiles";
const PROMPT_LOCATIONS_CONFIG_KEY = "chat.promptFilesLocations";
const INSTRUCTIONS_LOCATIONS_CONFIG_KEY = "chat.instructionsFilesLocations";
const PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";
const INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";
function getPromptFileType(fileUri) {
  const filename = basename(fileUri.path);
  if (filename.endsWith(PROMPT_FILE_EXTENSION)) {
    return "prompt";
  }
  if (filename.endsWith(INSTRUCTION_FILE_EXTENSION) || filename === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return "instructions";
  }
  return void 0;
}
__name(getPromptFileType, "getPromptFileType");
function isPromptOrInstructionsFile(fileUri) {
  return getPromptFileType(fileUri) !== void 0;
}
__name(isPromptOrInstructionsFile, "isPromptOrInstructionsFile");
function getPromptFileExtension(type) {
  return type === "instructions" ? INSTRUCTION_FILE_EXTENSION : PROMPT_FILE_EXTENSION;
}
__name(getPromptFileExtension, "getPromptFileExtension");
const isUntitled = /* @__PURE__ */ __name((fileUri) => {
  return fileUri.scheme === "untitled";
}, "isUntitled");
const getCleanPromptName = /* @__PURE__ */ __name((fileUri) => {
  const fileName = basename(fileUri.path);
  if (fileName.endsWith(PROMPT_FILE_EXTENSION)) {
    return basename(fileUri.path, PROMPT_FILE_EXTENSION);
  }
  if (fileName.endsWith(INSTRUCTION_FILE_EXTENSION)) {
    return basename(fileUri.path, INSTRUCTION_FILE_EXTENSION);
  }
  if (fileName === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return basename(fileUri.path, ".md");
  }
  return basename(fileUri.path);
}, "getCleanPromptName");
export {
  CONFIG_KEY,
  COPILOT_CUSTOM_INSTRUCTIONS_FILENAME,
  INSTRUCTIONS_DEFAULT_SOURCE_FOLDER,
  INSTRUCTIONS_LOCATIONS_CONFIG_KEY,
  INSTRUCTION_FILE_EXTENSION,
  PROMPT_DEFAULT_SOURCE_FOLDER,
  PROMPT_FILE_EXTENSION,
  PROMPT_LOCATIONS_CONFIG_KEY,
  getCleanPromptName,
  getPromptFileExtension,
  getPromptFileType,
  isPromptOrInstructionsFile,
  isUntitled
};
//# sourceMappingURL=constants.js.map
