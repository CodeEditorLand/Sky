var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const PROMPT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-prompt-snippets";
const INSTRUCTIONS_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-instructions";
const AGENT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-chat-modes";
const SKILL_DOCUMENTATION_URL = "https://aka.ms/vscode-agent-skills";
const PROMPT_LANGUAGE_ID = "prompt";
const INSTRUCTIONS_LANGUAGE_ID = "instructions";
const AGENT_LANGUAGE_ID = "chatagent";
const SKILL_LANGUAGE_ID = "skill";
const ALL_PROMPTS_LANGUAGE_SELECTOR = [PROMPT_LANGUAGE_ID, INSTRUCTIONS_LANGUAGE_ID, AGENT_LANGUAGE_ID, SKILL_LANGUAGE_ID];
function getLanguageIdForPromptsType(type) {
  switch (type) {
    case PromptsType.prompt:
      return PROMPT_LANGUAGE_ID;
    case PromptsType.instructions:
      return INSTRUCTIONS_LANGUAGE_ID;
    case PromptsType.agent:
      return AGENT_LANGUAGE_ID;
    case PromptsType.skill:
      return SKILL_LANGUAGE_ID;
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
    case AGENT_LANGUAGE_ID:
      return PromptsType.agent;
    case SKILL_LANGUAGE_ID:
      return PromptsType.skill;
    default:
      return void 0;
  }
}
__name(getPromptsTypeForLanguageId, "getPromptsTypeForLanguageId");
var PromptsType;
(function(PromptsType2) {
  PromptsType2["instructions"] = "instructions";
  PromptsType2["prompt"] = "prompt";
  PromptsType2["agent"] = "agent";
  PromptsType2["skill"] = "skill";
})(PromptsType || (PromptsType = {}));
function isValidPromptType(type) {
  return Object.values(PromptsType).includes(type);
}
__name(isValidPromptType, "isValidPromptType");
export {
  AGENT_DOCUMENTATION_URL,
  AGENT_LANGUAGE_ID,
  ALL_PROMPTS_LANGUAGE_SELECTOR,
  INSTRUCTIONS_DOCUMENTATION_URL,
  INSTRUCTIONS_LANGUAGE_ID,
  PROMPT_DOCUMENTATION_URL,
  PROMPT_LANGUAGE_ID,
  PromptsType,
  SKILL_DOCUMENTATION_URL,
  SKILL_LANGUAGE_ID,
  getLanguageIdForPromptsType,
  getPromptsTypeForLanguageId,
  isValidPromptType
};
//# sourceMappingURL=promptTypes.js.map
