var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ChatConfiguration } from "../../common/constants.js";
import { IAgentSessionProjectionService } from "./agentSessionProjectionService.js";
import { isMarshalledAgentSessionContext } from "./agentSessionsModel.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { CHAT_CATEGORY } from "../actions/chatActions.js";
import { ToggleTitleBarConfigAction } from "../../../../browser/parts/titlebar/titlebarActions.js";
import { IsCompactTitleBarContext } from "../../../../common/contextkeys.js";
class EnterAgentSessionProjectionAction extends Action2 {
  static {
    __name(this, "EnterAgentSessionProjectionAction");
  }
  static {
    this.ID = "agentSession.enterAgentSessionProjection";
  }
  constructor() {
    super({
      id: EnterAgentSessionProjectionAction.ID,
      title: localize2("enterAgentSessionProjection", "Enter Agent Session Projection"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.has(`config.${ChatConfiguration.AgentSessionProjectionEnabled}`), ChatContextKeys.inAgentSessionProjection.negate())
    });
  }
  async run(accessor, context) {
    const projectionService = accessor.get(IAgentSessionProjectionService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    let session;
    if (context) {
      if (isMarshalledAgentSessionContext(context)) {
        session = agentSessionsService.getSession(context.session.resource);
      } else {
        session = context;
      }
    }
    if (session) {
      await projectionService.enterProjection(session);
    }
  }
}
class ExitAgentSessionProjectionAction extends Action2 {
  static {
    __name(this, "ExitAgentSessionProjectionAction");
  }
  static {
    this.ID = "agentSession.exitAgentSessionProjection";
  }
  constructor() {
    super({
      id: ExitAgentSessionProjectionAction.ID,
      title: localize2("exitAgentSessionProjection", "Exit Agent Session Projection"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.inAgentSessionProjection),
      keybinding: {
        weight: 200,
        primary: 9,
        when: ChatContextKeys.inAgentSessionProjection
      }
    });
  }
  async run(accessor) {
    const projectionService = accessor.get(IAgentSessionProjectionService);
    await projectionService.exitProjection();
  }
}
class ToggleAgentStatusAction extends ToggleTitleBarConfigAction {
  static {
    __name(this, "ToggleAgentStatusAction");
  }
  constructor() {
    super(ChatConfiguration.AgentStatusEnabled, localize("toggle.agentStatus", "Agent Status"), localize("toggle.agentStatusDescription", "Toggle visibility of the Agent Status in title bar"), 6, ContextKeyExpr.and(ChatContextKeys.enabled, IsCompactTitleBarContext.negate(), ChatContextKeys.supported));
  }
}
class ToggleAgentSessionProjectionAction extends ToggleTitleBarConfigAction {
  static {
    __name(this, "ToggleAgentSessionProjectionAction");
  }
  constructor() {
    super(ChatConfiguration.AgentSessionProjectionEnabled, localize("toggle.agentSessionProjection", "Agent Session Projection"), localize("toggle.agentSessionProjectionDescription", "Toggle Agent Session Projection mode for focused workspace review of agent sessions"), 7, ContextKeyExpr.and(ChatContextKeys.enabled, IsCompactTitleBarContext.negate(), ChatContextKeys.supported));
  }
}
export {
  EnterAgentSessionProjectionAction,
  ExitAgentSessionProjectionAction,
  ToggleAgentSessionProjectionAction,
  ToggleAgentStatusAction
};
//# sourceMappingURL=agentSessionProjectionActions.js.map
