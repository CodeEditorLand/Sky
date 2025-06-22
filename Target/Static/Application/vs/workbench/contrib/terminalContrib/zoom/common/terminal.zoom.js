import { isMacintosh } from "../../../../../base/common/platform.js";
import { localize } from "../../../../../nls.js";
var TerminalZoomCommandId;
(function(TerminalZoomCommandId2) {
  TerminalZoomCommandId2["FontZoomIn"] = "workbench.action.terminal.fontZoomIn";
  TerminalZoomCommandId2["FontZoomOut"] = "workbench.action.terminal.fontZoomOut";
  TerminalZoomCommandId2["FontZoomReset"] = "workbench.action.terminal.fontZoomReset";
})(TerminalZoomCommandId || (TerminalZoomCommandId = {}));
var TerminalZoomSettingId;
(function(TerminalZoomSettingId2) {
  TerminalZoomSettingId2["MouseWheelZoom"] = "terminal.integrated.mouseWheelZoom";
})(TerminalZoomSettingId || (TerminalZoomSettingId = {}));
const terminalZoomConfiguration = {
  [
    "terminal.integrated.mouseWheelZoom"
    /* TerminalZoomSettingId.MouseWheelZoom */
  ]: {
    markdownDescription: isMacintosh ? localize("terminal.integrated.mouseWheelZoom.mac", "Zoom the font of the terminal when using mouse wheel and holding `Cmd`.") : localize("terminal.integrated.mouseWheelZoom", "Zoom the font of the terminal when using mouse wheel and holding `Ctrl`."),
    type: "boolean",
    default: false
  }
};
export {
  TerminalZoomCommandId,
  TerminalZoomSettingId,
  terminalZoomConfiguration
};
//# sourceMappingURL=terminal.zoom.js.map
