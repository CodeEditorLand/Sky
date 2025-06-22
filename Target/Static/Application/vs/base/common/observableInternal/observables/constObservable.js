var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ConvenientObservable } from "./baseObservable.js";
function constObservable(value) {
  return new ConstObservable(value);
}
__name(constObservable, "constObservable");
class ConstObservable extends ConvenientObservable {
  static {
    __name(this, "ConstObservable");
  }
  constructor(value) {
    super();
    this.value = value;
  }
  get debugName() {
    return this.toString();
  }
  get() {
    return this.value;
  }
  addObserver(observer) {
  }
  removeObserver(observer) {
  }
  log() {
    return this;
  }
  toString() {
    return `Const: ${this.value}`;
  }
}
export {
  constObservable
};
//# sourceMappingURL=constObservable.js.map
