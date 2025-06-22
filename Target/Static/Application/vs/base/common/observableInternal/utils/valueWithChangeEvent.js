var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../commonFacade/deps.js";
import { observableFromEvent } from "../observables/observableFromEvent.js";
class ValueWithChangeEventFromObservable {
  static {
    __name(this, "ValueWithChangeEventFromObservable");
  }
  constructor(observable) {
    this.observable = observable;
  }
  get onDidChange() {
    return Event.fromObservableLight(this.observable);
  }
  get value() {
    return this.observable.get();
  }
}
function observableFromValueWithChangeEvent(owner, value) {
  if (value instanceof ValueWithChangeEventFromObservable) {
    return value.observable;
  }
  return observableFromEvent(owner, value.onDidChange, () => value.value);
}
__name(observableFromValueWithChangeEvent, "observableFromValueWithChangeEvent");
export {
  ValueWithChangeEventFromObservable,
  observableFromValueWithChangeEvent
};
//# sourceMappingURL=valueWithChangeEvent.js.map
