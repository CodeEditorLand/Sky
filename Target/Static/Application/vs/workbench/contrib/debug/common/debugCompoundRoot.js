var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
class DebugCompoundRoot {
  static {
    __name(this, "DebugCompoundRoot");
  }
  constructor() {
    this.stopped = false;
    this.stopEmitter = new Emitter();
    this.onDidSessionStop = this.stopEmitter.event;
  }
  sessionStopped() {
    if (!this.stopped) {
      this.stopped = true;
      this.stopEmitter.fire();
    }
  }
}
export {
  DebugCompoundRoot
};
//# sourceMappingURL=debugCompoundRoot.js.map
