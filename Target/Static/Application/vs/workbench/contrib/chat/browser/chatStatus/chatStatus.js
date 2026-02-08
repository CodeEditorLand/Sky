var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ChatEntitlement } from "../../../../services/chat/common/chatEntitlementService.js";
function isNewUser(chatEntitlementService) {
  return !chatEntitlementService.sentiment.installed || // chat not installed
  chatEntitlementService.entitlement === ChatEntitlement.Available;
}
__name(isNewUser, "isNewUser");
export {
  isNewUser
};
//# sourceMappingURL=chatStatus.js.map
