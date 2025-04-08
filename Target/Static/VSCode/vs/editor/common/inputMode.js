var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../base/common/event.js";
class InputModeImpl {
  static {
    __name(this, "InputModeImpl");
  }
  _inputMode = "insert";
  _onDidChangeInputMode = new Emitter();
  onDidChangeInputMode = this._onDidChangeInputMode.event;
  getInputMode() {
    return this._inputMode;
  }
  setInputMode(inputMode) {
    this._inputMode = inputMode;
    this._onDidChangeInputMode.fire(this._inputMode);
  }
}
const InputMode = new InputModeImpl();
export {
  InputMode
};
//# sourceMappingURL=inputMode.js.map
