import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var ChatDebugLogLevel;
(function(ChatDebugLogLevel2) {
  ChatDebugLogLevel2[ChatDebugLogLevel2["Trace"] = 0] = "Trace";
  ChatDebugLogLevel2[ChatDebugLogLevel2["Info"] = 1] = "Info";
  ChatDebugLogLevel2[ChatDebugLogLevel2["Warning"] = 2] = "Warning";
  ChatDebugLogLevel2[ChatDebugLogLevel2["Error"] = 3] = "Error";
})(ChatDebugLogLevel || (ChatDebugLogLevel = {}));
const IChatDebugService = createDecorator("chatDebugService");
export {
  ChatDebugLogLevel,
  IChatDebugService
};
//# sourceMappingURL=chatDebugService.js.map
