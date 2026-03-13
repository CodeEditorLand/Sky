var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, dispose, toDisposable } from "../../../../base/common/lifecycle.js";
import { TerminalCapabilityStore } from "../capabilities/terminalCapabilityStore.js";
import { CommandDetectionCapability } from "../capabilities/commandDetectionCapability.js";
import { CwdDetectionCapability } from "../capabilities/cwdDetectionCapability.js";
import { PartialCommandDetectionCapability } from "../capabilities/partialCommandDetectionCapability.js";
import { Emitter } from "../../../../base/common/event.js";
import { BufferMarkCapability } from "../capabilities/bufferMarkCapability.js";
import { URI } from "../../../../base/common/uri.js";
import { sanitizeCwd } from "../terminalEnvironment.js";
import { removeAnsiEscapeCodesFromPrompt } from "../../../../base/common/strings.js";
import { ShellEnvDetectionCapability } from "../capabilities/shellEnvDetectionCapability.js";
import { PromptTypeDetectionCapability } from "../capabilities/promptTypeDetectionCapability.js";
var ShellIntegrationOscPs;
(function(ShellIntegrationOscPs2) {
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["FinalTerm"] = 133] = "FinalTerm";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["VSCode"] = 633] = "VSCode";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["ITerm"] = 1337] = "ITerm";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["SetCwd"] = 7] = "SetCwd";
  ShellIntegrationOscPs2[ShellIntegrationOscPs2["SetWindowsFriendlyCwd"] = 9] = "SetWindowsFriendlyCwd";
})(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
var FinalTermOscPt;
(function(FinalTermOscPt2) {
  FinalTermOscPt2["PromptStart"] = "A";
  FinalTermOscPt2["CommandStart"] = "B";
  FinalTermOscPt2["CommandExecuted"] = "C";
  FinalTermOscPt2["CommandFinished"] = "D";
})(FinalTermOscPt || (FinalTermOscPt = {}));
var VSCodeOscPt;
(function(VSCodeOscPt2) {
  VSCodeOscPt2["PromptStart"] = "A";
  VSCodeOscPt2["CommandStart"] = "B";
  VSCodeOscPt2["CommandExecuted"] = "C";
  VSCodeOscPt2["CommandFinished"] = "D";
  VSCodeOscPt2["CommandLine"] = "E";
  VSCodeOscPt2["ContinuationStart"] = "F";
  VSCodeOscPt2["ContinuationEnd"] = "G";
  VSCodeOscPt2["RightPromptStart"] = "H";
  VSCodeOscPt2["RightPromptEnd"] = "I";
  VSCodeOscPt2["Property"] = "P";
  VSCodeOscPt2["SetMark"] = "SetMark";
  VSCodeOscPt2["EnvJson"] = "EnvJson";
  VSCodeOscPt2["EnvSingleDelete"] = "EnvSingleDelete";
  VSCodeOscPt2["EnvSingleStart"] = "EnvSingleStart";
  VSCodeOscPt2["EnvSingleEntry"] = "EnvSingleEntry";
  VSCodeOscPt2["EnvSingleEnd"] = "EnvSingleEnd";
})(VSCodeOscPt || (VSCodeOscPt = {}));
var ITermOscPt;
(function(ITermOscPt2) {
  ITermOscPt2["SetMark"] = "SetMark";
  ITermOscPt2["CurrentDir"] = "CurrentDir";
})(ITermOscPt || (ITermOscPt = {}));
class ShellIntegrationAddon extends Disposable {
  static {
    __name(this, "ShellIntegrationAddon");
  }
  get seenSequences() {
    return this._seenSequences;
  }
  get status() {
    return this._status;
  }
  constructor(_nonce, _disableTelemetry, _onDidExecuteText, _telemetryService, _logService) {
    super();
    this._nonce = _nonce;
    this._disableTelemetry = _disableTelemetry;
    this._onDidExecuteText = _onDidExecuteText;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this.capabilities = this._register(new TerminalCapabilityStore());
    this._hasUpdatedTelemetry = false;
    this._commonProtocolDisposables = [];
    this._seenSequences = /* @__PURE__ */ new Set();
    this._status = 0;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._onDidChangeSeenSequences = this._register(new Emitter());
    this.onDidChangeSeenSequences = this._onDidChangeSeenSequences.event;
    this._register(toDisposable(() => {
      this._clearActivationTimeout();
      this._disposeCommonProtocol();
    }));
  }
  _disposeCommonProtocol() {
    dispose(this._commonProtocolDisposables);
    this._commonProtocolDisposables.length = 0;
  }
  activate(xterm) {
    this._terminal = xterm;
    this.capabilities.add(3, this._register(new PartialCommandDetectionCapability(this._terminal, this._onDidExecuteText)));
    this._register(xterm.parser.registerOscHandler(633, (data) => this._handleVSCodeSequence(data)));
    this._register(xterm.parser.registerOscHandler(1337, (data) => this._doHandleITermSequence(data)));
    this._commonProtocolDisposables.push(xterm.parser.registerOscHandler(133, (data) => this._handleFinalTermSequence(data)));
    this._register(xterm.parser.registerOscHandler(7, (data) => this._doHandleSetCwd(data)));
    this._register(xterm.parser.registerOscHandler(9, (data) => this._doHandleSetWindowsFriendlyCwd(data)));
    this._ensureCapabilitiesOrAddFailureTelemetry();
  }
  getMarkerId(terminal, vscodeMarkerId) {
    this._createOrGetBufferMarkDetection(terminal).getMark(vscodeMarkerId);
  }
  setNextCommandId(command, commandId) {
    if (this._terminal) {
      this._createOrGetCommandDetection(this._terminal).setNextCommandId(command, commandId);
    }
  }
  _markSequenceSeen(sequence) {
    if (!this._seenSequences.has(sequence)) {
      this._seenSequences.add(sequence);
      this._onDidChangeSeenSequences.fire(this._seenSequences);
    }
  }
  _handleFinalTermSequence(data) {
    const didHandle = this._doHandleFinalTermSequence(data);
    if (this._status === 0) {
      this._status = 1;
      this._onDidChangeStatus.fire(this._status);
    }
    return didHandle;
  }
  _doHandleFinalTermSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    this._markSequenceSeen(command);
    switch (command) {
      case "A":
        this._createOrGetCommandDetection(this._terminal).handlePromptStart();
        return true;
      case "B":
        this._createOrGetCommandDetection(this._terminal).handleCommandStart({ ignoreCommandLine: true });
        return true;
      case "C":
        this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
        return true;
      case "D": {
        const exitCode = args.length === 1 ? parseInt(args[0]) : void 0;
        this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
        return true;
      }
    }
    return false;
  }
  _handleVSCodeSequence(data) {
    const didHandle = this._doHandleVSCodeSequence(data);
    if (!this._hasUpdatedTelemetry && didHandle) {
      this._telemetryService?.publicLog2("terminal/shellIntegrationActivationSucceeded");
      this._hasUpdatedTelemetry = true;
      this._clearActivationTimeout();
    }
    if (this._status !== 2) {
      this._status = 2;
      this._onDidChangeStatus.fire(this._status);
    }
    return didHandle;
  }
  async _ensureCapabilitiesOrAddFailureTelemetry() {
    if (!this._telemetryService || this._disableTelemetry) {
      return;
    }
    this._activationTimeout = setTimeout(() => {
      if (!this.capabilities.get(
        2
        /* TerminalCapability.CommandDetection */
      ) && !this.capabilities.get(
        0
        /* TerminalCapability.CwdDetection */
      )) {
        this._telemetryService?.publicLog2("terminal/shellIntegrationActivationTimeout");
        this._logService.warn("Shell integration failed to add capabilities within 10 seconds");
      }
      this._hasUpdatedTelemetry = true;
    }, 1e4);
  }
  _clearActivationTimeout() {
    if (this._activationTimeout !== void 0) {
      clearTimeout(this._activationTimeout);
      this._activationTimeout = void 0;
    }
  }
  _doHandleVSCodeSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const argsIndex = data.indexOf(";");
    const command = argsIndex === -1 ? data : data.substring(0, argsIndex);
    this._markSequenceSeen(command);
    const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(";");
    switch (command) {
      case "A":
        this._createOrGetCommandDetection(this._terminal).handlePromptStart();
        return true;
      case "B":
        this._createOrGetCommandDetection(this._terminal).handleCommandStart();
        return true;
      case "C":
        this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
        return true;
      case "D": {
        const arg0 = args[0];
        const exitCode = arg0 !== void 0 ? parseInt(arg0) : void 0;
        this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
        return true;
      }
      case "E": {
        const arg0 = args[0];
        const arg1 = args[1];
        let commandLine;
        if (arg0 !== void 0) {
          commandLine = deserializeVSCodeOscMessage(arg0);
        } else {
          commandLine = "";
        }
        this._createOrGetCommandDetection(this._terminal).setCommandLine(commandLine, arg1 === this._nonce);
        return true;
      }
      case "F": {
        this._createOrGetCommandDetection(this._terminal).handleContinuationStart();
        return true;
      }
      case "G": {
        this._createOrGetCommandDetection(this._terminal).handleContinuationEnd();
        return true;
      }
      case "EnvJson": {
        const arg0 = args[0];
        const arg1 = args[1];
        if (arg0 !== void 0) {
          try {
            const env = JSON.parse(deserializeVSCodeOscMessage(arg0));
            this._createOrGetShellEnvDetection().setEnvironment(env, arg1 === this._nonce);
          } catch (e) {
            this._logService.warn("Failed to parse environment from shell integration sequence", arg0);
          }
        }
        return true;
      }
      case "EnvSingleStart": {
        this._createOrGetShellEnvDetection().startEnvironmentSingleVar(args[0] === "1", args[1] === this._nonce);
        return true;
      }
      case "EnvSingleDelete": {
        const arg0 = args[0];
        const arg1 = args[1];
        const arg2 = args[2];
        if (arg0 !== void 0 && arg1 !== void 0) {
          const env = deserializeVSCodeOscMessage(arg1);
          this._createOrGetShellEnvDetection().deleteEnvironmentSingleVar(arg0, env, arg2 === this._nonce);
        }
        return true;
      }
      case "EnvSingleEntry": {
        const arg0 = args[0];
        const arg1 = args[1];
        const arg2 = args[2];
        if (arg0 !== void 0 && arg1 !== void 0) {
          const env = deserializeVSCodeOscMessage(arg1);
          this._createOrGetShellEnvDetection().setEnvironmentSingleVar(arg0, env, arg2 === this._nonce);
        }
        return true;
      }
      case "EnvSingleEnd": {
        this._createOrGetShellEnvDetection().endEnvironmentSingleVar(args[0] === this._nonce);
        return true;
      }
      case "H": {
        this._createOrGetCommandDetection(this._terminal).handleRightPromptStart();
        return true;
      }
      case "I": {
        this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd();
        return true;
      }
      case "P": {
        const arg0 = args[0];
        const deserialized = arg0 !== void 0 ? deserializeVSCodeOscMessage(arg0) : "";
        const { key, value } = parseKeyValueAssignment(deserialized);
        if (value === void 0) {
          return true;
        }
        switch (key) {
          case "ContinuationPrompt": {
            this._updateContinuationPrompt(removeAnsiEscapeCodesFromPrompt(value));
            return true;
          }
          case "Cwd": {
            this._updateCwd(value);
            return true;
          }
          case "IsWindows": {
            this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(value === "True" ? true : false);
            return true;
          }
          case "HasRichCommandDetection": {
            this._createOrGetCommandDetection(this._terminal).setHasRichCommandDetection(value === "True" ? true : false);
            return true;
          }
          case "Prompt": {
            const sanitizedValue = value.replace(/\x1b\[[0-9;]*m/g, "");
            this._updatePromptTerminator(sanitizedValue);
            return true;
          }
          case "PromptType": {
            this._createOrGetPromptTypeDetection().setPromptType(value);
            return true;
          }
          case "Task": {
            this._createOrGetBufferMarkDetection(this._terminal);
            this.capabilities.get(
              2
              /* TerminalCapability.CommandDetection */
            )?.setIsCommandStorageDisabled();
            return true;
          }
        }
      }
      case "SetMark": {
        this._createOrGetBufferMarkDetection(this._terminal).addMark(parseMarkSequence(args));
        return true;
      }
    }
    return false;
  }
  _updateContinuationPrompt(value) {
    if (!this._terminal) {
      return;
    }
    this._createOrGetCommandDetection(this._terminal).setContinuationPrompt(value);
  }
  _updatePromptTerminator(prompt) {
    if (!this._terminal) {
      return;
    }
    const lastPromptLine = prompt.substring(prompt.lastIndexOf("\n") + 1);
    const lastPromptLineTrimmed = lastPromptLine.trim();
    const promptTerminator = lastPromptLineTrimmed.length === 1 ? lastPromptLine : lastPromptLine.substring(lastPromptLine.lastIndexOf(" "));
    if (promptTerminator) {
      this._createOrGetCommandDetection(this._terminal).setPromptTerminator(promptTerminator, lastPromptLine);
    }
  }
  _updateCwd(value) {
    value = sanitizeCwd(value);
    this._createOrGetCwdDetection().updateCwd(value);
    const commandDetection = this.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    commandDetection?.setCwd(value);
  }
  _doHandleITermSequence(data) {
    if (!this._terminal) {
      return false;
    }
    const [command] = data.split(";");
    this._markSequenceSeen(`${1337};${command}`);
    switch (command) {
      case "SetMark": {
        this._createOrGetBufferMarkDetection(this._terminal).addMark();
      }
      default: {
        const { key, value } = parseKeyValueAssignment(command);
        if (value === void 0) {
          return true;
        }
        switch (key) {
          case "CurrentDir":
            this._updateCwd(value);
            return true;
        }
      }
    }
    return false;
  }
  _doHandleSetWindowsFriendlyCwd(data) {
    if (!this._terminal) {
      return false;
    }
    const [command, ...args] = data.split(";");
    this._markSequenceSeen(`${9};${command}`);
    switch (command) {
      case "9":
        if (args.length) {
          this._updateCwd(args[0]);
        }
        return true;
    }
    return false;
  }
  /**
   * Handles the sequence: `OSC 7 ; scheme://cwd ST`
   */
  _doHandleSetCwd(data) {
    if (!this._terminal) {
      return false;
    }
    const [command] = data.split(";");
    this._markSequenceSeen(`${7};${command}`);
    if (command.match(/^file:\/\/.*\//)) {
      const uri = URI.parse(command);
      if (uri.path && uri.path.length > 0) {
        this._updateCwd(uri.path);
        return true;
      }
    }
    return false;
  }
  serialize() {
    if (!this._terminal || !this.capabilities.has(
      2
      /* TerminalCapability.CommandDetection */
    )) {
      return {
        isWindowsPty: false,
        hasRichCommandDetection: false,
        commands: [],
        promptInputModel: void 0
      };
    }
    const result = this._createOrGetCommandDetection(this._terminal).serialize();
    return result;
  }
  deserialize(serialized) {
    if (!this._terminal) {
      throw new Error("Cannot restore commands before addon is activated");
    }
    const commandDetection = this._createOrGetCommandDetection(this._terminal);
    commandDetection.deserialize(serialized);
    if (commandDetection.cwd) {
      this._updateCwd(commandDetection.cwd);
    }
  }
  _createOrGetCwdDetection() {
    let cwdDetection = this.capabilities.get(
      0
      /* TerminalCapability.CwdDetection */
    );
    if (!cwdDetection) {
      cwdDetection = this._register(new CwdDetectionCapability());
      this.capabilities.add(0, cwdDetection);
    }
    return cwdDetection;
  }
  _createOrGetCommandDetection(terminal) {
    let commandDetection = this.capabilities.get(
      2
      /* TerminalCapability.CommandDetection */
    );
    if (!commandDetection) {
      commandDetection = this._register(new CommandDetectionCapability(terminal, this._logService));
      this.capabilities.add(2, commandDetection);
    }
    return commandDetection;
  }
  _createOrGetBufferMarkDetection(terminal) {
    let bufferMarkDetection = this.capabilities.get(
      4
      /* TerminalCapability.BufferMarkDetection */
    );
    if (!bufferMarkDetection) {
      bufferMarkDetection = this._register(new BufferMarkCapability(terminal));
      this.capabilities.add(4, bufferMarkDetection);
    }
    return bufferMarkDetection;
  }
  _createOrGetShellEnvDetection() {
    let shellEnvDetection = this.capabilities.get(
      5
      /* TerminalCapability.ShellEnvDetection */
    );
    if (!shellEnvDetection) {
      shellEnvDetection = this._register(new ShellEnvDetectionCapability());
      this.capabilities.add(5, shellEnvDetection);
    }
    return shellEnvDetection;
  }
  _createOrGetPromptTypeDetection() {
    let promptTypeDetection = this.capabilities.get(
      6
      /* TerminalCapability.PromptTypeDetection */
    );
    if (!promptTypeDetection) {
      promptTypeDetection = this._register(new PromptTypeDetectionCapability());
      this.capabilities.add(6, promptTypeDetection);
    }
    return promptTypeDetection;
  }
}
function deserializeVSCodeOscMessage(message) {
  return message.replaceAll(
    // Backslash ('\') followed by an escape operator: either another '\', or 'x' and two hex chars.
    /\\(\\|x([0-9a-f]{2}))/gi,
    // If it's a hex value, parse it to a character.
    // Otherwise the operator is '\', which we return literally, now unescaped.
    (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op
  );
}
__name(deserializeVSCodeOscMessage, "deserializeVSCodeOscMessage");
function serializeVSCodeOscMessage(message) {
  return message.replace(
    // Match backslash ('\'), semicolon (';'), or characters 0x20 and below
    /[\\;\x00-\x20]/g,
    (char) => {
      if (char === "\\") {
        return "\\\\";
      }
      const charCode = char.charCodeAt(0);
      return `\\x${charCode.toString(16).padStart(2, "0")}`;
    }
  );
}
__name(serializeVSCodeOscMessage, "serializeVSCodeOscMessage");
function parseKeyValueAssignment(message) {
  const separatorIndex = message.indexOf("=");
  if (separatorIndex === -1) {
    return { key: message, value: void 0 };
  }
  return {
    key: message.substring(0, separatorIndex),
    value: message.substring(1 + separatorIndex)
  };
}
__name(parseKeyValueAssignment, "parseKeyValueAssignment");
function parseMarkSequence(sequence) {
  let id = void 0;
  let hidden = false;
  for (const property of sequence) {
    if (property === void 0) {
      continue;
    }
    if (property === "Hidden") {
      hidden = true;
    }
    if (property.startsWith("Id=")) {
      id = property.substring(3);
    }
  }
  return { id, hidden };
}
__name(parseMarkSequence, "parseMarkSequence");
export {
  ShellIntegrationAddon,
  ShellIntegrationOscPs,
  deserializeVSCodeOscMessage,
  parseKeyValueAssignment,
  parseMarkSequence,
  serializeVSCodeOscMessage
};
//# sourceMappingURL=shellIntegrationAddon.js.map
