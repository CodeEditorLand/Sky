var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatEntitlement } from "../../../../services/chat/common/chatEntitlementService.js";
import product from "../../../../../platform/product/common/product.js";
import { isObject } from "../../../../../base/common/types.js";
function isNewUser(chatEntitlementService) {
  return !chatEntitlementService.sentiment.installed || // chat not installed
  chatEntitlementService.entitlement === ChatEntitlement.Available;
}
__name(isNewUser, "isNewUser");
function isCompletionsEnabled(configurationService, modeId = "*") {
  const result = configurationService.getValue(product.defaultChatAgent.completionsEnablementSetting);
  if (!isObject(result)) {
    return false;
  }
  if (typeof result[modeId] !== "undefined") {
    return Boolean(result[modeId]);
  }
  return Boolean(result["*"]);
}
__name(isCompletionsEnabled, "isCompletionsEnabled");
export {
  isCompletionsEnabled,
  isNewUser
};
//# sourceMappingURL=chatStatus.js.map
