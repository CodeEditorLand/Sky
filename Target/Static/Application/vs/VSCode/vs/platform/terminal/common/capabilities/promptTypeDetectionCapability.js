var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
class PromptTypeDetectionCapability extends Disposable {
  static {
    __name(this, "PromptTypeDetectionCapability");
  }
  constructor() {
    super(...arguments);
    this.type = 6;
    this._onPromptTypeChanged = this._register(new Emitter());
    this.onPromptTypeChanged = this._onPromptTypeChanged.event;
  }
  get promptType() {
    return this._promptType;
  }
  setPromptType(value) {
    this._promptType = value;
    this._onPromptTypeChanged.fire(value);
  }
}
export {
  PromptTypeDetectionCapability
};
//# sourceMappingURL=promptTypeDetectionCapability.js.map
