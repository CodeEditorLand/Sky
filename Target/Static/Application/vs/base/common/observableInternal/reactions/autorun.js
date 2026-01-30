var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, toDisposable } from "../commonFacade/deps.js";
import { DebugNameData } from "../debugName.js";
import { AutorunObserver } from "./autorunImpl.js";
import { DebugLocation } from "../debugLocation.js";
function autorun(fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(new DebugNameData(void 0, void 0, fn), fn, void 0, debugLocation);
}
__name(autorun, "autorun");
function autorunOpts(options, fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, void 0, debugLocation);
}
__name(autorunOpts, "autorunOpts");
function autorunHandleChanges(options, fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.changeTracker, debugLocation);
}
__name(autorunHandleChanges, "autorunHandleChanges");
function autorunWithStoreHandleChanges(options, fn) {
  const store = new DisposableStore();
  const disposable = autorunHandleChanges({
    owner: options.owner,
    debugName: options.debugName,
    debugReferenceFn: options.debugReferenceFn ?? fn,
    changeTracker: options.changeTracker
  }, (reader, changeSummary) => {
    store.clear();
    fn(reader, changeSummary, store);
  });
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}
__name(autorunWithStoreHandleChanges, "autorunWithStoreHandleChanges");
function autorunWithStore(fn) {
  const store = new DisposableStore();
  const disposable = autorunOpts({
    owner: void 0,
    debugName: void 0,
    debugReferenceFn: fn
  }, (reader) => {
    store.clear();
    fn(reader, store);
  });
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}
__name(autorunWithStore, "autorunWithStore");
function autorunDelta(observable, handler) {
  let _lastValue;
  return autorunOpts({ debugReferenceFn: handler }, (reader) => {
    const newValue = observable.read(reader);
    const lastValue = _lastValue;
    _lastValue = newValue;
    handler({ lastValue, newValue });
  });
}
__name(autorunDelta, "autorunDelta");
function autorunIterableDelta(getValue, handler, getUniqueIdentifier = (v) => v) {
  const lastValues = /* @__PURE__ */ new Map();
  return autorunOpts({ debugReferenceFn: getValue }, (reader) => {
    const newValues = /* @__PURE__ */ new Map();
    const removedValues = new Map(lastValues);
    for (const value of getValue(reader)) {
      const id = getUniqueIdentifier(value);
      if (lastValues.has(id)) {
        removedValues.delete(id);
      } else {
        newValues.set(id, value);
        lastValues.set(id, value);
      }
    }
    for (const id of removedValues.keys()) {
      lastValues.delete(id);
    }
    if (newValues.size || removedValues.size) {
      handler({ addedValues: [...newValues.values()], removedValues: [...removedValues.values()] });
    }
  });
}
__name(autorunIterableDelta, "autorunIterableDelta");
function autorunSelfDisposable(fn, debugLocation = DebugLocation.ofCaller()) {
  let ar;
  let disposed = false;
  ar = autorun((reader) => {
    fn({
      delayedStore: reader.delayedStore,
      store: reader.store,
      readObservable: reader.readObservable.bind(reader),
      dispose: /* @__PURE__ */ __name(() => {
        ar?.dispose();
        disposed = true;
      }, "dispose")
    });
  }, debugLocation);
  if (disposed) {
    ar.dispose();
  }
  return ar;
}
__name(autorunSelfDisposable, "autorunSelfDisposable");
export {
  autorun,
  autorunDelta,
  autorunHandleChanges,
  autorunIterableDelta,
  autorunOpts,
  autorunSelfDisposable,
  autorunWithStore,
  autorunWithStoreHandleChanges
};
//# sourceMappingURL=autorun.js.map
