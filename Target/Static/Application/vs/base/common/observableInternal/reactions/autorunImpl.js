var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertFn, BugIndicatingError, DisposableStore, markAsDisposed, onBugIndicatingError, trackDisposable } from "../commonFacade/deps.js";
import { getLogger } from "../logging/logging.js";
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
    this._store = void 0;
    this._delayedStore = void 0;
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
    if (this._store !== void 0) {
      this._store.dispose();
    }
    if (this._delayedStore !== void 0) {
      this._delayedStore.dispose();
    }
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
        const delayedStore = this._delayedStore;
        if (delayedStore !== void 0) {
          this._delayedStore = void 0;
        }
        try {
          this._isRunning = true;
          if (this._changeTracker) {
            this._changeTracker.beforeUpdate?.(this, changeSummary);
            this._changeSummary = this._changeTracker.createChangeSummary(changeSummary);
          }
          if (this._store !== void 0) {
            this._store.dispose();
            this._store = void 0;
          }
          this._runFn(this, changeSummary);
        } catch (e) {
          onBugIndicatingError(e);
        } finally {
          this._isRunning = false;
          if (delayedStore !== void 0) {
            delayedStore.dispose();
          }
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
  _ensureNoRunning() {
    if (!this._isRunning) {
      throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
    }
  }
  readObservable(observable) {
    this._ensureNoRunning();
    if (this._disposed) {
      return observable.get();
    }
    observable.addObserver(this);
    const value = observable.get();
    this._dependencies.add(observable);
    this._dependenciesToBeRemoved.delete(observable);
    return value;
  }
  get store() {
    this._ensureNoRunning();
    if (this._disposed) {
      throw new BugIndicatingError("Cannot access store after dispose");
    }
    if (this._store === void 0) {
      this._store = new DisposableStore();
    }
    return this._store;
  }
  get delayedStore() {
    this._ensureNoRunning();
    if (this._disposed) {
      throw new BugIndicatingError("Cannot access store after dispose");
    }
    if (this._delayedStore === void 0) {
      this._delayedStore = new DisposableStore();
    }
    return this._delayedStore;
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
export {
  AutorunObserver,
  AutorunState
};
//# sourceMappingURL=autorunImpl.js.map
