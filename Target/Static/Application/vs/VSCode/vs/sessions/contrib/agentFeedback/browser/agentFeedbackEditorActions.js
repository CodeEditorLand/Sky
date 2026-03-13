var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { isEqual } from "../../../../base/common/resources.js";
import { IEditorService } from "../../../../workbench/services/editor/common/editorService.js";
import { IEditorGroupsService } from "../../../../workbench/services/editor/common/editorGroupsService.js";
import { IChatWidgetService } from "../../../../workbench/contrib/chat/browser/chat.js";
import { ChatContextKeys } from "../../../../workbench/contrib/chat/common/actions/chatContextKeys.js";
import { CHAT_CATEGORY } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { IAgentFeedbackService } from "./agentFeedbackService.js";
import { getActiveResourceCandidates, getSessionForResource } from "./agentFeedbackEditorUtils.js";
import { Menus } from "../../../browser/menus.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { ICodeReviewService } from "../../codeReview/browser/codeReviewService.js";
import { getSessionEditorComments } from "./sessionEditorComments.js";
const submitFeedbackActionId = "agentFeedbackEditor.action.submit";
const navigatePreviousFeedbackActionId = "agentFeedbackEditor.action.navigatePrevious";
const navigateNextFeedbackActionId = "agentFeedbackEditor.action.navigateNext";
const clearAllFeedbackActionId = "agentFeedbackEditor.action.clearAll";
const navigationBearingFakeActionId = "agentFeedbackEditor.navigation.bearings";
const hasSessionEditorComments = new RawContextKey("agentFeedbackEditor.hasSessionComments", false);
const hasSessionAgentFeedback = new RawContextKey("agentFeedbackEditor.hasAgentFeedback", false);
class AgentFeedbackEditorAction extends Action2 {
  static {
    __name(this, "AgentFeedbackEditorAction");
  }
  constructor(desc) {
    super({
      category: CHAT_CATEGORY,
      ...desc
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const chatEditingService = accessor.get(IChatEditingService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const codeReviewService = accessor.get(ICodeReviewService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const activePane = editorService.activeEditorPane ?? editorGroupsService.getGroups(
      1
      /* GroupsOrder.MOST_RECENTLY_ACTIVE */
    ).find((g) => g.activeEditorPane)?.activeEditorPane ?? editorService.visibleEditorPanes[0];
    const candidates = getActiveResourceCandidates(activePane?.input);
    for (const candidate of candidates) {
      const sessionResource = getSessionForResource(candidate, chatEditingService, agentSessionsService) ?? agentFeedbackService.getMostRecentSessionForResource(candidate);
      if (!sessionResource) {
        continue;
      }
      const comments = getSessionEditorComments(sessionResource, agentFeedbackService.getFeedback(sessionResource), codeReviewService.getReviewState(sessionResource).get(), codeReviewService.getPRReviewState(sessionResource).get());
      if (comments.length > 0) {
        return this.runWithSession(accessor, sessionResource);
      }
    }
  }
}
class SubmitFeedbackAction extends AgentFeedbackEditorAction {
  static {
    __name(this, "SubmitFeedbackAction");
  }
  constructor() {
    super({
      id: submitFeedbackActionId,
      title: localize2("agentFeedback.submit", "Submit Feedback"),
      shortTitle: localize2("agentFeedback.submitShort", "Submit"),
      icon: Codicon.send,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "a_submit",
        order: 0,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionAgentFeedback)
      }
    });
  }
  async runWithSession(accessor, sessionResource) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const editorService = accessor.get(IEditorService);
    const logService = accessor.get(ILogService);
    const widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      logService.error("[AgentFeedback] Cannot submit feedback: no chat widget found for session", sessionResource.toString());
      return;
    }
    const editorsToClose = [];
    for (const { editor, groupId } of editorService.getEditors(
      1
      /* EditorsOrder.SEQUENTIAL */
    )) {
      const candidates = getActiveResourceCandidates(editor);
      const belongsToSession = candidates.some((uri) => isEqual(agentFeedbackService.getMostRecentSessionForResource(uri), sessionResource));
      if (belongsToSession) {
        editorsToClose.push({ editor, groupId });
      }
    }
    if (editorsToClose.length) {
      await editorService.closeEditors(editorsToClose);
    }
    await widget.acceptInput("Act on the provided feedback");
  }
}
class NavigateFeedbackAction extends AgentFeedbackEditorAction {
  static {
    __name(this, "NavigateFeedbackAction");
  }
  constructor(_next) {
    super({
      id: _next ? navigateNextFeedbackActionId : navigatePreviousFeedbackActionId,
      title: _next ? localize2("agentFeedback.next", "Go to Next Feedback Comment") : localize2("agentFeedback.previous", "Go to Previous Feedback Comment"),
      icon: _next ? Codicon.arrowDown : Codicon.arrowUp,
      f1: true,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "navigate",
        order: _next ? 2 : 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionEditorComments)
      }
    });
    this._next = _next;
  }
  async runWithSession(accessor, sessionResource) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    const codeReviewService = accessor.get(ICodeReviewService);
    const comments = getSessionEditorComments(sessionResource, agentFeedbackService.getFeedback(sessionResource), codeReviewService.getReviewState(sessionResource).get(), codeReviewService.getPRReviewState(sessionResource).get());
    const comment = agentFeedbackService.getNextNavigableItem(sessionResource, comments, this._next);
    if (!comment) {
      return;
    }
    await agentFeedbackService.revealSessionComment(sessionResource, comment.id, comment.resourceUri, comment.range);
  }
}
class ClearAllFeedbackAction extends AgentFeedbackEditorAction {
  static {
    __name(this, "ClearAllFeedbackAction");
  }
  constructor() {
    super({
      id: clearAllFeedbackActionId,
      title: localize2("agentFeedback.clear", "Clear"),
      tooltip: localize2("agentFeedback.clearAllTooltip", "Clear All Feedback"),
      icon: Codicon.clearAll,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled),
      menu: {
        id: Menus.AgentFeedbackEditorContent,
        group: "a_submit",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionAgentFeedback)
      }
    });
  }
  runWithSession(accessor, sessionResource) {
    const agentFeedbackService = accessor.get(IAgentFeedbackService);
    agentFeedbackService.clearFeedback(sessionResource);
  }
}
function registerAgentFeedbackEditorActions() {
  registerAction2(SubmitFeedbackAction);
  registerAction2(class extends NavigateFeedbackAction {
    constructor() {
      super(false);
    }
  });
  registerAction2(class extends NavigateFeedbackAction {
    constructor() {
      super(true);
    }
  });
  registerAction2(ClearAllFeedbackAction);
  MenuRegistry.appendMenuItem(Menus.AgentFeedbackEditorContent, {
    command: {
      id: navigationBearingFakeActionId,
      title: localize("label", "Navigation Status"),
      precondition: ContextKeyExpr.false()
    },
    group: "navigate",
    order: -1,
    when: ContextKeyExpr.and(ChatContextKeys.enabled, hasSessionEditorComments)
  });
}
__name(registerAgentFeedbackEditorActions, "registerAgentFeedbackEditorActions");
export {
  clearAllFeedbackActionId,
  hasSessionAgentFeedback,
  hasSessionEditorComments,
  navigateNextFeedbackActionId,
  navigatePreviousFeedbackActionId,
  navigationBearingFakeActionId,
  registerAgentFeedbackEditorActions,
  submitFeedbackActionId
};
//# sourceMappingURL=agentFeedbackEditorActions.js.map
