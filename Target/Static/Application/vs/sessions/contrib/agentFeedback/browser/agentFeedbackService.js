var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { isEqual } from "../../../../base/common/resources.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { agentSessionContainsResource, editingEntriesContainResource } from "../../../../workbench/contrib/chat/browser/sessionResourceMatching.js";
import { IEditorService } from "../../../../workbench/services/editor/common/editorService.js";
import { IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
const IAgentFeedbackService = createDecorator("agentFeedbackService");
let AgentFeedbackService = class AgentFeedbackService2 extends Disposable {
  static {
    __name(this, "AgentFeedbackService");
  }
  constructor(_chatEditingService, _agentSessionsService, _editorService, _chatWidgetService, _commandService) {
    super();
    this._chatEditingService = _chatEditingService;
    this._agentSessionsService = _agentSessionsService;
    this._editorService = _editorService;
    this._chatWidgetService = _chatWidgetService;
    this._commandService = _commandService;
    this._onDidChangeFeedback = this._store.add(new Emitter());
    this.onDidChangeFeedback = this._onDidChangeFeedback.event;
    this._onDidChangeNavigation = this._store.add(new Emitter());
    this.onDidChangeNavigation = this._onDidChangeNavigation.event;
    this._feedbackBySession = /* @__PURE__ */ new Map();
    this._sessionUpdatedOrder = /* @__PURE__ */ new Map();
    this._sessionUpdatedSequence = 0;
    this._navigationAnchorBySession = /* @__PURE__ */ new Map();
  }
  addFeedback(sessionResource, resourceUri, range, text) {
    const key = sessionResource.toString();
    let feedbackItems = this._feedbackBySession.get(key);
    if (!feedbackItems) {
      feedbackItems = [];
      this._feedbackBySession.set(key, feedbackItems);
    }
    const feedback = {
      id: generateUuid(),
      text,
      resourceUri,
      range,
      sessionResource
    };
    const resourceStr = resourceUri.toString();
    const hasExistingForFile = feedbackItems.some((f) => f.resourceUri.toString() === resourceStr);
    if (!hasExistingForFile) {
      feedbackItems.push(feedback);
    } else {
      let insertIdx = feedbackItems.length;
      for (let i = 0; i < feedbackItems.length; i++) {
        if (feedbackItems[i].resourceUri.toString() === resourceStr && feedbackItems[i].range.startLineNumber > range.startLineNumber) {
          insertIdx = i;
          break;
        }
        if (feedbackItems[i].resourceUri.toString() === resourceStr) {
          insertIdx = i + 1;
        }
      }
      feedbackItems.splice(insertIdx, 0, feedback);
    }
    this._sessionUpdatedOrder.set(key, ++this._sessionUpdatedSequence);
    this._onDidChangeNavigation.fire(sessionResource);
    this._onDidChangeFeedback.fire({ sessionResource, feedbackItems });
    return feedback;
  }
  removeFeedback(sessionResource, feedbackId) {
    const key = sessionResource.toString();
    const feedbackItems = this._feedbackBySession.get(key);
    if (!feedbackItems) {
      return;
    }
    const idx = feedbackItems.findIndex((f) => f.id === feedbackId);
    if (idx >= 0) {
      feedbackItems.splice(idx, 1);
      if (this._navigationAnchorBySession.get(key) === feedbackId) {
        this._navigationAnchorBySession.delete(key);
        this._onDidChangeNavigation.fire(sessionResource);
      }
      if (feedbackItems.length > 0) {
        this._sessionUpdatedOrder.set(key, ++this._sessionUpdatedSequence);
      } else {
        this._sessionUpdatedOrder.delete(key);
      }
      this._onDidChangeFeedback.fire({ sessionResource, feedbackItems });
    }
  }
  getFeedback(sessionResource) {
    return this._feedbackBySession.get(sessionResource.toString()) ?? [];
  }
  getMostRecentSessionForResource(resourceUri) {
    let bestSession;
    let bestSequence = -1;
    for (const [, feedbackItems] of this._feedbackBySession) {
      if (!feedbackItems.length) {
        continue;
      }
      const candidate = feedbackItems[0].sessionResource;
      if (!this._sessionContainsResource(candidate, resourceUri, feedbackItems)) {
        continue;
      }
      const sequence = this._sessionUpdatedOrder.get(candidate.toString()) ?? 0;
      if (sequence > bestSequence) {
        bestSession = candidate;
        bestSequence = sequence;
      }
    }
    return bestSession;
  }
  _sessionContainsResource(sessionResource, resourceUri, feedbackItems) {
    if (feedbackItems.some((item) => isEqual(item.resourceUri, resourceUri))) {
      return true;
    }
    for (const editingSession of this._chatEditingService.editingSessionsObs.get()) {
      if (!isEqual(editingSession.chatSessionResource, sessionResource)) {
        continue;
      }
      if (editingEntriesContainResource(editingSession.entries.get(), resourceUri)) {
        return true;
      }
    }
    for (const session of this._agentSessionsService.model.sessions) {
      if (!isEqual(session.resource, sessionResource)) {
        continue;
      }
      if (agentSessionContainsResource(session, resourceUri)) {
        return true;
      }
    }
    return false;
  }
  async revealFeedback(sessionResource, feedbackId) {
    const key = sessionResource.toString();
    const feedbackItems = this._feedbackBySession.get(key);
    const feedback = feedbackItems?.find((f) => f.id === feedbackId);
    if (!feedback) {
      return;
    }
    await this._editorService.openEditor({
      resource: feedback.resourceUri,
      options: {
        preserveFocus: false,
        revealIfVisible: true
      }
    });
    setTimeout(() => {
      this._navigationAnchorBySession.set(key, feedbackId);
      this._onDidChangeNavigation.fire(sessionResource);
    }, 50);
  }
  getNextFeedback(sessionResource, next) {
    const key = sessionResource.toString();
    const feedbackItems = this._feedbackBySession.get(key);
    if (!feedbackItems?.length) {
      this._navigationAnchorBySession.delete(key);
      return void 0;
    }
    const anchorId = this._navigationAnchorBySession.get(key);
    let anchorIndex = anchorId ? feedbackItems.findIndex((item) => item.id === anchorId) : -1;
    if (anchorIndex < 0 && !next) {
      anchorIndex = 0;
    }
    const nextIndex = next ? (anchorIndex + 1) % feedbackItems.length : (anchorIndex - 1 + feedbackItems.length) % feedbackItems.length;
    const feedback = feedbackItems[nextIndex];
    this._navigationAnchorBySession.set(key, feedback.id);
    this._onDidChangeNavigation.fire(sessionResource);
    return feedback;
  }
  getNavigationBearing(sessionResource) {
    const key = sessionResource.toString();
    const feedbackItems = this._feedbackBySession.get(key) ?? [];
    const anchorId = this._navigationAnchorBySession.get(key);
    const activeIdx = anchorId ? feedbackItems.findIndex((item) => item.id === anchorId) : -1;
    return { activeIdx, totalCount: feedbackItems.length };
  }
  clearFeedback(sessionResource) {
    const key = sessionResource.toString();
    this._feedbackBySession.delete(key);
    this._sessionUpdatedOrder.delete(key);
    this._navigationAnchorBySession.delete(key);
    this._onDidChangeNavigation.fire(sessionResource);
    this._onDidChangeFeedback.fire({ sessionResource, feedbackItems: [] });
  }
  async addFeedbackAndSubmit(sessionResource, resourceUri, range, text) {
    this.addFeedback(sessionResource, resourceUri, range, text);
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (widget) {
      const attachmentId = "agentFeedback:" + sessionResource.toString();
      const hasAttachment = /* @__PURE__ */ __name(() => widget.attachmentModel.attachments.some((a) => a.id === attachmentId), "hasAttachment");
      if (!hasAttachment()) {
        await Event.toPromise(Event.filter(widget.attachmentModel.onDidChange, () => hasAttachment()));
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await this._commandService.executeCommand("agentFeedbackEditor.action.submit");
  }
};
AgentFeedbackService = __decorate([
  __param(0, IChatEditingService),
  __param(1, IAgentSessionsService),
  __param(2, IEditorService),
  __param(3, IChatWidgetService),
  __param(4, ICommandService)
], AgentFeedbackService);
export {
  AgentFeedbackService,
  IAgentFeedbackService
};
//# sourceMappingURL=agentFeedbackService.js.map
