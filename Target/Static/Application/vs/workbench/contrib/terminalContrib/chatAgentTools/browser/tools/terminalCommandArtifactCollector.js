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
import { getCommandOutputSnapshot } from "../../../../terminal/browser/chatTerminalCommandMirror.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
let TerminalCommandArtifactCollector = class TerminalCommandArtifactCollector2 {
  static {
    __name(this, "TerminalCommandArtifactCollector");
  }
  constructor(_logService) {
    this._logService = _logService;
  }
  async capture(toolSpecificData, instance, commandId) {
    if (commandId) {
      try {
        toolSpecificData.terminalCommandUri = this._createTerminalCommandUri(instance, commandId);
      } catch (error) {
        this._logService.warn(`RunInTerminalTool: Failed to create terminal command URI for ${commandId}`, error);
      }
      const command = await this._tryGetCommand(instance, commandId);
      if (command) {
        toolSpecificData.terminalCommandState = {
          exitCode: command.exitCode,
          timestamp: command.timestamp,
          duration: command.duration
        };
        const snapshot = await this._captureCommandOutput(instance, command);
        if (snapshot) {
          toolSpecificData.terminalCommandOutput = snapshot;
        }
        this._applyTheme(toolSpecificData, instance);
        return;
      }
    }
    this._applyTheme(toolSpecificData, instance);
  }
  async _captureCommandOutput(instance, command) {
    try {
      await instance.xtermReadyPromise;
    } catch {
      return void 0;
    }
    const xterm = instance.xterm;
    if (!xterm) {
      return void 0;
    }
    return getCommandOutputSnapshot(xterm, command, (reason, error) => {
      const suffix = reason === "fallback" ? " (fallback)" : "";
      this._logService.debug(`RunInTerminalTool: Failed to snapshot command output${suffix}`, error);
    });
  }
  _applyTheme(toolSpecificData, instance) {
    const theme = instance.xterm?.getXtermTheme();
    if (theme) {
      toolSpecificData.terminalTheme = { background: theme.background, foreground: theme.foreground };
    }
  }
  _createTerminalCommandUri(instance, commandId) {
    const params = new URLSearchParams(instance.resource.query);
    params.set("command", commandId);
    return instance.resource.with({ query: params.toString() });
  }
  async _tryGetCommand(instance, commandId) {
    const commandDetection = instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    return commandDetection?.commands.find((c) => c.id === commandId);
  }
};
TerminalCommandArtifactCollector = __decorate([
  __param(0, ITerminalLogService)
], TerminalCommandArtifactCollector);
export {
  TerminalCommandArtifactCollector
};
//# sourceMappingURL=terminalCommandArtifactCollector.js.map
