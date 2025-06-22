var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "./event.js";
class Sequence {
  static {
    __name(this, "Sequence");
  }
  constructor() {
    this.elements = [];
    this._onDidSplice = new Emitter();
    this.onDidSplice = this._onDidSplice.event;
  }
  splice(start, deleteCount, toInsert = []) {
    this.elements.splice(start, deleteCount, ...toInsert);
    this._onDidSplice.fire({ start, deleteCount, toInsert });
  }
}
export {
  Sequence
};
//# sourceMappingURL=sequence.js.map
