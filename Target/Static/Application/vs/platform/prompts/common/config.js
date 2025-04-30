var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../contextkey/common/contextkey.js";
import { CONFIG_KEY, PROMPT_DEFAULT_SOURCE_FOLDER, INSTRUCTIONS_LOCATIONS_CONFIG_KEY, PROMPT_LOCATIONS_CONFIG_KEY, INSTRUCTIONS_DEFAULT_SOURCE_FOLDER } from "./constants.js";
var PromptsConfig;
(function(PromptsConfig2) {
  PromptsConfig2.KEY = CONFIG_KEY;
  PromptsConfig2.PROMPT_LOCATIONS_KEY = PROMPT_LOCATIONS_CONFIG_KEY;
  PromptsConfig2.INSTRUCTIONS_LOCATION_KEY = INSTRUCTIONS_LOCATIONS_CONFIG_KEY;
  PromptsConfig2.enabled = (configService) => {
    const enabledValue = configService.getValue(CONFIG_KEY);
    return asBoolean(enabledValue) ?? false;
  };
  PromptsConfig2.enabledCtx = ContextKeyExpr.equals(`config.${CONFIG_KEY}`, true);
  PromptsConfig2.getLocationsValue = (configService, type) => {
    const key = type === "instructions" ? INSTRUCTIONS_LOCATIONS_CONFIG_KEY : PROMPT_LOCATIONS_CONFIG_KEY;
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
  };
  PromptsConfig2.promptSourceFolders = (configService, type) => {
    const value = PromptsConfig2.getLocationsValue(configService, type);
    const defaultSourceFolder = type === "instructions" ? INSTRUCTIONS_DEFAULT_SOURCE_FOLDER : PROMPT_DEFAULT_SOURCE_FOLDER;
    if (value && typeof value === "object") {
      const paths = [];
      if (value[defaultSourceFolder] !== false) {
        paths.push(defaultSourceFolder);
      }
      for (const [path, enabled] of Object.entries(value)) {
        if (enabled === false || path === defaultSourceFolder) {
          continue;
        }
        paths.push(path);
      }
      return paths;
    }
    return [];
  };
})(PromptsConfig || (PromptsConfig = {}));
const asBoolean = /* @__PURE__ */ __name((value) => {
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
}, "asBoolean");
export {
  PromptsConfig,
  asBoolean
};
//# sourceMappingURL=config.js.map
