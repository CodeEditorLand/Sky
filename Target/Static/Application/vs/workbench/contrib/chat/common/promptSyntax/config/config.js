var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { PromptsType } from "../promptTypes.js";
import { getPromptFileDefaultLocation } from "./promptFileLocations.js";
var PromptsConfig;
(function(PromptsConfig2) {
  PromptsConfig2.KEY = "chat.promptFiles";
  PromptsConfig2.PROMPT_LOCATIONS_KEY = "chat.promptFilesLocations";
  PromptsConfig2.INSTRUCTIONS_LOCATION_KEY = "chat.instructionsFilesLocations";
  PromptsConfig2.MODE_LOCATION_KEY = "chat.modeFilesLocations";
  PromptsConfig2.USE_COPILOT_INSTRUCTION_FILES = "github.copilot.chat.codeGeneration.useInstructionFiles";
  PromptsConfig2.COPILOT_INSTRUCTIONS = "github.copilot.chat.codeGeneration.instructions";
  function enabled(configService) {
    const enabledValue = configService.getValue(PromptsConfig2.KEY);
    return asBoolean(enabledValue) ?? false;
  }
  __name(enabled, "enabled");
  PromptsConfig2.enabled = enabled;
  PromptsConfig2.enabledCtx = ContextKeyExpr.equals(`config.${PromptsConfig2.KEY}`, true);
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
    const defaultSourceFolder = getPromptFileDefaultLocation(type);
    if (value && typeof value === "object") {
      const paths = [];
      if (value[defaultSourceFolder] !== false) {
        paths.push(defaultSourceFolder);
      }
      for (const [path, enabledValue] of Object.entries(value)) {
        if (enabledValue === false || path === defaultSourceFolder) {
          continue;
        }
        paths.push(path);
      }
      return paths;
    }
    return [];
  }
  __name(promptSourceFolders, "promptSourceFolders");
  PromptsConfig2.promptSourceFolders = promptSourceFolders;
})(PromptsConfig || (PromptsConfig = {}));
function getPromptFileLocationsConfigKey(type) {
  switch (type) {
    case PromptsType.instructions:
      return PromptsConfig.INSTRUCTIONS_LOCATION_KEY;
    case PromptsType.prompt:
      return PromptsConfig.PROMPT_LOCATIONS_KEY;
    case PromptsType.mode:
      return PromptsConfig.MODE_LOCATION_KEY;
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
export {
  PromptsConfig,
  asBoolean,
  getPromptFileLocationsConfigKey
};
//# sourceMappingURL=config.js.map
