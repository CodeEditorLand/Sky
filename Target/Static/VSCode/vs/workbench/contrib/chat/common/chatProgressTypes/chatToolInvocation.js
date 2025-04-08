var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../../base/common/async.js";
import { IMarkdownString } from "../../../../../base/common/htmlContent.js";
import { localize } from "../../../../../nls.js";
import { IChatTerminalToolInvocationData, IChatToolInputInvocationData, IChatToolInvocation, IChatToolInvocationSerialized } from "../chatService.js";
import { IPreparedToolInvocation, IToolConfirmationMessages, IToolData, IToolResult } from "../languageModelToolsService.js";
class ChatToolInvocation {
  constructor(preparedInvocation, toolData, toolCallId) {
    this.toolCallId = toolCallId;
    const defaultMessage = localize("toolInvocationMessage", "Using {0}", `"${toolData.displayName}"`);
    const invocationMessage = preparedInvocation?.invocationMessage ?? defaultMessage;
    this.invocationMessage = invocationMessage;
    this.pastTenseMessage = preparedInvocation?.pastTenseMessage;
    this._confirmationMessages = preparedInvocation?.confirmationMessages;
    this.presentation = preparedInvocation?.presentation;
    this.toolSpecificData = preparedInvocation?.toolSpecificData;
    this.toolId = toolData.id;
    if (!this._confirmationMessages) {
      this._isConfirmed = true;
      this._confirmDeferred.complete(true);
    }
    this._confirmDeferred.p.then((confirmed) => {
      this._isConfirmed = confirmed;
      this._confirmationMessages = void 0;
    });
    this._isCompleteDeferred.p.then(() => {
      this._isComplete = true;
    });
  }
  static {
    __name(this, "ChatToolInvocation");
  }
  kind = "toolInvocation";
  _isComplete = false;
  get isComplete() {
    return this._isComplete;
  }
  _isCompleteDeferred = new DeferredPromise();
  get isCompletePromise() {
    return this._isCompleteDeferred.p;
  }
  _confirmDeferred = new DeferredPromise();
  get confirmed() {
    return this._confirmDeferred;
  }
  _isConfirmed;
  get isConfirmed() {
    return this._isConfirmed;
  }
  _resultDetails;
  get resultDetails() {
    return this._resultDetails;
  }
  invocationMessage;
  pastTenseMessage;
  _confirmationMessages;
  presentation;
  toolId;
  toolSpecificData;
  complete(result) {
    if (result?.toolResultMessage) {
      this.pastTenseMessage = result.toolResultMessage;
    }
    this._resultDetails = result?.toolResultDetails;
    this._isCompleteDeferred.complete();
  }
  get confirmationMessages() {
    return this._confirmationMessages;
  }
  toJSON() {
    return {
      kind: "toolInvocationSerialized",
      presentation: this.presentation,
      invocationMessage: this.invocationMessage,
      pastTenseMessage: this.pastTenseMessage,
      isConfirmed: this._isConfirmed,
      isComplete: this._isComplete,
      resultDetails: this._resultDetails,
      toolSpecificData: this.toolSpecificData,
      toolCallId: this.toolCallId
    };
  }
}
export {
  ChatToolInvocation
};
//# sourceMappingURL=chatToolInvocation.js.map
