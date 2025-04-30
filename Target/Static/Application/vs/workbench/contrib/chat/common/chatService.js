var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { Range } from "../../../../editor/common/core/range.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
var ChatErrorLevel;
(function(ChatErrorLevel2) {
  ChatErrorLevel2[ChatErrorLevel2["Info"] = 0] = "Info";
  ChatErrorLevel2[ChatErrorLevel2["Warning"] = 1] = "Warning";
  ChatErrorLevel2[ChatErrorLevel2["Error"] = 2] = "Error";
})(ChatErrorLevel || (ChatErrorLevel = {}));
function isIDocumentContext(obj) {
  return !!obj && typeof obj === "object" && "uri" in obj && obj.uri instanceof URI && "version" in obj && typeof obj.version === "number" && "ranges" in obj && Array.isArray(obj.ranges) && obj.ranges.every(Range.isIRange);
}
__name(isIDocumentContext, "isIDocumentContext");
function isIUsedContext(obj) {
  return !!obj && typeof obj === "object" && "documents" in obj && Array.isArray(obj.documents) && obj.documents.every(isIDocumentContext);
}
__name(isIUsedContext, "isIUsedContext");
var ChatResponseReferencePartStatusKind;
(function(ChatResponseReferencePartStatusKind2) {
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Complete"] = 1] = "Complete";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Partial"] = 2] = "Partial";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Omitted"] = 3] = "Omitted";
})(ChatResponseReferencePartStatusKind || (ChatResponseReferencePartStatusKind = {}));
var ChatAgentVoteDirection;
(function(ChatAgentVoteDirection2) {
  ChatAgentVoteDirection2[ChatAgentVoteDirection2["Down"] = 0] = "Down";
  ChatAgentVoteDirection2[ChatAgentVoteDirection2["Up"] = 1] = "Up";
})(ChatAgentVoteDirection || (ChatAgentVoteDirection = {}));
var ChatAgentVoteDownReason;
(function(ChatAgentVoteDownReason2) {
  ChatAgentVoteDownReason2["IncorrectCode"] = "incorrectCode";
  ChatAgentVoteDownReason2["DidNotFollowInstructions"] = "didNotFollowInstructions";
  ChatAgentVoteDownReason2["IncompleteCode"] = "incompleteCode";
  ChatAgentVoteDownReason2["MissingContext"] = "missingContext";
  ChatAgentVoteDownReason2["PoorlyWrittenOrFormatted"] = "poorlyWrittenOrFormatted";
  ChatAgentVoteDownReason2["RefusedAValidRequest"] = "refusedAValidRequest";
  ChatAgentVoteDownReason2["OffensiveOrUnsafe"] = "offensiveOrUnsafe";
  ChatAgentVoteDownReason2["Other"] = "other";
  ChatAgentVoteDownReason2["WillReportIssue"] = "willReportIssue";
})(ChatAgentVoteDownReason || (ChatAgentVoteDownReason = {}));
var ChatCopyKind;
(function(ChatCopyKind2) {
  ChatCopyKind2[ChatCopyKind2["Action"] = 1] = "Action";
  ChatCopyKind2[ChatCopyKind2["Toolbar"] = 2] = "Toolbar";
})(ChatCopyKind || (ChatCopyKind = {}));
const IChatService = createDecorator("IChatService");
const KEYWORD_ACTIVIATION_SETTING_ID = "accessibility.voice.keywordActivation";
export {
  ChatAgentVoteDirection,
  ChatAgentVoteDownReason,
  ChatCopyKind,
  ChatErrorLevel,
  ChatResponseReferencePartStatusKind,
  IChatService,
  KEYWORD_ACTIVIATION_SETTING_ID,
  isIDocumentContext,
  isIUsedContext
};
//# sourceMappingURL=chatService.js.map
