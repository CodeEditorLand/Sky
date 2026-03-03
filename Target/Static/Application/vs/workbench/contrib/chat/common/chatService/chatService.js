var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, autorunSelfDisposable } from "../../../../../base/common/observable.js";
import { hasKey } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
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
function isChatContentVariableReference(obj) {
  return !!obj && typeof obj === "object" && typeof obj.variableName === "string";
}
__name(isChatContentVariableReference, "isChatContentVariableReference");
var ChatResponseReferencePartStatusKind;
(function(ChatResponseReferencePartStatusKind2) {
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Complete"] = 1] = "Complete";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Partial"] = 2] = "Partial";
  ChatResponseReferencePartStatusKind2[ChatResponseReferencePartStatusKind2["Omitted"] = 3] = "Omitted";
})(ChatResponseReferencePartStatusKind || (ChatResponseReferencePartStatusKind = {}));
var ChatResponseClearToPreviousToolInvocationReason;
(function(ChatResponseClearToPreviousToolInvocationReason2) {
  ChatResponseClearToPreviousToolInvocationReason2[ChatResponseClearToPreviousToolInvocationReason2["NoReason"] = 0] = "NoReason";
  ChatResponseClearToPreviousToolInvocationReason2[ChatResponseClearToPreviousToolInvocationReason2["FilteredContentRetry"] = 1] = "FilteredContentRetry";
  ChatResponseClearToPreviousToolInvocationReason2[ChatResponseClearToPreviousToolInvocationReason2["CopyrightContentRetry"] = 2] = "CopyrightContentRetry";
})(ChatResponseClearToPreviousToolInvocationReason || (ChatResponseClearToPreviousToolInvocationReason = {}));
class ChatMultiDiffData {
  static {
    __name(this, "ChatMultiDiffData");
  }
  constructor(opts) {
    this.kind = "multiDiffData";
    this.readOnly = opts.readOnly;
    this.collapsed = opts.collapsed;
    this.multiDiffData = opts.multiDiffData;
  }
  toJSON() {
    return {
      kind: this.kind,
      multiDiffData: hasKey(this.multiDiffData, { title: true }) ? this.multiDiffData : this.multiDiffData.get(),
      collapsed: this.collapsed,
      readOnly: this.readOnly
    };
  }
}
var ElicitationState;
(function(ElicitationState2) {
  ElicitationState2["Pending"] = "pending";
  ElicitationState2["Accepted"] = "accepted";
  ElicitationState2["Rejected"] = "rejected";
})(ElicitationState || (ElicitationState = {}));
function isLegacyChatTerminalToolInvocationData(data) {
  return !!data && typeof data === "object" && "command" in data && "language" in data;
}
__name(isLegacyChatTerminalToolInvocationData, "isLegacyChatTerminalToolInvocationData");
var ToolConfirmKind;
(function(ToolConfirmKind2) {
  ToolConfirmKind2[ToolConfirmKind2["Denied"] = 0] = "Denied";
  ToolConfirmKind2[ToolConfirmKind2["ConfirmationNotNeeded"] = 1] = "ConfirmationNotNeeded";
  ToolConfirmKind2[ToolConfirmKind2["Setting"] = 2] = "Setting";
  ToolConfirmKind2[ToolConfirmKind2["LmServicePerTool"] = 3] = "LmServicePerTool";
  ToolConfirmKind2[ToolConfirmKind2["UserAction"] = 4] = "UserAction";
  ToolConfirmKind2[ToolConfirmKind2["Skipped"] = 5] = "Skipped";
})(ToolConfirmKind || (ToolConfirmKind = {}));
var IChatToolInvocation;
(function(IChatToolInvocation2) {
  let StateKind;
  (function(StateKind2) {
    StateKind2[StateKind2["Streaming"] = 0] = "Streaming";
    StateKind2[StateKind2["WaitingForConfirmation"] = 1] = "WaitingForConfirmation";
    StateKind2[StateKind2["Executing"] = 2] = "Executing";
    StateKind2[StateKind2["WaitingForPostApproval"] = 3] = "WaitingForPostApproval";
    StateKind2[StateKind2["Completed"] = 4] = "Completed";
    StateKind2[StateKind2["Cancelled"] = 5] = "Cancelled";
  })(StateKind = IChatToolInvocation2.StateKind || (IChatToolInvocation2.StateKind = {}));
  function executionConfirmedOrDenied(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      if (invocation.isConfirmed === void 0 || typeof invocation.isConfirmed === "boolean") {
        return {
          type: invocation.isConfirmed ? 4 : 0
          /* ToolConfirmKind.Denied */
        };
      }
      return invocation.isConfirmed;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0 || state.type === 1) {
      return void 0;
    }
    if (state.type === 5) {
      return { type: state.reason };
    }
    return state.confirmed;
  }
  __name(executionConfirmedOrDenied, "executionConfirmedOrDenied");
  IChatToolInvocation2.executionConfirmedOrDenied = executionConfirmedOrDenied;
  function awaitConfirmation(invocation, token) {
    const reason = executionConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve({
            type: 0
            /* ToolConfirmKind.Denied */
          });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = executionConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  __name(awaitConfirmation, "awaitConfirmation");
  IChatToolInvocation2.awaitConfirmation = awaitConfirmation;
  function postApprovalConfirmedOrDenied(invocation, reader) {
    const state = invocation.state.read(reader);
    if (state.type === 4) {
      return state.postConfirmed || {
        type: 1
        /* ToolConfirmKind.ConfirmationNotNeeded */
      };
    }
    if (state.type === 5) {
      return { type: state.reason };
    }
    return void 0;
  }
  __name(postApprovalConfirmedOrDenied, "postApprovalConfirmedOrDenied");
  function confirmWith(invocation, reason) {
    const state = invocation?.state.get();
    if (state?.type === 1 || state?.type === 3) {
      state.confirm(reason);
      return true;
    }
    return false;
  }
  __name(confirmWith, "confirmWith");
  IChatToolInvocation2.confirmWith = confirmWith;
  function awaitPostConfirmation(invocation, token) {
    const reason = postApprovalConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve({
            type: 0
            /* ToolConfirmKind.Denied */
          });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = postApprovalConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  __name(awaitPostConfirmation, "awaitPostConfirmation");
  IChatToolInvocation2.awaitPostConfirmation = awaitPostConfirmation;
  function resultDetails(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return invocation.resultDetails;
    }
    const state = invocation.state.read(reader);
    if (state.type === 4 || state.type === 3) {
      return state.resultDetails;
    }
    return void 0;
  }
  __name(resultDetails, "resultDetails");
  IChatToolInvocation2.resultDetails = resultDetails;
  function isComplete(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return true;
    }
    const state = invocation.state.read(reader);
    return state.type === 4 || state.type === 5;
  }
  __name(isComplete, "isComplete");
  IChatToolInvocation2.isComplete = isComplete;
  function isStreaming(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return false;
    }
    const state = invocation.state.read(reader);
    return state.type === 0;
  }
  __name(isStreaming, "isStreaming");
  IChatToolInvocation2.isStreaming = isStreaming;
  function getParameters(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return void 0;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0) {
      return void 0;
    }
    return state.parameters;
  }
  __name(getParameters, "getParameters");
  IChatToolInvocation2.getParameters = getParameters;
  function getConfirmationMessages(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return void 0;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0) {
      return void 0;
    }
    return state.confirmationMessages;
  }
  __name(getConfirmationMessages, "getConfirmationMessages");
  IChatToolInvocation2.getConfirmationMessages = getConfirmationMessages;
})(IChatToolInvocation || (IChatToolInvocation = {}));
class ChatMcpServersStarting {
  static {
    __name(this, "ChatMcpServersStarting");
  }
  get isEmpty() {
    const s = this.state.get();
    return !s.working && s.serversRequiringInteraction.length === 0;
  }
  constructor(state) {
    this.state = state;
    this.kind = "mcpServersStarting";
    this.didStartServerIds = [];
  }
  wait() {
    return new Promise((resolve) => {
      autorunSelfDisposable((reader) => {
        const s = this.state.read(reader);
        if (!s.working) {
          reader.dispose();
          resolve(s);
        }
      });
    });
  }
  toJSON() {
    return { kind: "mcpServersStarting", didStartServerIds: this.didStartServerIds };
  }
}
function isChatFollowup(obj) {
  return !!obj && obj.kind === "reply" && typeof obj.message === "string" && typeof obj.agentId === "string";
}
__name(isChatFollowup, "isChatFollowup");
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
function convertLegacyChatSessionTiming(timing) {
  if (hasKey(timing, { created: true })) {
    return timing;
  }
  return {
    created: timing.startTime,
    lastRequestStarted: timing.startTime,
    lastRequestEnded: timing.endTime
  };
}
__name(convertLegacyChatSessionTiming, "convertLegacyChatSessionTiming");
var ResponseModelState;
(function(ResponseModelState2) {
  ResponseModelState2[ResponseModelState2["Pending"] = 0] = "Pending";
  ResponseModelState2[ResponseModelState2["Complete"] = 1] = "Complete";
  ResponseModelState2[ResponseModelState2["Cancelled"] = 2] = "Cancelled";
  ResponseModelState2[ResponseModelState2["Failed"] = 3] = "Failed";
  ResponseModelState2[ResponseModelState2["NeedsInput"] = 4] = "NeedsInput";
})(ResponseModelState || (ResponseModelState = {}));
var ChatSendResult;
(function(ChatSendResult2) {
  function isSent(result) {
    return result.kind === "sent";
  }
  __name(isSent, "isSent");
  ChatSendResult2.isSent = isSent;
  function isRejected(result) {
    return result.kind === "rejected";
  }
  __name(isRejected, "isRejected");
  ChatSendResult2.isRejected = isRejected;
  function isQueued(result) {
    return result.kind === "queued";
  }
  __name(isQueued, "isQueued");
  ChatSendResult2.isQueued = isQueued;
  function assertSent(result) {
    if (result.kind !== "sent") {
      throw new Error(`Expected ChatSendResult to be 'sent', but was '${result.kind}'`);
    }
  }
  __name(assertSent, "assertSent");
  ChatSendResult2.assertSent = assertSent;
})(ChatSendResult || (ChatSendResult = {}));
var ChatRequestQueueKind;
(function(ChatRequestQueueKind2) {
  ChatRequestQueueKind2["Queued"] = "queued";
  ChatRequestQueueKind2["Steering"] = "steering";
})(ChatRequestQueueKind || (ChatRequestQueueKind = {}));
const IChatService = createDecorator("IChatService");
const KEYWORD_ACTIVIATION_SETTING_ID = "accessibility.voice.keywordActivation";
const ChatStopCancellationNoopEventName = "chat.stopCancellationNoop";
const ChatPendingRequestChangeEventName = "chat.pendingRequestChange";
export {
  ChatAgentVoteDirection,
  ChatAgentVoteDownReason,
  ChatCopyKind,
  ChatErrorLevel,
  ChatMcpServersStarting,
  ChatMultiDiffData,
  ChatPendingRequestChangeEventName,
  ChatRequestQueueKind,
  ChatResponseClearToPreviousToolInvocationReason,
  ChatResponseReferencePartStatusKind,
  ChatSendResult,
  ChatStopCancellationNoopEventName,
  ElicitationState,
  IChatService,
  IChatToolInvocation,
  KEYWORD_ACTIVIATION_SETTING_ID,
  ResponseModelState,
  ToolConfirmKind,
  convertLegacyChatSessionTiming,
  isChatContentVariableReference,
  isChatFollowup,
  isIDocumentContext,
  isIUsedContext,
  isLegacyChatTerminalToolInvocationData
};
//# sourceMappingURL=chatService.js.map
