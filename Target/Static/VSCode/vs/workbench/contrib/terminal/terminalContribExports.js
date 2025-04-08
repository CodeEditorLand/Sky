import { TerminalAccessibilityCommandId, defaultTerminalAccessibilityCommandsToSkipShell } from "../terminalContrib/accessibility/common/terminal.accessibility.js";
import { terminalAccessibilityConfiguration } from "../terminalContrib/accessibility/common/terminalAccessibilityConfiguration.js";
import { terminalAutoRepliesConfiguration } from "../terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.js";
import { terminalInitialHintConfiguration } from "../terminalContrib/chat/common/terminalInitialHintConfiguration.js";
import { terminalCommandGuideConfiguration } from "../terminalContrib/commandGuide/common/terminalCommandGuideConfiguration.js";
import { TerminalDeveloperCommandId } from "../terminalContrib/developer/common/terminal.developer.js";
import { defaultTerminalFindCommandToSkipShell } from "../terminalContrib/find/common/terminal.find.js";
import { defaultTerminalHistoryCommandsToSkipShell, terminalHistoryConfiguration } from "../terminalContrib/history/common/terminal.history.js";
import { TerminalStickyScrollSettingId, terminalStickyScrollConfiguration } from "../terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js";
import { defaultTerminalSuggestCommandsToSkipShell } from "../terminalContrib/suggest/common/terminal.suggest.js";
import { TerminalSuggestSettingId, terminalSuggestConfiguration } from "../terminalContrib/suggest/common/terminalSuggestConfiguration.js";
import { terminalTypeAheadConfiguration } from "../terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.js";
import { terminalZoomConfiguration } from "../terminalContrib/zoom/common/terminal.zoom.js";
var TerminalContribCommandId = ((TerminalContribCommandId2) => {
  TerminalContribCommandId2[TerminalContribCommandId2["A11yFocusAccessibleBuffer"] = TerminalAccessibilityCommandId.FocusAccessibleBuffer] = "A11yFocusAccessibleBuffer";
  TerminalContribCommandId2[TerminalContribCommandId2["DeveloperRestartPtyHost"] = TerminalDeveloperCommandId.RestartPtyHost] = "DeveloperRestartPtyHost";
  return TerminalContribCommandId2;
})(TerminalContribCommandId || {});
var TerminalContribSettingId = ((TerminalContribSettingId2) => {
  TerminalContribSettingId2[TerminalContribSettingId2["SuggestEnabled"] = TerminalSuggestSettingId.Enabled] = "SuggestEnabled";
  TerminalContribSettingId2[TerminalContribSettingId2["StickyScrollEnabled"] = TerminalStickyScrollSettingId.Enabled] = "StickyScrollEnabled";
  return TerminalContribSettingId2;
})(TerminalContribSettingId || {});
const terminalContribConfiguration = {
  ...terminalAccessibilityConfiguration,
  ...terminalAutoRepliesConfiguration,
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
  TerminalContribSettingId,
  defaultTerminalContribCommandsToSkipShell,
  terminalContribConfiguration
};
//# sourceMappingURL=terminalContribExports.js.map
