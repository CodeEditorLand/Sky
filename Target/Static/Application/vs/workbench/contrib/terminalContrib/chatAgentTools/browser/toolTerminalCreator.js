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
var ToolTerminalCreator_1;
import { DeferredPromise, disposableTimeout, raceTimeout } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { CancellationError } from "../../../../../base/common/errors.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore, MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { hasKey, isNumber, isObject, isString } from "../../../../../base/common/types.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { getShellIntegrationTimeout } from "../../../terminal/common/terminalEnvironment.js";
import { isBash, isFish, isPowerShell, isZsh } from "./runInTerminalHelpers.js";
var ShellLaunchType;
(function(ShellLaunchType2) {
  ShellLaunchType2[ShellLaunchType2["Unknown"] = 0] = "Unknown";
  ShellLaunchType2[ShellLaunchType2["Default"] = 1] = "Default";
  ShellLaunchType2[ShellLaunchType2["Fallback"] = 2] = "Fallback";
})(ShellLaunchType || (ShellLaunchType = {}));
var ShellIntegrationQuality;
(function(ShellIntegrationQuality2) {
  ShellIntegrationQuality2["None"] = "none";
  ShellIntegrationQuality2["Basic"] = "basic";
  ShellIntegrationQuality2["Rich"] = "rich";
})(ShellIntegrationQuality || (ShellIntegrationQuality = {}));
let ToolTerminalCreator = class ToolTerminalCreator2 {
  static {
    __name(this, "ToolTerminalCreator");
  }
  static {
    ToolTerminalCreator_1 = this;
  }
  static {
    this._lastSuccessfulShell = 0;
  }
  constructor(_configurationService, _logService, _terminalService) {
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._terminalService = _terminalService;
  }
  async createTerminal(shellOrProfile, os, token) {
    const instance = await this._createCopilotTerminal(shellOrProfile, os);
    const toolTerminal = {
      instance,
      shellIntegrationQuality: "none"
    };
    let processReadyTimestamp = 0;
    const initResult = await Promise.any([
      instance.processReady.then(() => processReadyTimestamp = Date.now()),
      Event.toPromise(instance.onExit)
    ]);
    if (!isNumber(initResult) && isObject(initResult) && hasKey(initResult, { message: true })) {
      throw new Error(initResult.message);
    }
    const siInjectionEnabled = this._configurationService.getValue(
      "terminal.integrated.shellIntegration.enabled"
      /* TerminalSettingId.ShellIntegrationEnabled */
    ) === true;
    const waitTime = getShellIntegrationTimeout(this._configurationService, siInjectionEnabled, instance.hasRemoteAuthority, processReadyTimestamp);
    if (ToolTerminalCreator_1._lastSuccessfulShell !== 2 || siInjectionEnabled) {
      this._logService.info(`ToolTerminalCreator#createTerminal: Waiting ${waitTime}ms for shell integration`);
      const shellIntegrationQuality = await this._waitForShellIntegration(instance, waitTime);
      if (token.isCancellationRequested) {
        instance.dispose();
        throw new CancellationError();
      }
      if (shellIntegrationQuality === "rich") {
        const commandDetection = instance.capabilities.get(
          2
          /* TerminalCapability.CommandDetection */
        );
        if (commandDetection?.promptInputModel.state === 0) {
          this._logService.info(`ToolTerminalCreator#createTerminal: Waiting up to 2s for PromptInputModel state to change`);
          const didStart = await raceTimeout(Event.toPromise(commandDetection.onCommandStarted), 2e3);
          if (!didStart) {
            this._logService.info(`ToolTerminalCreator#createTerminal: PromptInputModel state did not change within timeout`);
          }
        }
      }
      if (shellIntegrationQuality !== "none") {
        ToolTerminalCreator_1._lastSuccessfulShell = 1;
        toolTerminal.shellIntegrationQuality = shellIntegrationQuality;
        return toolTerminal;
      }
    } else {
      this._logService.info(`ToolTerminalCreator#createTerminal: Skipping wait for shell integration - last successful launch type ${ToolTerminalCreator_1._lastSuccessfulShell}`);
    }
    ToolTerminalCreator_1._lastSuccessfulShell = 2;
    return toolTerminal;
  }
  /**
   * Synchronously update shell integration quality based on the terminal instance's current
   * capabilities. This is a defensive change to avoid no shell integration being sticky
   * https://github.com/microsoft/vscode/issues/260880
   *
   * Only upgrade quality just in case.
   */
  refreshShellIntegrationQuality(toolTerminal) {
    const commandDetection = toolTerminal.instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (commandDetection) {
      if (toolTerminal.shellIntegrationQuality === "none" || toolTerminal.shellIntegrationQuality === "basic") {
        toolTerminal.shellIntegrationQuality = commandDetection.hasRichCommandDetection ? "rich" : "basic";
      }
    }
  }
  _createCopilotTerminal(shellOrProfile, os) {
    const shellPath = isString(shellOrProfile) ? shellOrProfile : shellOrProfile.path;
    const env = {
      // Avoid making `git diff` interactive when called from copilot
      GIT_PAGER: "cat"
    };
    const preventShellHistory = this._configurationService.getValue(
      "chat.tools.terminal.preventShellHistory"
      /* TerminalChatAgentToolsSettingId.PreventShellHistory */
    ) === true;
    if (preventShellHistory) {
      if (isBash(shellPath, os) || isZsh(shellPath, os) || isFish(shellPath, os) || isPowerShell(shellPath, os)) {
        env["VSCODE_PREVENT_SHELL_HISTORY"] = "1";
      }
    }
    const config = {
      icon: ThemeIcon.fromId(Codicon.chatSparkle.id),
      hideFromUser: true,
      forcePersist: true,
      env
    };
    if (isString(shellOrProfile)) {
      config.executable = shellOrProfile;
    } else {
      config.executable = shellOrProfile.path;
      config.args = shellOrProfile.args;
      config.icon = shellOrProfile.icon ?? config.icon;
      config.color = shellOrProfile.color;
      config.env = {
        ...config.env,
        ...shellOrProfile.env
      };
    }
    return this._terminalService.createTerminal({ config });
  }
  _waitForShellIntegration(instance, timeoutMs) {
    const store = new DisposableStore();
    const result = new DeferredPromise();
    const siNoneTimer = store.add(new MutableDisposable());
    siNoneTimer.value = disposableTimeout(() => {
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out ${timeoutMs}ms, using no SI`);
      result.complete(
        "none"
        /* ShellIntegrationQuality.None */
      );
    }, timeoutMs);
    if (instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    )?.hasRichCommandDetection) {
      siNoneTimer.clear();
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Rich SI available immediately`);
      result.complete(
        "rich"
        /* ShellIntegrationQuality.Rich */
      );
    } else {
      const onSetRichCommandDetection = store.add(this._terminalService.createOnInstanceCapabilityEvent(2, (e) => e.onSetRichCommandDetection));
      store.add(onSetRichCommandDetection.event((e) => {
        if (e.instance !== instance) {
          return;
        }
        siNoneTimer.clear();
        this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Rich SI available eventually`);
        result.complete(
          "rich"
          /* ShellIntegrationQuality.Rich */
        );
      }));
      const commandDetection = instance.capabilities.get(
        2
        /* TerminalCapability.CommandDetection */
      );
      if (commandDetection) {
        siNoneTimer.clear();
        store.add(disposableTimeout(() => {
          this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out 200ms, using basic SI`);
          result.complete(
            "basic"
            /* ShellIntegrationQuality.Basic */
          );
        }, 200));
      } else {
        store.add(instance.capabilities.onDidAddCommandDetectionCapability((e) => {
          siNoneTimer.clear();
          store.add(disposableTimeout(() => {
            this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Timed out 200ms, using basic SI (via listener)`);
            result.complete(
              "basic"
              /* ShellIntegrationQuality.Basic */
            );
          }, 200));
        }));
      }
    }
    result.p.finally(() => {
      this._logService.info(`ToolTerminalCreator#_waitForShellIntegration: Promise complete, disposing store`);
      store.dispose();
    });
    return result.p;
  }
};
ToolTerminalCreator = ToolTerminalCreator_1 = __decorate([
  __param(0, IConfigurationService),
  __param(1, ITerminalLogService),
  __param(2, ITerminalService)
], ToolTerminalCreator);
export {
  ShellIntegrationQuality,
  ToolTerminalCreator
};
//# sourceMappingURL=toolTerminalCreator.js.map
