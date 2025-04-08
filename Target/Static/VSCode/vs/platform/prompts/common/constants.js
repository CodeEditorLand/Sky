var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { assert } from "../../../base/common/assert.js";
import { basename } from "../../../base/common/path.js";
const PROMPT_FILE_EXTENSION = ".prompt.md";
const COPILOT_CUSTOM_INSTRUCTIONS_FILENAME = "copilot-instructions.md";
const CONFIG_KEY = "chat.promptFiles";
const LOCATIONS_CONFIG_KEY = "chat.promptFilesLocations";
const DEFAULT_SOURCE_FOLDER = ".github/prompts";
const isPromptFile = /* @__PURE__ */ __name((fileUri) => {
  const filename = basename(fileUri.path);
  const hasPromptFileExtension = filename.endsWith(PROMPT_FILE_EXTENSION);
  const isCustomInstructionsFile = filename === COPILOT_CUSTOM_INSTRUCTIONS_FILENAME;
  return hasPromptFileExtension || isCustomInstructionsFile;
}, "isPromptFile");
const getCleanPromptName = /* @__PURE__ */ __name((fileUri) => {
  assert(
    isPromptFile(fileUri),
    `Provided path '${fileUri.fsPath}' is not a prompt file.`
  );
  const fileExtension = fileUri.path.endsWith(COPILOT_CUSTOM_INSTRUCTIONS_FILENAME) ? ".md" : PROMPT_FILE_EXTENSION;
  return basename(fileUri.path, fileExtension);
}, "getCleanPromptName");
export {
  CONFIG_KEY,
  COPILOT_CUSTOM_INSTRUCTIONS_FILENAME,
  DEFAULT_SOURCE_FOLDER,
  LOCATIONS_CONFIG_KEY,
  PROMPT_FILE_EXTENSION,
  getCleanPromptName,
  isPromptFile
};
//# sourceMappingURL=constants.js.map
