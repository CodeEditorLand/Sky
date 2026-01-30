var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isLocalAgentSessionItem } from "./agentSessionsModel.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../chat.js";
import { ACTIVE_GROUP, SIDE_GROUP } from "../../../../services/editor/common/editorService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { Schemas } from "../../../../../base/common/network.js";
import { IAgentSessionProjectionService } from "./agentSessionProjectionService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ChatConfiguration } from "../../common/constants.js";
async function openSession(accessor, session, openOptions) {
  const configurationService = accessor.get(IConfigurationService);
  const projectionService = accessor.get(IAgentSessionProjectionService);
  session.setRead(true);
  const agentSessionProjectionEnabled = configurationService.getValue(ChatConfiguration.AgentSessionProjectionEnabled) === true;
  if (agentSessionProjectionEnabled) {
    await projectionService.enterProjection(session);
  } else {
    await openSessionInChatWidget(accessor, session, openOptions);
  }
}
__name(openSession, "openSession");
async function openSessionInChatWidget(accessor, session, openOptions) {
  const chatSessionsService = accessor.get(IChatSessionsService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  session.setRead(true);
  let sessionOptions;
  if (isLocalAgentSessionItem(session)) {
    sessionOptions = {};
  } else {
    sessionOptions = { title: { preferred: session.label } };
  }
  let options = {
    ...sessionOptions,
    ...openOptions?.editorOptions,
    revealIfOpened: true,
    // always try to reveal if already opened
    expanded: openOptions?.expanded
  };
  await chatSessionsService.activateChatSessionItemProvider(session.providerType);
  let target;
  if (openOptions?.sideBySide) {
    target = ACTIVE_GROUP;
  } else {
    target = ChatViewPaneTarget;
  }
  const isLocalChatSession = session.resource.scheme === Schemas.vscodeChatEditor || session.resource.scheme === Schemas.vscodeLocalChatSession;
  if (!isLocalChatSession && !await chatSessionsService.canResolveChatSession(session.resource)) {
    target = openOptions?.sideBySide ? SIDE_GROUP : ACTIVE_GROUP;
    options = { ...options, revealIfOpened: true };
  }
  await chatWidgetService.openSession(session.resource, target, options);
}
__name(openSessionInChatWidget, "openSessionInChatWidget");
export {
  openSession,
  openSessionInChatWidget
};
//# sourceMappingURL=agentSessionsOpener.js.map
