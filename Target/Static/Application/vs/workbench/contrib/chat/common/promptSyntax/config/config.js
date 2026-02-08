var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptsType } from "../promptTypes.js";
import { getPromptFileDefaultLocations, PromptFileSource } from "./promptFileLocations.js";
import { PromptsStorage } from "../service/promptsService.js";
var PromptsConfig;
(function(PromptsConfig2) {
  PromptsConfig2.PROMPT_LOCATIONS_KEY = "chat.promptFilesLocations";
  PromptsConfig2.INSTRUCTIONS_LOCATION_KEY = "chat.instructionsFilesLocations";
  PromptsConfig2.MODE_LOCATION_KEY = "chat.modeFilesLocations";
  PromptsConfig2.AGENTS_LOCATION_KEY = "chat.agentFilesLocations";
  PromptsConfig2.SKILLS_LOCATION_KEY = "chat.agentSkillsLocations";
  PromptsConfig2.HOOKS_LOCATION_KEY = "chat.hookFilesLocations";
  PromptsConfig2.PROMPT_FILES_SUGGEST_KEY = "chat.promptFilesRecommendations";
  PromptsConfig2.USE_COPILOT_INSTRUCTION_FILES = "github.copilot.chat.codeGeneration.useInstructionFiles";
  PromptsConfig2.USE_AGENT_MD = "chat.useAgentsMdFile";
  PromptsConfig2.USE_NESTED_AGENT_MD = "chat.useNestedAgentsMdFiles";
  PromptsConfig2.USE_AGENT_SKILLS = "chat.useAgentSkills";
  PromptsConfig2.USE_CHAT_HOOKS = "chat.useChatHooks";
  PromptsConfig2.USE_SKILL_ADHERENCE_PROMPT = "chat.experimental.useSkillAdherencePrompt";
  PromptsConfig2.INCLUDE_APPLYING_INSTRUCTIONS = "chat.includeApplyingInstructions";
  PromptsConfig2.INCLUDE_REFERENCED_INSTRUCTIONS = "chat.includeReferencedInstructions";
  function getLocationsValue(configService, type) {
    const key = getPromptFileLocationsConfigKey(type);
    const configValue = configService.getValue(key);
    if (configValue === void 0 || configValue === null || Array.isArray(configValue)) {
      return void 0;
    }
    if (typeof configValue === "object") {
      const paths = {};
      for (const [path, value] of Object.entries(configValue)) {
        const cleanPath = path.trim();
        const booleanValue = asBoolean(value);
        if (booleanValue !== void 0 && cleanPath) {
          paths[cleanPath] = booleanValue;
        }
      }
      return paths;
    }
    return void 0;
  }
  __name(getLocationsValue, "getLocationsValue");
  PromptsConfig2.getLocationsValue = getLocationsValue;
  function promptSourceFolders(configService, type) {
    const value = getLocationsValue(configService, type);
    const defaultSourceFolders = getPromptFileDefaultLocations(type);
    if (value && typeof value === "object") {
      const paths = [];
      const defaultFolderPathsSet = new Set(defaultSourceFolders.map((f) => f.path));
      for (const defaultFolder of defaultSourceFolders) {
        if (value[defaultFolder.path] !== false) {
          paths.push(defaultFolder);
        }
      }
      for (const [path, enabledValue] of Object.entries(value)) {
        if (enabledValue === false || defaultFolderPathsSet.has(path)) {
          continue;
        }
        const storage = isTildePath(path) ? PromptsStorage.user : PromptsStorage.local;
        paths.push({ path, source: storage === PromptsStorage.local ? PromptFileSource.ConfigPersonal : PromptFileSource.ConfigWorkspace, storage });
      }
      return paths;
    }
    return [];
  }
  __name(promptSourceFolders, "promptSourceFolders");
  PromptsConfig2.promptSourceFolders = promptSourceFolders;
  function getPromptFilesRecommendationsValue(configService, resource) {
    const configValue = configService.getValue(PromptsConfig2.PROMPT_FILES_SUGGEST_KEY, { resource });
    if (!configValue || typeof configValue !== "object" || Array.isArray(configValue)) {
      return void 0;
    }
    const suggestions = {};
    for (const [promptName, value] of Object.entries(configValue)) {
      const cleanPromptName = promptName.trim();
      if (!cleanPromptName) {
        continue;
      }
      if (typeof value === "boolean") {
        suggestions[cleanPromptName] = value;
        continue;
      }
      if (typeof value === "string") {
        const cleanValue = value.trim();
        if (cleanValue) {
          suggestions[cleanPromptName] = cleanValue;
        }
        continue;
      }
      const booleanValue = asBoolean(value);
      if (booleanValue !== void 0) {
        suggestions[cleanPromptName] = booleanValue;
      }
    }
    return Object.keys(suggestions).length > 0 ? suggestions : void 0;
  }
  __name(getPromptFilesRecommendationsValue, "getPromptFilesRecommendationsValue");
  PromptsConfig2.getPromptFilesRecommendationsValue = getPromptFilesRecommendationsValue;
})(PromptsConfig || (PromptsConfig = {}));
function getPromptFileLocationsConfigKey(type) {
  switch (type) {
    case PromptsType.instructions:
      return PromptsConfig.INSTRUCTIONS_LOCATION_KEY;
    case PromptsType.prompt:
      return PromptsConfig.PROMPT_LOCATIONS_KEY;
    case PromptsType.agent:
      return PromptsConfig.AGENTS_LOCATION_KEY;
    case PromptsType.skill:
      return PromptsConfig.SKILLS_LOCATION_KEY;
    case PromptsType.hook:
      return PromptsConfig.HOOKS_LOCATION_KEY;
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPromptFileLocationsConfigKey, "getPromptFileLocationsConfigKey");
function asBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const cleanValue = value.trim().toLowerCase();
    if (cleanValue === "true") {
      return true;
    }
    if (cleanValue === "false") {
      return false;
    }
    return void 0;
  }
  return void 0;
}
__name(asBoolean, "asBoolean");
function isTildePath(path) {
  return path.startsWith("~/");
}
__name(isTildePath, "isTildePath");
export {
  PromptsConfig,
  asBoolean,
  getPromptFileLocationsConfigKey,
  isTildePath
};
//# sourceMappingURL=config.js.map
