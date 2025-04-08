var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DebugNameData, DebugOwner, getFunctionName } from "./debugName.js";
import { DisposableStore, EqualityComparer, IDisposable, strictEquals } from "./commonFacade/deps.js";
import { getLogger, logObservable } from "./logging/logging.js";
import { keepObserved, recomputeInitiallyAndOnChange } from "./utils.js";
import { onUnexpectedError } from "../errors.js";
let _recomputeInitiallyAndOnChange;
function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange2) {
  _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange2;
}
__name(_setRecomputeInitiallyAndOnChange, "_setRecomputeInitiallyAndOnChange");
let _keepObserved;
function _setKeepObserved(keepObserved2) {
  _keepObserved = keepObserved2;
}
__name(_setKeepObserved, "_setKeepObserved");
let _derived;
function _setDerivedOpts(derived) {
  _derived = derived;
}
__name(_setDerivedOpts, "_setDerivedOpts");
class ConvenientObservable {
  static {
    __name(this, "ConvenientObservable");
  }
  get TChange() {
    return null;
  }
  reportChanges() {
    this.get();
  }
  /** @sealed */
  read(reader) {
    if (reader) {
      return reader.readObservable(this);
    } else {
      return this.get();
    }
  }
  map(fnOrOwner, fnOrUndefined) {
    const owner = fnOrUndefined === void 0 ? void 0 : fnOrOwner;
    const fn = fnOrUndefined === void 0 ? fnOrOwner : fnOrUndefined;
    return _derived(
      {
        owner,
        debugName: /* @__PURE__ */ __name(() => {
          const name = getFunctionName(fn);
          if (name !== void 0) {
            return name;
          }
          const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
          const match = regexp.exec(fn.toString());
          if (match) {
            return `${this.debugName}.${match[2]}`;
          }
          if (!owner) {
            return `${this.debugName} (mapped)`;
          }
          return void 0;
        }, "debugName"),
        debugReferenceFn: fn
      },
      (reader) => fn(this.read(reader), reader)
    );
  }
  /**
   * @sealed
   * Converts an observable of an observable value into a direct observable of the value.
  */
  flatten() {
    return _derived(
      {
        owner: void 0,
        debugName: /* @__PURE__ */ __name(() => `${this.debugName} (flattened)`, "debugName")
      },
      (reader) => this.read(reader).read(reader)
    );
  }
  recomputeInitiallyAndOnChange(store, handleValue) {
    store.add(_recomputeInitiallyAndOnChange(this, handleValue));
    return this;
  }
  /**
   * Ensures that this observable is observed. This keeps the cache alive.
   * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
   * Use `recomputeInitiallyAndOnChange` for eager evaluation.
   */
  keepObserved(store) {
    store.add(_keepObserved(this));
    return this;
  }
  get debugValue() {
    return this.get();
  }
}
class BaseObservable extends ConvenientObservable {
  static {
    __name(this, "BaseObservable");
  }
  _observers = /* @__PURE__ */ new Set();
  constructor() {
    super();
    getLogger()?.handleObservableCreated(this);
  }
  addObserver(observer) {
    const len = this._observers.size;
    this._observers.add(observer);
    if (len === 0) {
      this.onFirstObserverAdded();
    }
    if (len !== this._observers.size) {
      getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
    }
  }
  removeObserver(observer) {
    const deleted = this._observers.delete(observer);
    if (deleted && this._observers.size === 0) {
      this.onLastObserverRemoved();
    }
    if (deleted) {
      getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
    }
  }
  onFirstObserverAdded() {
  }
  onLastObserverRemoved() {
  }
  log() {
    const hadLogger = !!getLogger();
    logObservable(this);
    if (!hadLogger) {
      getLogger()?.handleObservableCreated(this);
    }
    return this;
  }
  debugGetObservers() {
    return this._observers;
  }
}
function transaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    fn(tx);
  } finally {
    tx.finish();
  }
}
__name(transaction, "transaction");
let _globalTransaction = void 0;
function globalTransaction(fn) {
  if (_globalTransaction) {
    fn(_globalTransaction);
  } else {
    const tx = new TransactionImpl(fn, void 0);
    _globalTransaction = tx;
    try {
      fn(tx);
    } finally {
      tx.finish();
      _globalTransaction = void 0;
    }
  }
}
__name(globalTransaction, "globalTransaction");
async function asyncTransaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    await fn(tx);
  } finally {
    tx.finish();
  }
}
__name(asyncTransaction, "asyncTransaction");
function subtransaction(tx, fn, getDebugName) {
  if (!tx) {
    transaction(fn, getDebugName);
  } else {
    fn(tx);
  }
}
__name(subtransaction, "subtransaction");
class TransactionImpl {
  constructor(_fn, _getDebugName) {
    this._fn = _fn;
    this._getDebugName = _getDebugName;
    getLogger()?.handleBeginTransaction(this);
  }
  static {
    __name(this, "TransactionImpl");
  }
  _updatingObservers = [];
  getDebugName() {
    if (this._getDebugName) {
      return this._getDebugName();
    }
    return getFunctionName(this._fn);
  }
  updateObserver(observer, observable) {
    if (!this._updatingObservers) {
      handleBugIndicatingErrorRecovery("Transaction already finished!");
      transaction((tx) => {
        tx.updateObserver(observer, observable);
      });
      return;
    }
    this._updatingObservers.push({ observer, observable });
    observer.beginUpdate(observable);
  }
  finish() {
    const updatingObservers = this._updatingObservers;
    if (!updatingObservers) {
      handleBugIndicatingErrorRecovery("transaction.finish() has already been called!");
      return;
    }
    for (let i = 0; i < updatingObservers.length; i++) {
      const { observer, observable } = updatingObservers[i];
      observer.endUpdate(observable);
    }
    this._updatingObservers = null;
    getLogger()?.handleEndTransaction(this);
  }
  debugGetUpdatingObservers() {
    return this._updatingObservers;
  }
}
function handleBugIndicatingErrorRecovery(message) {
  const err = new Error("BugIndicatingErrorRecovery: " + message);
  onUnexpectedError(err);
  console.error("recovered from an error that indicates a bug", err);
}
__name(handleBugIndicatingErrorRecovery, "handleBugIndicatingErrorRecovery");
function observableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new ObservableValue(debugNameData, initialValue, strictEquals);
}
__name(observableValue, "observableValue");
class ObservableValue extends BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._value = initialValue;
    getLogger()?.handleObservableUpdated(this, { hadValue: false, newValue: initialValue, change: void 0, didChange: true, oldValue: void 0 });
  }
  static {
    __name(this, "ObservableValue");
  }
  _value;
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "ObservableValue";
  }
  get() {
    return this._value;
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      const oldValue = this._value;
      this._setValue(value);
      getLogger()?.handleObservableUpdated(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
      for (const observer of this._observers) {
        tx.updateObserver(observer, this);
        observer.handleChange(this, change);
      }
    } finally {
      if (_tx) {
        _tx.finish();
      }
    }
  }
  toString() {
    return `${this.debugName}: ${this._value}`;
  }
  _setValue(newValue) {
    this._value = newValue;
  }
  debugGetState() {
    return {
      value: this._value
    };
  }
  debugSetValue(value) {
    this._value = value;
  }
}
function disposableObservableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new DisposableObservableValue(debugNameData, initialValue, strictEquals);
}
__name(disposableObservableValue, "disposableObservableValue");
class DisposableObservableValue extends ObservableValue {
  static {
    __name(this, "DisposableObservableValue");
  }
  _setValue(newValue) {
    if (this._value === newValue) {
      return;
    }
    if (this._value) {
      this._value.dispose();
    }
    this._value = newValue;
  }
  dispose() {
    this._value?.dispose();
  }
}
export {
  BaseObservable,
  ConvenientObservable,
  DisposableObservableValue,
  ObservableValue,
  TransactionImpl,
  _setDerivedOpts,
  _setKeepObserved,
  _setRecomputeInitiallyAndOnChange,
  asyncTransaction,
  disposableObservableValue,
  globalTransaction,
  observableValue,
  subtransaction,
  transaction
};
//# sourceMappingURL=base.js.map
