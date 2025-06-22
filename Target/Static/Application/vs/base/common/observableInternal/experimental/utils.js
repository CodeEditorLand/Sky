var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError, DisposableStore } from "../commonFacade/deps.js";
import { getDebugName, DebugNameData } from "../debugName.js";
import { observableFromEvent } from "../observables/observableFromEvent.js";
import { autorunOpts } from "../reactions/autorun.js";
import { derivedObservableWithCache } from "../utils/utils.js";
function latestChangedValue(owner, observables) {
  if (observables.length === 0) {
    throw new BugIndicatingError();
  }
  let hasLastChangedValue = false;
  let lastChangedValue = void 0;
  const result = observableFromEvent(owner, (cb) => {
    const store = new DisposableStore();
    for (const o of observables) {
      store.add(autorunOpts({ debugName: /* @__PURE__ */ __name(() => getDebugName(result, new DebugNameData(owner, void 0, void 0)) + ".updateLastChangedValue", "debugName") }, (reader) => {
        hasLastChangedValue = true;
        lastChangedValue = o.read(reader);
        cb();
      }));
    }
    store.add({
      dispose() {
        hasLastChangedValue = false;
        lastChangedValue = void 0;
      }
    });
    return store;
  }, () => {
    if (hasLastChangedValue) {
      return lastChangedValue;
    } else {
      return observables[observables.length - 1].get();
    }
  });
  return result;
}
__name(latestChangedValue, "latestChangedValue");
function derivedConstOnceDefined(owner, fn) {
  return derivedObservableWithCache(owner, (reader, lastValue) => lastValue ?? fn(reader));
}
__name(derivedConstOnceDefined, "derivedConstOnceDefined");
export {
  derivedConstOnceDefined,
  latestChangedValue
};
//# sourceMappingURL=utils.js.map
