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
      const partialSnapshot = await this._capturePartialCommandOutput(instance, commandId);
      if (partialSnapshot) {
        toolSpecificData.terminalCommandOutput = partialSnapshot;
        this._logService.debug(`RunInTerminalTool: Captured partial command output for ${commandId}`);
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
  /**
   * Captures output from a partial/current command that hasn't finished yet.
   * This is used when the command is cancelled mid-execution.
   */
  async _capturePartialCommandOutput(instance, commandId) {
    try {
      await instance.xtermReadyPromise;
    } catch {
      return void 0;
    }
    const xterm = instance.xterm;
    if (!xterm) {
      return void 0;
    }
    const commandDetection = instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    const currentCommand = commandDetection?.currentCommand;
    if (currentCommand && currentCommand.id === commandId) {
      const executedMarker = currentCommand.commandExecutedMarker;
      if (executedMarker && !executedMarker.isDisposed) {
        try {
          const raw = xterm.raw;
          const buffer = raw.buffer.active;
          const endLine = buffer.baseY + buffer.cursorY;
          const startLine = executedMarker.line;
          const lineCount = Math.max(endLine - startLine, 0);
          if (lineCount > 0) {
            const text = await xterm.getRangeAsVT(executedMarker, void 0, true);
            if (text) {
              return { text, lineCount };
            }
          }
        } catch (error) {
          this._logService.debug(`RunInTerminalTool: Failed to capture partial command output`, error);
        }
      }
    }
    return void 0;
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
