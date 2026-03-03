var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var ChatSessionStatus;
(function(ChatSessionStatus2) {
  ChatSessionStatus2[ChatSessionStatus2["Failed"] = 0] = "Failed";
  ChatSessionStatus2[ChatSessionStatus2["Completed"] = 1] = "Completed";
  ChatSessionStatus2[ChatSessionStatus2["InProgress"] = 2] = "InProgress";
  ChatSessionStatus2[ChatSessionStatus2["NeedsInput"] = 3] = "NeedsInput";
})(ChatSessionStatus || (ChatSessionStatus = {}));
const localChatSessionType = "local";
const agentOptionId = "agent";
function isSessionInProgressStatus(state) {
  return state === 2 || state === 3;
}
__name(isSessionInProgressStatus, "isSessionInProgressStatus");
function isIChatSessionFileChange2(obj) {
  const candidate = obj;
  return candidate && candidate.uri instanceof URI && typeof candidate.insertions === "number" && typeof candidate.deletions === "number";
}
__name(isIChatSessionFileChange2, "isIChatSessionFileChange2");
const IChatSessionsService = createDecorator("chatSessionsService");
export {
  ChatSessionStatus,
  IChatSessionsService,
  agentOptionId,
  isIChatSessionFileChange2,
  isSessionInProgressStatus,
  localChatSessionType
};
//# sourceMappingURL=chatSessionsService.js.map
