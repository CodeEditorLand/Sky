var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { encodeBase64 } from "../../../../../../base/common/buffer.js";
import { observableValue } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IChatToolInvocation } from "../../chatService/chatService.js";
import { isToolResultOutputDetails } from "../../tools/languageModelToolsService.js";
class ChatToolInvocation {
  static {
    __name(this, "ChatToolInvocation");
  }
  get state() {
    return this._state;
  }
  /**
   * Create a tool invocation in streaming state.
   * Use this when the tool call is beginning to stream partial input from the LM.
   */
  static createStreaming(options) {
    return new ChatToolInvocation(void 0, options.toolData, options.toolCallId, options.subagentInvocationId, void 0, true, options.chatRequestId);
  }
  constructor(preparedInvocation, toolData, toolCallId, subAgentInvocationId, parameters, isStreaming = false, chatRequestId) {
    this.toolCallId = toolCallId;
    this.kind = "toolInvocation";
    this._progress = observableValue(this, { progress: 0 });
    this._partialInput = observableValue(this, void 0);
    this._streamingMessage = observableValue(this, void 0);
    const defaultStreamingMessage = isStreaming ? localize("toolInvocationMessage", 'Using "{0}"', toolData.displayName) : "";
    this.invocationMessage = preparedInvocation?.invocationMessage ?? defaultStreamingMessage;
    this.pastTenseMessage = preparedInvocation?.pastTenseMessage;
    this.originMessage = preparedInvocation?.originMessage;
    this.confirmationMessages = preparedInvocation?.confirmationMessages;
    this.presentation = preparedInvocation?.presentation;
    this.toolSpecificData = preparedInvocation?.toolSpecificData;
    this.toolId = toolData.id;
    this.source = toolData.source;
    this.subAgentInvocationId = subAgentInvocationId;
    this.parameters = parameters;
    this.chatRequestId = chatRequestId;
    if (isStreaming) {
      this._state = observableValue(this, {
        type: 0,
        partialInput: this._partialInput,
        streamingMessage: this._streamingMessage
      });
    } else if (!this.confirmationMessages?.title) {
      this._state = observableValue(this, {
        type: 2,
        confirmed: { type: 1, reason: this.confirmationMessages?.confirmationNotNeededReason },
        progress: this._progress,
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages
      });
    } else {
      this._state = observableValue(this, {
        type: 1,
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages,
        confirm: /* @__PURE__ */ __name((reason) => {
          if (reason.type === 0 || reason.type === 5) {
            this._state.set({
              type: 5,
              reason: reason.type,
              parameters: this.parameters,
              confirmationMessages: this.confirmationMessages
            }, void 0);
          } else {
            this._state.set({
              type: 2,
              confirmed: reason,
              progress: this._progress,
              parameters: this.parameters,
              confirmationMessages: this.confirmationMessages
            }, void 0);
          }
        }, "confirm")
      });
    }
  }
  /**
   * Update the partial input observable during streaming.
   */
  updatePartialInput(input) {
    if (this._state.get().type !== 0) {
      return;
    }
    this._partialInput.set(input, void 0);
  }
  /**
   * Update the streaming message (from handleToolStream).
   */
  updateStreamingMessage(message) {
    const state = this._state.get();
    if (state.type !== 0) {
      return;
    }
    this._streamingMessage.set(message, void 0);
  }
  /**
   * Transition from streaming state to prepared/executing state.
   * Called when the full tool call is ready.
   */
  transitionFromStreaming(preparedInvocation, parameters, autoConfirmed) {
    const currentState = this._state.get();
    if (currentState.type !== 0) {
      return;
    }
    const lastStreamingMessage = this._streamingMessage.get();
    if (lastStreamingMessage && !preparedInvocation?.invocationMessage) {
      this.invocationMessage = lastStreamingMessage;
    }
    this.parameters = parameters;
    if (preparedInvocation) {
      if (preparedInvocation.invocationMessage) {
        this.invocationMessage = preparedInvocation.invocationMessage;
      }
      this.pastTenseMessage = preparedInvocation.pastTenseMessage;
      this.confirmationMessages = preparedInvocation.confirmationMessages;
      this.presentation = preparedInvocation.presentation;
      this.toolSpecificData = preparedInvocation.toolSpecificData;
    }
    const confirm = /* @__PURE__ */ __name((reason) => {
      if (reason.type === 0 || reason.type === 5) {
        this._state.set({
          type: 5,
          reason: reason.type,
          parameters: this.parameters,
          confirmationMessages: this.confirmationMessages
        }, void 0);
      } else {
        this._state.set({
          type: 2,
          confirmed: reason,
          progress: this._progress,
          parameters: this.parameters,
          confirmationMessages: this.confirmationMessages
        }, void 0);
      }
    }, "confirm");
    if (autoConfirmed) {
      confirm(autoConfirmed);
    }
    if (!this.confirmationMessages?.title) {
      this._state.set({
        type: 2,
        confirmed: { type: 1, reason: this.confirmationMessages?.confirmationNotNeededReason },
        progress: this._progress,
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages
      }, void 0);
    } else {
      this._state.set({
        type: 1,
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages,
        confirm
      }, void 0);
    }
  }
  _setCompleted(result, postConfirmed) {
    if (postConfirmed && (postConfirmed.type === 0 || postConfirmed.type === 5)) {
      this._state.set({
        type: 5,
        reason: postConfirmed.type,
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages
      }, void 0);
      return;
    }
    this._state.set({
      type: 4,
      confirmed: IChatToolInvocation.executionConfirmedOrDenied(this) || {
        type: 1
        /* ToolConfirmKind.ConfirmationNotNeeded */
      },
      resultDetails: result?.toolResultDetails,
      postConfirmed,
      contentForModel: result?.content || [],
      parameters: this.parameters,
      confirmationMessages: this.confirmationMessages
    }, void 0);
  }
  didExecuteTool(result, final) {
    if (result?.toolResultMessage) {
      this.pastTenseMessage = result.toolResultMessage;
    } else if (this._progress.get().message) {
      this.pastTenseMessage = this._progress.get().message;
    }
    if (this.confirmationMessages?.confirmResults && !result?.toolResultError && result?.confirmResults !== false && !final) {
      this._state.set({
        type: 3,
        confirmed: IChatToolInvocation.executionConfirmedOrDenied(this) || {
          type: 1
          /* ToolConfirmKind.ConfirmationNotNeeded */
        },
        resultDetails: result?.toolResultDetails,
        contentForModel: result?.content || [],
        confirm: /* @__PURE__ */ __name((reason) => this._setCompleted(result, reason), "confirm"),
        parameters: this.parameters,
        confirmationMessages: this.confirmationMessages
      }, void 0);
    } else {
      this._setCompleted(result);
    }
    return this._state.get();
  }
  acceptProgress(step) {
    const prev = this._progress.get();
    this._progress.set({
      progress: step.progress || prev.progress || 0,
      message: step.message
    }, void 0);
  }
  toJSON() {
    const waitingForPostApproval = this.state.get().type === 3;
    const details = waitingForPostApproval ? void 0 : IChatToolInvocation.resultDetails(this);
    return {
      kind: "toolInvocationSerialized",
      presentation: this.presentation,
      invocationMessage: this.invocationMessage,
      pastTenseMessage: this.pastTenseMessage,
      originMessage: this.originMessage,
      isConfirmed: waitingForPostApproval ? {
        type: 5
        /* ToolConfirmKind.Skipped */
      } : IChatToolInvocation.executionConfirmedOrDenied(this),
      isComplete: true,
      source: this.source,
      resultDetails: isToolResultOutputDetails(details) ? { output: { type: "data", mimeType: details.output.mimeType, base64Data: encodeBase64(details.output.value) } } : details,
      toolSpecificData: this.toolSpecificData,
      toolCallId: this.toolCallId,
      toolId: this.toolId,
      subAgentInvocationId: this.subAgentInvocationId,
      generatedTitle: this.generatedTitle
    };
  }
}
export {
  ChatToolInvocation
};
//# sourceMappingURL=chatToolInvocation.js.map
