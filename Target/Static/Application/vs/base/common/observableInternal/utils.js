var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { autorun, autorunOpts, autorunWithStoreHandleChanges } from "./autorun.js";
import { BaseObservable, ConvenientObservable, _setKeepObserved, _setRecomputeInitiallyAndOnChange, observableValue, subtransaction, transaction } from "./base.js";
import { DebugNameData, getDebugName } from "./debugName.js";
import { BugIndicatingError, DisposableStore, Event, strictEquals, toDisposable } from "./commonFacade/deps.js";
import { derived, derivedOpts } from "./derived.js";
import { getLogger } from "./logging/logging.js";
import { cancelOnDispose } from "../cancellation.js";
function constObservable(value) {
  return new ConstObservable(value);
}
__name(constObservable, "constObservable");
class ConstObservable extends ConvenientObservable {
  static {
    __name(this, "ConstObservable");
  }
  constructor(value) {
    super();
    this.value = value;
  }
  get debugName() {
    return this.toString();
  }
  get() {
    return this.value;
  }
  addObserver(observer) {
  }
  removeObserver(observer) {
  }
  log() {
    return this;
  }
  toString() {
    return `Const: ${this.value}`;
  }
}
function observableFromPromise(promise) {
  const observable = observableValue("promiseValue", {});
  promise.then((value) => {
    observable.set({ value }, void 0);
  });
  return observable;
}
__name(observableFromPromise, "observableFromPromise");
function observableFromEvent(...args) {
  let owner;
  let event;
  let getValue;
  if (args.length === 3) {
    [owner, event, getValue] = args;
  } else {
    [event, getValue] = args;
  }
  return new FromEventObservable(new DebugNameData(owner, void 0, getValue), event, getValue, () => FromEventObservable.globalTransaction, strictEquals);
}
__name(observableFromEvent, "observableFromEvent");
function observableFromEventOpts(options, event, getValue) {
  return new FromEventObservable(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? getValue), event, getValue, () => FromEventObservable.globalTransaction, options.equalsFn ?? strictEquals);
}
__name(observableFromEventOpts, "observableFromEventOpts");
class FromEventObservable extends BaseObservable {
  static {
    __name(this, "FromEventObservable");
  }
  constructor(_debugNameData, event, _getValue, _getTransaction, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this.event = event;
    this._getValue = _getValue;
    this._getTransaction = _getTransaction;
    this._equalityComparator = _equalityComparator;
    this._hasValue = false;
    this.handleEvent = (args) => {
      const newValue = this._getValue(args);
      const oldValue = this._value;
      const didChange = !this._hasValue || !this._equalityComparator(oldValue, newValue);
      let didRunTransaction = false;
      if (didChange) {
        this._value = newValue;
        if (this._hasValue) {
          didRunTransaction = true;
          subtransaction(this._getTransaction(), (tx) => {
            getLogger()?.handleObservableUpdated(this, { oldValue, newValue, change: void 0, didChange, hadValue: this._hasValue });
            for (const o of this._observers) {
              tx.updateObserver(o, this);
              o.handleChange(this, void 0);
            }
          }, () => {
            const name = this.getDebugName();
            return "Event fired" + (name ? `: ${name}` : "");
          });
        }
        this._hasValue = true;
      }
      if (!didRunTransaction) {
        getLogger()?.handleObservableUpdated(this, { oldValue, newValue, change: void 0, didChange, hadValue: this._hasValue });
      }
    };
  }
  getDebugName() {
    return this._debugNameData.getDebugName(this);
  }
  get debugName() {
    const name = this.getDebugName();
    return "From Event" + (name ? `: ${name}` : "");
  }
  onFirstObserverAdded() {
    this._subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this._subscription.dispose();
    this._subscription = void 0;
    this._hasValue = false;
    this._value = void 0;
  }
  get() {
    if (this._subscription) {
      if (!this._hasValue) {
        this.handleEvent(void 0);
      }
      return this._value;
    } else {
      const value = this._getValue(void 0);
      return value;
    }
  }
  debugSetValue(value) {
    this._value = value;
  }
}
(function(observableFromEvent2) {
  observableFromEvent2.Observer = FromEventObservable;
  function batchEventsGlobally(tx, fn) {
    let didSet = false;
    if (FromEventObservable.globalTransaction === void 0) {
      FromEventObservable.globalTransaction = tx;
      didSet = true;
    }
    try {
      fn();
    } finally {
      if (didSet) {
        FromEventObservable.globalTransaction = void 0;
      }
    }
  }
  __name(batchEventsGlobally, "batchEventsGlobally");
  observableFromEvent2.batchEventsGlobally = batchEventsGlobally;
})(observableFromEvent || (observableFromEvent = {}));
function observableSignalFromEvent(owner, event) {
  return new FromEventObservableSignal(typeof owner === "string" ? owner : new DebugNameData(owner, void 0, void 0), event);
}
__name(observableSignalFromEvent, "observableSignalFromEvent");
class FromEventObservableSignal extends BaseObservable {
  static {
    __name(this, "FromEventObservableSignal");
  }
  constructor(debugNameDataOrName, event) {
    super();
    this.event = event;
    this.handleEvent = () => {
      transaction((tx) => {
        for (const o of this._observers) {
          tx.updateObserver(o, this);
          o.handleChange(this, void 0);
        }
      }, () => this.debugName);
    };
    this.debugName = typeof debugNameDataOrName === "string" ? debugNameDataOrName : debugNameDataOrName.getDebugName(this) ?? "Observable Signal From Event";
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
  }
  get() {
  }
}
function observableSignal(debugNameOrOwner) {
  if (typeof debugNameOrOwner === "string") {
    return new ObservableSignal(debugNameOrOwner);
  } else {
    return new ObservableSignal(void 0, debugNameOrOwner);
  }
}
__name(observableSignal, "observableSignal");
class ObservableSignal extends BaseObservable {
  static {
    __name(this, "ObservableSignal");
  }
  get debugName() {
    return new DebugNameData(this._owner, this._debugName, void 0).getDebugName(this) ?? "Observable Signal";
  }
  toString() {
    return this.debugName;
  }
  constructor(_debugName, _owner) {
    super();
    this._debugName = _debugName;
    this._owner = _owner;
  }
  trigger(tx, change) {
    if (!tx) {
      transaction((tx2) => {
        this.trigger(tx2, change);
      }, () => `Trigger signal ${this.debugName}`);
      return;
    }
    for (const o of this._observers) {
      tx.updateObserver(o, this);
      o.handleChange(this, change);
    }
  }
  get() {
  }
}
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
function runOnChange(observable, cb) {
  let _previousValue;
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
  FromEventObservable,
  KeepAliveObserver,
  ValueWithChangeEventFromObservable,
  constObservable,
  debouncedObservable,
  debouncedObservableDeprecated,
  derivedConstOnceDefined,
  derivedObservableWithCache,
  derivedObservableWithWritableCache,
  keepObserved,
  latestChangedValue,
  mapObservableArrayCached,
  observableFromEvent,
  observableFromEventOpts,
  observableFromPromise,
  observableFromValueWithChangeEvent,
  observableSignal,
  observableSignalFromEvent,
  recomputeInitiallyAndOnChange,
  runOnChange,
  runOnChangeWithCancellationToken,
  runOnChangeWithStore,
  signalFromObservable,
  wasEventTriggeredRecently
};
//# sourceMappingURL=utils.js.map
