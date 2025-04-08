var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IPartialCommandDetectionCapability, TerminalCapability } from "./capabilities.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MinimumPromptLength"] = 2] = "MinimumPromptLength";
  return Constants2;
})(Constants || {});
class PartialCommandDetectionCapability extends DisposableStore {
  constructor(_terminal) {
    super();
    this._terminal = _terminal;
    this.add(this._terminal.onData((e) => this._onData(e)));
    this.add(this._terminal.parser.registerCsiHandler({ final: "J" }, (params) => {
      if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
        this._clearCommandsInViewport();
      }
      return false;
    }));
  }
  static {
    __name(this, "PartialCommandDetectionCapability");
  }
  type = TerminalCapability.PartialCommandDetection;
  _commands = [];
  get commands() {
    return this._commands;
  }
  _onCommandFinished = this.add(new Emitter());
  onCommandFinished = this._onCommandFinished.event;
  _onData(data) {
    if (data === "\r") {
      this._onEnter();
    }
  }
  _onEnter() {
    if (!this._terminal) {
      return;
    }
    if (this._terminal.buffer.active.cursorX >= 2 /* MinimumPromptLength */) {
      const marker = this._terminal.registerMarker(0);
      if (marker) {
        this._commands.push(marker);
        this._onCommandFinished.fire(marker);
      }
    }
  }
  _clearCommandsInViewport() {
    let count = 0;
    for (let i = this._commands.length - 1; i >= 0; i--) {
      if (this._commands[i].line < this._terminal.buffer.active.baseY) {
        break;
      }
      count++;
    }
    this._commands.splice(this._commands.length - count, count);
  }
}
export {
  PartialCommandDetectionCapability
};
//# sourceMappingURL=partialCommandDetectionCapability.js.map
