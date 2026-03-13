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
import { Disposable, DisposableMap } from "../../../../base/common/lifecycle.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { basename } from "../../../../base/common/resources.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
const ATTACHMENT_ID_PREFIX = "agentFeedback:";
let AgentFeedbackAttachmentContribution = class AgentFeedbackAttachmentContribution2 extends Disposable {
  static {
    __name(this, "AgentFeedbackAttachmentContribution");
  }
  static {
    this.ID = "workbench.contrib.agentFeedbackAttachment";
  }
  constructor(_agentFeedbackService, _chatWidgetService, _textModelService) {
    super();
    this._agentFeedbackService = _agentFeedbackService;
    this._chatWidgetService = _chatWidgetService;
    this._textModelService = _textModelService;
    this._widgetListeners = this._store.add(new DisposableMap());
    this._snippetCache = /* @__PURE__ */ new Map();
    this._store.add(this._agentFeedbackService.onDidChangeFeedback((e) => {
      this._updateAttachment(e.sessionResource);
      this._ensureAcceptListener(e.sessionResource);
    }));
  }
  async _updateAttachment(sessionResource) {
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return;
    }
    const feedbackItems = this._agentFeedbackService.getFeedback(sessionResource);
    const attachmentId = ATTACHMENT_ID_PREFIX + sessionResource.toString();
    if (feedbackItems.length === 0) {
      widget.attachmentModel.delete(attachmentId);
      this._snippetCache.clear();
      return;
    }
    const value = await this._buildFeedbackValue(feedbackItems);
    const entry = {
      kind: "agentFeedback",
      id: attachmentId,
      name: feedbackItems.length === 1 ? localize("agentFeedback.one", "1 comment") : localize("agentFeedback.many", "{0} comments", feedbackItems.length),
      icon: Codicon.comment,
      sessionResource,
      feedbackItems: feedbackItems.map((f) => ({
        id: f.id,
        text: f.text,
        resourceUri: f.resourceUri,
        range: f.range,
        codeSelection: this._snippetCache.get(f.id)
      })),
      value
    };
    widget.attachmentModel.delete(attachmentId);
    widget.attachmentModel.addContext(entry);
  }
  /**
   * Builds a rich string value for the agent feedback attachment that includes
   * the code snippet at each feedback item's location alongside the feedback text.
   * Uses a cache keyed by feedback ID to avoid re-resolving snippets for
   * items that haven't changed.
   */
  async _buildFeedbackValue(feedbackItems) {
    const currentIds = new Set(feedbackItems.map((f) => f.id));
    for (const cachedId of this._snippetCache.keys()) {
      if (!currentIds.has(cachedId)) {
        this._snippetCache.delete(cachedId);
      }
    }
    const uncachedItems = feedbackItems.filter((f) => !this._snippetCache.has(f.id));
    if (uncachedItems.length > 0) {
      await Promise.all(uncachedItems.map(async (f) => {
        const snippet = await this._getCodeSnippet(f.resourceUri, f.range);
        this._snippetCache.set(f.id, snippet);
      }));
    }
    const parts = ["The following comments were made on the code changes:"];
    for (const item of feedbackItems) {
      const codeSnippet = this._snippetCache.get(item.id);
      const fileName = basename(item.resourceUri);
      const lineRef = item.range.startLineNumber === item.range.endLineNumber ? `${item.range.startLineNumber}` : `${item.range.startLineNumber}-${item.range.endLineNumber}`;
      let part = `[${fileName}:${lineRef}]`;
      if (codeSnippet) {
        part += `
\`\`\`
${codeSnippet}
\`\`\``;
      }
      part += `
Comment: ${item.text}`;
      parts.push(part);
    }
    return parts.join("\n\n");
  }
  /**
   * Resolves the text model for a resource and extracts the code in the given range.
   * Returns undefined if the model cannot be resolved.
   */
  async _getCodeSnippet(resourceUri, range) {
    try {
      const ref = await this._textModelService.createModelReference(resourceUri);
      try {
        return ref.object.textEditorModel.getValueInRange(range);
      } finally {
        ref.dispose();
      }
    } catch {
      return void 0;
    }
  }
  /**
   * Ensure we listen for the chat widget's submit event so we can clear feedback after send.
   */
  _ensureAcceptListener(sessionResource) {
    const key = sessionResource.toString();
    if (this._widgetListeners.has(key)) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return;
    }
    this._widgetListeners.set(key, widget.onDidSubmitAgent(() => {
      this._agentFeedbackService.clearFeedback(sessionResource);
      this._widgetListeners.deleteAndDispose(key);
    }));
  }
};
AgentFeedbackAttachmentContribution = __decorate([
  __param(0, IAgentFeedbackService),
  __param(1, IChatWidgetService),
  __param(2, ITextModelService)
], AgentFeedbackAttachmentContribution);
export {
  ATTACHMENT_ID_PREFIX,
  AgentFeedbackAttachmentContribution
};
//# sourceMappingURL=agentFeedbackAttachment.js.map
