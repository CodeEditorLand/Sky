var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
const staticObservableValue = /* @__PURE__ */ __name((value) => ({
  onDidChange: Event.None,
  value
}), "staticObservableValue");
class MutableObservableValue extends Disposable {
  static {
    __name(this, "MutableObservableValue");
  }
  get value() {
    return this._value;
  }
  set value(v) {
    if (v !== this._value) {
      this._value = v;
      this.changeEmitter.fire(v);
    }
  }
  static stored(stored, defaultValue) {
    const o = new MutableObservableValue(stored.get(defaultValue));
    o._register(stored);
    o._register(o.onDidChange((value) => stored.store(value)));
    return o;
  }
  constructor(_value) {
    super();
    this._value = _value;
    this.changeEmitter = this._register(new Emitter());
    this.onDidChange = this.changeEmitter.event;
  }
}
export {
  MutableObservableValue,
  staticObservableValue
};
//# sourceMappingURL=observableValue.js.map
