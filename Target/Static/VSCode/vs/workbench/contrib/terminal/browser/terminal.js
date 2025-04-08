var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDimension } from "../../../../base/browser/dom.js";
import { Orientation } from "../../../../base/browser/ui/splitview/splitview.js";
import { Color } from "../../../../base/common/color.js";
import { Event, IDynamicListEventMultiplexer } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeyMods } from "../../../../platform/quickinput/common/quickInput.js";
import { IMarkProperties, ITerminalCapabilityImplMap, ITerminalCapabilityStore, ITerminalCommand, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { IMergedEnvironmentVariableCollection } from "../../../../platform/terminal/common/environmentVariable.js";
import { IExtensionTerminalProfile, IReconnectionProperties, IShellIntegration, IShellLaunchConfig, ITerminalBackend, ITerminalDimensions, ITerminalLaunchError, ITerminalProfile, ITerminalTabLayoutInfoById, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalShellType, TerminalType, TitleEventSource, WaitOnExitValue } from "../../../../platform/terminal/common/terminal.js";
import { IColorTheme } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IEditableData } from "../../../common/views.js";
import { ITerminalStatusList } from "./terminalStatusList.js";
import { XtermTerminal } from "./xterm/xtermTerminal.js";
import { IRegisterContributedProfileArgs, IRemoteTerminalAttachTarget, IStartExtensionTerminalRequest, ITerminalConfiguration, ITerminalFont, ITerminalProcessExtHostProxy, ITerminalProcessInfo } from "../common/terminal.js";
import { ScrollPosition } from "./xterm/markNavigationAddon.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
const ITerminalService = createDecorator("terminalService");
const ITerminalConfigurationService = createDecorator("terminalConfigurationService");
const ITerminalEditorService = createDecorator("terminalEditorService");
const ITerminalGroupService = createDecorator("terminalGroupService");
const ITerminalInstanceService = createDecorator("terminalInstanceService");
var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2[Direction2["Left"] = 0] = "Left";
  Direction2[Direction2["Right"] = 1] = "Right";
  Direction2[Direction2["Up"] = 2] = "Up";
  Direction2[Direction2["Down"] = 3] = "Down";
  return Direction2;
})(Direction || {});
var TerminalConnectionState = /* @__PURE__ */ ((TerminalConnectionState2) => {
  TerminalConnectionState2[TerminalConnectionState2["Connecting"] = 0] = "Connecting";
  TerminalConnectionState2[TerminalConnectionState2["Connected"] = 1] = "Connected";
  return TerminalConnectionState2;
})(TerminalConnectionState || {});
const isDetachedTerminalInstance = /* @__PURE__ */ __name((t) => typeof t.instanceId !== "number", "isDetachedTerminalInstance");
class TerminalLinkQuickPickEvent extends MouseEvent {
  static {
    __name(this, "TerminalLinkQuickPickEvent");
  }
}
const terminalEditorId = "terminalEditor";
var XtermTerminalConstants = /* @__PURE__ */ ((XtermTerminalConstants2) => {
  XtermTerminalConstants2[XtermTerminalConstants2["SearchHighlightLimit"] = 2e4] = "SearchHighlightLimit";
  return XtermTerminalConstants2;
})(XtermTerminalConstants || {});
var LinuxDistro = /* @__PURE__ */ ((LinuxDistro2) => {
  LinuxDistro2[LinuxDistro2["Unknown"] = 1] = "Unknown";
  LinuxDistro2[LinuxDistro2["Fedora"] = 2] = "Fedora";
  LinuxDistro2[LinuxDistro2["Ubuntu"] = 3] = "Ubuntu";
  return LinuxDistro2;
})(LinuxDistro || {});
var TerminalDataTransfers = /* @__PURE__ */ ((TerminalDataTransfers2) => {
  TerminalDataTransfers2["Terminals"] = "Terminals";
  return TerminalDataTransfers2;
})(TerminalDataTransfers || {});
export {
  Direction,
  ITerminalConfigurationService,
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
