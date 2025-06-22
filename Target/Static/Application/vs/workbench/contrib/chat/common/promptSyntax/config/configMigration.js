var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../base/common/assert.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import { asBoolean, PromptsConfig } from "./config.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
let ConfigMigration = class ConfigMigration2 {
  static {
    __name(this, "ConfigMigration");
  }
  constructor(logService, configService) {
    this.logService = logService;
    this.configService = configService;
    this.migrateConfig().catch((error) => {
      this.logService.warn("failed to migrate config setting value.", error);
    });
  }
  /**
   * The main function that implements the migration logic.
   */
  async migrateConfig() {
    const value = await this.configService.getValue(PromptsConfig.KEY);
    if (value === void 0 || value === null) {
      return;
    }
    if (typeof value === "boolean" || asBoolean(value) !== void 0) {
      return;
    }
    if (Array.isArray(value)) {
      const locationsValue = {};
      for (const filePath of value) {
        if (typeof filePath !== "string") {
          continue;
        }
        const trimmedValue = filePath.trim();
        if (!trimmedValue) {
          continue;
        }
        locationsValue[trimmedValue] = true;
      }
      await this.configService.updateValue(PromptsConfig.KEY, true);
      await this.configService.updateValue(PromptsConfig.PROMPT_LOCATIONS_KEY, locationsValue);
      return;
    }
    if (typeof value === "object") {
      assert(value !== null, "Object value must not be a null.");
      const locationsValue = {};
      for (const [location, enabled] of Object.entries(value)) {
        if (typeof enabled !== "boolean" || asBoolean(enabled) === void 0) {
          continue;
        }
        const trimmedValue = location.trim();
        if (!trimmedValue) {
          continue;
        }
        locationsValue[trimmedValue] = enabled;
      }
      await this.configService.updateValue(PromptsConfig.KEY, true);
      await this.configService.updateValue(PromptsConfig.PROMPT_LOCATIONS_KEY, locationsValue);
      return;
    }
    if (typeof value === "string") {
      assert(asBoolean(value) === void 0, `String value must not be a boolean, got '${value}'.`);
      await this.configService.updateValue(PromptsConfig.KEY, true);
      await this.configService.updateValue(PromptsConfig.PROMPT_LOCATIONS_KEY, { [value]: true });
      return;
    }
  }
};
ConfigMigration = __decorate([
  __param(0, ILogService),
  __param(1, IConfigurationService)
], ConfigMigration);
export {
  ConfigMigration
};
//# sourceMappingURL=configMigration.js.map
