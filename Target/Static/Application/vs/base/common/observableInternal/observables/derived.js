var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DisposableStore, strictEquals } from "../commonFacade/deps.js";
import { DebugNameData } from "../debugName.js";
import { _setDerivedOpts } from "./baseObservable.js";
import { Derived, DerivedWithSetter } from "./derivedImpl.js";
function derived(computeFnOrOwner, computeFn) {
  if (computeFn !== void 0) {
    return new Derived(new DebugNameData(computeFnOrOwner, void 0, computeFn), computeFn, void 0, void 0, strictEquals);
  }
  return new Derived(new DebugNameData(void 0, void 0, computeFnOrOwner), computeFnOrOwner, void 0, void 0, strictEquals);
}
__name(derived, "derived");
function derivedWithSetter(owner, computeFn, setter) {
  return new DerivedWithSetter(new DebugNameData(owner, void 0, computeFn), computeFn, void 0, void 0, strictEquals, setter);
}
__name(derivedWithSetter, "derivedWithSetter");
function derivedOpts(options, computeFn) {
  return new Derived(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn), computeFn, void 0, options.onLastObserverRemoved, options.equalsFn ?? strictEquals);
}
__name(derivedOpts, "derivedOpts");
_setDerivedOpts(derivedOpts);
function derivedHandleChanges(options, computeFn) {
  return new Derived(new DebugNameData(options.owner, options.debugName, void 0), computeFn, options.changeTracker, void 0, options.equalityComparer ?? strictEquals);
}
__name(derivedHandleChanges, "derivedHandleChanges");
function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let store = new DisposableStore();
  return new Derived(new DebugNameData(owner, void 0, computeFn), (r) => {
    if (store.isDisposed) {
      store = new DisposableStore();
    } else {
      store.clear();
    }
    return computeFn(r, store);
  }, void 0, () => store.dispose(), strictEquals);
}
__name(derivedWithStore, "derivedWithStore");
function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let store = void 0;
  return new Derived(new DebugNameData(owner, void 0, computeFn), (r) => {
    if (!store) {
      store = new DisposableStore();
    } else {
      store.clear();
    }
    const result = computeFn(r);
    if (result) {
      store.add(result);
    }
    return result;
  }, void 0, () => {
    if (store) {
      store.dispose();
      store = void 0;
    }
  }, strictEquals);
}
__name(derivedDisposable, "derivedDisposable");
export {
  derived,
  derivedDisposable,
  derivedHandleChanges,
  derivedOpts,
  derivedWithSetter,
  derivedWithStore
};
//# sourceMappingURL=derived.js.map
