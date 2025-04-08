var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { IProcessEnvironment, OperatingSystem } from "../../../base/common/platform.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IPtyHostProcessReplayEvent, ISerializedCommandDetectionCapability, ITerminalCapabilityStore } from "./capabilities/capabilities.js";
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from "./terminalProcess.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { ISerializableEnvironmentVariableCollections } from "./environmentVariable.js";
import { RawContextKey } from "../../contextkey/common/contextkey.js";
import { IWorkspaceFolder } from "../../workspace/common/workspace.js";
import { Registry } from "../../registry/common/platform.js";
import { ILogService } from "../../log/common/log.js";
const terminalTabFocusModeContextKey = new RawContextKey("terminalTabFocusMode", false, true);
var TerminalSettingPrefix = /* @__PURE__ */ ((TerminalSettingPrefix2) => {
  TerminalSettingPrefix2["AutomationProfile"] = "terminal.integrated.automationProfile.";
  TerminalSettingPrefix2["DefaultProfile"] = "terminal.integrated.defaultProfile.";
  TerminalSettingPrefix2["Profiles"] = "terminal.integrated.profiles.";
  return TerminalSettingPrefix2;
})(TerminalSettingPrefix || {});
var TerminalSettingId = /* @__PURE__ */ ((TerminalSettingId2) => {
  TerminalSettingId2["SendKeybindingsToShell"] = "terminal.integrated.sendKeybindingsToShell";
  TerminalSettingId2["AutomationProfileLinux"] = "terminal.integrated.automationProfile.linux";
  TerminalSettingId2["AutomationProfileMacOs"] = "terminal.integrated.automationProfile.osx";
  TerminalSettingId2["AutomationProfileWindows"] = "terminal.integrated.automationProfile.windows";
  TerminalSettingId2["ProfilesWindows"] = "terminal.integrated.profiles.windows";
  TerminalSettingId2["ProfilesMacOs"] = "terminal.integrated.profiles.osx";
  TerminalSettingId2["ProfilesLinux"] = "terminal.integrated.profiles.linux";
  TerminalSettingId2["DefaultProfileLinux"] = "terminal.integrated.defaultProfile.linux";
  TerminalSettingId2["DefaultProfileMacOs"] = "terminal.integrated.defaultProfile.osx";
  TerminalSettingId2["DefaultProfileWindows"] = "terminal.integrated.defaultProfile.windows";
  TerminalSettingId2["UseWslProfiles"] = "terminal.integrated.useWslProfiles";
  TerminalSettingId2["TabsDefaultColor"] = "terminal.integrated.tabs.defaultColor";
  TerminalSettingId2["TabsDefaultIcon"] = "terminal.integrated.tabs.defaultIcon";
  TerminalSettingId2["TabsEnabled"] = "terminal.integrated.tabs.enabled";
  TerminalSettingId2["TabsEnableAnimation"] = "terminal.integrated.tabs.enableAnimation";
  TerminalSettingId2["TabsHideCondition"] = "terminal.integrated.tabs.hideCondition";
  TerminalSettingId2["TabsShowActiveTerminal"] = "terminal.integrated.tabs.showActiveTerminal";
  TerminalSettingId2["TabsShowActions"] = "terminal.integrated.tabs.showActions";
  TerminalSettingId2["TabsLocation"] = "terminal.integrated.tabs.location";
  TerminalSettingId2["TabsFocusMode"] = "terminal.integrated.tabs.focusMode";
  TerminalSettingId2["MacOptionIsMeta"] = "terminal.integrated.macOptionIsMeta";
  TerminalSettingId2["MacOptionClickForcesSelection"] = "terminal.integrated.macOptionClickForcesSelection";
  TerminalSettingId2["AltClickMovesCursor"] = "terminal.integrated.altClickMovesCursor";
  TerminalSettingId2["CopyOnSelection"] = "terminal.integrated.copyOnSelection";
  TerminalSettingId2["EnableMultiLinePasteWarning"] = "terminal.integrated.enableMultiLinePasteWarning";
  TerminalSettingId2["DrawBoldTextInBrightColors"] = "terminal.integrated.drawBoldTextInBrightColors";
  TerminalSettingId2["FontFamily"] = "terminal.integrated.fontFamily";
  TerminalSettingId2["FontSize"] = "terminal.integrated.fontSize";
  TerminalSettingId2["LetterSpacing"] = "terminal.integrated.letterSpacing";
  TerminalSettingId2["LineHeight"] = "terminal.integrated.lineHeight";
  TerminalSettingId2["MinimumContrastRatio"] = "terminal.integrated.minimumContrastRatio";
  TerminalSettingId2["TabStopWidth"] = "terminal.integrated.tabStopWidth";
  TerminalSettingId2["FastScrollSensitivity"] = "terminal.integrated.fastScrollSensitivity";
  TerminalSettingId2["MouseWheelScrollSensitivity"] = "terminal.integrated.mouseWheelScrollSensitivity";
  TerminalSettingId2["BellDuration"] = "terminal.integrated.bellDuration";
  TerminalSettingId2["FontWeight"] = "terminal.integrated.fontWeight";
  TerminalSettingId2["FontWeightBold"] = "terminal.integrated.fontWeightBold";
  TerminalSettingId2["CursorBlinking"] = "terminal.integrated.cursorBlinking";
  TerminalSettingId2["CursorStyle"] = "terminal.integrated.cursorStyle";
  TerminalSettingId2["CursorStyleInactive"] = "terminal.integrated.cursorStyleInactive";
  TerminalSettingId2["CursorWidth"] = "terminal.integrated.cursorWidth";
  TerminalSettingId2["Scrollback"] = "terminal.integrated.scrollback";
  TerminalSettingId2["DetectLocale"] = "terminal.integrated.detectLocale";
  TerminalSettingId2["DefaultLocation"] = "terminal.integrated.defaultLocation";
  TerminalSettingId2["GpuAcceleration"] = "terminal.integrated.gpuAcceleration";
  TerminalSettingId2["TerminalTitleSeparator"] = "terminal.integrated.tabs.separator";
  TerminalSettingId2["TerminalTitle"] = "terminal.integrated.tabs.title";
  TerminalSettingId2["TerminalDescription"] = "terminal.integrated.tabs.description";
  TerminalSettingId2["RightClickBehavior"] = "terminal.integrated.rightClickBehavior";
  TerminalSettingId2["MiddleClickBehavior"] = "terminal.integrated.middleClickBehavior";
  TerminalSettingId2["Cwd"] = "terminal.integrated.cwd";
  TerminalSettingId2["ConfirmOnExit"] = "terminal.integrated.confirmOnExit";
  TerminalSettingId2["ConfirmOnKill"] = "terminal.integrated.confirmOnKill";
  TerminalSettingId2["EnableBell"] = "terminal.integrated.enableBell";
  TerminalSettingId2["EnableVisualBell"] = "terminal.integrated.enableVisualBell";
  TerminalSettingId2["CommandsToSkipShell"] = "terminal.integrated.commandsToSkipShell";
  TerminalSettingId2["AllowChords"] = "terminal.integrated.allowChords";
  TerminalSettingId2["AllowMnemonics"] = "terminal.integrated.allowMnemonics";
  TerminalSettingId2["TabFocusMode"] = "terminal.integrated.tabFocusMode";
  TerminalSettingId2["EnvMacOs"] = "terminal.integrated.env.osx";
  TerminalSettingId2["EnvLinux"] = "terminal.integrated.env.linux";
  TerminalSettingId2["EnvWindows"] = "terminal.integrated.env.windows";
  TerminalSettingId2["EnvironmentChangesIndicator"] = "terminal.integrated.environmentChangesIndicator";
  TerminalSettingId2["EnvironmentChangesRelaunch"] = "terminal.integrated.environmentChangesRelaunch";
  TerminalSettingId2["ShowExitAlert"] = "terminal.integrated.showExitAlert";
  TerminalSettingId2["SplitCwd"] = "terminal.integrated.splitCwd";
  TerminalSettingId2["WindowsEnableConpty"] = "terminal.integrated.windowsEnableConpty";
  TerminalSettingId2["WindowsUseConptyDll"] = "terminal.integrated.windowsUseConptyDll";
  TerminalSettingId2["WordSeparators"] = "terminal.integrated.wordSeparators";
  TerminalSettingId2["EnableFileLinks"] = "terminal.integrated.enableFileLinks";
  TerminalSettingId2["AllowedLinkSchemes"] = "terminal.integrated.allowedLinkSchemes";
  TerminalSettingId2["UnicodeVersion"] = "terminal.integrated.unicodeVersion";
  TerminalSettingId2["EnablePersistentSessions"] = "terminal.integrated.enablePersistentSessions";
  TerminalSettingId2["PersistentSessionReviveProcess"] = "terminal.integrated.persistentSessionReviveProcess";
  TerminalSettingId2["HideOnStartup"] = "terminal.integrated.hideOnStartup";
  TerminalSettingId2["HideOnLastClosed"] = "terminal.integrated.hideOnLastClosed";
  TerminalSettingId2["CustomGlyphs"] = "terminal.integrated.customGlyphs";
  TerminalSettingId2["RescaleOverlappingGlyphs"] = "terminal.integrated.rescaleOverlappingGlyphs";
  TerminalSettingId2["PersistentSessionScrollback"] = "terminal.integrated.persistentSessionScrollback";
  TerminalSettingId2["InheritEnv"] = "terminal.integrated.inheritEnv";
  TerminalSettingId2["ShowLinkHover"] = "terminal.integrated.showLinkHover";
  TerminalSettingId2["IgnoreProcessNames"] = "terminal.integrated.ignoreProcessNames";
  TerminalSettingId2["ShellIntegrationEnabled"] = "terminal.integrated.shellIntegration.enabled";
  TerminalSettingId2["ShellIntegrationShowWelcome"] = "terminal.integrated.shellIntegration.showWelcome";
  TerminalSettingId2["ShellIntegrationDecorationsEnabled"] = "terminal.integrated.shellIntegration.decorationsEnabled";
  TerminalSettingId2["ShellIntegrationEnvironmentReporting"] = "terminal.integrated.shellIntegration.environmentReporting";
  TerminalSettingId2["EnableImages"] = "terminal.integrated.enableImages";
  TerminalSettingId2["SmoothScrolling"] = "terminal.integrated.smoothScrolling";
  TerminalSettingId2["IgnoreBracketedPasteMode"] = "terminal.integrated.ignoreBracketedPasteMode";
  TerminalSettingId2["FocusAfterRun"] = "terminal.integrated.focusAfterRun";
  TerminalSettingId2["FontLigaturesEnabled"] = "terminal.integrated.fontLigatures.enabled";
  TerminalSettingId2["FontLigaturesFeatureSettings"] = "terminal.integrated.fontLigatures.featureSettings";
  TerminalSettingId2["FontLigaturesFallbackLigatures"] = "terminal.integrated.fontLigatures.fallbackLigatures";
  TerminalSettingId2["DeveloperPtyHostLatency"] = "terminal.integrated.developer.ptyHost.latency";
  TerminalSettingId2["DeveloperPtyHostStartupDelay"] = "terminal.integrated.developer.ptyHost.startupDelay";
  TerminalSettingId2["DevMode"] = "terminal.integrated.developer.devMode";
  return TerminalSettingId2;
})(TerminalSettingId || {});
var PosixShellType = /* @__PURE__ */ ((PosixShellType2) => {
  PosixShellType2["Bash"] = "bash";
  PosixShellType2["Fish"] = "fish";
  PosixShellType2["Sh"] = "sh";
  PosixShellType2["Csh"] = "csh";
  PosixShellType2["Ksh"] = "ksh";
  PosixShellType2["Zsh"] = "zsh";
  return PosixShellType2;
})(PosixShellType || {});
var WindowsShellType = /* @__PURE__ */ ((WindowsShellType2) => {
  WindowsShellType2["CommandPrompt"] = "cmd";
  WindowsShellType2["Wsl"] = "wsl";
  WindowsShellType2["GitBash"] = "gitbash";
  return WindowsShellType2;
})(WindowsShellType || {});
var GeneralShellType = /* @__PURE__ */ ((GeneralShellType2) => {
  GeneralShellType2["PowerShell"] = "pwsh";
  GeneralShellType2["Python"] = "python";
  GeneralShellType2["Julia"] = "julia";
  GeneralShellType2["NuShell"] = "nu";
  GeneralShellType2["Node"] = "node";
  return GeneralShellType2;
})(GeneralShellType || {});
var TitleEventSource = /* @__PURE__ */ ((TitleEventSource2) => {
  TitleEventSource2[TitleEventSource2["Api"] = 0] = "Api";
  TitleEventSource2[TitleEventSource2["Process"] = 1] = "Process";
  TitleEventSource2[TitleEventSource2["Sequence"] = 2] = "Sequence";
  TitleEventSource2[TitleEventSource2["Config"] = 3] = "Config";
  return TitleEventSource2;
})(TitleEventSource || {});
var TerminalIpcChannels = /* @__PURE__ */ ((TerminalIpcChannels2) => {
  TerminalIpcChannels2["LocalPty"] = "localPty";
  TerminalIpcChannels2["PtyHost"] = "ptyHost";
  TerminalIpcChannels2["PtyHostWindow"] = "ptyHostWindow";
  TerminalIpcChannels2["Logger"] = "logger";
  TerminalIpcChannels2["Heartbeat"] = "heartbeat";
  return TerminalIpcChannels2;
})(TerminalIpcChannels || {});
var ProcessPropertyType = /* @__PURE__ */ ((ProcessPropertyType2) => {
  ProcessPropertyType2["Cwd"] = "cwd";
  ProcessPropertyType2["InitialCwd"] = "initialCwd";
  ProcessPropertyType2["FixedDimensions"] = "fixedDimensions";
  ProcessPropertyType2["Title"] = "title";
  ProcessPropertyType2["ShellType"] = "shellType";
  ProcessPropertyType2["HasChildProcesses"] = "hasChildProcesses";
  ProcessPropertyType2["ResolvedShellLaunchConfig"] = "resolvedShellLaunchConfig";
  ProcessPropertyType2["OverrideDimensions"] = "overrideDimensions";
  ProcessPropertyType2["FailedShellIntegrationActivation"] = "failedShellIntegrationActivation";
  ProcessPropertyType2["UsedShellIntegrationInjection"] = "usedShellIntegrationInjection";
  ProcessPropertyType2["ShellIntegrationInjectionFailureReason"] = "shellIntegrationInjectionFailureReason";
  return ProcessPropertyType2;
})(ProcessPropertyType || {});
const IPtyService = createDecorator("ptyService");
var HeartbeatConstants = /* @__PURE__ */ ((HeartbeatConstants2) => {
  HeartbeatConstants2[HeartbeatConstants2["BeatInterval"] = 5e3] = "BeatInterval";
  HeartbeatConstants2[HeartbeatConstants2["ConnectingBeatInterval"] = 2e4] = "ConnectingBeatInterval";
  HeartbeatConstants2[HeartbeatConstants2["FirstWaitMultiplier"] = 1.2] = "FirstWaitMultiplier";
  HeartbeatConstants2[HeartbeatConstants2["SecondWaitMultiplier"] = 1] = "SecondWaitMultiplier";
  HeartbeatConstants2[HeartbeatConstants2["CreateProcessTimeout"] = 5e3] = "CreateProcessTimeout";
  return HeartbeatConstants2;
})(HeartbeatConstants || {});
var TerminalLocation = /* @__PURE__ */ ((TerminalLocation2) => {
  TerminalLocation2[TerminalLocation2["Panel"] = 1] = "Panel";
  TerminalLocation2[TerminalLocation2["Editor"] = 2] = "Editor";
  return TerminalLocation2;
})(TerminalLocation || {});
var TerminalLocationString = /* @__PURE__ */ ((TerminalLocationString2) => {
  TerminalLocationString2["TerminalView"] = "view";
  TerminalLocationString2["Editor"] = "editor";
  return TerminalLocationString2;
})(TerminalLocationString || {});
var LocalReconnectConstants = /* @__PURE__ */ ((LocalReconnectConstants2) => {
  LocalReconnectConstants2[LocalReconnectConstants2["GraceTime"] = 6e4] = "GraceTime";
  LocalReconnectConstants2[LocalReconnectConstants2["ShortGraceTime"] = 6e3] = "ShortGraceTime";
  return LocalReconnectConstants2;
})(LocalReconnectConstants || {});
var FlowControlConstants = /* @__PURE__ */ ((FlowControlConstants2) => {
  FlowControlConstants2[FlowControlConstants2["HighWatermarkChars"] = 1e5] = "HighWatermarkChars";
  FlowControlConstants2[FlowControlConstants2["LowWatermarkChars"] = 5e3] = "LowWatermarkChars";
  FlowControlConstants2[FlowControlConstants2["CharCountAckSize"] = 5e3] = "CharCountAckSize";
  return FlowControlConstants2;
})(FlowControlConstants || {});
var ProfileSource = /* @__PURE__ */ ((ProfileSource2) => {
  ProfileSource2["GitBash"] = "Git Bash";
  ProfileSource2["Pwsh"] = "PowerShell";
  return ProfileSource2;
})(ProfileSource || {});
var ShellIntegrationStatus = /* @__PURE__ */ ((ShellIntegrationStatus2) => {
  ShellIntegrationStatus2[ShellIntegrationStatus2["Off"] = 0] = "Off";
  ShellIntegrationStatus2[ShellIntegrationStatus2["FinalTerm"] = 1] = "FinalTerm";
  ShellIntegrationStatus2[ShellIntegrationStatus2["VSCode"] = 2] = "VSCode";
  return ShellIntegrationStatus2;
})(ShellIntegrationStatus || {});
var ShellIntegrationInjectionFailureReason = /* @__PURE__ */ ((ShellIntegrationInjectionFailureReason2) => {
  ShellIntegrationInjectionFailureReason2["InjectionSettingDisabled"] = "injectionSettingDisabled";
  ShellIntegrationInjectionFailureReason2["NoExecutable"] = "noExecutable";
  ShellIntegrationInjectionFailureReason2["FeatureTerminal"] = "featureTerminal";
  ShellIntegrationInjectionFailureReason2["IgnoreShellIntegrationFlag"] = "ignoreShellIntegrationFlag";
  ShellIntegrationInjectionFailureReason2["Winpty"] = "winpty";
  ShellIntegrationInjectionFailureReason2["UnsupportedArgs"] = "unsupportedArgs";
  ShellIntegrationInjectionFailureReason2["UnsupportedShell"] = "unsupportedShell";
  return ShellIntegrationInjectionFailureReason2;
})(ShellIntegrationInjectionFailureReason || {});
var TerminalExitReason = /* @__PURE__ */ ((TerminalExitReason2) => {
  TerminalExitReason2[TerminalExitReason2["Unknown"] = 0] = "Unknown";
  TerminalExitReason2[TerminalExitReason2["Shutdown"] = 1] = "Shutdown";
  TerminalExitReason2[TerminalExitReason2["Process"] = 2] = "Process";
  TerminalExitReason2[TerminalExitReason2["User"] = 3] = "User";
  TerminalExitReason2[TerminalExitReason2["Extension"] = 4] = "Extension";
  return TerminalExitReason2;
})(TerminalExitReason || {});
const TerminalExtensions = {
  Backend: "workbench.contributions.terminal.processBackend"
};
class TerminalBackendRegistry {
  static {
    __name(this, "TerminalBackendRegistry");
  }
  _backends = /* @__PURE__ */ new Map();
  get backends() {
    return this._backends;
  }
  registerTerminalBackend(backend) {
    const key = this._sanitizeRemoteAuthority(backend.remoteAuthority);
    if (this._backends.has(key)) {
      throw new Error(`A terminal backend with remote authority '${key}' was already registered.`);
    }
    this._backends.set(key, backend);
  }
  getTerminalBackend(remoteAuthority) {
    return this._backends.get(this._sanitizeRemoteAuthority(remoteAuthority));
  }
  _sanitizeRemoteAuthority(remoteAuthority) {
    return remoteAuthority?.toLowerCase() ?? "";
  }
}
Registry.add(TerminalExtensions.Backend, new TerminalBackendRegistry());
const ILocalPtyService = createDecorator("localPtyService");
const ITerminalLogService = createDecorator("terminalLogService");
export {
  FlowControlConstants,
  GeneralShellType,
  HeartbeatConstants,
  ILocalPtyService,
  IPtyService,
  ITerminalLogService,
  LocalReconnectConstants,
  PosixShellType,
  ProcessPropertyType,
  ProfileSource,
  ShellIntegrationInjectionFailureReason,
  ShellIntegrationStatus,
  TerminalExitReason,
  TerminalExtensions,
  TerminalIpcChannels,
  TerminalLocation,
  TerminalLocationString,
  TerminalSettingId,
  TerminalSettingPrefix,
  TitleEventSource,
  WindowsShellType,
  terminalTabFocusModeContextKey
};
//# sourceMappingURL=terminal.js.map
