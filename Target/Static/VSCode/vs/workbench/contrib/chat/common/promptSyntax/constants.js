import { LanguageFilter } from "../../../../../editor/common/languageSelector.js";
import { COPILOT_CUSTOM_INSTRUCTIONS_FILENAME, PROMPT_FILE_EXTENSION } from "../../../../../platform/prompts/common/constants.js";
const DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-prompt-snippets";
const REUSABLE_PROMPT_FILE_PATTERNS = Object.freeze([
  /**
   * Any file that has the prompt file extension.
   * See {@link PROMPT_FILE_EXTENSION}.
   */
  `**/*${PROMPT_FILE_EXTENSION}`,
  /**
   * Copilot custom instructions file inside a `.github` folder.
   */
  `**/.github/${COPILOT_CUSTOM_INSTRUCTIONS_FILENAME}`
]);
const LANGUAGE_SELECTOR = Object.freeze({
  pattern: `{${REUSABLE_PROMPT_FILE_PATTERNS.join(",")}}`
});
export {
  DOCUMENTATION_URL,
  LANGUAGE_SELECTOR
};
//# sourceMappingURL=constants.js.map
