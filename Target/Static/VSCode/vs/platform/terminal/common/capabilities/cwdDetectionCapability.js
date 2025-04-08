var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICwdDetectionCapability, TerminalCapability } from "./capabilities.js";
class CwdDetectionCapability extends Disposable {
  static {
    __name(this, "CwdDetectionCapability");
  }
  type = TerminalCapability.CwdDetection;
  _cwd = "";
  _cwds = /* @__PURE__ */ new Map();
  /**
   * Gets the list of cwds seen in this session in order of last accessed.
   */
  get cwds() {
    return Array.from(this._cwds.keys());
  }
  _onDidChangeCwd = this._register(new Emitter());
  onDidChangeCwd = this._onDidChangeCwd.event;
  getCwd() {
    return this._cwd;
  }
  updateCwd(cwd) {
    const didChange = this._cwd !== cwd;
    this._cwd = cwd;
    const count = this._cwds.get(this._cwd) || 0;
    this._cwds.delete(this._cwd);
    this._cwds.set(this._cwd, count + 1);
    if (didChange) {
      this._onDidChangeCwd.fire(cwd);
    }
  }
}
export {
  CwdDetectionCapability
};
//# sourceMappingURL=cwdDetectionCapability.js.map
