var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseObservable } from "./baseObservable.js";
import { BugIndicatingError, DisposableStore, assertFn, onBugIndicatingError } from "../commonFacade/deps.js";
import { getLogger } from "../logging/logging.js";
var DerivedState;
(function(DerivedState2) {
  DerivedState2[DerivedState2["initial"] = 0] = "initial";
  DerivedState2[DerivedState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  DerivedState2[DerivedState2["stale"] = 2] = "stale";
  DerivedState2[DerivedState2["upToDate"] = 3] = "upToDate";
})(DerivedState || (DerivedState = {}));
class Derived extends BaseObservable {
  static {
    __name(this, "Derived");
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  constructor(_debugNameData, _computeFn, _changeTracker, _handleLastObserverRemoved = void 0, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._computeFn = _computeFn;
    this._changeTracker = _changeTracker;
    this._handleLastObserverRemoved = _handleLastObserverRemoved;
    this._equalityComparator = _equalityComparator;
    this._state = 0;
    this._value = void 0;
    this._updateCount = 0;
    this._dependencies = /* @__PURE__ */ new Set();
    this._dependenciesToBeRemoved = /* @__PURE__ */ new Set();
    this._changeSummary = void 0;
    this._isUpdating = false;
    this._isComputing = false;
    this._didReportChange = false;
    this._isInBeforeUpdate = false;
    this._isReaderValid = false;
    this._store = void 0;
    this._delayedStore = void 0;
    this._removedObserverToCallEndUpdateOn = null;
    this._changeSummary = this._changeTracker?.createChangeSummary(void 0);
  }
  onLastObserverRemoved() {
    this._state = 0;
    this._value = void 0;
    getLogger()?.handleDerivedCleared(this);
    for (const d of this._dependencies) {
      d.removeObserver(this);
    }
    this._dependencies.clear();
    if (this._store !== void 0) {
      this._store.dispose();
      this._store = void 0;
    }
    if (this._delayedStore !== void 0) {
      this._delayedStore.dispose();
      this._delayedStore = void 0;
    }
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
        if (this._state === 1) {
          for (const d of this._dependencies) {
            d.reportChanges();
            if (this._state === 2) {
              break;
            }
          }
        }
        if (this._state === 1) {
          this._state = 3;
        }
        if (this._state !== 3) {
          this._recompute();
        }
      } while (this._state !== 3);
      return this._value;
    }
  }
  _recompute() {
    let didChange = false;
    this._isComputing = true;
    this._didReportChange = false;
    const emptySet = this._dependenciesToBeRemoved;
    this._dependenciesToBeRemoved = this._dependencies;
    this._dependencies = emptySet;
    try {
      const changeSummary = this._changeSummary;
      this._isReaderValid = true;
      if (this._changeTracker) {
        this._isInBeforeUpdate = true;
        this._changeTracker.beforeUpdate?.(this, changeSummary);
        this._isInBeforeUpdate = false;
        this._changeSummary = this._changeTracker?.createChangeSummary(changeSummary);
      }
      const hadValue = this._state !== 0;
      const oldValue = this._value;
      this._state = 3;
      const delayedStore = this._delayedStore;
      if (delayedStore !== void 0) {
        this._delayedStore = void 0;
      }
      try {
        if (this._store !== void 0) {
          this._store.dispose();
          this._store = void 0;
        }
        this._value = this._computeFn(this, changeSummary);
      } finally {
        this._isReaderValid = false;
        for (const o of this._dependenciesToBeRemoved) {
          o.removeObserver(this);
        }
        this._dependenciesToBeRemoved.clear();
        if (delayedStore !== void 0) {
          delayedStore.dispose();
        }
      }
      didChange = this._didReportChange || hadValue && !this._equalityComparator(oldValue, this._value);
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
    if (!this._didReportChange && didChange) {
      for (const r of this._observers) {
        r.handleChange(this, void 0);
      }
    } else {
      this._didReportChange = false;
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
      if (this._state === 3) {
        this._state = 1;
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
    if (this._state === 3 && this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
      this._state = 1;
      for (const r of this._observers) {
        r.handlePossibleChange(this);
      }
    }
  }
  handleChange(observable, change) {
    if (this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable) || this._isInBeforeUpdate) {
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
      const wasUpToDate = this._state === 3;
      if (shouldReact && (this._state === 1 || wasUpToDate)) {
        this._state = 2;
        if (wasUpToDate) {
          for (const r of this._observers) {
            r.handlePossibleChange(this);
          }
        }
      }
    }
  }
  // IReader Implementation
  _ensureReaderValid() {
    if (!this._isReaderValid) {
      throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
    }
  }
  readObservable(observable) {
    this._ensureReaderValid();
    observable.addObserver(this);
    const value = observable.get();
    this._dependencies.add(observable);
    this._dependenciesToBeRemoved.delete(observable);
    return value;
  }
  reportChange(change) {
    this._ensureReaderValid();
    this._didReportChange = true;
    for (const r of this._observers) {
      r.handleChange(this, change);
    }
  }
  get store() {
    this._ensureReaderValid();
    if (this._store === void 0) {
      this._store = new DisposableStore();
    }
    return this._store;
  }
  get delayedStore() {
    this._ensureReaderValid();
    if (this._delayedStore === void 0) {
      this._delayedStore = new DisposableStore();
    }
    return this._delayedStore;
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
  setValue(newValue, tx, change) {
    this._value = newValue;
    const observers = this._observers;
    tx.updateObserver(this, this);
    for (const d of observers) {
      d.handleChange(this, change);
    }
  }
}
class DerivedWithSetter extends Derived {
  static {
    __name(this, "DerivedWithSetter");
  }
  constructor(debugNameData, computeFn, changeTracker, handleLastObserverRemoved = void 0, equalityComparator, set) {
    super(debugNameData, computeFn, changeTracker, handleLastObserverRemoved, equalityComparator);
    this.set = set;
  }
}
export {
  Derived,
  DerivedState,
  DerivedWithSetter
};
//# sourceMappingURL=derivedImpl.js.map
