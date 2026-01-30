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
import { CancellationError } from "../../../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../../../base/common/event.js";
import { DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { isNumber } from "../../../../../../base/common/types.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { trackIdleOnPrompt, waitForIdle } from "./executeStrategy.js";
import { createAltBufferPromise, setupRecreatingStartMarker } from "./strategyHelpers.js";
let BasicExecuteStrategy = class BasicExecuteStrategy2 {
  static {
    __name(this, "BasicExecuteStrategy");
  }
  constructor(_instance, _hasReceivedUserInput, _commandDetection, _logService) {
    this._instance = _instance;
    this._hasReceivedUserInput = _hasReceivedUserInput;
    this._commandDetection = _commandDetection;
    this._logService = _logService;
    this.type = "basic";
    this._startMarker = new MutableDisposable();
    this._onDidCreateStartMarker = new Emitter();
    this.onDidCreateStartMarker = this._onDidCreateStartMarker.event;
  }
  async execute(commandLine, token, commandId) {
    const store = new DisposableStore();
    try {
      const idlePromptPromise = trackIdleOnPrompt(this._instance, 1e3, store);
      const onDone = Promise.race([
        Event.toPromise(this._commandDetection.onCommandFinished, store).then((e) => {
          this._log("onDone 1 of 2 via end event, waiting for short idle prompt");
          return idlePromptPromise.then(() => {
            this._log("onDone 2 of 2 via short idle prompt");
            return {
              "type": "success",
              command: e
            };
          });
        }),
        Event.toPromise(token.onCancellationRequested, store).then(() => {
          this._log("onDone via cancellation");
        }),
        Event.toPromise(this._instance.onDisposed, store).then(() => {
          this._log("onDone via terminal disposal");
          return { type: "disposal" };
        }),
        // A longer idle prompt event is used here as a catch all for unexpected cases where
        // the end event doesn't fire for some reason.
        trackIdleOnPrompt(this._instance, 3e3, store).then(() => {
          this._log("onDone long idle prompt");
        })
      ]);
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      this._log("Waiting for idle");
      await waitForIdle(this._instance.onData, 1e3);
      setupRecreatingStartMarker(xterm, this._startMarker, (m) => this._onDidCreateStartMarker.fire(m), store, this._log.bind(this));
      if (this._hasReceivedUserInput()) {
        this._log("Command timed out, sending SIGINT and retrying");
        await this._instance.sendText("", false);
        await waitForIdle(this._instance.onData, 100);
      }
      if (commandId) {
        this._log(`In basic execute strategy: skipping pre-bound command id ${commandId} because basic shell integration executes via sendText`);
      }
      this._log(`Executing command line \`${commandLine}\``);
      this._instance.sendText(commandLine, true);
      this._log("Waiting for done event");
      const onDoneResult = await Promise.race([onDone, alternateBufferPromise.then(() => ({ type: "alternateBuffer" }))]);
      if (onDoneResult && onDoneResult.type === "disposal") {
        throw new Error("The terminal was closed");
      }
      if (onDoneResult && onDoneResult.type === "alternateBuffer") {
        this._log("Detected alternate buffer entry, skipping output capture");
        return {
          output: void 0,
          exitCode: void 0,
          error: "alternateBuffer",
          didEnterAltBuffer: true
        };
      }
      const finishedCommand = onDoneResult && onDoneResult.type === "success" ? onDoneResult.command : void 0;
      if (finishedCommand) {
        this._log(`Finished command id=${finishedCommand.id ?? "none"} for requested=${commandId ?? "none"}`);
      } else if (commandId) {
        this._log(`No finished command surfaced for requested=${commandId}`);
      }
      this._log("Waiting for idle");
      await waitForIdle(this._instance.onData, 1e3);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const endMarker = store.add(xterm.raw.registerMarker());
      let output;
      const additionalInformationLines = [];
      if (finishedCommand) {
        const commandOutput = finishedCommand?.getOutput();
        if (commandOutput !== void 0) {
          this._log("Fetched output via finished command");
          output = commandOutput;
        }
      }
      if (output === void 0) {
        try {
          output = xterm.getContentsAsText(this._startMarker.value, endMarker);
          this._log("Fetched output via markers");
        } catch {
          this._log("Failed to fetch output via markers");
          additionalInformationLines.push("Failed to retrieve command output");
        }
      }
      if (output !== void 0 && output.trim().length === 0) {
        additionalInformationLines.push("Command produced no output");
      }
      const exitCode = finishedCommand?.exitCode;
      if (isNumber(exitCode) && exitCode > 0) {
        additionalInformationLines.push(`Command exited with code ${exitCode}`);
      }
      return {
        output,
        additionalInformation: additionalInformationLines.length > 0 ? additionalInformationLines.join("\n") : void 0,
        exitCode
      };
    } finally {
      store.dispose();
    }
  }
  _log(message) {
    this._logService.debug(`RunInTerminalTool#Basic: ${message}`);
  }
};
BasicExecuteStrategy = __decorate([
  __param(3, ITerminalLogService)
], BasicExecuteStrategy);
export {
  BasicExecuteStrategy
};
//# sourceMappingURL=basicExecuteStrategy.js.map
