var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IKeymapInfo } from "../../common/keymapInfo.js";
class KeyboardLayoutContribution {
  static {
    __name(this, "KeyboardLayoutContribution");
  }
  static INSTANCE = new KeyboardLayoutContribution();
  _layoutInfos = [];
  get layoutInfos() {
    return this._layoutInfos;
  }
  constructor() {
  }
  registerKeyboardLayout(layout) {
    this._layoutInfos.push(layout);
  }
}
export {
  KeyboardLayoutContribution
};
//# sourceMappingURL=_.contribution.js.map
