var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { hash } from "../../../../base/common/hash.js";
import { Disposable, dispose } from "../../../../base/common/lifecycle.js";
import * as marked from "../../../../base/common/marked/marked.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { annotateVulnerabilitiesInText } from "./annotations.js";
import { getFullyQualifiedId, IChatAgentNameService } from "./chatAgents.js";
import { countWords } from "./chatWordCounter.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
function isRequestVM(item) {
  return !!item && typeof item === "object" && "message" in item;
}
__name(isRequestVM, "isRequestVM");
function isResponseVM(item) {
  return !!item && typeof item.setVote !== "undefined";
}
__name(isResponseVM, "isResponseVM");
function assertIsResponseVM(item) {
  if (!isResponseVM(item)) {
    throw new Error("Expected item to be IChatResponseViewModel");
  }
}
__name(assertIsResponseVM, "assertIsResponseVM");
let ChatViewModel = class ChatViewModel2 extends Disposable {
  static {
    __name(this, "ChatViewModel");
  }
  get inputPlaceholder() {
    return this._inputPlaceholder;
  }
  get model() {
    return this._model;
  }
  setInputPlaceholder(text) {
    this._inputPlaceholder = text;
    this._onDidChange.fire({ kind: "changePlaceholder" });
  }
  resetInputPlaceholder() {
    this._inputPlaceholder = void 0;
    this._onDidChange.fire({ kind: "changePlaceholder" });
  }
  get sessionId() {
    return this._model.sessionId;
  }
  get requestInProgress() {
    return this._model.requestInProgress;
  }
  get requestPausibility() {
    return this._model.requestPausibility;
  }
  constructor(_model, codeBlockModelCollection, instantiationService) {
    super();
    this._model = _model;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.instantiationService = instantiationService;
    this._onDidDisposeModel = this._register(new Emitter());
    this.onDidDisposeModel = this._onDidDisposeModel.event;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._items = [];
    this._inputPlaceholder = void 0;
    _model.getRequests().forEach((request, i) => {
      const requestModel = this.instantiationService.createInstance(ChatRequestViewModel, request);
      this._items.push(requestModel);
      this.updateCodeBlockTextModels(requestModel);
      if (request.response) {
        this.onAddResponse(request.response);
      }
    });
    this._register(_model.onDidDispose(() => this._onDidDisposeModel.fire()));
    this._register(_model.onDidChange((e) => {
      if (e.kind === "addRequest") {
        const requestModel = this.instantiationService.createInstance(ChatRequestViewModel, e.request);
        this._items.push(requestModel);
        this.updateCodeBlockTextModels(requestModel);
        if (e.request.response) {
          this.onAddResponse(e.request.response);
        }
      } else if (e.kind === "addResponse") {
        this.onAddResponse(e.response);
      } else if (e.kind === "removeRequest") {
        const requestIdx = this._items.findIndex((item) => isRequestVM(item) && item.id === e.requestId);
        if (requestIdx >= 0) {
          this._items.splice(requestIdx, 1);
        }
        const responseIdx = e.responseId && this._items.findIndex((item) => isResponseVM(item) && item.id === e.responseId);
        if (typeof responseIdx === "number" && responseIdx >= 0) {
          const items = this._items.splice(responseIdx, 1);
          const item = items[0];
          if (item instanceof ChatResponseViewModel) {
            item.dispose();
          }
        }
      }
      const modelEventToVmEvent = e.kind === "addRequest" ? { kind: "addRequest" } : e.kind === "initialize" ? { kind: "initialize" } : e.kind === "setHidden" ? { kind: "setHidden" } : null;
      this._onDidChange.fire(modelEventToVmEvent);
    }));
  }
  onAddResponse(responseModel) {
    const response = this.instantiationService.createInstance(ChatResponseViewModel, responseModel, this);
    this._register(response.onDidChange(() => {
      if (response.isComplete) {
        this.updateCodeBlockTextModels(response);
      }
      return this._onDidChange.fire(null);
    }));
    this._items.push(response);
    this.updateCodeBlockTextModels(response);
  }
  getItems() {
    return this._items.filter((item) => !item.shouldBeRemovedOnSend || item.shouldBeRemovedOnSend.afterUndoStop);
  }
  dispose() {
    super.dispose();
    dispose(this._items.filter((item) => item instanceof ChatResponseViewModel));
  }
  updateCodeBlockTextModels(model) {
    let content;
    if (isRequestVM(model)) {
      content = model.messageText;
    } else {
      content = annotateVulnerabilitiesInText(model.response.value).map((x) => x.content.value).join("");
    }
    let codeBlockIndex = 0;
    marked.walkTokens(marked.lexer(content), (token) => {
      if (token.type === "code") {
        const lang = token.lang || "";
        const text = token.text;
        this.codeBlockModelCollection.update(this._model.sessionId, model, codeBlockIndex++, { text, languageId: lang, isComplete: true });
      }
    });
  }
};
ChatViewModel = __decorate([
  __param(2, IInstantiationService)
], ChatViewModel);
class ChatRequestViewModel {
  static {
    __name(this, "ChatRequestViewModel");
  }
  get id() {
    return this._model.id;
  }
  get dataId() {
    return this.id + `_${hash(this.variables)}_${hash(this.isComplete)}`;
  }
  get sessionId() {
    return this._model.session.sessionId;
  }
  get username() {
    return this._model.username;
  }
  get avatarIcon() {
    return this._model.avatarIconUri;
  }
  get message() {
    return this._model.message;
  }
  get messageText() {
    return this.message.text;
  }
  get attempt() {
    return this._model.attempt;
  }
  get variables() {
    return this._model.variableData.variables;
  }
  get contentReferences() {
    return this._model.response?.contentReferences;
  }
  get confirmation() {
    return this._model.confirmation;
  }
  get isComplete() {
    return this._model.response?.isComplete ?? false;
  }
  get isCompleteAddedRequest() {
    return this._model.isCompleteAddedRequest;
  }
  get shouldBeRemovedOnSend() {
    return this._model.shouldBeRemovedOnSend;
  }
  get slashCommand() {
    return this._model.response?.slashCommand;
  }
  get agentOrSlashCommandDetected() {
    return this._model.response?.agentOrSlashCommandDetected ?? false;
  }
  constructor(_model) {
    this._model = _model;
  }
}
let ChatResponseViewModel = class ChatResponseViewModel2 extends Disposable {
  static {
    __name(this, "ChatResponseViewModel");
  }
  get model() {
    return this._model;
  }
  get id() {
    return this._model.id;
  }
  get dataId() {
    return this._model.id + `_${this._modelChangeCount}` + (this.isLast ? "_last" : "");
  }
  get sessionId() {
    return this._model.session.sessionId;
  }
  get username() {
    if (this.agent) {
      const isAllowed = this.chatAgentNameService.getAgentNameRestriction(this.agent);
      if (isAllowed) {
        return this.agent.fullName || this.agent.name;
      } else {
        return getFullyQualifiedId(this.agent);
      }
    }
    return this._model.username;
  }
  get avatarIcon() {
    return this._model.avatarIcon;
  }
  get agent() {
    return this._model.agent;
  }
  get slashCommand() {
    return this._model.slashCommand;
  }
  get agentOrSlashCommandDetected() {
    return this._model.agentOrSlashCommandDetected;
  }
  get response() {
    return this._model.response;
  }
  get usedContext() {
    return this._model.usedContext;
  }
  get contentReferences() {
    return this._model.contentReferences;
  }
  get codeCitations() {
    return this._model.codeCitations;
  }
  get progressMessages() {
    return this._model.progressMessages;
  }
  get isComplete() {
    return this._model.isComplete;
  }
  get isCanceled() {
    return this._model.isCanceled;
  }
  get shouldBeRemovedOnSend() {
    return this._model.shouldBeRemovedOnSend;
  }
  get isCompleteAddedRequest() {
    return this._model.isCompleteAddedRequest;
  }
  get replyFollowups() {
    return this._model.followups?.filter((f) => f.kind === "reply");
  }
  get result() {
    return this._model.result;
  }
  get errorDetails() {
    return this.result?.errorDetails;
  }
  get vote() {
    return this._model.vote;
  }
  get voteDownReason() {
    return this._model.voteDownReason;
  }
  get requestId() {
    return this._model.requestId;
  }
  get isStale() {
    return this._model.isStale;
  }
  get isLast() {
    return this._chatViewModel.getItems().at(-1) === this;
  }
  get usedReferencesExpanded() {
    if (typeof this._usedReferencesExpanded === "boolean") {
      return this._usedReferencesExpanded;
    }
    return void 0;
  }
  set usedReferencesExpanded(v) {
    this._usedReferencesExpanded = v;
  }
  get vulnerabilitiesListExpanded() {
    return this._vulnerabilitiesListExpanded;
  }
  set vulnerabilitiesListExpanded(v) {
    this._vulnerabilitiesListExpanded = v;
  }
  get contentUpdateTimings() {
    return this._contentUpdateTimings;
  }
  get isPaused() {
    return this._model.isPaused;
  }
  constructor(_model, _chatViewModel, logService, chatAgentNameService) {
    super();
    this._model = _model;
    this._chatViewModel = _chatViewModel;
    this.logService = logService;
    this.chatAgentNameService = chatAgentNameService;
    this._modelChangeCount = 0;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.renderData = void 0;
    this._vulnerabilitiesListExpanded = false;
    this._contentUpdateTimings = void 0;
    if (!_model.isComplete) {
      this._contentUpdateTimings = {
        totalTime: 0,
        lastUpdateTime: Date.now(),
        impliedWordLoadRate: 0,
        lastWordCount: 0
      };
    }
    this._register(_model.onDidChange(() => {
      if (this._contentUpdateTimings) {
        const now = Date.now();
        const wordCount = countWords(_model.entireResponse.getMarkdown());
        if (wordCount === this._contentUpdateTimings.lastWordCount) {
          this.trace("onDidChange", `Update- no new words`);
        } else {
          if (this._contentUpdateTimings.lastWordCount === 0) {
            this._contentUpdateTimings.lastUpdateTime = now;
          }
          const timeDiff = Math.min(now - this._contentUpdateTimings.lastUpdateTime, 1e3);
          const newTotalTime = Math.max(this._contentUpdateTimings.totalTime + timeDiff, 250);
          const impliedWordLoadRate = wordCount / (newTotalTime / 1e3);
          this.trace("onDidChange", `Update- got ${wordCount} words over last ${newTotalTime}ms = ${impliedWordLoadRate} words/s`);
          this._contentUpdateTimings = {
            totalTime: this._contentUpdateTimings.totalTime !== 0 || this.response.value.some((v) => v.kind === "markdownContent") ? newTotalTime : this._contentUpdateTimings.totalTime,
            lastUpdateTime: now,
            impliedWordLoadRate,
            lastWordCount: wordCount
          };
        }
      }
      this._modelChangeCount++;
      this._onDidChange.fire();
    }));
  }
  trace(tag, message) {
    this.logService.trace(`ChatResponseViewModel#${tag}: ${message}`);
  }
  setVote(vote) {
    this._modelChangeCount++;
    this._model.setVote(vote);
  }
  setVoteDownReason(reason) {
    this._modelChangeCount++;
    this._model.setVoteDownReason(reason);
  }
  setEditApplied(edit, editCount) {
    this._modelChangeCount++;
    this._model.setEditApplied(edit, editCount);
  }
};
ChatResponseViewModel = __decorate([
  __param(2, ILogService),
  __param(3, IChatAgentNameService)
], ChatResponseViewModel);
export {
  ChatRequestViewModel,
  ChatResponseViewModel,
  ChatViewModel,
  assertIsResponseVM,
  isRequestVM,
  isResponseVM
};
//# sourceMappingURL=chatViewModel.js.map
