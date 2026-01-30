import { localize } from "../../../../../nls.js";
var TerminalStickyScrollSettingId;
(function(TerminalStickyScrollSettingId2) {
  TerminalStickyScrollSettingId2["Enabled"] = "terminal.integrated.stickyScroll.enabled";
  TerminalStickyScrollSettingId2["MaxLineCount"] = "terminal.integrated.stickyScroll.maxLineCount";
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
  }
};
export {
  TerminalStickyScrollSettingId,
  terminalStickyScrollConfiguration
};
//# sourceMappingURL=terminalStickyScrollConfiguration.js.map
