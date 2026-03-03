var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import { Extensions } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ConfigurationService as BaseConfigurationService } from "../../../../platform/configuration/common/configurationService.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING } from "../../../../workbench/services/configuration/common/configuration.js";
import "../../../../workbench/services/configuration/browser/configurationService.js";
class ConfigurationService extends BaseConfigurationService {
  static {
    __name(this, "ConfigurationService");
  }
  constructor() {
    super(...arguments);
    this.restrictedSettings = { default: [] };
    this.onDidChangeRestrictedSettings = Event.None;
  }
  async whenRemoteConfigurationLoaded() {
  }
  isSettingAppliedForAllProfiles(key) {
    const scope = Registry.as(Extensions.Configuration).getConfigurationProperties()[key]?.scope;
    if (scope && APPLICATION_SCOPES.includes(scope)) {
      return true;
    }
    const allProfilesSettings = this.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
    return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key);
  }
}
export {
  ConfigurationService
};
//# sourceMappingURL=configurationService.js.map
