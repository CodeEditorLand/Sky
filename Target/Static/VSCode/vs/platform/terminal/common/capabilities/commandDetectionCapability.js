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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { debounce } from "../../../../base/common/decorators.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, MandatoryMutableDisposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../log/common/log.js";
import { CommandInvalidationReason, ICommandDetectionCapability, ICommandInvalidationRequest, IHandleCommandOptions, ISerializedCommandDetectionCapability, ISerializedTerminalCommand, ITerminalCommand, IXtermMarker, TerminalCapability } from "./capabilities.js";
import { ITerminalOutputMatcher } from "../terminal.js";
import { ICurrentPartialCommand, PartialTerminalCommand, TerminalCommand } from "./commandDetection/terminalCommand.js";
import { PromptInputModel } from "./commandDetection/promptInputModel.js";
let CommandDetectionCapability = class extends Disposable {
  constructor(_terminal, _logService) {
    super();
    this._terminal = _terminal;
    this._logService = _logService;
    this._promptInputModel = this._register(new PromptInputModel(this._terminal, this.onCommandStarted, this.onCommandStartChanged, this.onCommandExecuted, this._logService));
    this._register(this.onCommandExecuted((command) => {
      if (command.commandLineConfidence !== "high") {
        const typedCommand = command;
        command.command = typedCommand.extractCommandLine();
        command.commandLineConfidence = "low";
        if ("getOutput" in typedCommand) {
          if (
            // Markers exist
            typedCommand.promptStartMarker && typedCommand.marker && typedCommand.executedMarker && // Single line command
            command.command.indexOf("\n") === -1 && // Start marker is not on the left-most column
            typedCommand.startX !== void 0 && typedCommand.startX > 0
          ) {
            command.commandLineConfidence = "medium";
          }
        } else {
          if (
            // Markers exist
            typedCommand.promptStartMarker && typedCommand.commandStartMarker && typedCommand.commandExecutedMarker && // Single line command
            command.command.indexOf("\n") === -1 && // Start marker is not on the left-most column
            typedCommand.commandStartX !== void 0 && typedCommand.commandStartX > 0
          ) {
            command.commandLineConfidence = "medium";
          }
        }
      }
    }));
    const that = this;
    this._ptyHeuristicsHooks = new class {
      get onCurrentCommandInvalidatedEmitter() {
        return that._onCurrentCommandInvalidated;
      }
      get onCommandStartedEmitter() {
        return that._onCommandStarted;
      }
      get onCommandExecutedEmitter() {
        return that._onCommandExecuted;
      }
      get dimensions() {
        return that._dimensions;
      }
      get isCommandStorageDisabled() {
        return that.__isCommandStorageDisabled;
      }
      get commandMarkers() {
        return that._commandMarkers;
      }
      set commandMarkers(value) {
        that._commandMarkers = value;
      }
      get clearCommandsInViewport() {
        return that._clearCommandsInViewport.bind(that);
      }
    }();
    this._ptyHeuristics = this._register(new MandatoryMutableDisposable(new UnixPtyHeuristics(this._terminal, this, this._ptyHeuristicsHooks, this._logService)));
    this._dimensions = {
      cols: this._terminal.cols,
      rows: this._terminal.rows
    };
    this._register(this._terminal.onResize((e) => this._handleResize(e)));
    this._register(this._terminal.onCursorMove(() => this._handleCursorMove()));
  }
  static {
    __name(this, "CommandDetectionCapability");
  }
  type = TerminalCapability.CommandDetection;
  _promptInputModel;
  get promptInputModel() {
    return this._promptInputModel;
  }
  _commands = [];
  _cwd;
  _promptTerminator;
  _currentCommand = new PartialTerminalCommand(this._terminal);
  _commandMarkers = [];
  _dimensions;
  __isCommandStorageDisabled = false;
  _handleCommandStartOptions;
  _hasRichCommandDetection = false;
  get hasRichCommandDetection() {
    return this._hasRichCommandDetection;
  }
  _promptType;
  get promptType() {
    return this._promptType;
  }
  _ptyHeuristicsHooks;
  _ptyHeuristics;
  get commands() {
    return this._commands;
  }
  get executingCommand() {
    return this._currentCommand.command;
  }
  get executingCommandObject() {
    if (this._currentCommand.commandStartMarker) {
      return this._currentCommand.promoteToFullCommand(this._cwd, void 0, this._handleCommandStartOptions?.ignoreCommandLine ?? false, void 0);
    }
    return void 0;
  }
  get executingCommandConfidence() {
    const casted = this._currentCommand;
    return "commandLineConfidence" in casted ? casted.commandLineConfidence : void 0;
  }
  get currentCommand() {
    return this._currentCommand;
  }
  get cwd() {
    return this._cwd;
  }
  get promptTerminator() {
    return this._promptTerminator;
  }
  _onCommandStarted = this._register(new Emitter());
  onCommandStarted = this._onCommandStarted.event;
  _onCommandStartChanged = this._register(new Emitter());
  onCommandStartChanged = this._onCommandStartChanged.event;
  _onBeforeCommandFinished = this._register(new Emitter());
  onBeforeCommandFinished = this._onBeforeCommandFinished.event;
  _onCommandFinished = this._register(new Emitter());
  onCommandFinished = this._onCommandFinished.event;
  _onCommandExecuted = this._register(new Emitter());
  onCommandExecuted = this._onCommandExecuted.event;
  _onCommandInvalidated = this._register(new Emitter());
  onCommandInvalidated = this._onCommandInvalidated.event;
  _onCurrentCommandInvalidated = this._register(new Emitter());
  onCurrentCommandInvalidated = this._onCurrentCommandInvalidated.event;
  _onPromptTypeChanged = this._register(new Emitter());
  onPromptTypeChanged = this._onPromptTypeChanged.event;
  _onSetRichCommandDetection = this._register(new Emitter());
  onSetRichCommandDetection = this._onSetRichCommandDetection.event;
  _handleResize(e) {
    this._ptyHeuristics.value.preHandleResize?.(e);
    this._dimensions.cols = e.cols;
    this._dimensions.rows = e.rows;
  }
  _handleCursorMove() {
    if (this._store.isDisposed) {
      return;
    }
    if (this._terminal.buffer.active === this._terminal.buffer.normal && this._currentCommand.commandStartMarker) {
      if (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY < this._currentCommand.commandStartMarker.line) {
        this._clearCommandsInViewport();
        this._currentCommand.isInvalid = true;
        this._onCurrentCommandInvalidated.fire({ reason: CommandInvalidationReason.Windows });
      }
    }
  }
  _clearCommandsInViewport() {
    let count = 0;
    for (let i = this._commands.length - 1; i >= 0; i--) {
      const line = this._commands[i].marker?.line;
      if (line && line < this._terminal.buffer.active.baseY) {
        break;
      }
      count++;
    }
    if (count > 0) {
      this._onCommandInvalidated.fire(this._commands.splice(this._commands.length - count, count));
    }
  }
  setContinuationPrompt(value) {
    this._promptInputModel.setContinuationPrompt(value);
  }
  // TODO: Simplify this, can everything work off the last line?
  setPromptTerminator(promptTerminator, lastPromptLine) {
    this._logService.debug("CommandDetectionCapability#setPromptTerminator", promptTerminator);
    this._promptTerminator = promptTerminator;
    this._promptInputModel.setLastPromptLine(lastPromptLine);
  }
  setCwd(value) {
    this._cwd = value;
  }
  setIsWindowsPty(value) {
    if (value && !(this._ptyHeuristics.value instanceof WindowsPtyHeuristics)) {
      const that = this;
      this._ptyHeuristics.value = new WindowsPtyHeuristics(
        this._terminal,
        this,
        new class {
          get onCurrentCommandInvalidatedEmitter() {
            return that._onCurrentCommandInvalidated;
          }
          get onCommandStartedEmitter() {
            return that._onCommandStarted;
          }
          get onCommandExecutedEmitter() {
            return that._onCommandExecuted;
          }
          get dimensions() {
            return that._dimensions;
          }
          get isCommandStorageDisabled() {
            return that.__isCommandStorageDisabled;
          }
          get commandMarkers() {
            return that._commandMarkers;
          }
          set commandMarkers(value2) {
            that._commandMarkers = value2;
          }
          get clearCommandsInViewport() {
            return that._clearCommandsInViewport.bind(that);
          }
        }(),
        this._logService
      );
    } else if (!value && !(this._ptyHeuristics.value instanceof UnixPtyHeuristics)) {
      this._ptyHeuristics.value = new UnixPtyHeuristics(this._terminal, this, this._ptyHeuristicsHooks, this._logService);
    }
  }
  setHasRichCommandDetection(value) {
    this._hasRichCommandDetection = value;
    this._onSetRichCommandDetection.fire(value);
  }
  setPromptType(value) {
    this._promptType = value;
    this._onPromptTypeChanged.fire(value);
  }
  setIsCommandStorageDisabled() {
    this.__isCommandStorageDisabled = true;
  }
  getCommandForLine(line) {
    if (this._currentCommand.promptStartMarker && line >= this._currentCommand.promptStartMarker?.line) {
      return this._currentCommand;
    }
    if (this._commands.length === 0) {
      return void 0;
    }
    if ((this._commands[0].promptStartMarker ?? this._commands[0].marker).line > line) {
      return void 0;
    }
    for (let i = this.commands.length - 1; i >= 0; i--) {
      if ((this.commands[i].promptStartMarker ?? this.commands[i].marker).line <= line) {
        return this.commands[i];
      }
    }
    return void 0;
  }
  getCwdForLine(line) {
    if (this._currentCommand.promptStartMarker && line >= this._currentCommand.promptStartMarker?.line) {
      return this._cwd;
    }
    const command = this.getCommandForLine(line);
    if (command && "cwd" in command) {
      return command.cwd;
    }
    return void 0;
  }
  handlePromptStart(options) {
    const lastCommand = this.commands.at(-1);
    if (lastCommand?.endMarker && lastCommand?.executedMarker && lastCommand.endMarker.line === lastCommand.executedMarker.line) {
      this._logService.debug("CommandDetectionCapability#handlePromptStart adjusted commandFinished", `${lastCommand.endMarker.line} -> ${lastCommand.executedMarker.line + 1}`);
      lastCommand.endMarker = cloneMarker(this._terminal, lastCommand.executedMarker, 1);
    }
    this._currentCommand.promptStartMarker = options?.marker || (lastCommand?.endMarker ? cloneMarker(this._terminal, lastCommand.endMarker) : this._terminal.registerMarker(0));
    this._logService.debug("CommandDetectionCapability#handlePromptStart", this._terminal.buffer.active.cursorX, this._currentCommand.promptStartMarker?.line);
  }
  handleContinuationStart() {
    this._currentCommand.currentContinuationMarker = this._terminal.registerMarker(0);
    this._logService.debug("CommandDetectionCapability#handleContinuationStart", this._currentCommand.currentContinuationMarker);
  }
  handleContinuationEnd() {
    if (!this._currentCommand.currentContinuationMarker) {
      this._logService.warn("CommandDetectionCapability#handleContinuationEnd Received continuation end without start");
      return;
    }
    if (!this._currentCommand.continuations) {
      this._currentCommand.continuations = [];
    }
    this._currentCommand.continuations.push({
      marker: this._currentCommand.currentContinuationMarker,
      end: this._terminal.buffer.active.cursorX
    });
    this._currentCommand.currentContinuationMarker = void 0;
    this._logService.debug("CommandDetectionCapability#handleContinuationEnd", this._currentCommand.continuations[this._currentCommand.continuations.length - 1]);
  }
  handleRightPromptStart() {
    this._currentCommand.commandRightPromptStartX = this._terminal.buffer.active.cursorX;
    this._logService.debug("CommandDetectionCapability#handleRightPromptStart", this._currentCommand.commandRightPromptStartX);
  }
  handleRightPromptEnd() {
    this._currentCommand.commandRightPromptEndX = this._terminal.buffer.active.cursorX;
    this._logService.debug("CommandDetectionCapability#handleRightPromptEnd", this._currentCommand.commandRightPromptEndX);
  }
  handleCommandStart(options) {
    this._handleCommandStartOptions = options;
    this._currentCommand.cwd = this._cwd;
    this._currentCommand.commandStartMarker = options?.marker || this._currentCommand.commandStartMarker;
    if (this._currentCommand.commandStartMarker?.line === this._terminal.buffer.active.cursorY) {
      this._currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
      this._onCommandStartChanged.fire();
      this._logService.debug("CommandDetectionCapability#handleCommandStart", this._currentCommand.commandStartX, this._currentCommand.commandStartMarker?.line);
      return;
    }
    this._ptyHeuristics.value.handleCommandStart(options);
  }
  handleCommandExecuted(options) {
    this._ptyHeuristics.value.handleCommandExecuted(options);
    this._currentCommand.markExecutedTime();
  }
  handleCommandFinished(exitCode, options) {
    if (!this._currentCommand.commandExecutedMarker) {
      this.handleCommandExecuted();
    }
    this._currentCommand.markFinishedTime();
    this._ptyHeuristics.value.preHandleCommandFinished?.();
    this._logService.debug("CommandDetectionCapability#handleCommandFinished", this._terminal.buffer.active.cursorX, options?.marker?.line, this._currentCommand.command, this._currentCommand);
    if (exitCode === void 0) {
      const lastCommand = this.commands.length > 0 ? this.commands[this.commands.length - 1] : void 0;
      if (this._currentCommand.command && this._currentCommand.command.length > 0 && lastCommand?.command === this._currentCommand.command) {
        exitCode = lastCommand.exitCode;
      }
    }
    if (this._currentCommand.commandStartMarker === void 0 || !this._terminal.buffer.active) {
      return;
    }
    this._currentCommand.commandFinishedMarker = options?.marker || this._terminal.registerMarker(0);
    this._ptyHeuristics.value.postHandleCommandFinished?.();
    const newCommand = this._currentCommand.promoteToFullCommand(this._cwd, exitCode, this._handleCommandStartOptions?.ignoreCommandLine ?? false, options?.markProperties);
    if (newCommand) {
      this._commands.push(newCommand);
      this._onBeforeCommandFinished.fire(newCommand);
      if (!this._currentCommand.isInvalid) {
        this._logService.debug("CommandDetectionCapability#onCommandFinished", newCommand);
        this._onCommandFinished.fire(newCommand);
      }
    }
    this._currentCommand = new PartialTerminalCommand(this._terminal);
    this._handleCommandStartOptions = void 0;
  }
  setCommandLine(commandLine, isTrusted) {
    this._logService.debug("CommandDetectionCapability#setCommandLine", commandLine, isTrusted);
    this._currentCommand.command = commandLine;
    this._currentCommand.commandLineConfidence = "high";
    this._currentCommand.isTrusted = isTrusted;
    if (isTrusted) {
      this._promptInputModel.setConfidentCommandLine(commandLine);
    }
  }
  serialize() {
    const commands = this.commands.map((e) => e.serialize(this.__isCommandStorageDisabled));
    const partialCommand = this._currentCommand.serialize(this._cwd);
    if (partialCommand) {
      commands.push(partialCommand);
    }
    return {
      isWindowsPty: this._ptyHeuristics.value instanceof WindowsPtyHeuristics,
      hasRichCommandDetection: this._hasRichCommandDetection,
      commands,
      promptInputModel: this._promptInputModel.serialize()
    };
  }
  deserialize(serialized) {
    if (serialized.isWindowsPty) {
      this.setIsWindowsPty(serialized.isWindowsPty);
    }
    if (serialized.hasRichCommandDetection) {
      this.setHasRichCommandDetection(serialized.hasRichCommandDetection);
    }
    const buffer = this._terminal.buffer.normal;
    for (const e of serialized.commands) {
      if (!e.endLine) {
        const marker = e.startLine !== void 0 ? this._terminal.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : void 0;
        if (!marker) {
          continue;
        }
        this._currentCommand.commandStartMarker = e.startLine !== void 0 ? this._terminal.registerMarker(e.startLine - (buffer.baseY + buffer.cursorY)) : void 0;
        this._currentCommand.commandStartX = e.startX;
        this._currentCommand.promptStartMarker = e.promptStartLine !== void 0 ? this._terminal.registerMarker(e.promptStartLine - (buffer.baseY + buffer.cursorY)) : void 0;
        this._cwd = e.cwd;
        this._onCommandStarted.fire({ marker });
        continue;
      }
      const newCommand = TerminalCommand.deserialize(this._terminal, e, this.__isCommandStorageDisabled);
      if (!newCommand) {
        continue;
      }
      this._commands.push(newCommand);
      this._logService.debug("CommandDetectionCapability#onCommandFinished", newCommand);
      this._onCommandFinished.fire(newCommand);
    }
    if (serialized.promptInputModel) {
      this._promptInputModel.deserialize(serialized.promptInputModel);
    }
  }
};
__decorateClass([
  debounce(500)
], CommandDetectionCapability.prototype, "_handleCursorMove", 1);
CommandDetectionCapability = __decorateClass([
  __decorateParam(1, ILogService)
], CommandDetectionCapability);
class UnixPtyHeuristics extends Disposable {
  constructor(_terminal, _capability, _hooks, _logService) {
    super();
    this._terminal = _terminal;
    this._capability = _capability;
    this._hooks = _hooks;
    this._logService = _logService;
    this._register(_terminal.parser.registerCsiHandler({ final: "J" }, (params) => {
      if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
        _hooks.clearCommandsInViewport();
      }
      return false;
    }));
  }
  static {
    __name(this, "UnixPtyHeuristics");
  }
  handleCommandStart(options) {
    const currentCommand = this._capability.currentCommand;
    currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
    currentCommand.commandStartMarker = options?.marker || this._terminal.registerMarker(0);
    currentCommand.commandExecutedMarker?.dispose();
    currentCommand.commandExecutedMarker = void 0;
    currentCommand.commandExecutedX = void 0;
    for (const m of this._hooks.commandMarkers) {
      m.dispose();
    }
    this._hooks.commandMarkers.length = 0;
    this._hooks.onCommandStartedEmitter.fire({ marker: options?.marker || currentCommand.commandStartMarker, markProperties: options?.markProperties });
    this._logService.debug("CommandDetectionCapability#handleCommandStart", currentCommand.commandStartX, currentCommand.commandStartMarker?.line);
  }
  handleCommandExecuted(options) {
    const currentCommand = this._capability.currentCommand;
    currentCommand.commandExecutedMarker = options?.marker || this._terminal.registerMarker(0);
    currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
    this._logService.debug("CommandDetectionCapability#handleCommandExecuted", currentCommand.commandExecutedX, currentCommand.commandExecutedMarker?.line);
    if (!currentCommand.commandStartMarker || !currentCommand.commandExecutedMarker || currentCommand.commandStartX === void 0) {
      return;
    }
    currentCommand.command = this._hooks.isCommandStorageDisabled ? "" : this._terminal.buffer.active.getLine(currentCommand.commandStartMarker.line)?.translateToString(true, currentCommand.commandStartX, currentCommand.commandRightPromptStartX).trim();
    let y = currentCommand.commandStartMarker.line + 1;
    const commandExecutedLine = currentCommand.commandExecutedMarker.line;
    for (; y < commandExecutedLine; y++) {
      const line = this._terminal.buffer.active.getLine(y);
      if (line) {
        const continuation = currentCommand.continuations?.find((e) => e.marker.line === y);
        if (continuation) {
          currentCommand.command += "\n";
        }
        const startColumn = continuation?.end ?? 0;
        currentCommand.command += line.translateToString(true, startColumn);
      }
    }
    if (y === commandExecutedLine) {
      currentCommand.command += this._terminal.buffer.active.getLine(commandExecutedLine)?.translateToString(true, void 0, currentCommand.commandExecutedX) || "";
    }
    this._hooks.onCommandExecutedEmitter.fire(currentCommand);
  }
}
var AdjustCommandStartMarkerConstants = /* @__PURE__ */ ((AdjustCommandStartMarkerConstants2) => {
  AdjustCommandStartMarkerConstants2[AdjustCommandStartMarkerConstants2["MaxCheckLineCount"] = 10] = "MaxCheckLineCount";
  AdjustCommandStartMarkerConstants2[AdjustCommandStartMarkerConstants2["Interval"] = 20] = "Interval";
  AdjustCommandStartMarkerConstants2[AdjustCommandStartMarkerConstants2["MaximumPollCount"] = 10] = "MaximumPollCount";
  return AdjustCommandStartMarkerConstants2;
})(AdjustCommandStartMarkerConstants || {});
let WindowsPtyHeuristics = class extends Disposable {
  constructor(_terminal, _capability, _hooks, _logService) {
    super();
    this._terminal = _terminal;
    this._capability = _capability;
    this._hooks = _hooks;
    this._logService = _logService;
    this._register(_terminal.parser.registerCsiHandler({ final: "J" }, (params) => {
      if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
        this._hooks.clearCommandsInViewport();
      }
      return false;
    }));
    this._register(this._capability.onBeforeCommandFinished((command) => {
      if (command.command.trim().toLowerCase() === "clear" || command.command.trim().toLowerCase() === "cls") {
        this._tryAdjustCommandStartMarkerScheduler?.cancel();
        this._tryAdjustCommandStartMarkerScheduler = void 0;
        this._hooks.clearCommandsInViewport();
        this._capability.currentCommand.isInvalid = true;
        this._hooks.onCurrentCommandInvalidatedEmitter.fire({ reason: CommandInvalidationReason.Windows });
      }
    }));
  }
  static {
    __name(this, "WindowsPtyHeuristics");
  }
  _onCursorMoveListener = this._register(new MutableDisposable());
  _tryAdjustCommandStartMarkerScheduler;
  _tryAdjustCommandStartMarkerScannedLineCount = 0;
  _tryAdjustCommandStartMarkerPollCount = 0;
  preHandleResize(e) {
    const baseY = this._terminal.buffer.active.baseY;
    const rowsDifference = e.rows - this._hooks.dimensions.rows;
    if (rowsDifference > 0) {
      this._waitForCursorMove().then(() => {
        const potentialShiftedLineCount = Math.min(rowsDifference, baseY);
        for (let i = this._capability.commands.length - 1; i >= 0; i--) {
          const command = this._capability.commands[i];
          if (!command.marker || command.marker.line < baseY || command.commandStartLineContent === void 0) {
            break;
          }
          const line = this._terminal.buffer.active.getLine(command.marker.line);
          if (!line || line.translateToString(true) === command.commandStartLineContent) {
            continue;
          }
          const shiftedY = command.marker.line - potentialShiftedLineCount;
          const shiftedLine = this._terminal.buffer.active.getLine(shiftedY);
          if (shiftedLine?.translateToString(true) !== command.commandStartLineContent) {
            continue;
          }
          this._terminal._core._bufferService.buffer.lines.onDeleteEmitter.fire({
            index: this._terminal.buffer.active.baseY,
            amount: potentialShiftedLineCount
          });
        }
      });
    }
  }
  handleCommandStart() {
    this._capability.currentCommand.commandStartX = this._terminal.buffer.active.cursorX;
    this._hooks.commandMarkers.length = 0;
    const initialCommandStartMarker = this._capability.currentCommand.commandStartMarker = this._capability.currentCommand.promptStartMarker ? cloneMarker(this._terminal, this._capability.currentCommand.promptStartMarker) : this._terminal.registerMarker(0);
    this._capability.currentCommand.commandStartX = 0;
    this._tryAdjustCommandStartMarkerScannedLineCount = 0;
    this._tryAdjustCommandStartMarkerPollCount = 0;
    this._tryAdjustCommandStartMarkerScheduler = new RunOnceScheduler(() => this._tryAdjustCommandStartMarker(initialCommandStartMarker), 20 /* Interval */);
    this._tryAdjustCommandStartMarkerScheduler.schedule();
  }
  _tryAdjustCommandStartMarker(start) {
    if (this._store.isDisposed) {
      return;
    }
    const buffer = this._terminal.buffer.active;
    let scannedLineCount = this._tryAdjustCommandStartMarkerScannedLineCount;
    while (scannedLineCount < 10 /* MaxCheckLineCount */ && start.line + scannedLineCount < buffer.baseY + this._terminal.rows) {
      if (this._cursorOnNextLine()) {
        const prompt = this._getWindowsPrompt(start.line + scannedLineCount);
        if (prompt) {
          const adjustedPrompt = typeof prompt === "string" ? prompt : prompt.prompt;
          this._capability.currentCommand.commandStartMarker = this._terminal.registerMarker(0);
          if (typeof prompt === "object" && prompt.likelySingleLine) {
            this._logService.debug("CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted promptStart", `${this._capability.currentCommand.promptStartMarker?.line} -> ${this._capability.currentCommand.commandStartMarker.line}`);
            this._capability.currentCommand.promptStartMarker?.dispose();
            this._capability.currentCommand.promptStartMarker = cloneMarker(this._terminal, this._capability.currentCommand.commandStartMarker);
            const lastCommand = this._capability.commands.at(-1);
            if (lastCommand && this._capability.currentCommand.commandStartMarker.line !== lastCommand.endMarker?.line) {
              lastCommand.endMarker?.dispose();
              lastCommand.endMarker = cloneMarker(this._terminal, this._capability.currentCommand.commandStartMarker);
            }
          }
          this._capability.currentCommand.commandStartX = adjustedPrompt.length;
          this._logService.debug("CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted commandStart", `${start.line} -> ${this._capability.currentCommand.commandStartMarker.line}:${this._capability.currentCommand.commandStartX}`);
          this._flushPendingHandleCommandStartTask();
          return;
        }
      }
      scannedLineCount++;
    }
    if (scannedLineCount < 10 /* MaxCheckLineCount */) {
      this._tryAdjustCommandStartMarkerScannedLineCount = scannedLineCount;
      if (++this._tryAdjustCommandStartMarkerPollCount < 10 /* MaximumPollCount */) {
        this._tryAdjustCommandStartMarkerScheduler?.schedule();
      } else {
        this._flushPendingHandleCommandStartTask();
      }
    } else {
      this._flushPendingHandleCommandStartTask();
    }
  }
  _flushPendingHandleCommandStartTask() {
    if (this._tryAdjustCommandStartMarkerScheduler) {
      this._tryAdjustCommandStartMarkerPollCount = 10 /* MaximumPollCount */;
      this._tryAdjustCommandStartMarkerScheduler.flush();
      this._tryAdjustCommandStartMarkerScheduler = void 0;
    }
    if (!this._capability.currentCommand.commandExecutedMarker) {
      this._onCursorMoveListener.value = this._terminal.onCursorMove(() => {
        if (this._hooks.commandMarkers.length === 0 || this._hooks.commandMarkers[this._hooks.commandMarkers.length - 1].line !== this._terminal.buffer.active.cursorY) {
          const marker = this._terminal.registerMarker(0);
          if (marker) {
            this._hooks.commandMarkers.push(marker);
          }
        }
      });
    }
    if (this._capability.currentCommand.commandStartMarker) {
      const line = this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);
      if (line) {
        this._capability.currentCommand.commandStartLineContent = line.translateToString(true);
      }
    }
    this._hooks.onCommandStartedEmitter.fire({ marker: this._capability.currentCommand.commandStartMarker });
    this._logService.debug("CommandDetectionCapability#_handleCommandStartWindows", this._capability.currentCommand.commandStartX, this._capability.currentCommand.commandStartMarker?.line);
  }
  handleCommandExecuted(options) {
    if (this._tryAdjustCommandStartMarkerScheduler) {
      this._flushPendingHandleCommandStartTask();
    }
    this._onCursorMoveListener.clear();
    this._evaluateCommandMarkers();
    this._capability.currentCommand.commandExecutedX = this._terminal.buffer.active.cursorX;
    this._hooks.onCommandExecutedEmitter.fire(this._capability.currentCommand);
    this._logService.debug("CommandDetectionCapability#handleCommandExecuted", this._capability.currentCommand.commandExecutedX, this._capability.currentCommand.commandExecutedMarker?.line);
  }
  preHandleCommandFinished() {
    if (this._capability.currentCommand.commandExecutedMarker) {
      return;
    }
    if (this._hooks.commandMarkers.length === 0) {
      if (!this._capability.currentCommand.commandStartMarker) {
        this._capability.currentCommand.commandStartMarker = this._terminal.registerMarker(0);
      }
      if (this._capability.currentCommand.commandStartMarker) {
        this._hooks.commandMarkers.push(this._capability.currentCommand.commandStartMarker);
      }
    }
    this._evaluateCommandMarkers();
  }
  postHandleCommandFinished() {
    const currentCommand = this._capability.currentCommand;
    const commandText = currentCommand.command;
    const commandLine = currentCommand.commandStartMarker?.line;
    const executedLine = currentCommand.commandExecutedMarker?.line;
    if (!commandText || commandText.length === 0 || commandLine === void 0 || commandLine === -1 || executedLine === void 0 || executedLine === -1) {
      return;
    }
    let current = 0;
    let found = false;
    for (let i = commandLine; i <= executedLine; i++) {
      const line = this._terminal.buffer.active.getLine(i);
      if (!line) {
        break;
      }
      const text = line.translateToString(true);
      for (let j = 0; j < text.length; j++) {
        while (commandText.length < current && commandText[current] === " ") {
          current++;
        }
        if (text[j] === commandText[current]) {
          current++;
        }
        if (current === commandText.length) {
          const wrapsToNextLine = j >= this._terminal.cols - 1;
          currentCommand.commandExecutedMarker = this._terminal.registerMarker(i - (this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY) + (wrapsToNextLine ? 1 : 0));
          currentCommand.commandExecutedX = wrapsToNextLine ? 0 : j + 1;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }
  _evaluateCommandMarkers() {
    if (this._hooks.commandMarkers.length === 0) {
      return;
    }
    this._hooks.commandMarkers = this._hooks.commandMarkers.sort((a, b) => a.line - b.line);
    this._capability.currentCommand.commandStartMarker = this._hooks.commandMarkers[0];
    if (this._capability.currentCommand.commandStartMarker) {
      const line = this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);
      if (line) {
        this._capability.currentCommand.commandStartLineContent = line.translateToString(true);
      }
    }
    this._capability.currentCommand.commandExecutedMarker = this._hooks.commandMarkers[this._hooks.commandMarkers.length - 1];
    this._hooks.onCommandExecutedEmitter.fire(this._capability.currentCommand);
  }
  _cursorOnNextLine() {
    const lastCommand = this._capability.commands.at(-1);
    if (!lastCommand) {
      return true;
    }
    const cursorYAbsolute = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY;
    const lastCommandYAbsolute = (lastCommand.endMarker ? lastCommand.endMarker.line : lastCommand.marker?.line) ?? -1;
    return cursorYAbsolute > lastCommandYAbsolute;
  }
  _waitForCursorMove() {
    const cursorX = this._terminal.buffer.active.cursorX;
    const cursorY = this._terminal.buffer.active.cursorY;
    let totalDelay = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (cursorX !== this._terminal.buffer.active.cursorX || cursorY !== this._terminal.buffer.active.cursorY) {
          resolve();
          clearInterval(interval);
          return;
        }
        totalDelay += 10;
        if (totalDelay > 1e3) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  }
  _getWindowsPrompt(y = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY) {
    const line = this._terminal.buffer.active.getLine(y);
    if (!line) {
      return;
    }
    const lineText = line.translateToString(true);
    if (!lineText) {
      return;
    }
    const pwshPrompt = lineText.match(/(?<prompt>(\(.+\)\s)?(?:PS.+>\s?))/)?.groups?.prompt;
    if (pwshPrompt) {
      const adjustedPrompt = this._adjustPrompt(pwshPrompt, lineText, ">");
      if (adjustedPrompt) {
        return {
          prompt: adjustedPrompt,
          likelySingleLine: true
        };
      }
    }
    const customPrompt = lineText.match(/.*\u276f(?=[^\u276f]*$)/g)?.[0];
    if (customPrompt) {
      const adjustedPrompt = this._adjustPrompt(customPrompt, lineText, "\u276F");
      if (adjustedPrompt) {
        return adjustedPrompt;
      }
    }
    const bashPrompt = lineText.match(/^(?<prompt>\$)/)?.groups?.prompt;
    if (bashPrompt) {
      const adjustedPrompt = this._adjustPrompt(bashPrompt, lineText, "$");
      if (adjustedPrompt) {
        return adjustedPrompt;
      }
    }
    const pythonPrompt = lineText.match(/^(?<prompt>>>> )/g)?.groups?.prompt;
    if (pythonPrompt) {
      return {
        prompt: pythonPrompt,
        likelySingleLine: true
      };
    }
    if (this._capability.promptTerminator && lineText.trim().endsWith(this._capability.promptTerminator)) {
      const adjustedPrompt = this._adjustPrompt(lineText, lineText, this._capability.promptTerminator);
      if (adjustedPrompt) {
        return adjustedPrompt;
      }
    }
    const cmdMatch = lineText.match(/^(?<prompt>(\(.+\)\s)?(?:[A-Z]:\\.*>))/);
    return cmdMatch?.groups?.prompt ? {
      prompt: cmdMatch.groups.prompt,
      likelySingleLine: true
    } : void 0;
  }
  _adjustPrompt(prompt, lineText, char) {
    if (!prompt) {
      return;
    }
    if (lineText === prompt && prompt.endsWith(char)) {
      prompt += " ";
    }
    return prompt;
  }
};
WindowsPtyHeuristics = __decorateClass([
  __decorateParam(3, ILogService)
], WindowsPtyHeuristics);
function getLinesForCommand(buffer, command, cols, outputMatcher) {
  if (!outputMatcher) {
    return void 0;
  }
  const executedMarker = command.executedMarker;
  const endMarker = command.endMarker;
  if (!executedMarker || !endMarker) {
    return void 0;
  }
  const startLine = executedMarker.line;
  const endLine = endMarker.line;
  const linesToCheck = outputMatcher.length;
  const lines = [];
  if (outputMatcher.anchor === "bottom") {
    for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
      let wrappedLineStart = i;
      const wrappedLineEnd = i;
      while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
        wrappedLineStart--;
      }
      i = wrappedLineStart;
      lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
      if (lines.length > linesToCheck) {
        lines.pop();
      }
    }
  } else {
    for (let i = startLine + (outputMatcher.offset || 0); i < endLine; i++) {
      const wrappedLineStart = i;
      let wrappedLineEnd = i;
      while (wrappedLineEnd + 1 < endLine && buffer.getLine(wrappedLineEnd + 1)?.isWrapped) {
        wrappedLineEnd++;
      }
      i = wrappedLineEnd;
      lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, cols));
      if (lines.length === linesToCheck) {
        lines.shift();
      }
    }
  }
  return lines;
}
__name(getLinesForCommand, "getLinesForCommand");
function getXtermLineContent(buffer, lineStart, lineEnd, cols) {
  const maxLineLength = Math.max(2048 / cols * 2);
  lineEnd = Math.min(lineEnd, lineStart + maxLineLength);
  let content = "";
  for (let i = lineStart; i <= lineEnd; i++) {
    const line = buffer.getLine(i);
    if (line) {
      content += line.translateToString(true, 0, cols);
    }
  }
  return content;
}
__name(getXtermLineContent, "getXtermLineContent");
function cloneMarker(xterm, marker, offset = 0) {
  return xterm.registerMarker(marker.line - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY) + offset);
}
__name(cloneMarker, "cloneMarker");
export {
  CommandDetectionCapability,
  getLinesForCommand
};
//# sourceMappingURL=commandDetectionCapability.js.map
