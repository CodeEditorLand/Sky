var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename } from "../../../../../../base/common/path.js";
import { PromptsType } from "../promptTypes.js";
const PROMPT_FILE_EXTENSION = ".prompt.md";
const INSTRUCTION_FILE_EXTENSION = ".instructions.md";
const MODE_FILE_EXTENSION = ".chatmode.md";
const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
const PROMPT_DEFAULT_SOURCE_FOLDER = ".github/prompts";
const INSTRUCTIONS_DEFAULT_SOURCE_FOLDER = ".github/instructions";
const MODE_DEFAULT_SOURCE_FOLDER = ".github/chatmodes";
function getPromptFileType(fileUri) {
  const filename = basename(fileUri.path);
  if (filename.endsWith(PROMPT_FILE_EXTENSION)) {
    return PromptsType.prompt;
  }
  if (filename.endsWith(INSTRUCTION_FILE_EXTENSION) || filename === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return PromptsType.instructions;
  }
  if (filename.endsWith(MODE_FILE_EXTENSION)) {
    return PromptsType.mode;
  }
  return void 0;
}
__name(getPromptFileType, "getPromptFileType");
function isPromptOrInstructionsFile(fileUri) {
  return getPromptFileType(fileUri) !== void 0;
}
__name(isPromptOrInstructionsFile, "isPromptOrInstructionsFile");
function getPromptFileExtension(type) {
  switch (type) {
    case PromptsType.instructions:
      return INSTRUCTION_FILE_EXTENSION;
    case PromptsType.prompt:
      return PROMPT_FILE_EXTENSION;
    case PromptsType.mode:
      return MODE_FILE_EXTENSION;
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPromptFileExtension, "getPromptFileExtension");
function getPromptFileDefaultLocation(type) {
  switch (type) {
    case PromptsType.instructions:
      return INSTRUCTIONS_DEFAULT_SOURCE_FOLDER;
    case PromptsType.prompt:
      return PROMPT_DEFAULT_SOURCE_FOLDER;
    case PromptsType.mode:
      return MODE_DEFAULT_SOURCE_FOLDER;
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPromptFileDefaultLocation, "getPromptFileDefaultLocation");
function getCleanPromptName(fileUri) {
  const fileName = basename(fileUri.path);
  const extensions = [
    PROMPT_FILE_EXTENSION,
    INSTRUCTION_FILE_EXTENSION,
    MODE_FILE_EXTENSION
  ];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return basename(fileUri.path, ext);
    }
  }
  if (fileName === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) {
    return basename(fileUri.path, ".md");
  }
  return basename(fileUri.path);
}
__name(getCleanPromptName, "getCleanPromptName");
export {
  COPILOT_CUSTOM_INSTRUCTIONS_FILENAME,
  INSTRUCTIONS_DEFAULT_SOURCE_FOLDER,
  INSTRUCTION_FILE_EXTENSION,
  MODE_DEFAULT_SOURCE_FOLDER,
  MODE_FILE_EXTENSION,
  PROMPT_DEFAULT_SOURCE_FOLDER,
  PROMPT_FILE_EXTENSION,
  getCleanPromptName,
  getPromptFileDefaultLocation,
  getPromptFileExtension,
  getPromptFileType,
  isPromptOrInstructionsFile
};
//# sourceMappingURL=promptFileLocations.js.map
