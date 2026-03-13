import { localize } from "../../../../../nls.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
var TerminalChatCommandId;
(function(TerminalChatCommandId2) {
  TerminalChatCommandId2["Start"] = "workbench.action.terminal.chat.start";
  TerminalChatCommandId2["Close"] = "workbench.action.terminal.chat.close";
  TerminalChatCommandId2["MakeRequest"] = "workbench.action.terminal.chat.makeRequest";
  TerminalChatCommandId2["Cancel"] = "workbench.action.terminal.chat.cancel";
  TerminalChatCommandId2["RunCommand"] = "workbench.action.terminal.chat.runCommand";
  TerminalChatCommandId2["RunFirstCommand"] = "workbench.action.terminal.chat.runFirstCommand";
  TerminalChatCommandId2["InsertCommand"] = "workbench.action.terminal.chat.insertCommand";
  TerminalChatCommandId2["InsertFirstCommand"] = "workbench.action.terminal.chat.insertFirstCommand";
  TerminalChatCommandId2["ViewInChat"] = "workbench.action.terminal.chat.viewInChat";
  TerminalChatCommandId2["RerunRequest"] = "workbench.action.terminal.chat.rerunRequest";
  TerminalChatCommandId2["ViewHiddenChatTerminals"] = "workbench.action.terminal.chat.viewHiddenChatTerminals";
  TerminalChatCommandId2["OpenTerminalSettingsLink"] = "workbench.action.terminal.chat.openTerminalSettingsLink";
  TerminalChatCommandId2["DisableSessionAutoApproval"] = "workbench.action.terminal.chat.disableSessionAutoApproval";
  TerminalChatCommandId2["FocusMostRecentChatTerminalOutput"] = "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput";
  TerminalChatCommandId2["FocusMostRecentChatTerminal"] = "workbench.action.terminal.chat.focusMostRecentChatTerminal";
  TerminalChatCommandId2["ToggleChatTerminalOutput"] = "workbench.action.terminal.chat.toggleChatTerminalOutput";
  TerminalChatCommandId2["FocusChatInstanceAction"] = "workbench.action.terminal.chat.focusChatInstance";
  TerminalChatCommandId2["ContinueInBackground"] = "workbench.action.terminal.chat.continueInBackground";
})(TerminalChatCommandId || (TerminalChatCommandId = {}));
const MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR = MenuId.for("terminalChatWidget");
const MENU_TERMINAL_CHAT_WIDGET_STATUS = MenuId.for("terminalChatWidget.status");
const MENU_TERMINAL_CHAT_WIDGET_TOOLBAR = MenuId.for("terminalChatWidget.toolbar");
var TerminalChatContextKeyStrings;
(function(TerminalChatContextKeyStrings2) {
  TerminalChatContextKeyStrings2["ChatFocus"] = "terminalChatFocus";
  TerminalChatContextKeyStrings2["ChatVisible"] = "terminalChatVisible";
  TerminalChatContextKeyStrings2["ChatActiveRequest"] = "terminalChatActiveRequest";
  TerminalChatContextKeyStrings2["ChatInputHasText"] = "terminalChatInputHasText";
  TerminalChatContextKeyStrings2["ChatAgentRegistered"] = "terminalChatAgentRegistered";
  TerminalChatContextKeyStrings2["ChatResponseEditorFocused"] = "terminalChatResponseEditorFocused";
  TerminalChatContextKeyStrings2["ChatResponseContainsCodeBlock"] = "terminalChatResponseContainsCodeBlock";
  TerminalChatContextKeyStrings2["ChatResponseContainsMultipleCodeBlocks"] = "terminalChatResponseContainsMultipleCodeBlocks";
  TerminalChatContextKeyStrings2["ChatResponseSupportsIssueReporting"] = "terminalChatResponseSupportsIssueReporting";
  TerminalChatContextKeyStrings2["ChatSessionResponseVote"] = "terminalChatSessionResponseVote";
  TerminalChatContextKeyStrings2["ChatHasTerminals"] = "hasChatTerminals";
  TerminalChatContextKeyStrings2["ChatHasHiddenTerminals"] = "hasHiddenChatTerminals";
})(TerminalChatContextKeyStrings || (TerminalChatContextKeyStrings = {}));
var TerminalChatContextKeys;
(function(TerminalChatContextKeys2) {
  TerminalChatContextKeys2.focused = new RawContextKey("terminalChatFocus", false, localize("chatFocusedContextKey", "Whether the chat view is focused."));
  TerminalChatContextKeys2.visible = new RawContextKey("terminalChatVisible", false, localize("chatVisibleContextKey", "Whether the chat view is visible."));
  TerminalChatContextKeys2.requestActive = new RawContextKey("terminalChatActiveRequest", false, localize("chatRequestActiveContextKey", "Whether there is an active chat request."));
  TerminalChatContextKeys2.inputHasText = new RawContextKey("terminalChatInputHasText", false, localize("chatInputHasTextContextKey", "Whether the chat input has text."));
  TerminalChatContextKeys2.responseContainsCodeBlock = new RawContextKey("terminalChatResponseContainsCodeBlock", false, localize("chatResponseContainsCodeBlockContextKey", "Whether the chat response contains a code block."));
  TerminalChatContextKeys2.responseContainsMultipleCodeBlocks = new RawContextKey("terminalChatResponseContainsMultipleCodeBlocks", false, localize("chatResponseContainsMultipleCodeBlocksContextKey", "Whether the chat response contains multiple code blocks."));
  TerminalChatContextKeys2.hasChatAgent = new RawContextKey("terminalChatAgentRegistered", false, localize("chatAgentRegisteredContextKey", "Whether a chat agent is registered for the terminal location."));
  TerminalChatContextKeys2.hasChatTerminals = new RawContextKey("hasChatTerminals", false, localize("terminalHasChatTerminals", "Whether there are any chat terminals."));
  TerminalChatContextKeys2.hasHiddenChatTerminals = new RawContextKey("hasHiddenChatTerminals", false, localize("terminalHasHiddenChatTerminals", "Whether there are any hidden chat terminals."));
})(TerminalChatContextKeys || (TerminalChatContextKeys = {}));
export {
  MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR,
  MENU_TERMINAL_CHAT_WIDGET_STATUS,
  MENU_TERMINAL_CHAT_WIDGET_TOOLBAR,
  TerminalChatCommandId,
  TerminalChatContextKeyStrings,
  TerminalChatContextKeys
};
//# sourceMappingURL=terminalChat.js.map
