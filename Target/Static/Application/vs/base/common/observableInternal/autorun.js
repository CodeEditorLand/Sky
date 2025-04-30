var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DebugNameData } from "./debugName.js";
import { assertFn, BugIndicatingError, DisposableStore, markAsDisposed, onBugIndicatingError, toDisposable, trackDisposable } from "./commonFacade/deps.js";
import { getLogger } from "./logging/logging.js";
function autorun(fn) {
  return new AutorunObserver(new DebugNameData(void 0, void 0, fn), fn, void 0);
}
__name(autorun, "autorun");
function autorunOpts(options, fn) {
  return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, void 0);
}
__name(autorunOpts, "autorunOpts");
function autorunHandleChanges(options, fn) {
  return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.changeTracker);
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
var AutorunState;
(function(AutorunState2) {
  AutorunState2[AutorunState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  AutorunState2[AutorunState2["stale"] = 2] = "stale";
  AutorunState2[AutorunState2["upToDate"] = 3] = "upToDate";
})(AutorunState || (AutorunState = {}));
class AutorunObserver {
  static {
    __name(this, "AutorunObserver");
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  constructor(_debugNameData, _runFn, _changeTracker) {
    this._debugNameData = _debugNameData;
    this._runFn = _runFn;
    this._changeTracker = _changeTracker;
    this._state = 2;
    this._updateCount = 0;
    this._disposed = false;
    this._dependencies = /* @__PURE__ */ new Set();
    this._dependenciesToBeRemoved = /* @__PURE__ */ new Set();
    this._isRunning = false;
    this._changeSummary = this._changeTracker?.createChangeSummary(void 0);
    getLogger()?.handleAutorunCreated(this);
    this._run();
    trackDisposable(this);
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    for (const o of this._dependencies) {
      o.removeObserver(this);
    }
    this._dependencies.clear();
    getLogger()?.handleAutorunDisposed(this);
    markAsDisposed(this);
  }
  _run() {
    const emptySet = this._dependenciesToBeRemoved;
    this._dependenciesToBeRemoved = this._dependencies;
    this._dependencies = emptySet;
    this._state = 3;
    try {
      if (!this._disposed) {
        getLogger()?.handleAutorunStarted(this);
        const changeSummary = this._changeSummary;
        try {
          this._isRunning = true;
          if (this._changeTracker) {
            this._changeTracker.beforeUpdate?.(this, changeSummary);
            this._changeSummary = this._changeTracker.createChangeSummary(changeSummary);
          }
          this._runFn(this, changeSummary);
        } catch (e) {
          onBugIndicatingError(e);
        } finally {
          this._isRunning = false;
        }
      }
    } finally {
      if (!this._disposed) {
        getLogger()?.handleAutorunFinished(this);
      }
      for (const o of this._dependenciesToBeRemoved) {
        o.removeObserver(this);
      }
      this._dependenciesToBeRemoved.clear();
    }
  }
  toString() {
    return `Autorun<${this.debugName}>`;
  }
  // IObserver implementation
  beginUpdate(_observable) {
    if (this._state === 3) {
      this._state = 1;
    }
    this._updateCount++;
  }
  endUpdate(_observable) {
    try {
      if (this._updateCount === 1) {
        do {
          if (this._state === 1) {
            this._state = 3;
            for (const d of this._dependencies) {
              d.reportChanges();
              if (this._state === 2) {
                break;
              }
            }
          }
          if (this._state !== 3) {
            this._run();
          }
        } while (this._state !== 3);
      }
    } finally {
      this._updateCount--;
    }
    assertFn(() => this._updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this._state === 3 && this._isDependency(observable)) {
      this._state = 1;
    }
  }
  handleChange(observable, change) {
    if (this._isDependency(observable)) {
      getLogger()?.handleAutorunDependencyChanged(this, observable, change);
      try {
        const shouldReact = this._changeTracker ? this._changeTracker.handleChange({
          changedObservable: observable,
          change,
          didChange: /* @__PURE__ */ __name((o) => o === observable, "didChange")
        }, this._changeSummary) : true;
        if (shouldReact) {
          this._state = 2;
        }
      } catch (e) {
        onBugIndicatingError(e);
      }
    }
  }
  _isDependency(observable) {
    return this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable);
  }
  // IReader implementation
  readObservable(observable) {
    if (!this._isRunning) {
      throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
    }
    if (this._disposed) {
      return observable.get();
    }
    observable.addObserver(this);
    const value = observable.get();
    this._dependencies.add(observable);
    this._dependenciesToBeRemoved.delete(observable);
    return value;
  }
  debugGetState() {
    return {
      isRunning: this._isRunning,
      updateCount: this._updateCount,
      dependencies: this._dependencies,
      state: this._state
    };
  }
  debugRerun() {
    if (!this._isRunning) {
      this._run();
    } else {
      this._state = 2;
    }
  }
}
(function(autorun2) {
  autorun2.Observer = AutorunObserver;
})(autorun || (autorun = {}));
export {
  AutorunObserver,
  AutorunState,
  autorun,
  autorunDelta,
  autorunHandleChanges,
  autorunIterableDelta,
  autorunOpts,
  autorunWithStore,
  autorunWithStoreHandleChanges
};
//# sourceMappingURL=autorun.js.map
