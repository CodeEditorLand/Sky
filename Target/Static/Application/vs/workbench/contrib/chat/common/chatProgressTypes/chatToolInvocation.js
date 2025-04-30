var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DeferredPromise } from "../../../../../base/common/async.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { localize } from "../../../../../nls.js";
class ChatToolInvocation {
  static {
    __name(this, "ChatToolInvocation");
  }
  get isComplete() {
    return this._isComplete;
  }
  get isCompletePromise() {
    return this._isCompleteDeferred.p;
  }
  get confirmed() {
    return this._confirmDeferred;
  }
  get isConfirmed() {
    return this._isConfirmed;
  }
  get resultDetails() {
    return this._resultDetails;
  }
  constructor(preparedInvocation, toolData, toolCallId) {
    this.toolCallId = toolCallId;
    this.kind = "toolInvocation";
    this._isComplete = false;
    this._isCompleteDeferred = new DeferredPromise();
    this._confirmDeferred = new DeferredPromise();
    this.progress = observableValue(this, { progress: 0 });
    const defaultMessage = localize("toolInvocationMessage", "Using {0}", `"${toolData.displayName}"`);
    const invocationMessage = preparedInvocation?.invocationMessage ?? defaultMessage;
    this.invocationMessage = invocationMessage;
    this.pastTenseMessage = preparedInvocation?.pastTenseMessage;
    this.originMessage = preparedInvocation?.originMessage;
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
  acceptProgress(step) {
    const prev = this.progress.get();
    this.progress.set({
      progress: step.increment ? prev.progress + step.increment : prev.progress,
      message: step.message
    }, void 0);
  }
  toJSON() {
    return {
      kind: "toolInvocationSerialized",
      presentation: this.presentation,
      invocationMessage: this.invocationMessage,
      pastTenseMessage: this.pastTenseMessage,
      originMessage: this.originMessage,
      isConfirmed: this._isConfirmed,
      isComplete: this._isComplete,
      resultDetails: this._resultDetails,
      toolSpecificData: this.toolSpecificData,
      toolCallId: this.toolCallId,
      toolId: this.toolId
    };
  }
}
export {
  ChatToolInvocation
};
//# sourceMappingURL=chatToolInvocation.js.map
