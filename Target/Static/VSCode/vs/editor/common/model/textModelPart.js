var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
class TextModelPart extends Disposable {
  static {
    __name(this, "TextModelPart");
  }
  _isDisposed = false;
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
  assertNotDisposed() {
    if (this._isDisposed) {
      throw new Error("TextModelPart is disposed!");
    }
  }
}
export {
  TextModelPart
};
//# sourceMappingURL=textModelPart.js.map
