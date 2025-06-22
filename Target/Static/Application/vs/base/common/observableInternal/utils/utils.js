var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { autorun } from "../reactions/autorun.js";
import { transaction } from "../transaction.js";
import { observableValue } from "../observables/observableValue.js";
import { DisposableStore, toDisposable } from "../commonFacade/deps.js";
import { derived, derivedOpts } from "../observables/derived.js";
import { observableFromEvent } from "../observables/observableFromEvent.js";
import { observableSignal } from "../observables/observableSignal.js";
import { _setKeepObserved, _setRecomputeInitiallyAndOnChange } from "../observables/baseObservable.js";
function observableFromPromise(promise) {
  const observable = observableValue("promiseValue", {});
  promise.then((value) => {
    observable.set({ value }, void 0);
  });
  return observable;
}
__name(observableFromPromise, "observableFromPromise");
function signalFromObservable(owner, observable) {
  return derivedOpts({
    owner,
    equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn")
  }, (reader) => {
    observable.read(reader);
  });
}
__name(signalFromObservable, "signalFromObservable");
function debouncedObservableDeprecated(observable, debounceMs, disposableStore) {
  const debouncedObservable2 = observableValue("debounced", void 0);
  let timeout = void 0;
  disposableStore.add(autorun((reader) => {
    const value = observable.read(reader);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      transaction((tx) => {
        debouncedObservable2.set(value, tx);
      });
    }, debounceMs);
  }));
  return debouncedObservable2;
}
__name(debouncedObservableDeprecated, "debouncedObservableDeprecated");
function debouncedObservable(observable, debounceMs) {
  let hasValue = false;
  let lastValue;
  let timeout = void 0;
  return observableFromEvent((cb) => {
    const d = autorun((reader) => {
      const value = observable.read(reader);
      if (!hasValue) {
        hasValue = true;
        lastValue = value;
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          lastValue = value;
          cb();
        }, debounceMs);
      }
    });
    return {
      dispose() {
        d.dispose();
        hasValue = false;
        lastValue = void 0;
      }
    };
  }, () => {
    if (hasValue) {
      return lastValue;
    } else {
      return observable.get();
    }
  });
}
__name(debouncedObservable, "debouncedObservable");
function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
  const observable = observableValue("triggeredRecently", false);
  let timeout = void 0;
  disposableStore.add(event(() => {
    observable.set(true, void 0);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      observable.set(false, void 0);
    }, timeoutMs);
  }));
  return observable;
}
__name(wasEventTriggeredRecently, "wasEventTriggeredRecently");
function keepObserved(observable) {
  const o = new KeepAliveObserver(false, void 0);
  observable.addObserver(o);
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}
__name(keepObserved, "keepObserved");
_setKeepObserved(keepObserved);
function recomputeInitiallyAndOnChange(observable, handleValue) {
  const o = new KeepAliveObserver(true, handleValue);
  observable.addObserver(o);
  try {
    o.beginUpdate(observable);
  } finally {
    o.endUpdate(observable);
  }
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}
__name(recomputeInitiallyAndOnChange, "recomputeInitiallyAndOnChange");
_setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange);
class KeepAliveObserver {
  static {
    __name(this, "KeepAliveObserver");
  }
  constructor(_forceRecompute, _handleValue) {
    this._forceRecompute = _forceRecompute;
    this._handleValue = _handleValue;
    this._counter = 0;
  }
  beginUpdate(observable) {
    this._counter++;
  }
  endUpdate(observable) {
    if (this._counter === 1 && this._forceRecompute) {
      if (this._handleValue) {
        this._handleValue(observable.get());
      } else {
        observable.reportChanges();
      }
    }
    this._counter--;
  }
  handlePossibleChange(observable) {
  }
  handleChange(observable, change) {
  }
}
function derivedObservableWithCache(owner, computeFn) {
  let lastValue = void 0;
  const observable = derivedOpts({ owner, debugReferenceFn: computeFn }, (reader) => {
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return observable;
}
__name(derivedObservableWithCache, "derivedObservableWithCache");
function derivedObservableWithWritableCache(owner, computeFn) {
  let lastValue = void 0;
  const onChange = observableSignal("derivedObservableWithWritableCache");
  const observable = derived(owner, (reader) => {
    onChange.read(reader);
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return Object.assign(observable, {
    clearCache: /* @__PURE__ */ __name((tx) => {
      lastValue = void 0;
      onChange.trigger(tx);
    }, "clearCache"),
    setCache: /* @__PURE__ */ __name((newValue, tx) => {
      lastValue = newValue;
      onChange.trigger(tx);
    }, "setCache")
  });
}
__name(derivedObservableWithWritableCache, "derivedObservableWithWritableCache");
function mapObservableArrayCached(owner, items, map, keySelector) {
  let m = new ArrayMap(map, keySelector);
  const self = derivedOpts({
    debugReferenceFn: map,
    owner,
    onLastObserverRemoved: /* @__PURE__ */ __name(() => {
      m.dispose();
      m = new ArrayMap(map);
    }, "onLastObserverRemoved")
  }, (reader) => {
    m.setItems(items.read(reader));
    return m.getItems();
  });
  return self;
}
__name(mapObservableArrayCached, "mapObservableArrayCached");
class ArrayMap {
  static {
    __name(this, "ArrayMap");
  }
  constructor(_map, _keySelector) {
    this._map = _map;
    this._keySelector = _keySelector;
    this._cache = /* @__PURE__ */ new Map();
    this._items = [];
  }
  dispose() {
    this._cache.forEach((entry) => entry.store.dispose());
    this._cache.clear();
  }
  setItems(items) {
    const newItems = [];
    const itemsToRemove = new Set(this._cache.keys());
    for (const item of items) {
      const key = this._keySelector ? this._keySelector(item) : item;
      let entry = this._cache.get(key);
      if (!entry) {
        const store = new DisposableStore();
        const out = this._map(item, store);
        entry = { out, store };
        this._cache.set(key, entry);
      } else {
        itemsToRemove.delete(key);
      }
      newItems.push(entry.out);
    }
    for (const item of itemsToRemove) {
      const entry = this._cache.get(item);
      entry.store.dispose();
      this._cache.delete(item);
    }
    this._items = newItems;
  }
  getItems() {
    return this._items;
  }
}
export {
  KeepAliveObserver,
  debouncedObservable,
  debouncedObservableDeprecated,
  derivedObservableWithCache,
  derivedObservableWithWritableCache,
  keepObserved,
  mapObservableArrayCached,
  observableFromPromise,
  recomputeInitiallyAndOnChange,
  signalFromObservable,
  wasEventTriggeredRecently
};
//# sourceMappingURL=utils.js.map
