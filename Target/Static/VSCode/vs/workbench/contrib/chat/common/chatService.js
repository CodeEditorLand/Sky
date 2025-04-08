var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { ISelection } from "../../../../editor/common/core/selection.js";
import { Command, Location, TextEdit } from "../../../../editor/common/languages.js";
import { FileType } from "../../../../platform/files/common/files.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ICellEditOperation } from "../../notebook/common/notebookCommon.js";
import { IWorkspaceSymbol } from "../../search/common/search.js";
import { IChatAgentCommand, IChatAgentData, IChatAgentResult } from "./chatAgents.js";
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IChatRequestVariableEntry, IChatResponseModel, IExportableChatData, ISerializableChatData } from "./chatModel.js";
import { IParsedChatRequest } from "./chatParserTypes.js";
import { IChatParserContext } from "./chatRequestParser.js";
import { IChatRequestVariableValue } from "./chatVariables.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
import { IPreparedToolInvocation, IToolConfirmationMessages, IToolResult } from "./languageModelToolsService.js";
var ChatErrorLevel = /* @__PURE__ */ ((ChatErrorLevel2) => {
  ChatErrorLevel2[ChatErrorLevel2["Info"] = 0] = "Info";
  ChatErrorLevel2[ChatErrorLevel2["Warning"] = 1] = "Warning";
  ChatErrorLevel2[ChatErrorLevel2["Error"] = 2] = "Error";
  return ChatErrorLevel2;
})(ChatErrorLevel || {});
function isIDocumentContext(obj) {
  return !!obj && typeof obj === "object" && "uri" in obj && obj.uri instanceof URI && "version" in obj && typeof obj.version === "number" && "ranges" in obj && Array.isArray(obj.ranges) && obj.ranges.every(Range.isIRange);
}
__name(isIDocumentContext, "isIDocumentContext");
function isIUsedContext(obj) {
  return !!obj && typeof obj === "object" && "documents" in obj && Array.isArray(obj.documents) && obj.documents.every(isIDocumentContext);
}
__name(isIUsedContext, "isIUsedContext");
var ChatResponseReferencePartStatusKind = /* @__PURE__ */ ((ChatResponseReferencePartStatusKind2) => {
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Complete"] = 1] = "Complete";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Partial"] = 2] = "Partial";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Omitted"] = 3] = "Omitted";
  return ChatResponseReferencePartStatusKind2;
})(ChatResponseReferencePartStatusKind || {});
var ChatAgentVoteDirection = /* @__PURE__ */ ((ChatAgentVoteDirection2) => {
  ChatAgentVoteDirection2[ChatAgentVoteDirection2["Down"] = 0] = "Down";
  ChatAgentVoteDirection2[ChatAgentVoteDirection2["Up"] = 1] = "Up";
  return ChatAgentVoteDirection2;
})(ChatAgentVoteDirection || {});
var ChatAgentVoteDownReason = /* @__PURE__ */ ((ChatAgentVoteDownReason2) => {
  ChatAgentVoteDownReason2["IncorrectCode"] = "incorrectCode";
  ChatAgentVoteDownReason2["DidNotFollowInstructions"] = "didNotFollowInstructions";
  ChatAgentVoteDownReason2["IncompleteCode"] = "incompleteCode";
  ChatAgentVoteDownReason2["MissingContext"] = "missingContext";
  ChatAgentVoteDownReason2["PoorlyWrittenOrFormatted"] = "poorlyWrittenOrFormatted";
  ChatAgentVoteDownReason2["RefusedAValidRequest"] = "refusedAValidRequest";
  ChatAgentVoteDownReason2["OffensiveOrUnsafe"] = "offensiveOrUnsafe";
  ChatAgentVoteDownReason2["Other"] = "other";
  ChatAgentVoteDownReason2["WillReportIssue"] = "willReportIssue";
  return ChatAgentVoteDownReason2;
})(ChatAgentVoteDownReason || {});
var ChatCopyKind = /* @__PURE__ */ ((ChatCopyKind2) => {
  ChatCopyKind2[ChatCopyKind2["Action"] = 1] = "Action";
  ChatCopyKind2[ChatCopyKind2["Toolbar"] = 2] = "Toolbar";
  return ChatCopyKind2;
})(ChatCopyKind || {});
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
