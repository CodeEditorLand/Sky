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
import { Disposable, DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { isNumber } from "../../../../../../base/common/types.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { trackIdleOnPrompt } from "./executeStrategy.js";
import { createAltBufferPromise, setupRecreatingStartMarker } from "./strategyHelpers.js";
let RichExecuteStrategy = class RichExecuteStrategy2 extends Disposable {
  static {
    __name(this, "RichExecuteStrategy");
  }
  constructor(_instance, _commandDetection, _logService) {
    super();
    this._instance = _instance;
    this._commandDetection = _commandDetection;
    this._logService = _logService;
    this.type = "rich";
    this._startMarker = this._register(new MutableDisposable());
    this._onDidCreateStartMarker = this._register(new Emitter());
    this.onDidCreateStartMarker = this._onDidCreateStartMarker.event;
  }
  async execute(commandLine, token, commandId) {
    const store = new DisposableStore();
    try {
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      const onDone = Promise.race([
        Event.toPromise(this._commandDetection.onCommandFinished, store).then((e) => {
          this._log("onDone via end event");
          return {
            "type": "success",
            command: e
          };
        }),
        Event.toPromise(token.onCancellationRequested, store).then(() => {
          this._log("onDone via cancellation");
        }),
        Event.toPromise(this._instance.onDisposed, store).then(() => {
          this._log("onDone via terminal disposal");
          return { type: "disposal" };
        }),
        trackIdleOnPrompt(this._instance, 1e3, store).then(() => {
          this._log("onDone via idle prompt");
        })
      ]);
      setupRecreatingStartMarker(xterm, this._startMarker, (m) => this._onDidCreateStartMarker.fire(m), store, this._log.bind(this));
      this._log(`Executing command line \`${commandLine}\``);
      this._instance.runCommand(commandLine, true, commandId);
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
    this._logService.debug(`RunInTerminalTool#Rich: ${message}`);
  }
};
RichExecuteStrategy = __decorate([
  __param(2, ITerminalLogService)
], RichExecuteStrategy);
export {
  RichExecuteStrategy
};
//# sourceMappingURL=richExecuteStrategy.js.map
