import { localize } from "../../../../../nls.js";
var TerminalHistoryCommandId;
(function(TerminalHistoryCommandId2) {
  TerminalHistoryCommandId2["ClearPreviousSessionHistory"] = "workbench.action.terminal.clearPreviousSessionHistory";
  TerminalHistoryCommandId2["GoToRecentDirectory"] = "workbench.action.terminal.goToRecentDirectory";
  TerminalHistoryCommandId2["RunRecentCommand"] = "workbench.action.terminal.runRecentCommand";
})(TerminalHistoryCommandId || (TerminalHistoryCommandId = {}));
const defaultTerminalHistoryCommandsToSkipShell = [
  "workbench.action.terminal.goToRecentDirectory",
  "workbench.action.terminal.runRecentCommand"
  /* TerminalHistoryCommandId.RunRecentCommand */
];
var TerminalHistorySettingId;
(function(TerminalHistorySettingId2) {
  TerminalHistorySettingId2["ShellIntegrationCommandHistory"] = "terminal.integrated.shellIntegration.history";
})(TerminalHistorySettingId || (TerminalHistorySettingId = {}));
const terminalHistoryConfiguration = {
  [
    "terminal.integrated.shellIntegration.history"
    /* TerminalHistorySettingId.ShellIntegrationCommandHistory */
  ]: {
    restricted: true,
    markdownDescription: localize("terminal.integrated.shellIntegration.history", "Controls the number of recently used commands to keep in the terminal command history. Set to 0 to disable terminal command history."),
    type: "number",
    default: 100
  }
};
export {
  TerminalHistoryCommandId,
  TerminalHistorySettingId,
  defaultTerminalHistoryCommandsToSkipShell,
  terminalHistoryConfiguration
};
//# sourceMappingURL=terminal.history.js.map
