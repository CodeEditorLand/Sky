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
import { Emitter } from "../../../../../../base/common/event.js";
import { DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { ITerminalLogService } from "../../../../../../platform/terminal/common/terminal.js";
import { waitForIdle, waitForIdleWithPromptHeuristics } from "./executeStrategy.js";
import { createAltBufferPromise, setupRecreatingStartMarker } from "./strategyHelpers.js";
let NoneExecuteStrategy = class NoneExecuteStrategy2 {
  static {
    __name(this, "NoneExecuteStrategy");
  }
  constructor(_instance, _hasReceivedUserInput, _logService) {
    this._instance = _instance;
    this._hasReceivedUserInput = _hasReceivedUserInput;
    this._logService = _logService;
    this.type = "none";
    this._startMarker = new MutableDisposable();
    this._onDidCreateStartMarker = new Emitter();
    this.onDidCreateStartMarker = this._onDidCreateStartMarker.event;
  }
  async execute(commandLine, token, commandId) {
    const store = new DisposableStore();
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      this._log("Waiting for xterm");
      const xterm = await this._instance.xtermReadyPromise;
      if (!xterm) {
        throw new Error("Xterm is not available");
      }
      const alternateBufferPromise = createAltBufferPromise(xterm, store, this._log.bind(this));
      this._log("Waiting for idle");
      await waitForIdle(this._instance.onData, 1e3);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      setupRecreatingStartMarker(xterm, this._startMarker, (m) => this._onDidCreateStartMarker.fire(m), store, this._log.bind(this));
      if (this._hasReceivedUserInput()) {
        this._log("Command timed out, sending SIGINT and retrying");
        await this._instance.sendText("", false);
        await waitForIdle(this._instance.onData, 100);
      }
      this._log(`Executing command line \`${commandLine}\``);
      this._instance.sendText(commandLine, true);
      this._log("Waiting for idle with prompt heuristics");
      const promptResultOrAltBuffer = await Promise.race([
        waitForIdleWithPromptHeuristics(this._instance.onData, this._instance, 1e3, 1e4),
        alternateBufferPromise.then(() => "alternateBuffer")
      ]);
      if (promptResultOrAltBuffer === "alternateBuffer") {
        this._log("Detected alternate buffer entry, skipping output capture");
        return {
          output: void 0,
          additionalInformation: void 0,
          exitCode: void 0,
          error: "alternateBuffer",
          didEnterAltBuffer: true
        };
      }
      const promptResult = promptResultOrAltBuffer;
      this._log(`Prompt detection result: ${promptResult.detected ? "detected" : "not detected"} - ${promptResult.reason}`);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const endMarker = store.add(xterm.raw.registerMarker());
      let output;
      const additionalInformationLines = [];
      try {
        output = xterm.getContentsAsText(this._startMarker.value, endMarker);
        this._log("Fetched output via markers");
      } catch {
        this._log("Failed to fetch output via markers");
        additionalInformationLines.push("Failed to retrieve command output");
      }
      return {
        output,
        additionalInformation: additionalInformationLines.length > 0 ? additionalInformationLines.join("\n") : void 0,
        exitCode: void 0
      };
    } finally {
      store.dispose();
    }
  }
  _log(message) {
    this._logService.debug(`RunInTerminalTool#None: ${message}`);
  }
};
NoneExecuteStrategy = __decorate([
  __param(2, ITerminalLogService)
], NoneExecuteStrategy);
export {
  NoneExecuteStrategy
};
//# sourceMappingURL=noneExecuteStrategy.js.map
