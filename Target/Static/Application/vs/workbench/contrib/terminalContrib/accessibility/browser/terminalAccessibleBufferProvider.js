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
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { isFullTerminalCommand } from "../../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
let TerminalAccessibleBufferProvider = class TerminalAccessibleBufferProvider2 extends Disposable {
  static {
    __name(this, "TerminalAccessibleBufferProvider");
  }
  constructor(_instance, _bufferTracker, customHelp, configurationService, terminalService) {
    super();
    this._instance = _instance;
    this._bufferTracker = _bufferTracker;
    this.id = "terminal";
    this.options = {
      type: "view",
      language: "terminal",
      id: "terminal"
      /* AccessibleViewProviderId.Terminal */
    };
    this.verbositySettingKey = "accessibility.verbosity.terminal";
    this._onDidRequestClearProvider = this._register(new Emitter());
    this.onDidRequestClearLastProvider = this._onDidRequestClearProvider.event;
    this.options.customHelp = customHelp;
    this.options.position = configurationService.getValue(
      "terminal.integrated.accessibleViewPreserveCursorPosition"
      /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */
    ) ? "initial-bottom" : "bottom";
    this._register(this._instance.onDisposed(() => this._onDidRequestClearProvider.fire(
      "terminal"
      /* AccessibleViewProviderId.Terminal */
    )));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(
        "terminal.integrated.accessibleViewPreserveCursorPosition"
        /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */
      )) {
        this.options.position = configurationService.getValue(
          "terminal.integrated.accessibleViewPreserveCursorPosition"
          /* TerminalAccessibilitySettingId.AccessibleViewPreserveCursorPosition */
        ) ? "initial-bottom" : "bottom";
      }
    }));
    this._focusedInstance = terminalService.activeInstance;
    this._register(terminalService.onDidChangeActiveInstance(() => {
      if (terminalService.activeInstance && this._focusedInstance?.instanceId !== terminalService.activeInstance?.instanceId) {
        this._onDidRequestClearProvider.fire(
          "terminal"
          /* AccessibleViewProviderId.Terminal */
        );
        this._focusedInstance = terminalService.activeInstance;
      }
    }));
  }
  onClose() {
    this._instance.focus();
  }
  provideContent() {
    this._bufferTracker.update();
    return this._bufferTracker.lines.join("\n");
  }
  getSymbols() {
    const commands = this._getCommandsWithEditorLine() ?? [];
    const symbols = [];
    for (const command of commands) {
      const label = command.command.command;
      if (label) {
        symbols.push({
          label,
          lineNumber: command.lineNumber
        });
      }
    }
    return symbols;
  }
  _getCommandsWithEditorLine() {
    const capability = this._instance.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    const commands = capability?.commands;
    const currentCommand = capability?.currentCommand;
    if (!commands?.length) {
      return;
    }
    const result = [];
    for (const command of commands) {
      const lineNumber = this._getEditorLineForCommand(command);
      if (lineNumber === void 0) {
        continue;
      }
      result.push({ command, lineNumber, exitCode: command.exitCode });
    }
    if (currentCommand) {
      const lineNumber = this._getEditorLineForCommand(currentCommand);
      if (lineNumber !== void 0) {
        result.push({ command: currentCommand, lineNumber });
      }
    }
    return result;
  }
  _getEditorLineForCommand(command) {
    let line;
    if (isFullTerminalCommand(command)) {
      line = command.marker?.line;
    } else {
      line = command.commandStartMarker?.line;
    }
    if (line === void 0 || line < 0) {
      return;
    }
    line = this._bufferTracker.bufferToEditorLineMapping.get(line);
    if (line === void 0) {
      return;
    }
    return line + 1;
  }
};
TerminalAccessibleBufferProvider = __decorate([
  __param(3, IConfigurationService),
  __param(4, ITerminalService)
], TerminalAccessibleBufferProvider);
export {
  TerminalAccessibleBufferProvider
};
//# sourceMappingURL=terminalAccessibleBufferProvider.js.map
