var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { getWindowById } from "../../../../base/browser/dom.js";
import { isAuxiliaryWindow } from "../../../../base/browser/window.js";
import { timeout } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/path.js";
import { isString } from "../../../../base/common/types.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { TelemetryTrustedValue } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { ITerminalEditorService, ITerminalService } from "./terminal.js";
let TerminalTelemetryContribution = class TerminalTelemetryContribution2 extends Disposable {
  static {
    __name(this, "TerminalTelemetryContribution");
  }
  static {
    this.ID = "terminalTelemetry";
  }
  constructor(lifecycleService, terminalService, terminalEditorService, _telemetryService) {
    super();
    this._telemetryService = _telemetryService;
    this._register(terminalService.onDidCreateInstance(async (instance) => {
      const store = new DisposableStore();
      this._store.add(store);
      await Promise.race([
        // Wait for process ready so the shell launch config is fully resolved, then
        // allow another 10 seconds for the shell integration to be fully initialized
        instance.processReady.then(() => {
          return timeout(1e4);
        }),
        // If the terminal is disposed, it's ready to report on immediately
        Event.toPromise(instance.onDisposed, store),
        // If the app is shutting down, flush
        Event.toPromise(lifecycleService.onWillShutdown, store)
      ]);
      let isInAuxWindow = false;
      try {
        const input = terminalEditorService.getInputFromResource(instance.resource);
        const windowId = input.group?.windowId;
        isInAuxWindow = !!(windowId && isAuxiliaryWindow(getWindowById(windowId, true).window));
      } catch {
      }
      this._logCreateInstance(instance, isInAuxWindow);
      this._store.delete(store);
    }));
  }
  _logCreateInstance(instance, isInAuxWindow) {
    const slc = instance.shellLaunchConfig;
    const commandDetection = instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    this._telemetryService.publicLog2("terminal/createInstance", {
      location: instance.target === TerminalLocation.Panel ? "view" : instance.target === TerminalLocation.Editor ? isInAuxWindow ? "editor-auxwindow" : "editor" : "unknown",
      shellType: new TelemetryTrustedValue(getSanitizedShellType(slc)),
      promptType: new TelemetryTrustedValue(instance.capabilities.get(
        6
        /* TerminalCapability.PromptTypeDetection */
      )?.promptType),
      isCustomPtyImplementation: !!slc.customPtyImplementation,
      isExtensionOwnedTerminal: !!slc.isExtensionOwnedTerminal,
      isLoginShell: (isString(slc.args) ? slc.args.split(" ") : slc.args)?.some((arg) => arg === "-l" || arg === "--login") ?? false,
      isReconnect: !!slc.attachPersistentProcess,
      hasRemoteAuthority: instance.hasRemoteAuthority,
      shellIntegrationQuality: commandDetection?.hasRichCommandDetection ? 2 : commandDetection ? 1 : 0,
      shellIntegrationInjected: instance.usedShellIntegrationInjection,
      shellIntegrationInjectionFailureReason: instance.shellIntegrationInjectionFailureReason,
      terminalSessionId: instance.sessionId
    });
  }
};
TerminalTelemetryContribution = __decorate([
  __param(0, ILifecycleService),
  __param(1, ITerminalService),
  __param(2, ITerminalEditorService),
  __param(3, ITelemetryService)
], TerminalTelemetryContribution);
var AllowedShellType;
(function(AllowedShellType2) {
  AllowedShellType2["Unknown"] = "unknown";
  AllowedShellType2["CommandPrompt"] = "cmd";
  AllowedShellType2["Cygwin"] = "cygwin-bash";
  AllowedShellType2["GitBash"] = "git-bash";
  AllowedShellType2["Msys2"] = "msys2-bash";
  AllowedShellType2["WindowsPowerShell"] = "windows-powershell";
  AllowedShellType2["Wsl"] = "wsl";
  AllowedShellType2["Bash"] = "bash";
  AllowedShellType2["Fish"] = "fish";
  AllowedShellType2["Pwsh"] = "pwsh";
  AllowedShellType2["PwshPreview"] = "pwsh-preview";
  AllowedShellType2["Sh"] = "sh";
  AllowedShellType2["Ssh"] = "ssh";
  AllowedShellType2["Tmux"] = "tmux";
  AllowedShellType2["Zsh"] = "zsh";
  AllowedShellType2["Amm"] = "amm";
  AllowedShellType2["Ash"] = "ash";
  AllowedShellType2["Csh"] = "csh";
  AllowedShellType2["Dash"] = "dash";
  AllowedShellType2["Elvish"] = "elvish";
  AllowedShellType2["Ion"] = "ion";
  AllowedShellType2["Ksh"] = "ksh";
  AllowedShellType2["Mksh"] = "mksh";
  AllowedShellType2["Msh"] = "msh";
  AllowedShellType2["NuShell"] = "nu";
  AllowedShellType2["Plan9Shell"] = "rc";
  AllowedShellType2["SchemeShell"] = "scsh";
  AllowedShellType2["Tcsh"] = "tcsh";
  AllowedShellType2["Termux"] = "termux";
  AllowedShellType2["Xonsh"] = "xonsh";
  AllowedShellType2["Clojure"] = "clj";
  AllowedShellType2["CommonLispSbcl"] = "sbcl";
  AllowedShellType2["Crystal"] = "crystal";
  AllowedShellType2["Deno"] = "deno";
  AllowedShellType2["Elixir"] = "iex";
  AllowedShellType2["Erlang"] = "erl";
  AllowedShellType2["FSharp"] = "fsi";
  AllowedShellType2["Go"] = "go";
  AllowedShellType2["HaskellGhci"] = "ghci";
  AllowedShellType2["Java"] = "jshell";
  AllowedShellType2["Julia"] = "julia";
  AllowedShellType2["Lua"] = "lua";
  AllowedShellType2["Node"] = "node";
  AllowedShellType2["Ocaml"] = "ocaml";
  AllowedShellType2["Perl"] = "perl";
  AllowedShellType2["Php"] = "php";
  AllowedShellType2["PrologSwipl"] = "swipl";
  AllowedShellType2["Python"] = "python";
  AllowedShellType2["R"] = "R";
  AllowedShellType2["RubyIrb"] = "irb";
  AllowedShellType2["Scala"] = "scala";
  AllowedShellType2["SchemeRacket"] = "racket";
  AllowedShellType2["SmalltalkGnu"] = "gst";
  AllowedShellType2["SmalltalkPharo"] = "pharo";
  AllowedShellType2["Tcl"] = "tclsh";
  AllowedShellType2["TsNode"] = "ts-node";
})(AllowedShellType || (AllowedShellType = {}));
const shellTypeExecutableAllowList = /* @__PURE__ */ new Set([
  "cmd",
  "wsl",
  "bash",
  "fish",
  "pwsh",
  "sh",
  "ssh",
  "tmux",
  "zsh",
  "amm",
  "ash",
  "csh",
  "dash",
  "elvish",
  "ion",
  "ksh",
  "mksh",
  "msh",
  "nu",
  "rc",
  "scsh",
  "tcsh",
  "termux",
  "xonsh",
  "clj",
  "sbcl",
  "crystal",
  "deno",
  "iex",
  "erl",
  "fsi",
  "go",
  "ghci",
  "jshell",
  "julia",
  "lua",
  "node",
  "ocaml",
  "perl",
  "php",
  "swipl",
  "python",
  "R",
  "irb",
  "scala",
  "racket",
  "gst",
  "pharo",
  "tclsh",
  "ts-node"
]);
const shellTypeExecutableRegexAllowList = [
  {
    regex: /^(?:pwsh|powershell)-preview$/i,
    type: "pwsh-preview"
    /* AllowedShellType.PwshPreview */
  },
  {
    regex: /^python(?:\d+(?:\.\d+)?)?$/i,
    type: "python"
    /* AllowedShellType.Python */
  }
];
const shellTypePathRegexAllowList = [
  // Cygwin uses bash.exe, so look up based on the path
  {
    regex: /\\Cygwin(?:64)?\\.+\\bash\.exe$/i,
    type: "cygwin-bash"
    /* AllowedShellType.Cygwin */
  },
  // Git bash uses bash.exe, so look up based on the path
  {
    regex: /\\Git\\.+\\bash\.exe$/i,
    type: "git-bash"
    /* AllowedShellType.GitBash */
  },
  // Msys2 uses bash.exe, so look up based on the path
  {
    regex: /\\msys(?:32|64)\\.+\\(?:bash|msys2)\.exe$/i,
    type: "msys2-bash"
    /* AllowedShellType.Msys2 */
  },
  // WindowsPowerShell should always be installed on this path, we cannot just look at the
  // executable name since powershell is the CLI on other platforms sometimes (eg. snap package)
  {
    regex: /\\WindowsPowerShell\\v1.0\\powershell.exe$/i,
    type: "windows-powershell"
    /* AllowedShellType.WindowsPowerShell */
  },
  // WSL executables will represent some other shell in the end, but it's difficult to determine
  // when we log
  {
    regex: /\\Windows\\(?:System32|SysWOW64|Sysnative)\\(?:bash|wsl)\.exe$/i,
    type: "wsl"
    /* AllowedShellType.Wsl */
  }
];
function getSanitizedShellType(slc) {
  if (!slc.executable) {
    return "unknown";
  }
  const executableFile = basename(slc.executable);
  const executableFileWithoutExt = executableFile.replace(/\.[^\.]+$/, "");
  for (const entry of shellTypePathRegexAllowList) {
    if (entry.regex.test(slc.executable)) {
      return entry.type;
    }
  }
  for (const entry of shellTypeExecutableRegexAllowList) {
    if (entry.regex.test(executableFileWithoutExt)) {
      return entry.type;
    }
  }
  if (shellTypeExecutableAllowList.has(executableFileWithoutExt)) {
    return executableFileWithoutExt;
  }
  return "unknown";
}
__name(getSanitizedShellType, "getSanitizedShellType");
export {
  TerminalTelemetryContribution
};
//# sourceMappingURL=terminalTelemetry.js.map
