var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { isNumber } from "../../../../base/common/types.js";
const ITerminalService = createDecorator("terminalService");
const ITerminalConfigurationService = createDecorator("terminalConfigurationService");
const ITerminalEditorService = createDecorator("terminalEditorService");
const ITerminalEditingService = createDecorator("terminalEditingService");
const ITerminalGroupService = createDecorator("terminalGroupService");
const ITerminalInstanceService = createDecorator("terminalInstanceService");
const ITerminalChatService = createDecorator("terminalChatService");
var Direction;
(function(Direction2) {
  Direction2[Direction2["Left"] = 0] = "Left";
  Direction2[Direction2["Right"] = 1] = "Right";
  Direction2[Direction2["Up"] = 2] = "Up";
  Direction2[Direction2["Down"] = 3] = "Down";
})(Direction || (Direction = {}));
var TerminalConnectionState;
(function(TerminalConnectionState2) {
  TerminalConnectionState2[TerminalConnectionState2["Connecting"] = 0] = "Connecting";
  TerminalConnectionState2[TerminalConnectionState2["Connected"] = 1] = "Connected";
})(TerminalConnectionState || (TerminalConnectionState = {}));
const isDetachedTerminalInstance = /* @__PURE__ */ __name((t) => !isNumber(t.instanceId), "isDetachedTerminalInstance");
class TerminalLinkQuickPickEvent extends MouseEvent {
  static {
    __name(this, "TerminalLinkQuickPickEvent");
  }
}
const terminalEditorId = "terminalEditor";
var XtermTerminalConstants;
(function(XtermTerminalConstants2) {
  XtermTerminalConstants2[XtermTerminalConstants2["SearchHighlightLimit"] = 2e4] = "SearchHighlightLimit";
})(XtermTerminalConstants || (XtermTerminalConstants = {}));
var LinuxDistro;
(function(LinuxDistro2) {
  LinuxDistro2[LinuxDistro2["Unknown"] = 1] = "Unknown";
  LinuxDistro2[LinuxDistro2["Fedora"] = 2] = "Fedora";
  LinuxDistro2[LinuxDistro2["Ubuntu"] = 3] = "Ubuntu";
})(LinuxDistro || (LinuxDistro = {}));
var TerminalDataTransfers;
(function(TerminalDataTransfers2) {
  TerminalDataTransfers2["Terminals"] = "Terminals";
})(TerminalDataTransfers || (TerminalDataTransfers = {}));
export {
  Direction,
  ITerminalChatService,
  ITerminalConfigurationService,
  ITerminalEditingService,
  ITerminalEditorService,
  ITerminalGroupService,
  ITerminalInstanceService,
  ITerminalService,
  LinuxDistro,
  TerminalConnectionState,
  TerminalDataTransfers,
  TerminalLinkQuickPickEvent,
  XtermTerminalConstants,
  isDetachedTerminalInstance,
  terminalEditorId
};
//# sourceMappingURL=terminal.js.map
