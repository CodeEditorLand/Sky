var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IExtensionRecommendationReason } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
class ExtensionRecommendations extends Disposable {
  static {
    __name(this, "ExtensionRecommendations");
  }
  _activationPromise = null;
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
