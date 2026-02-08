import { localize } from "../../../../../nls.js";
var TerminalStickyScrollSettingId;
(function(TerminalStickyScrollSettingId2) {
  TerminalStickyScrollSettingId2["Enabled"] = "terminal.integrated.stickyScroll.enabled";
  TerminalStickyScrollSettingId2["MaxLineCount"] = "terminal.integrated.stickyScroll.maxLineCount";
  TerminalStickyScrollSettingId2["IgnoredCommands"] = "terminal.integrated.stickyScroll.ignoredCommands";
})(TerminalStickyScrollSettingId || (TerminalStickyScrollSettingId = {}));
const terminalStickyScrollConfiguration = {
  [
    "terminal.integrated.stickyScroll.enabled"
    /* TerminalStickyScrollSettingId.Enabled */
  ]: {
    markdownDescription: localize("stickyScroll.enabled", "Shows the current command at the top of the terminal. This feature requires [shell integration]({0}) to be activated. See {1}.", "https://code.visualstudio.com/docs/terminal/shell-integration", `\`#${"terminal.integrated.shellIntegration.enabled"}#\``),
    type: "boolean",
    default: true
  },
  [
    "terminal.integrated.stickyScroll.maxLineCount"
    /* TerminalStickyScrollSettingId.MaxLineCount */
  ]: {
    markdownDescription: localize("stickyScroll.maxLineCount", "Defines the maximum number of sticky lines to show. Sticky scroll lines will never exceed 40% of the viewport regardless of this setting."),
    type: "number",
    default: 5,
    minimum: 1,
    maximum: 10
  },
  [
    "terminal.integrated.stickyScroll.ignoredCommands"
    /* TerminalStickyScrollSettingId.IgnoredCommands */
  ]: {
    markdownDescription: localize("stickyScroll.ignoredCommands", "A list of commands that should not trigger sticky scroll. When a command from this list is detected, the sticky scroll overlay will be hidden."),
    type: "array",
    items: {
      type: "string"
    },
    default: [
      "clear",
      "cls",
      "clear-host",
      "copilot",
      "claude",
      "codex",
      "gemini"
    ]
  }
};
export {
  TerminalStickyScrollSettingId,
  terminalStickyScrollConfiguration
};
//# sourceMappingURL=terminalStickyScrollConfiguration.js.map
