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
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, observableFromEvent } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { IsSessionsWindowContext } from "../../../../workbench/common/contextkeys.js";
import { ChatContextKeys } from "../../../../workbench/contrib/chat/common/actions/chatContextKeys.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { CHAT_CATEGORY } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { CodeReviewService, getCodeReviewFilesFromSessionChanges, getCodeReviewVersion, ICodeReviewService } from "./codeReviewService.js";
import { IAgentFeedbackService } from "../../agentFeedback/browser/agentFeedbackService.js";
import { getSessionEditorComments } from "../../agentFeedback/browser/sessionEditorComments.js";
registerSingleton(
  ICodeReviewService,
  CodeReviewService,
  1
  /* InstantiationType.Delayed */
);
const canRunSessionCodeReviewContextKey = new RawContextKey("sessions.canRunCodeReview", true, {
  type: "boolean",
  description: localize("sessions.canRunCodeReview", "True when a new code review can be started for the active session version.")
});
function registerSessionCodeReviewAction(tooltip, icon) {
  class RunSessionCodeReviewAction extends Action2 {
    static {
      __name(this, "RunSessionCodeReviewAction");
    }
    static {
      this.ID = "sessions.codeReview.run";
    }
    constructor() {
      super({
        id: RunSessionCodeReviewAction.ID,
        title: localize("sessions.runCodeReview", "Run Code Review"),
        tooltip,
        category: CHAT_CATEGORY,
        icon,
        precondition: canRunSessionCodeReviewContextKey,
        menu: [
          {
            id: MenuId.ChatEditingSessionChangesToolbar,
            group: "navigation",
            order: 7,
            when: ContextKeyExpr.and(IsSessionsWindowContext, ChatContextKeys.hasAgentSessionChanges, ChatContextKeys.agentSessionType.notEqualsTo(AgentSessionProviders.Cloud))
          }
        ]
      });
    }
    async run(accessor, sessionResource) {
      const sessionManagementService = accessor.get(ISessionsManagementService);
      const agentSessionsService = accessor.get(IAgentSessionsService);
      const codeReviewService = accessor.get(ICodeReviewService);
      const agentFeedbackService = accessor.get(IAgentFeedbackService);
      const resource = URI.isUri(sessionResource) ? sessionResource : sessionManagementService.getActiveSession()?.resource;
      if (!resource) {
        return;
      }
      const session = agentSessionsService.getSession(resource);
      if (!(session?.changes instanceof Array) || session.changes.length === 0) {
        return;
      }
      const files = getCodeReviewFilesFromSessionChanges(session.changes);
      const version = getCodeReviewVersion(files);
      const reviewState = codeReviewService.getReviewState(resource).get();
      const prReviewState = codeReviewService.getPRReviewState(resource).get();
      const codeReviewCount = reviewState.kind === "result" && reviewState.version === version ? reviewState.comments.length : 0;
      const prReviewCount = prReviewState.kind === "loaded" ? prReviewState.comments.length : 0;
      if (codeReviewCount > 0 || prReviewCount > 0) {
        const comments = getSessionEditorComments(resource, agentFeedbackService.getFeedback(resource), reviewState, prReviewState);
        const first = agentFeedbackService.getNextNavigableItem(resource, comments, true);
        if (first) {
          await agentFeedbackService.revealSessionComment(resource, first.id, first.resourceUri, first.range);
        }
        return;
      }
      codeReviewService.requestReview(resource, version, files);
    }
  }
  return registerAction2(RunSessionCodeReviewAction);
}
__name(registerSessionCodeReviewAction, "registerSessionCodeReviewAction");
let CodeReviewToolbarContribution = class CodeReviewToolbarContribution2 extends Disposable {
  static {
    __name(this, "CodeReviewToolbarContribution");
  }
  static {
    this.ID = "sessions.contrib.codeReviewToolbar";
  }
  constructor(contextKeyService, _agentSessionsService, _sessionManagementService, _codeReviewService) {
    super();
    this._agentSessionsService = _agentSessionsService;
    this._sessionManagementService = _sessionManagementService;
    this._codeReviewService = _codeReviewService;
    this._actionRegistration = this._register(new MutableDisposable());
    const canRunCodeReviewContext = canRunSessionCodeReviewContextKey.bindTo(contextKeyService);
    const sessionsChangedSignal = observableFromEvent(this, this._agentSessionsService.model.onDidChangeSessions, () => void 0);
    this._register(autorun((reader) => {
      const activeSession = this._sessionManagementService.activeSession.read(reader);
      sessionsChangedSignal.read(reader);
      this._actionRegistration.clear();
      const sessionResource = activeSession?.resource;
      if (!sessionResource) {
        canRunCodeReviewContext.set(false);
        this._actionRegistration.value = registerSessionCodeReviewAction(localize("sessions.runCodeReview.noSession", "No active session available for code review."), Codicon.codeReview);
        return;
      }
      const session = this._agentSessionsService.getSession(sessionResource);
      if (!(session?.changes instanceof Array) || session.changes.length === 0) {
        canRunCodeReviewContext.set(false);
        this._actionRegistration.value = registerSessionCodeReviewAction(localize("sessions.runCodeReview.noChanges", "No changes available for code review."), Codicon.codeReview);
        return;
      }
      const files = getCodeReviewFilesFromSessionChanges(session.changes);
      const version = getCodeReviewVersion(files);
      const reviewState = this._codeReviewService.getReviewState(sessionResource).read(reader);
      const prReviewState = this._codeReviewService.getPRReviewState(sessionResource).read(reader);
      const codeReviewCount = reviewState.kind === "result" && reviewState.version === version ? reviewState.comments.length : 0;
      const prReviewCount = prReviewState.kind === "loaded" ? prReviewState.comments.length : 0;
      const totalCommentCount = codeReviewCount + prReviewCount;
      let canRunCodeReview = true;
      let tooltip = localize("sessions.runCodeReview.tooltip.default", "Run Code Review");
      let icon = Codicon.codeReview;
      if (reviewState.kind === "loading" && reviewState.version === version) {
        canRunCodeReview = false;
        tooltip = localize("sessions.runCodeReview.tooltip.loading", "Creating code review...");
        icon = Codicon.commentDraft;
      } else if (totalCommentCount > 0) {
        canRunCodeReview = true;
        icon = Codicon.commentUnresolved;
        tooltip = totalCommentCount === 1 ? localize("sessions.runCodeReview.tooltip.oneUnresolved", "1 review comment unresolved.") : localize("sessions.runCodeReview.tooltip.manyUnresolved", "{0} review comments unresolved.", totalCommentCount);
      } else if (reviewState.kind === "result" && reviewState.version === version) {
        canRunCodeReview = false;
        tooltip = localize("sessions.runCodeReview.tooltip.allResolved", "All review comments have been addressed.");
        icon = Codicon.comment;
      }
      canRunCodeReviewContext.set(canRunCodeReview);
      this._actionRegistration.value = registerSessionCodeReviewAction(tooltip, icon);
    }));
  }
};
CodeReviewToolbarContribution = __decorate([
  __param(0, IContextKeyService),
  __param(1, IAgentSessionsService),
  __param(2, ISessionsManagementService),
  __param(3, ICodeReviewService)
], CodeReviewToolbarContribution);
registerWorkbenchContribution2(
  CodeReviewToolbarContribution.ID,
  CodeReviewToolbarContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=codeReview.contributions.js.map
