var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { transaction } from "../transaction.js";
import { DebugNameData } from "../debugName.js";
import { BaseObservable } from "./baseObservable.js";
function observableSignalFromEvent(owner, event) {
  return new FromEventObservableSignal(typeof owner === "string" ? owner : new DebugNameData(owner, void 0, void 0), event);
}
__name(observableSignalFromEvent, "observableSignalFromEvent");
class FromEventObservableSignal extends BaseObservable {
  static {
    __name(this, "FromEventObservableSignal");
  }
  constructor(debugNameDataOrName, event) {
    super();
    this.event = event;
    this.handleEvent = () => {
      transaction((tx) => {
        for (const o of this._observers) {
          tx.updateObserver(o, this);
          o.handleChange(this, void 0);
        }
      }, () => this.debugName);
    };
    this.debugName = typeof debugNameDataOrName === "string" ? debugNameDataOrName : debugNameDataOrName.getDebugName(this) ?? "Observable Signal From Event";
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
  }
  get() {
  }
}
export {
  observableSignalFromEvent
};
//# sourceMappingURL=observableSignalFromEvent.js.map
