var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { localize } from "../../../../nls.js";
import { asCssVariable, asCssVariableName, registerColor, transparent } from "../../../../platform/theme/common/colorRegistry.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IDebugService, State, IDebugSession, IDebugConfiguration } from "../common/debug.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { STATUS_BAR_FOREGROUND, STATUS_BAR_BORDER, COMMAND_CENTER_BACKGROUND } from "../../../common/theme.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
const STATUS_BAR_DEBUGGING_BACKGROUND = registerColor("statusBar.debuggingBackground", {
  dark: "#CC6633",
  light: "#CC6633",
  hcDark: "#BA592C",
  hcLight: "#B5200D"
}, localize("statusBarDebuggingBackground", "Status bar background color when a program is being debugged. The status bar is shown in the bottom of the window"));
const STATUS_BAR_DEBUGGING_FOREGROUND = registerColor("statusBar.debuggingForeground", {
  dark: STATUS_BAR_FOREGROUND,
  light: STATUS_BAR_FOREGROUND,
  hcDark: STATUS_BAR_FOREGROUND,
  hcLight: "#FFFFFF"
}, localize("statusBarDebuggingForeground", "Status bar foreground color when a program is being debugged. The status bar is shown in the bottom of the window"));
const STATUS_BAR_DEBUGGING_BORDER = registerColor("statusBar.debuggingBorder", STATUS_BAR_BORDER, localize("statusBarDebuggingBorder", "Status bar border color separating to the sidebar and editor when a program is being debugged. The status bar is shown in the bottom of the window"));
const COMMAND_CENTER_DEBUGGING_BACKGROUND = registerColor(
  "commandCenter.debuggingBackground",
  transparent(STATUS_BAR_DEBUGGING_BACKGROUND, 0.258),
  localize("commandCenter-activeBackground", "Command center background color when a program is being debugged"),
  true
);
let StatusBarColorProvider = class {
  constructor(debugService, contextService, statusbarService, layoutService, configurationService) {
    this.debugService = debugService;
    this.contextService = contextService;
    this.statusbarService = statusbarService;
    this.layoutService = layoutService;
    this.configurationService = configurationService;
    this.debugService.onDidChangeState(this.update, this, this.disposables);
    this.contextService.onDidChangeWorkbenchState(this.update, this, this.disposables);
    this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.enableStatusBarColor") || e.affectsConfiguration("debug.toolBarLocation")) {
        this.update();
      }
    }, void 0, this.disposables);
    this.update();
  }
  static {
    __name(this, "StatusBarColorProvider");
  }
  disposables = new DisposableStore();
  disposable;
  set enabled(enabled) {
    if (enabled === !!this.disposable) {
      return;
    }
    if (enabled) {
      this.disposable = this.statusbarService.overrideStyle({
        priority: 10,
        foreground: STATUS_BAR_DEBUGGING_FOREGROUND,
        background: STATUS_BAR_DEBUGGING_BACKGROUND,
        border: STATUS_BAR_DEBUGGING_BORDER
      });
    } else {
      this.disposable.dispose();
      this.disposable = void 0;
    }
  }
  update() {
    const debugConfig = this.configurationService.getValue("debug");
    const isInDebugMode = isStatusbarInDebugMode(this.debugService.state, this.debugService.getModel().getSessions());
    if (!debugConfig.enableStatusBarColor) {
      this.enabled = false;
    } else {
      this.enabled = isInDebugMode;
    }
    const isInCommandCenter = debugConfig.toolBarLocation === "commandCenter";
    this.layoutService.mainContainer.style.setProperty(
      asCssVariableName(COMMAND_CENTER_BACKGROUND),
      isInCommandCenter && isInDebugMode ? asCssVariable(COMMAND_CENTER_DEBUGGING_BACKGROUND) : ""
    );
  }
  dispose() {
    this.disposable?.dispose();
    this.disposables.dispose();
  }
};
StatusBarColorProvider = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IStatusbarService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IConfigurationService)
], StatusBarColorProvider);
function isStatusbarInDebugMode(state, sessions) {
  if (state === State.Inactive || state === State.Initializing || sessions.every((s) => s.suppressDebugStatusbar || s.configuration?.noDebug)) {
    return false;
  }
  return true;
}
__name(isStatusbarInDebugMode, "isStatusbarInDebugMode");
export {
  COMMAND_CENTER_DEBUGGING_BACKGROUND,
  STATUS_BAR_DEBUGGING_BACKGROUND,
  STATUS_BAR_DEBUGGING_BORDER,
  STATUS_BAR_DEBUGGING_FOREGROUND,
  StatusBarColorProvider,
  isStatusbarInDebugMode
};
//# sourceMappingURL=statusbarColorProvider.js.map
