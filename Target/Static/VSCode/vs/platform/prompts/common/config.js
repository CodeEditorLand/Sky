var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ContextKeyExpr } from "../../contextkey/common/contextkey.js";
import { CONFIG_KEY, DEFAULT_SOURCE_FOLDER, LOCATIONS_CONFIG_KEY } from "./constants.js";
var PromptsConfig;
((PromptsConfig2) => {
  PromptsConfig2.KEY = CONFIG_KEY;
  PromptsConfig2.LOCATIONS_KEY = LOCATIONS_CONFIG_KEY;
  PromptsConfig2.enabled = /* @__PURE__ */ __name((configService) => {
    const enabledValue = configService.getValue(CONFIG_KEY);
    return asBoolean(enabledValue) ?? false;
  }, "enabled");
  PromptsConfig2.enabledCtx = ContextKeyExpr.equals(`config.${CONFIG_KEY}`, true);
  PromptsConfig2.getLocationsValue = /* @__PURE__ */ __name((configService) => {
    const configValue = configService.getValue(LOCATIONS_CONFIG_KEY);
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
  }, "getLocationsValue");
  PromptsConfig2.promptSourceFolders = /* @__PURE__ */ __name((configService) => {
    const value = (0, PromptsConfig2.getLocationsValue)(configService);
    if (value && typeof value === "object") {
      const paths = [];
      if (value[DEFAULT_SOURCE_FOLDER] !== false) {
        paths.push(DEFAULT_SOURCE_FOLDER);
      }
      for (const [path, enabled2] of Object.entries(value)) {
        if (enabled2 === false || path === DEFAULT_SOURCE_FOLDER) {
          continue;
        }
        paths.push(path);
      }
      return paths;
    }
    return [];
  }, "promptSourceFolders");
})(PromptsConfig || (PromptsConfig = {}));
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
  PromptsConfig
};
//# sourceMappingURL=config.js.map
