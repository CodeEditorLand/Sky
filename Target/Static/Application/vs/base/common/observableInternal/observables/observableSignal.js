var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { transaction } from "../transaction.js";
import { DebugNameData } from "../debugName.js";
import { BaseObservable } from "./baseObservable.js";
function observableSignal(debugNameOrOwner) {
  if (typeof debugNameOrOwner === "string") {
    return new ObservableSignal(debugNameOrOwner);
  } else {
    return new ObservableSignal(void 0, debugNameOrOwner);
  }
}
__name(observableSignal, "observableSignal");
class ObservableSignal extends BaseObservable {
  static {
    __name(this, "ObservableSignal");
  }
  get debugName() {
    return new DebugNameData(this._owner, this._debugName, void 0).getDebugName(this) ?? "Observable Signal";
  }
  toString() {
    return this.debugName;
  }
  constructor(_debugName, _owner) {
    super();
    this._debugName = _debugName;
    this._owner = _owner;
  }
  trigger(tx, change) {
    if (!tx) {
      transaction((tx2) => {
        this.trigger(tx2, change);
      }, () => `Trigger signal ${this.debugName}`);
      return;
    }
    for (const o of this._observers) {
      tx.updateObserver(o, this);
      o.handleChange(this, change);
    }
  }
  get() {
  }
}
export {
  observableSignal
};
//# sourceMappingURL=observableSignal.js.map
