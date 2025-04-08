var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { ITerminalChildProcess } from "../terminal.js";
import { TerminalCapability, INaiveCwdDetectionCapability } from "./capabilities.js";
class NaiveCwdDetectionCapability {
  constructor(_process) {
    this._process = _process;
  }
  static {
    __name(this, "NaiveCwdDetectionCapability");
  }
  type = TerminalCapability.NaiveCwdDetection;
  _cwd = "";
  _onDidChangeCwd = new Emitter();
  onDidChangeCwd = this._onDidChangeCwd.event;
  async getCwd() {
    if (!this._process) {
      return Promise.resolve("");
    }
    const newCwd = await this._process.getCwd();
    if (newCwd !== this._cwd) {
      this._onDidChangeCwd.fire(newCwd);
    }
    this._cwd = newCwd;
    return this._cwd;
  }
}
export {
  NaiveCwdDetectionCapability
};
//# sourceMappingURL=naiveCwdDetectionCapability.js.map
