var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import product from "../../../platform/product/common/product.js";
import { isObject } from "../../../base/common/types.js";
function getCompletionsEnablementSettingName() {
  return product.defaultChatAgent?.completionsEnablementSetting;
}
__name(getCompletionsEnablementSettingName, "getCompletionsEnablementSettingName");
function isCompletionsEnabled(configurationService, modeId = "*") {
  const settingName = getCompletionsEnablementSettingName();
  if (!settingName) {
    return false;
  }
  return isCompletionsEnabledFromObject(configurationService.getValue(settingName), modeId);
}
__name(isCompletionsEnabled, "isCompletionsEnabled");
function isCompletionsEnabledWithTextResourceConfig(configurationService, resource, modeId = "*") {
  const settingName = getCompletionsEnablementSettingName();
  if (!settingName) {
    return false;
  }
  return isCompletionsEnabledFromObject(configurationService.getValue(resource, settingName), modeId);
}
__name(isCompletionsEnabledWithTextResourceConfig, "isCompletionsEnabledWithTextResourceConfig");
function isCompletionsEnabledFromObject(completionsEnablementObject, modeId = "*") {
  if (!isObject(completionsEnablementObject)) {
    return false;
  }
  if (typeof completionsEnablementObject[modeId] !== "undefined") {
    return Boolean(completionsEnablementObject[modeId]);
  }
  return Boolean(completionsEnablementObject["*"]);
}
__name(isCompletionsEnabledFromObject, "isCompletionsEnabledFromObject");
export {
  isCompletionsEnabled,
  isCompletionsEnabledFromObject,
  isCompletionsEnabledWithTextResourceConfig
};
//# sourceMappingURL=completionsEnablement.js.map
