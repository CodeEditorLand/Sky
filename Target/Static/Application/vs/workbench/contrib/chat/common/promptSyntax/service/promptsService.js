import { createDecorator } from "../../../../../../platform/instantiation/common/instantiation.js";
const CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT = "onCustomAgentProvider";
const INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT = "onInstructionsProvider";
const PROMPT_FILE_PROVIDER_ACTIVATION_EVENT = "onPromptFileProvider";
const SKILL_PROVIDER_ACTIVATION_EVENT = "onSkillProvider";
const IPromptsService = createDecorator("IPromptsService");
var PromptsStorage;
(function(PromptsStorage2) {
  PromptsStorage2["local"] = "local";
  PromptsStorage2["user"] = "user";
  PromptsStorage2["extension"] = "extension";
})(PromptsStorage || (PromptsStorage = {}));
var ExtensionAgentSourceType;
(function(ExtensionAgentSourceType2) {
  ExtensionAgentSourceType2["contribution"] = "contribution";
  ExtensionAgentSourceType2["provider"] = "provider";
})(ExtensionAgentSourceType || (ExtensionAgentSourceType = {}));
export {
  CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT,
  ExtensionAgentSourceType,
  INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT,
  IPromptsService,
  PROMPT_FILE_PROVIDER_ACTIVATION_EVENT,
  PromptsStorage,
  SKILL_PROVIDER_ACTIVATION_EVENT
};
//# sourceMappingURL=promptsService.js.map
