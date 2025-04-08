var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
function isChatViewTitleActionContext(obj) {
  return !!obj && typeof obj.sessionId === "string" && obj.$mid === MarshalledId.ChatViewContext;
}
__name(isChatViewTitleActionContext, "isChatViewTitleActionContext");
export {
  isChatViewTitleActionContext
};
//# sourceMappingURL=chatActions.js.map
