var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
class ExtensionRecommendations extends Disposable {
  static {
    __name(this, "ExtensionRecommendations");
  }
  constructor() {
    super(...arguments);
    this._activationPromise = null;
  }
  get activated() {
    return this._activationPromise !== null;
  }
  activate() {
    if (!this._activationPromise) {
      this._activationPromise = this.doActivate();
    }
    return this._activationPromise;
  }
}
export {
  ExtensionRecommendations
};
//# sourceMappingURL=extensionRecommendations.js.map
