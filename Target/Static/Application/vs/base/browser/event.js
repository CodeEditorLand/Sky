var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../common/event.js";
class DomEmitter {
  static {
    __name(this, "DomEmitter");
  }
  get event() {
    return this.emitter.event;
  }
  constructor(element, type, useCapture) {
    const fn = /* @__PURE__ */ __name((e) => this.emitter.fire(e), "fn");
    this.emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => element.addEventListener(type, fn, useCapture), "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => element.removeEventListener(type, fn, useCapture), "onDidRemoveLastListener")
    });
  }
  dispose() {
    this.emitter.dispose();
  }
}
export {
  DomEmitter
};
//# sourceMappingURL=event.js.map
