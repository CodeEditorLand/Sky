import { localize } from "../../../../../nls.js";
var TerminalAccessibilitySettingId = /* @__PURE__ */ ((TerminalAccessibilitySettingId2) => {
  TerminalAccessibilitySettingId2["AccessibleViewPreserveCursorPosition"] = "terminal.integrated.accessibleViewPreserveCursorPosition";
  TerminalAccessibilitySettingId2["AccessibleViewFocusOnCommandExecution"] = "terminal.integrated.accessibleViewFocusOnCommandExecution";
  return TerminalAccessibilitySettingId2;
})(TerminalAccessibilitySettingId || {});
const terminalAccessibilityConfiguration = {
  ["terminal.integrated.accessibleViewPreserveCursorPosition" /* AccessibleViewPreserveCursorPosition */]: {
    markdownDescription: localize("terminal.integrated.accessibleViewPreserveCursorPosition", "Preserve the cursor position on reopen of the terminal's accessible view rather than setting it to the bottom of the buffer."),
    type: "boolean",
    default: false
  },
  ["terminal.integrated.accessibleViewFocusOnCommandExecution" /* AccessibleViewFocusOnCommandExecution */]: {
    markdownDescription: localize("terminal.integrated.accessibleViewFocusOnCommandExecution", "Focus the terminal accessible view when a command is executed."),
    type: "boolean",
    default: false
  }
};
export {
  TerminalAccessibilitySettingId,
  terminalAccessibilityConfiguration
};
//# sourceMappingURL=terminalAccessibilityConfiguration.js.map
