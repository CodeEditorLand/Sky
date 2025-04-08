var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../../../base/common/async.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { ILogService } from "../../../../log/common/log.js";
import { ITerminalChildProcess } from "../../../common/terminal.js";
class TerminalAutoResponder extends Disposable {
  static {
    __name(this, "TerminalAutoResponder");
  }
  _pointer = 0;
  _paused = false;
  /**
   * Each reply is throttled by a second to avoid resource starvation and responding to screen
   * reprints on Winodws.
   */
  _throttled = false;
  constructor(proc, matchWord, response, logService) {
    super();
    this._register(proc.onProcessData((e) => {
      if (this._paused || this._throttled) {
        return;
      }
      const data = typeof e === "string" ? e : e.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i] === matchWord[this._pointer]) {
          this._pointer++;
        } else {
          this._reset();
        }
        if (this._pointer === matchWord.length) {
          logService.debug(`Auto reply match: "${matchWord}", response: "${response}"`);
          proc.input(response);
          this._throttled = true;
          timeout(1e3).then(() => this._throttled = false);
          this._reset();
        }
      }
    }));
  }
  _reset() {
    this._pointer = 0;
  }
  /**
   * No auto response will happen after a resize on Windows in case the resize is a result of
   * reprinting the screen.
   */
  handleResize() {
    if (isWindows) {
      this._paused = true;
    }
  }
  handleInput() {
    this._paused = false;
  }
}
export {
  TerminalAutoResponder
};
//# sourceMappingURL=terminalAutoResponder.js.map
