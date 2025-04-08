var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
class DebugCompoundRoot {
  static {
    __name(this, "DebugCompoundRoot");
  }
  stopped = false;
  stopEmitter = new Emitter();
  onDidSessionStop = this.stopEmitter.event;
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
