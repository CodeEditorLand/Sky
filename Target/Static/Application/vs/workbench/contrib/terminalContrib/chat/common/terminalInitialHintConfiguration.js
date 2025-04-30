import { localize } from "../../../../../nls.js";
var TerminalInitialHintSettingId;
(function(TerminalInitialHintSettingId2) {
  TerminalInitialHintSettingId2["Enabled"] = "terminal.integrated.initialHint";
})(TerminalInitialHintSettingId || (TerminalInitialHintSettingId = {}));
const terminalInitialHintConfiguration = {
  [
    "terminal.integrated.initialHint"
    /* TerminalInitialHintSettingId.Enabled */
  ]: {
    restricted: true,
    markdownDescription: localize("terminal.integrated.initialHint", "Controls if the first terminal without input will show a hint about available actions when it is focused."),
    type: "boolean",
    default: true
  }
};
export {
  TerminalInitialHintSettingId,
  terminalInitialHintConfiguration
};
//# sourceMappingURL=terminalInitialHintConfiguration.js.map
