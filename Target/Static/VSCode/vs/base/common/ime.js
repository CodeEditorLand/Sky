var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "./event.js";
class IMEImpl {
  static {
    __name(this, "IMEImpl");
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _enabled = true;
  get enabled() {
    return this._enabled;
  }
  /**
   * Enable IME
   */
  enable() {
    this._enabled = true;
    this._onDidChange.fire();
  }
  /**
   * Disable IME
   */
  disable() {
    this._enabled = false;
    this._onDidChange.fire();
  }
}
const IME = new IMEImpl();
export {
  IME,
  IMEImpl
};
//# sourceMappingURL=ime.js.map
