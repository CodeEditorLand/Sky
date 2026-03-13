var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isLocalAgentSessionItem } from "./agentSessionsModel.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../chat.js";
import { ACTIVE_GROUP, SIDE_GROUP } from "../../../../services/editor/common/editorService.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { Schemas } from "../../../../../base/common/network.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { localize } from "../../../../../nls.js";
import { toErrorMessage } from "../../../../../base/common/errorMessage.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
class SessionOpenerRegistry {
  static {
    __name(this, "SessionOpenerRegistry");
  }
  constructor() {
    this.participants = /* @__PURE__ */ new Set();
  }
  registerParticipant(participant) {
    this.participants.add(participant);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.participants.delete(participant);
      }, "dispose")
    };
  }
  getParticipants() {
    return Array.from(this.participants);
  }
}
const sessionOpenerRegistry = new SessionOpenerRegistry();
async function openSession(accessor, session, openOptions) {
  const instantiationService = accessor.get(IInstantiationService);
  const logService = accessor.get(ILogService);
  for (const participant of sessionOpenerRegistry.getParticipants()) {
    try {
      const handled = await instantiationService.invokeFunction((accessor2) => participant.handleOpenSession(accessor2, session, openOptions));
      if (handled) {
        return void 0;
      }
    } catch (error) {
      logService.error(error);
    }
  }
  return instantiationService.invokeFunction((accessor2) => openSessionDefault(accessor2, session, openOptions));
}
__name(openSession, "openSession");
async function openSessionDefault(accessor, session, openOptions) {
  const chatSessionsService = accessor.get(IChatSessionsService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  const notificationService = accessor.get(INotificationService);
  try {
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
      revealIfOpened: true
      // always try to reveal if already opened
    };
    await chatSessionsService.activateChatSessionItemProvider(session.providerType);
    let target;
    if (openOptions?.sideBySide) {
      target = ACTIVE_GROUP;
    } else {
      target = ChatViewPaneTarget;
    }
    const isLocalChatSession = session.resource.scheme === Schemas.vscodeChatEditor || session.resource.scheme === Schemas.vscodeLocalChatSession;
    if (!isLocalChatSession && !await chatSessionsService.canResolveChatSession(session.resource.scheme)) {
      target = openOptions?.sideBySide ? SIDE_GROUP : ACTIVE_GROUP;
      options = { ...options, revealIfOpened: true };
    }
    return await chatWidgetService.openSession(session.resource, target, options);
  } catch (error) {
    notificationService.error(localize("chat.openSessionFailed", "Failed to open chat session: {0}", toErrorMessage(error)));
    return void 0;
  }
}
__name(openSessionDefault, "openSessionDefault");
export {
  openSession,
  sessionOpenerRegistry
};
//# sourceMappingURL=agentSessionsOpener.js.map
