var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IMarkProperties, IMarker, ISerializedTerminalCommand, ITerminalCommand, IXtermMarker } from "../capabilities.js";
import { ITerminalOutputMatcher, ITerminalOutputMatch } from "../../terminal.js";
class TerminalCommand {
  constructor(_xterm, _properties) {
    this._xterm = _xterm;
    this._properties = _properties;
  }
  static {
    __name(this, "TerminalCommand");
  }
  get command() {
    return this._properties.command;
  }
  get commandLineConfidence() {
    return this._properties.commandLineConfidence;
  }
  get isTrusted() {
    return this._properties.isTrusted;
  }
  get timestamp() {
    return this._properties.timestamp;
  }
  get duration() {
    return this._properties.duration;
  }
  get promptStartMarker() {
    return this._properties.promptStartMarker;
  }
  get marker() {
    return this._properties.marker;
  }
  get endMarker() {
    return this._properties.endMarker;
  }
  set endMarker(value) {
    this._properties.endMarker = value;
  }
  get executedMarker() {
    return this._properties.executedMarker;
  }
  get aliases() {
    return this._properties.aliases;
  }
  get wasReplayed() {
    return this._properties.wasReplayed;
  }
  get cwd() {
    return this._properties.cwd;
  }
  get exitCode() {
    return this._properties.exitCode;
  }
  get commandStartLineContent() {
    return this._properties.commandStartLineContent;
  }
  get markProperties() {
    return this._properties.markProperties;
  }
  get executedX() {
    return this._properties.executedX;
  }
  get startX() {
    return this._properties.startX;
  }
  static deserialize(xterm, serialized, isCommandStorageDisabled) {
    const buffer = xterm.buffer.normal;
    const marker = serialized.startLine !== void 0 ? xterm.registerMarker(serialized.startLine - (buffer.baseY + buffer.cursorY)) : void 0;
    if (!marker) {
      return void 0;
    }
    const promptStartMarker = serialized.promptStartLine !== void 0 ? xterm.registerMarker(serialized.promptStartLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const endMarker = serialized.endLine !== void 0 ? xterm.registerMarker(serialized.endLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const executedMarker = serialized.executedLine !== void 0 ? xterm.registerMarker(serialized.executedLine - (buffer.baseY + buffer.cursorY)) : void 0;
    const newCommand = new TerminalCommand(xterm, {
      command: isCommandStorageDisabled ? "" : serialized.command,
      commandLineConfidence: serialized.commandLineConfidence ?? "low",
      isTrusted: serialized.isTrusted,
      promptStartMarker,
      marker,
      startX: serialized.startX,
      endMarker,
      executedMarker,
      executedX: serialized.executedX,
      timestamp: serialized.timestamp,
      duration: serialized.duration,
      cwd: serialized.cwd,
      commandStartLineContent: serialized.commandStartLineContent,
      exitCode: serialized.exitCode,
      markProperties: serialized.markProperties,
      aliases: void 0,
      wasReplayed: true
    });
    return newCommand;
  }
  serialize(isCommandStorageDisabled) {
    return {
      promptStartLine: this.promptStartMarker?.line,
      startLine: this.marker?.line,
      startX: void 0,
      endLine: this.endMarker?.line,
      executedLine: this.executedMarker?.line,
      executedX: this.executedX,
      command: isCommandStorageDisabled ? "" : this.command,
      commandLineConfidence: isCommandStorageDisabled ? "low" : this.commandLineConfidence,
      isTrusted: this.isTrusted,
      cwd: this.cwd,
      exitCode: this.exitCode,
      commandStartLineContent: this.commandStartLineContent,
      timestamp: this.timestamp,
      duration: this.duration,
      markProperties: this.markProperties
    };
  }
  extractCommandLine() {
    return extractCommandLine(this._xterm.buffer.active, this._xterm.cols, this.marker, this.startX, this.executedMarker, this.executedX);
  }
  getOutput() {
    if (!this.executedMarker || !this.endMarker) {
      return void 0;
    }
    const startLine = this.executedMarker.line;
    const endLine = this.endMarker.line;
    if (startLine === endLine) {
      return void 0;
    }
    let output = "";
    let line;
    for (let i = startLine; i < endLine; i++) {
      line = this._xterm.buffer.active.getLine(i);
      if (!line) {
        continue;
      }
      output += line.translateToString(!line.isWrapped) + (line.isWrapped ? "" : "\n");
    }
    return output === "" ? void 0 : output;
  }
  getOutputMatch(outputMatcher) {
    if (!this.executedMarker || !this.endMarker) {
      return void 0;
    }
    const endLine = this.endMarker.line;
    if (endLine === -1) {
      return void 0;
    }
    const buffer = this._xterm.buffer.active;
    const startLine = Math.max(this.executedMarker.line, 0);
    const matcher = outputMatcher.lineMatcher;
    const linesToCheck = typeof matcher === "string" ? 1 : outputMatcher.length || countNewLines(matcher);
    const lines = [];
    let match;
    if (outputMatcher.anchor === "bottom") {
      for (let i = endLine - (outputMatcher.offset || 0); i >= startLine; i--) {
        let wrappedLineStart = i;
        const wrappedLineEnd = i;
        while (wrappedLineStart >= startLine && buffer.getLine(wrappedLineStart)?.isWrapped) {
          wrappedLineStart--;
        }
        i = wrappedLineStart;
        lines.unshift(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
        if (!match) {
          match = lines[0].match(matcher);
        }
        if (lines.length >= linesToCheck) {
          break;
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
        lines.push(getXtermLineContent(buffer, wrappedLineStart, wrappedLineEnd, this._xterm.cols));
        if (!match) {
          match = lines[lines.length - 1].match(matcher);
        }
        if (lines.length >= linesToCheck) {
          break;
        }
      }
    }
    return match ? { regexMatch: match, outputLines: lines } : void 0;
  }
  hasOutput() {
    return !this.executedMarker?.isDisposed && !this.endMarker?.isDisposed && !!(this.executedMarker && this.endMarker && this.executedMarker.line < this.endMarker.line);
  }
  getPromptRowCount() {
    return getPromptRowCount(this, this._xterm.buffer.active);
  }
  getCommandRowCount() {
    return getCommandRowCount(this);
  }
}
class PartialTerminalCommand {
  constructor(_xterm) {
    this._xterm = _xterm;
  }
  static {
    __name(this, "PartialTerminalCommand");
  }
  promptStartMarker;
  commandStartMarker;
  commandStartX;
  commandStartLineContent;
  commandRightPromptStartX;
  commandRightPromptEndX;
  commandLines;
  commandExecutedMarker;
  commandExecutedX;
  commandExecutedTimestamp;
  commandDuration;
  commandFinishedMarker;
  currentContinuationMarker;
  continuations;
  cwd;
  command;
  commandLineConfidence;
  isTrusted;
  isInvalid;
  serialize(cwd) {
    if (!this.commandStartMarker) {
      return void 0;
    }
    return {
      promptStartLine: this.promptStartMarker?.line,
      startLine: this.commandStartMarker.line,
      startX: this.commandStartX,
      endLine: void 0,
      executedLine: void 0,
      executedX: void 0,
      command: "",
      commandLineConfidence: "low",
      isTrusted: true,
      cwd,
      exitCode: void 0,
      commandStartLineContent: void 0,
      timestamp: 0,
      duration: 0,
      markProperties: void 0
    };
  }
  promoteToFullCommand(cwd, exitCode, ignoreCommandLine, markProperties) {
    if (exitCode === void 0 && this.command === void 0) {
      this.command = "";
    }
    if (this.command !== void 0 && !this.command.startsWith("\\") || ignoreCommandLine) {
      return new TerminalCommand(this._xterm, {
        command: ignoreCommandLine ? "" : this.command || "",
        commandLineConfidence: ignoreCommandLine ? "low" : this.commandLineConfidence || "low",
        isTrusted: !!this.isTrusted,
        promptStartMarker: this.promptStartMarker,
        marker: this.commandStartMarker,
        startX: this.commandStartX,
        endMarker: this.commandFinishedMarker,
        executedMarker: this.commandExecutedMarker,
        executedX: this.commandExecutedX,
        timestamp: Date.now(),
        duration: this.commandDuration || 0,
        cwd,
        exitCode,
        commandStartLineContent: this.commandStartLineContent,
        markProperties
      });
    }
    return void 0;
  }
  markExecutedTime() {
    if (this.commandExecutedTimestamp === void 0) {
      this.commandExecutedTimestamp = Date.now();
    }
  }
  markFinishedTime() {
    if (this.commandDuration === void 0 && this.commandExecutedTimestamp !== void 0) {
      this.commandDuration = Date.now() - this.commandExecutedTimestamp;
    }
  }
  extractCommandLine() {
    return extractCommandLine(this._xterm.buffer.active, this._xterm.cols, this.commandStartMarker, this.commandStartX, this.commandExecutedMarker, this.commandExecutedX);
  }
  getPromptRowCount() {
    return getPromptRowCount(this, this._xterm.buffer.active);
  }
  getCommandRowCount() {
    return getCommandRowCount(this);
  }
}
function extractCommandLine(buffer, cols, commandStartMarker, commandStartX, commandExecutedMarker, commandExecutedX) {
  if (!commandStartMarker || !commandExecutedMarker || commandStartX === void 0 || commandExecutedX === void 0) {
    return "";
  }
  let content = "";
  for (let i = commandStartMarker.line; i <= commandExecutedMarker.line; i++) {
    const line = buffer.getLine(i);
    if (line) {
      content += line.translateToString(true, i === commandStartMarker.line ? commandStartX : 0, i === commandExecutedMarker.line ? commandExecutedX : cols);
    }
  }
  return content;
}
__name(extractCommandLine, "extractCommandLine");
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
function countNewLines(regex) {
  if (!regex.multiline) {
    return 1;
  }
  const source = regex.source;
  let count = 1;
  let i = source.indexOf("\\n");
  while (i !== -1) {
    count++;
    i = source.indexOf("\\n", i + 1);
  }
  return count;
}
__name(countNewLines, "countNewLines");
function getPromptRowCount(command, buffer) {
  const marker = "hasOutput" in command ? command.marker : command.commandStartMarker;
  if (!marker || !command.promptStartMarker) {
    return 1;
  }
  let promptRowCount = 1;
  let promptStartLine = command.promptStartMarker.line;
  while (promptStartLine < marker.line && (buffer.getLine(promptStartLine)?.translateToString(true) ?? "").length === 0) {
    promptStartLine++;
  }
  promptRowCount = marker.line - promptStartLine + 1;
  return promptRowCount;
}
__name(getPromptRowCount, "getPromptRowCount");
function getCommandRowCount(command) {
  const marker = "hasOutput" in command ? command.marker : command.commandStartMarker;
  const executedMarker = "hasOutput" in command ? command.executedMarker : command.commandExecutedMarker;
  if (!marker || !executedMarker) {
    return 1;
  }
  const commandExecutedLine = Math.max(executedMarker.line, marker.line);
  let commandRowCount = commandExecutedLine - marker.line + 1;
  const executedX = "hasOutput" in command ? command.executedX : command.commandExecutedX;
  if (executedX === 0) {
    commandRowCount--;
  }
  return commandRowCount;
}
__name(getCommandRowCount, "getCommandRowCount");
export {
  PartialTerminalCommand,
  TerminalCommand
};
//# sourceMappingURL=terminalCommand.js.map
