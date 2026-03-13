import { localize } from "../../nls.js";
import { RawContextKey } from "../../platform/contextkey/common/contextkey.js";
const ActiveChatBarContext = new RawContextKey("activeChatBar", "", localize("activeChatBar", "The identifier of the active chat bar panel"));
const ChatBarFocusContext = new RawContextKey("chatBarFocus", false, localize("chatBarFocus", "Whether the chat bar has keyboard focus"));
const ChatBarVisibleContext = new RawContextKey("chatBarVisible", false, localize("chatBarVisible", "Whether the chat bar is visible"));
const SessionsWelcomeVisibleContext = new RawContextKey("sessionsWelcomeVisible", false, localize("sessionsWelcomeVisible", "Whether the sessions welcome overlay is visible"));
export {
  ActiveChatBarContext,
  ChatBarFocusContext,
  ChatBarVisibleContext,
  SessionsWelcomeVisibleContext
};
//# sourceMappingURL=contextkeys.js.map
