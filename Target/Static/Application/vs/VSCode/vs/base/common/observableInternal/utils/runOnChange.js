var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { cancelOnDispose } from "../commonFacade/cancellation.js";
import { DisposableStore } from "../commonFacade/deps.js";
import { autorunWithStoreHandleChanges } from "../reactions/autorun.js";
function runOnChange(observable, cb) {
  let _previousValue;
  let _firstRun = true;
  return autorunWithStoreHandleChanges({
    changeTracker: {
      createChangeSummary: /* @__PURE__ */ __name(() => ({ deltas: [], didChange: false }), "createChangeSummary"),
      handleChange: /* @__PURE__ */ __name((context, changeSummary) => {
        if (context.didChange(observable)) {
          const e = context.change;
          if (e !== void 0) {
            changeSummary.deltas.push(e);
          }
          changeSummary.didChange = true;
        }
        return true;
      }, "handleChange")
    }
  }, (reader, changeSummary) => {
    const value = observable.read(reader);
    const previousValue = _previousValue;
    if (changeSummary.didChange) {
      _previousValue = value;
      cb(value, previousValue, changeSummary.deltas);
    }
    if (_firstRun) {
      _firstRun = false;
      _previousValue = value;
    }
  });
}
__name(runOnChange, "runOnChange");
function runOnChangeWithStore(observable, cb) {
  const store = new DisposableStore();
  const disposable = runOnChange(observable, (value, previousValue, deltas) => {
    store.clear();
    cb(value, previousValue, deltas, store);
  });
  return {
    dispose() {
      disposable.dispose();
      store.dispose();
    }
  };
}
__name(runOnChangeWithStore, "runOnChangeWithStore");
function runOnChangeWithCancellationToken(observable, cb) {
  return runOnChangeWithStore(observable, (value, previousValue, deltas, store) => {
    cb(value, previousValue, deltas, cancelOnDispose(store));
  });
}
__name(runOnChangeWithCancellationToken, "runOnChangeWithCancellationToken");
export {
  runOnChange,
  runOnChangeWithCancellationToken,
  runOnChangeWithStore
};
//# sourceMappingURL=runOnChange.js.map
