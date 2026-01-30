import { defaultTerminalAccessibilityCommandsToSkipShell } from "../terminalContrib/accessibility/common/terminal.accessibility.js";
import { terminalAccessibilityConfiguration } from "../terminalContrib/accessibility/common/terminalAccessibilityConfiguration.js";
import { terminalAutoRepliesConfiguration } from "../terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.js";
import { terminalInitialHintConfiguration } from "../terminalContrib/inlineHint/common/terminalInitialHintConfiguration.js";
import { terminalChatAgentToolsConfiguration } from "../terminalContrib/chatAgentTools/common/terminalChatAgentToolsConfiguration.js";
import { terminalCommandGuideConfiguration } from "../terminalContrib/commandGuide/common/terminalCommandGuideConfiguration.js";
import { defaultTerminalFindCommandToSkipShell } from "../terminalContrib/find/common/terminal.find.js";
import { defaultTerminalHistoryCommandsToSkipShell, terminalHistoryConfiguration } from "../terminalContrib/history/common/terminal.history.js";
import { terminalStickyScrollConfiguration } from "../terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js";
import { defaultTerminalSuggestCommandsToSkipShell } from "../terminalContrib/suggest/common/terminal.suggest.js";
import { terminalSuggestConfiguration } from "../terminalContrib/suggest/common/terminalSuggestConfiguration.js";
import { terminalTypeAheadConfiguration } from "../terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.js";
import { terminalZoomConfiguration } from "../terminalContrib/zoom/common/terminal.zoom.js";
var TerminalContribCommandId;
(function(TerminalContribCommandId2) {
  TerminalContribCommandId2["A11yFocusAccessibleBuffer"] = "workbench.action.terminal.focusAccessibleBuffer";
  TerminalContribCommandId2["DeveloperRestartPtyHost"] = "workbench.action.terminal.restartPtyHost";
  TerminalContribCommandId2["OpenTerminalSettingsLink"] = "workbench.action.terminal.chat.openTerminalSettingsLink";
  TerminalContribCommandId2["DisableSessionAutoApproval"] = "workbench.action.terminal.chat.disableSessionAutoApproval";
  TerminalContribCommandId2["FocusMostRecentChatTerminalOutput"] = "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput";
  TerminalContribCommandId2["FocusMostRecentChatTerminal"] = "workbench.action.terminal.chat.focusMostRecentChatTerminal";
  TerminalContribCommandId2["ToggleChatTerminalOutput"] = "workbench.action.terminal.chat.toggleChatTerminalOutput";
  TerminalContribCommandId2["FocusChatInstanceAction"] = "workbench.action.terminal.chat.focusChatInstance";
})(TerminalContribCommandId || (TerminalContribCommandId = {}));
var TerminalContribSettingId;
(function(TerminalContribSettingId2) {
  TerminalContribSettingId2["StickyScrollEnabled"] = "terminal.integrated.stickyScroll.enabled";
  TerminalContribSettingId2["SuggestEnabled"] = "terminal.integrated.suggest.enabled";
  TerminalContribSettingId2["AutoApprove"] = "chat.tools.terminal.autoApprove";
  TerminalContribSettingId2["EnableAutoApprove"] = "chat.tools.terminal.enableAutoApprove";
  TerminalContribSettingId2["ShellIntegrationTimeout"] = "chat.tools.terminal.shellIntegrationTimeout";
  TerminalContribSettingId2["OutputLocation"] = "chat.tools.terminal.outputLocation";
})(TerminalContribSettingId || (TerminalContribSettingId = {}));
var TerminalContribContextKeyStrings;
(function(TerminalContribContextKeyStrings2) {
  TerminalContribContextKeyStrings2["ChatHasTerminals"] = "hasChatTerminals";
  TerminalContribContextKeyStrings2["ChatHasHiddenTerminals"] = "hasHiddenChatTerminals";
})(TerminalContribContextKeyStrings || (TerminalContribContextKeyStrings = {}));
const terminalContribConfiguration = {
  ...terminalAccessibilityConfiguration,
  ...terminalAutoRepliesConfiguration,
  ...terminalChatAgentToolsConfiguration,
  ...terminalInitialHintConfiguration,
  ...terminalCommandGuideConfiguration,
  ...terminalHistoryConfiguration,
  ...terminalStickyScrollConfiguration,
  ...terminalSuggestConfiguration,
  ...terminalTypeAheadConfiguration,
  ...terminalZoomConfiguration
};
const defaultTerminalContribCommandsToSkipShell = [
  ...defaultTerminalAccessibilityCommandsToSkipShell,
  ...defaultTerminalFindCommandToSkipShell,
  ...defaultTerminalHistoryCommandsToSkipShell,
  ...defaultTerminalSuggestCommandsToSkipShell
];
export {
  TerminalContribCommandId,
  TerminalContribContextKeyStrings,
  TerminalContribSettingId,
  defaultTerminalContribCommandsToSkipShell,
  terminalContribConfiguration
};
//# sourceMappingURL=terminalContribExports.js.map
