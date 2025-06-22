var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const PROMPT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-prompt-snippets";
const INSTRUCTIONS_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-instructions";
const MODE_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-chat-modes";
const PROMPT_LANGUAGE_ID = "prompt";
const INSTRUCTIONS_LANGUAGE_ID = "instructions";
const MODE_LANGUAGE_ID = "chatmode";
const ALL_PROMPTS_LANGUAGE_SELECTOR = [PROMPT_LANGUAGE_ID, INSTRUCTIONS_LANGUAGE_ID, MODE_LANGUAGE_ID];
function getLanguageIdForPromptsType(type) {
  switch (type) {
    case PromptsType.prompt:
      return PROMPT_LANGUAGE_ID;
    case PromptsType.instructions:
      return INSTRUCTIONS_LANGUAGE_ID;
    case PromptsType.mode:
      return MODE_LANGUAGE_ID;
    default:
      throw new Error(`Unknown prompt type: ${type}`);
  }
}
__name(getLanguageIdForPromptsType, "getLanguageIdForPromptsType");
function getPromptsTypeForLanguageId(languageId) {
  switch (languageId) {
    case PROMPT_LANGUAGE_ID:
      return PromptsType.prompt;
    case INSTRUCTIONS_LANGUAGE_ID:
      return PromptsType.instructions;
    case MODE_LANGUAGE_ID:
      return PromptsType.mode;
    default:
      return void 0;
  }
}
__name(getPromptsTypeForLanguageId, "getPromptsTypeForLanguageId");
var PromptsType;
(function(PromptsType2) {
  PromptsType2["instructions"] = "instructions";
  PromptsType2["prompt"] = "prompt";
  PromptsType2["mode"] = "mode";
})(PromptsType || (PromptsType = {}));
function isValidPromptType(type) {
  return Object.values(PromptsType).includes(type);
}
__name(isValidPromptType, "isValidPromptType");
export {
  ALL_PROMPTS_LANGUAGE_SELECTOR,
  INSTRUCTIONS_DOCUMENTATION_URL,
  INSTRUCTIONS_LANGUAGE_ID,
  MODE_DOCUMENTATION_URL,
  MODE_LANGUAGE_ID,
  PROMPT_DOCUMENTATION_URL,
  PROMPT_LANGUAGE_ID,
  PromptsType,
  getLanguageIdForPromptsType,
  getPromptsTypeForLanguageId,
  isValidPromptType
};
//# sourceMappingURL=promptTypes.js.map
