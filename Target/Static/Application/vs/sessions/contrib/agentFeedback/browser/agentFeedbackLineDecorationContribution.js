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
import "./media/agentFeedbackLineDecoration.css";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { getSessionForResource } from "./agentFeedbackEditorUtils.js";
import { Selection } from "../../../../editor/common/core/selection.js";
const addFeedbackHintDecoration = ModelDecorationOptions.register({
  description: "agent-feedback-add-hint",
  linesDecorationsClassName: `${ThemeIcon.asClassName(Codicon.add)} agent-feedback-add-hint`,
  stickiness: 1
});
let AgentFeedbackLineDecorationContribution = class AgentFeedbackLineDecorationContribution2 extends Disposable {
  static {
    __name(this, "AgentFeedbackLineDecorationContribution");
  }
  static {
    this.ID = "agentFeedback.lineDecorationContribution";
  }
  constructor(_editor, _agentFeedbackService, _chatEditingService, _agentSessionsService) {
    super();
    this._editor = _editor;
    this._agentFeedbackService = _agentFeedbackService;
    this._chatEditingService = _chatEditingService;
    this._agentSessionsService = _agentSessionsService;
    this._hintDecorationId = null;
    this._hintLine = -1;
    this._feedbackLines = /* @__PURE__ */ new Set();
    this._store.add(this._agentFeedbackService.onDidChangeFeedback(() => this._updateFeedbackLines()));
    this._store.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
    this._store.add(this._editor.onMouseMove((e) => this._onMouseMove(e)));
    this._store.add(this._editor.onMouseLeave(() => this._updateHintDecoration(-1)));
    this._store.add(this._editor.onMouseDown((e) => this._onMouseDown(e)));
    this._resolveSession();
    this._updateFeedbackLines();
  }
  _onModelChanged() {
    this._updateHintDecoration(-1);
    this._resolveSession();
    this._updateFeedbackLines();
  }
  _resolveSession() {
    const model = this._editor.getModel();
    if (!model) {
      this._sessionResource = void 0;
      return;
    }
    this._sessionResource = getSessionForResource(model.uri, this._chatEditingService, this._agentSessionsService);
  }
  _updateFeedbackLines() {
    if (!this._sessionResource) {
      this._feedbackLines.clear();
      return;
    }
    const feedbackItems = this._agentFeedbackService.getFeedback(this._sessionResource);
    const lines = /* @__PURE__ */ new Set();
    for (const item of feedbackItems) {
      const model = this._editor.getModel();
      if (!model || item.resourceUri.toString() !== model.uri.toString()) {
        continue;
      }
      lines.add(item.range.startLineNumber);
    }
    this._feedbackLines = lines;
  }
  _onMouseMove(e) {
    if (!this._sessionResource) {
      this._updateHintDecoration(-1);
      return;
    }
    const isLineDecoration = e.target.type === 4 && !e.target.detail.isAfterLines;
    const isContentArea = e.target.type === 6 || e.target.type === 7;
    if (e.target.position && (isLineDecoration || isContentArea) && !this._feedbackLines.has(e.target.position.lineNumber)) {
      this._updateHintDecoration(e.target.position.lineNumber);
    } else {
      this._updateHintDecoration(-1);
    }
  }
  _updateHintDecoration(line) {
    if (line === this._hintLine) {
      return;
    }
    this._hintLine = line;
    this._editor.changeDecorations((accessor) => {
      if (this._hintDecorationId) {
        accessor.removeDecoration(this._hintDecorationId);
        this._hintDecorationId = null;
      }
      if (line !== -1) {
        this._hintDecorationId = accessor.addDecoration(new Range(line, 1, line, 1), addFeedbackHintDecoration);
      }
    });
  }
  _onMouseDown(e) {
    if (!e.target.position || e.target.type !== 4 || e.target.detail.isAfterLines || !this._sessionResource) {
      return;
    }
    const lineNumber = e.target.position.lineNumber;
    if (this._feedbackLines.has(lineNumber)) {
      return;
    }
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    const startColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    const endColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
    if (startColumn === 0 || endColumn === 0) {
      this._editor.setSelection(new Selection(lineNumber, model.getLineMaxColumn(lineNumber), lineNumber, 1));
    } else {
      this._editor.setSelection(new Selection(lineNumber, endColumn, lineNumber, startColumn));
    }
    this._editor.focus();
  }
  dispose() {
    this._updateHintDecoration(-1);
    super.dispose();
  }
};
AgentFeedbackLineDecorationContribution = __decorate([
  __param(1, IAgentFeedbackService),
  __param(2, IChatEditingService),
  __param(3, IAgentSessionsService)
], AgentFeedbackLineDecorationContribution);
registerEditorContribution(
  AgentFeedbackLineDecorationContribution.ID,
  AgentFeedbackLineDecorationContribution,
  3
  /* EditorContributionInstantiation.Eventually */
);
export {
  AgentFeedbackLineDecorationContribution
};
//# sourceMappingURL=agentFeedbackLineDecorationContribution.js.map
