var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseObservable, IObservable, IObservableWithChange, IObserver, IReader, ISettableObservable, ITransaction, _setDerivedOpts } from "./base.js";
import { DebugNameData, DebugOwner, IDebugNameData } from "./debugName.js";
import { BugIndicatingError, DisposableStore, EqualityComparer, IDisposable, assertFn, onBugIndicatingError, strictEquals } from "./commonFacade/deps.js";
import { getLogger } from "./logging/logging.js";
import { IChangeTracker } from "./changeTracker.js";
function derived(computeFnOrOwner, computeFn) {
  if (computeFn !== void 0) {
    return new Derived(
      new DebugNameData(computeFnOrOwner, void 0, computeFn),
      computeFn,
      void 0,
      void 0,
      strictEquals
    );
  }
  return new Derived(
    new DebugNameData(void 0, void 0, computeFnOrOwner),
    computeFnOrOwner,
    void 0,
    void 0,
    strictEquals
  );
}
__name(derived, "derived");
function derivedWithSetter(owner, computeFn, setter) {
  return new DerivedWithSetter(
    new DebugNameData(owner, void 0, computeFn),
    computeFn,
    void 0,
    void 0,
    strictEquals,
    setter
  );
}
__name(derivedWithSetter, "derivedWithSetter");
function derivedOpts(options, computeFn) {
  return new Derived(
    new DebugNameData(options.owner, options.debugName, options.debugReferenceFn),
    computeFn,
    void 0,
    options.onLastObserverRemoved,
    options.equalsFn ?? strictEquals
  );
}
__name(derivedOpts, "derivedOpts");
_setDerivedOpts(derivedOpts);
function derivedHandleChanges(options, computeFn) {
  return new Derived(
    new DebugNameData(options.owner, options.debugName, void 0),
    computeFn,
    options.changeTracker,
    void 0,
    options.equalityComparer ?? strictEquals
  );
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
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r) => {
      if (store.isDisposed) {
        store = new DisposableStore();
      } else {
        store.clear();
      }
      return computeFn(r, store);
    },
    void 0,
    () => store.dispose(),
    strictEquals
  );
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
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r) => {
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
    },
    void 0,
    () => {
      if (store) {
        store.dispose();
        store = void 0;
      }
    },
    strictEquals
  );
}
__name(derivedDisposable, "derivedDisposable");
var DerivedState = /* @__PURE__ */ ((DerivedState2) => {
  DerivedState2[DerivedState2["initial"] = 0] = "initial";
  DerivedState2[DerivedState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  DerivedState2[DerivedState2["stale"] = 2] = "stale";
  DerivedState2[DerivedState2["upToDate"] = 3] = "upToDate";
  return DerivedState2;
})(DerivedState || {});
class Derived extends BaseObservable {
  constructor(_debugNameData, _computeFn, _changeTracker, _handleLastObserverRemoved = void 0, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._computeFn = _computeFn;
    this._changeTracker = _changeTracker;
    this._handleLastObserverRemoved = _handleLastObserverRemoved;
    this._equalityComparator = _equalityComparator;
    this._changeSummary = this._changeTracker?.createChangeSummary(void 0);
  }
  static {
    __name(this, "Derived");
  }
  _state = 0 /* initial */;
  _value = void 0;
  _updateCount = 0;
  _dependencies = /* @__PURE__ */ new Set();
  _dependenciesToBeRemoved = /* @__PURE__ */ new Set();
  _changeSummary = void 0;
  _isUpdating = false;
  _isComputing = false;
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  onLastObserverRemoved() {
    this._state = 0 /* initial */;
    this._value = void 0;
    getLogger()?.handleDerivedCleared(this);
    for (const d of this._dependencies) {
      d.removeObserver(this);
    }
    this._dependencies.clear();
    this._handleLastObserverRemoved?.();
  }
  get() {
    const checkEnabled = false;
    if (this._isComputing && checkEnabled) {
      throw new BugIndicatingError("Cyclic deriveds are not supported yet!");
    }
    if (this._observers.size === 0) {
      let result;
      try {
        this._isReaderValid = true;
        let changeSummary = void 0;
        if (this._changeTracker) {
          changeSummary = this._changeTracker.createChangeSummary(void 0);
          this._changeTracker.beforeUpdate?.(this, changeSummary);
        }
        result = this._computeFn(this, changeSummary);
      } finally {
        this._isReaderValid = false;
      }
      this.onLastObserverRemoved();
      return result;
    } else {
      do {
        if (this._state === 1 /* dependenciesMightHaveChanged */) {
          for (const d of this._dependencies) {
            d.reportChanges();
            if (this._state === 2 /* stale */) {
              break;
            }
          }
        }
        if (this._state === 1 /* dependenciesMightHaveChanged */) {
          this._state = 3 /* upToDate */;
        }
        if (this._state !== 3 /* upToDate */) {
          this._recompute();
        }
      } while (this._state !== 3 /* upToDate */);
      return this._value;
    }
  }
  _recompute() {
    const emptySet = this._dependenciesToBeRemoved;
    this._dependenciesToBeRemoved = this._dependencies;
    this._dependencies = emptySet;
    const hadValue = this._state !== 0 /* initial */;
    const oldValue = this._value;
    this._state = 3 /* upToDate */;
    let didChange = false;
    this._isComputing = true;
    try {
      const changeSummary = this._changeSummary;
      try {
        this._isReaderValid = true;
        if (this._changeTracker) {
          this._changeTracker.beforeUpdate?.(this, changeSummary);
          this._changeSummary = this._changeTracker?.createChangeSummary(changeSummary);
        }
        this._value = this._computeFn(this, changeSummary);
      } finally {
        this._isReaderValid = false;
        for (const o of this._dependenciesToBeRemoved) {
          o.removeObserver(this);
        }
        this._dependenciesToBeRemoved.clear();
      }
      didChange = hadValue && !this._equalityComparator(oldValue, this._value);
      getLogger()?.handleObservableUpdated(this, {
        oldValue,
        newValue: this._value,
        change: void 0,
        didChange,
        hadValue
      });
    } catch (e) {
      onBugIndicatingError(e);
    }
    this._isComputing = false;
    if (didChange) {
      for (const r of this._observers) {
        r.handleChange(this, void 0);
      }
    }
  }
  toString() {
    return `LazyDerived<${this.debugName}>`;
  }
  // IObserver Implementation
  beginUpdate(_observable) {
    if (this._isUpdating) {
      throw new BugIndicatingError("Cyclic deriveds are not supported yet!");
    }
    this._updateCount++;
    this._isUpdating = true;
    try {
      const propagateBeginUpdate = this._updateCount === 1;
      if (this._state === 3 /* upToDate */) {
        this._state = 1 /* dependenciesMightHaveChanged */;
        if (!propagateBeginUpdate) {
          for (const r of this._observers) {
            r.handlePossibleChange(this);
          }
        }
      }
      if (propagateBeginUpdate) {
        for (const r of this._observers) {
          r.beginUpdate(this);
        }
      }
    } finally {
      this._isUpdating = false;
    }
  }
  _removedObserverToCallEndUpdateOn = null;
  endUpdate(_observable) {
    this._updateCount--;
    if (this._updateCount === 0) {
      const observers = [...this._observers];
      for (const r of observers) {
        r.endUpdate(this);
      }
      if (this._removedObserverToCallEndUpdateOn) {
        const observers2 = [...this._removedObserverToCallEndUpdateOn];
        this._removedObserverToCallEndUpdateOn = null;
        for (const r of observers2) {
          r.endUpdate(this);
        }
      }
    }
    assertFn(() => this._updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this._state === 3 /* upToDate */ && this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
      this._state = 1 /* dependenciesMightHaveChanged */;
      for (const r of this._observers) {
        r.handlePossibleChange(this);
      }
    }
  }
  handleChange(observable, change) {
    if (this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
      getLogger()?.handleDerivedDependencyChanged(this, observable, change);
      let shouldReact = false;
      try {
        shouldReact = this._changeTracker ? this._changeTracker.handleChange({
          changedObservable: observable,
          change,
          didChange: /* @__PURE__ */ __name((o) => o === observable, "didChange")
        }, this._changeSummary) : true;
      } catch (e) {
        onBugIndicatingError(e);
      }
      const wasUpToDate = this._state === 3 /* upToDate */;
      if (shouldReact && (this._state === 1 /* dependenciesMightHaveChanged */ || wasUpToDate)) {
        this._state = 2 /* stale */;
        if (wasUpToDate) {
          for (const r of this._observers) {
            r.handlePossibleChange(this);
          }
        }
      }
    }
  }
  // IReader Implementation
  _isReaderValid = false;
  readObservable(observable) {
    if (!this._isReaderValid) {
      throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
    }
    observable.addObserver(this);
    const value = observable.get();
    this._dependencies.add(observable);
    this._dependenciesToBeRemoved.delete(observable);
    return value;
  }
  addObserver(observer) {
    const shouldCallBeginUpdate = !this._observers.has(observer) && this._updateCount > 0;
    super.addObserver(observer);
    if (shouldCallBeginUpdate) {
      if (this._removedObserverToCallEndUpdateOn && this._removedObserverToCallEndUpdateOn.has(observer)) {
        this._removedObserverToCallEndUpdateOn.delete(observer);
      } else {
        observer.beginUpdate(this);
      }
    }
  }
  removeObserver(observer) {
    if (this._observers.has(observer) && this._updateCount > 0) {
      if (!this._removedObserverToCallEndUpdateOn) {
        this._removedObserverToCallEndUpdateOn = /* @__PURE__ */ new Set();
      }
      this._removedObserverToCallEndUpdateOn.add(observer);
    }
    super.removeObserver(observer);
  }
  debugGetState() {
    return {
      state: this._state,
      updateCount: this._updateCount,
      isComputing: this._isComputing,
      dependencies: this._dependencies,
      value: this._value
    };
  }
  debugSetValue(newValue) {
    this._value = newValue;
  }
}
class DerivedWithSetter extends Derived {
  constructor(debugNameData, computeFn, changeTracker, handleLastObserverRemoved = void 0, equalityComparator, set) {
    super(
      debugNameData,
      computeFn,
      changeTracker,
      handleLastObserverRemoved,
      equalityComparator
    );
    this.set = set;
  }
  static {
    __name(this, "DerivedWithSetter");
  }
}
export {
  Derived,
  DerivedState,
  DerivedWithSetter,
  derived,
  derivedDisposable,
  derivedHandleChanges,
  derivedOpts,
  derivedWithSetter,
  derivedWithStore
};
//# sourceMappingURL=derived.js.map
