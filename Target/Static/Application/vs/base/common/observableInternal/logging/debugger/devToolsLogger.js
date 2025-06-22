var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AutorunObserver } from "../../reactions/autorunImpl.js";
import { formatValue } from "../consoleObservableLogger.js";
import { registerDebugChannel } from "./debuggerRpc.js";
import { deepAssign, deepAssignDeleteNulls, getFirstStackFrameOutsideOf, Throttler } from "./utils.js";
import { isDefined } from "../../../types.js";
import { FromEventObservable } from "../../observables/observableFromEvent.js";
import { BugIndicatingError, onUnexpectedError } from "../../../errors.js";
import { Derived } from "../../observables/derivedImpl.js";
import { ObservableValue } from "../../observables/observableValue.js";
class DevToolsLogger {
  static {
    __name(this, "DevToolsLogger");
  }
  static {
    this._instance = void 0;
  }
  static getInstance() {
    if (DevToolsLogger._instance === void 0) {
      DevToolsLogger._instance = new DevToolsLogger();
    }
    return DevToolsLogger._instance;
  }
  getTransactionState() {
    const affected = [];
    const txs = [...this._activeTransactions];
    if (txs.length === 0) {
      return void 0;
    }
    const observerQueue = txs.flatMap((t) => t.debugGetUpdatingObservers() ?? []).map((o) => o.observer);
    const processedObservers = /* @__PURE__ */ new Set();
    while (observerQueue.length > 0) {
      const observer = observerQueue.shift();
      if (processedObservers.has(observer)) {
        continue;
      }
      processedObservers.add(observer);
      const state = this._getInfo(observer, (d) => {
        if (!processedObservers.has(d)) {
          observerQueue.push(d);
        }
      });
      if (state) {
        affected.push(state);
      }
    }
    return { names: txs.map((t) => t.getDebugName() ?? "tx"), affected };
  }
  _getObservableInfo(observable) {
    const info = this._instanceInfos.get(observable);
    if (!info) {
      onUnexpectedError(new BugIndicatingError("No info found"));
      return void 0;
    }
    return info;
  }
  _getAutorunInfo(autorun) {
    const info = this._instanceInfos.get(autorun);
    if (!info) {
      onUnexpectedError(new BugIndicatingError("No info found"));
      return void 0;
    }
    return info;
  }
  _getInfo(observer, queue) {
    if (observer instanceof Derived) {
      const observersToUpdate = [...observer.debugGetObservers()];
      for (const o of observersToUpdate) {
        queue(o);
      }
      const info = this._getObservableInfo(observer);
      if (!info) {
        return;
      }
      const observerState = observer.debugGetState();
      const base = { name: observer.debugName, instanceId: info.instanceId, updateCount: observerState.updateCount };
      const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o)?.instanceId).filter(isDefined);
      if (observerState.isComputing) {
        return { ...base, type: "observable/derived", state: "updating", changedDependencies, initialComputation: false };
      }
      switch (observerState.state) {
        case 0:
          return { ...base, type: "observable/derived", state: "noValue" };
        case 3:
          return { ...base, type: "observable/derived", state: "upToDate" };
        case 2:
          return { ...base, type: "observable/derived", state: "stale", changedDependencies };
        case 1:
          return { ...base, type: "observable/derived", state: "possiblyStale" };
      }
    } else if (observer instanceof AutorunObserver) {
      const info = this._getAutorunInfo(observer);
      if (!info) {
        return void 0;
      }
      const base = { name: observer.debugName, instanceId: info.instanceId, updateCount: info.updateCount };
      const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o).instanceId);
      if (observer.debugGetState().isRunning) {
        return { ...base, type: "autorun", state: "updating", changedDependencies };
      }
      switch (observer.debugGetState().state) {
        case 3:
          return { ...base, type: "autorun", state: "upToDate" };
        case 2:
          return { ...base, type: "autorun", state: "stale", changedDependencies };
        case 1:
          return { ...base, type: "autorun", state: "possiblyStale" };
      }
    }
    return void 0;
  }
  _formatObservable(obs) {
    const info = this._getObservableInfo(obs);
    if (!info) {
      return void 0;
    }
    return { name: obs.debugName, instanceId: info.instanceId };
  }
  _formatObserver(obs) {
    if (obs instanceof Derived) {
      return { name: obs.toString(), instanceId: this._getObservableInfo(obs)?.instanceId };
    }
    const autorunInfo = this._getAutorunInfo(obs);
    if (autorunInfo) {
      return { name: obs.toString(), instanceId: autorunInfo.instanceId };
    }
    return void 0;
  }
  constructor() {
    this._declarationId = 0;
    this._instanceId = 0;
    this._declarations = /* @__PURE__ */ new Map();
    this._instanceInfos = /* @__PURE__ */ new WeakMap();
    this._aliveInstances = /* @__PURE__ */ new Map();
    this._activeTransactions = /* @__PURE__ */ new Set();
    this._channel = registerDebugChannel("observableDevTools", () => {
      return {
        notifications: {
          setDeclarationIdFilter: /* @__PURE__ */ __name((declarationIds) => {
          }, "setDeclarationIdFilter"),
          logObservableValue: /* @__PURE__ */ __name((observableId) => {
            console.log("logObservableValue", observableId);
          }, "logObservableValue"),
          flushUpdates: /* @__PURE__ */ __name(() => {
            this._flushUpdates();
          }, "flushUpdates"),
          resetUpdates: /* @__PURE__ */ __name(() => {
            this._pendingChanges = null;
            this._channel.api.notifications.handleChange(this._fullState, true);
          }, "resetUpdates")
        },
        requests: {
          getDeclarations: /* @__PURE__ */ __name(() => {
            const result = {};
            for (const decl of this._declarations.values()) {
              result[decl.id] = decl;
            }
            return { decls: result };
          }, "getDeclarations"),
          getSummarizedInstances: /* @__PURE__ */ __name(() => {
            return null;
          }, "getSummarizedInstances"),
          getObservableValueInfo: /* @__PURE__ */ __name((instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            return {
              observers: [...obs.debugGetObservers()].map((d) => this._formatObserver(d)).filter(isDefined)
            };
          }, "getObservableValueInfo"),
          getDerivedInfo: /* @__PURE__ */ __name((instanceId) => {
            const d = this._aliveInstances.get(instanceId);
            return {
              dependencies: [...d.debugGetState().dependencies].map((d2) => this._formatObservable(d2)).filter(isDefined),
              observers: [...d.debugGetObservers()].map((d2) => this._formatObserver(d2)).filter(isDefined)
            };
          }, "getDerivedInfo"),
          getAutorunInfo: /* @__PURE__ */ __name((instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            return {
              dependencies: [...obs.debugGetState().dependencies].map((d) => this._formatObservable(d)).filter(isDefined)
            };
          }, "getAutorunInfo"),
          getTransactionState: /* @__PURE__ */ __name(() => {
            return this.getTransactionState();
          }, "getTransactionState"),
          setValue: /* @__PURE__ */ __name((instanceId, jsonValue) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs instanceof Derived) {
              obs.debugSetValue(jsonValue);
            } else if (obs instanceof ObservableValue) {
              obs.debugSetValue(jsonValue);
            } else if (obs instanceof FromEventObservable) {
              obs.debugSetValue(jsonValue);
            } else {
              throw new BugIndicatingError("Observable is not supported");
            }
            const observers = [...obs.debugGetObservers()];
            for (const d of observers) {
              d.beginUpdate(obs);
            }
            for (const d of observers) {
              d.handleChange(obs, void 0);
            }
            for (const d of observers) {
              d.endUpdate(obs);
            }
          }, "setValue"),
          getValue: /* @__PURE__ */ __name((instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs instanceof Derived) {
              return formatValue(obs.debugGetState().value, 200);
            } else if (obs instanceof ObservableValue) {
              return formatValue(obs.debugGetState().value, 200);
            }
            return void 0;
          }, "getValue")
        }
      };
    });
    this._pendingChanges = null;
    this._changeThrottler = new Throttler();
    this._fullState = {};
    this._flushUpdates = () => {
      if (this._pendingChanges !== null) {
        this._channel.api.notifications.handleChange(this._pendingChanges, false);
        this._pendingChanges = null;
      }
    };
  }
  _handleChange(update) {
    deepAssignDeleteNulls(this._fullState, update);
    if (this._pendingChanges === null) {
      this._pendingChanges = update;
    } else {
      deepAssign(this._pendingChanges, update);
    }
    this._changeThrottler.throttle(this._flushUpdates, 10);
  }
  _getDeclarationId(type) {
    let shallow = true;
    let loc;
    const Err = Error;
    while (true) {
      const l = Err.stackTraceLimit;
      Err.stackTraceLimit = shallow ? 6 : 20;
      const stack = new Error().stack;
      Err.stackTraceLimit = l;
      let result = getFirstStackFrameOutsideOf(stack, /[/\\]observableInternal[/\\]|\.observe|[/\\]util(s)?\./);
      if (!shallow && !result) {
        result = getFirstStackFrameOutsideOf(stack, /[/\\]observableInternal[/\\]|\.observe/);
      }
      if (result) {
        loc = result;
        break;
      }
      if (!shallow) {
        console.error("Could not find location for declaration", new Error().stack);
        loc = { fileName: "unknown", line: 0, column: 0, id: "unknown" };
        break;
      }
      shallow = false;
    }
    let decInfo = this._declarations.get(loc.id);
    if (decInfo === void 0) {
      decInfo = {
        id: this._declarationId++,
        type,
        url: loc.fileName,
        line: loc.line,
        column: loc.column
      };
      this._declarations.set(loc.id, decInfo);
      this._handleChange({ decls: { [decInfo.id]: decInfo } });
    }
    return decInfo.id;
  }
  handleObservableCreated(observable) {
    const declarationId = this._getDeclarationId("observable/value");
    const info = {
      declarationId,
      instanceId: this._instanceId++,
      listenerCount: 0,
      lastValue: void 0,
      updateCount: 0,
      changedObservables: /* @__PURE__ */ new Set()
    };
    this._instanceInfos.set(observable, info);
  }
  handleOnListenerCountChanged(observable, newCount) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    if (info.listenerCount === 0 && newCount > 0) {
      const type = observable instanceof Derived ? "observable/derived" : "observable/value";
      this._aliveInstances.set(info.instanceId, observable);
      this._handleChange({
        instances: {
          [info.instanceId]: {
            instanceId: info.instanceId,
            declarationId: info.declarationId,
            formattedValue: info.lastValue,
            type,
            name: observable.debugName
          }
        }
      });
    } else if (info.listenerCount > 0 && newCount === 0) {
      this._handleChange({
        instances: { [info.instanceId]: null }
      });
      this._aliveInstances.delete(info.instanceId);
    }
    info.listenerCount = newCount;
  }
  handleObservableUpdated(observable, changeInfo) {
    if (observable instanceof Derived) {
      this._handleDerivedRecomputed(observable, changeInfo);
      return;
    }
    const info = this._getObservableInfo(observable);
    if (info) {
      if (changeInfo.didChange) {
        info.lastValue = formatValue(changeInfo.newValue, 30);
        if (info.listenerCount > 0) {
          this._handleChange({
            instances: { [info.instanceId]: { formattedValue: info.lastValue } }
          });
        }
      }
    }
  }
  handleAutorunCreated(autorun) {
    const declarationId = this._getDeclarationId("autorun");
    const info = {
      declarationId,
      instanceId: this._instanceId++,
      updateCount: 0,
      changedObservables: /* @__PURE__ */ new Set()
    };
    this._instanceInfos.set(autorun, info);
    this._aliveInstances.set(info.instanceId, autorun);
    if (info) {
      this._handleChange({
        instances: {
          [info.instanceId]: {
            instanceId: info.instanceId,
            declarationId: info.declarationId,
            runCount: 0,
            type: "autorun",
            name: autorun.debugName
          }
        }
      });
    }
  }
  handleAutorunDisposed(autorun) {
    const info = this._getAutorunInfo(autorun);
    if (!info) {
      return;
    }
    this._handleChange({
      instances: { [info.instanceId]: null }
    });
    this._instanceInfos.delete(autorun);
    this._aliveInstances.delete(info.instanceId);
  }
  handleAutorunDependencyChanged(autorun, observable, change) {
    const info = this._getAutorunInfo(autorun);
    if (!info) {
      return;
    }
    info.changedObservables.add(observable);
  }
  handleAutorunStarted(autorun) {
  }
  handleAutorunFinished(autorun) {
    const info = this._getAutorunInfo(autorun);
    if (!info) {
      return;
    }
    info.changedObservables.clear();
    info.updateCount++;
    this._handleChange({
      instances: { [info.instanceId]: { runCount: info.updateCount } }
    });
  }
  handleDerivedDependencyChanged(derived, observable, change) {
    const info = this._getObservableInfo(derived);
    if (info) {
      info.changedObservables.add(observable);
    }
  }
  _handleDerivedRecomputed(observable, changeInfo) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    const formattedValue = formatValue(changeInfo.newValue, 30);
    info.updateCount++;
    info.changedObservables.clear();
    info.lastValue = formattedValue;
    if (info.listenerCount > 0) {
      this._handleChange({
        instances: { [info.instanceId]: { formattedValue, recomputationCount: info.updateCount } }
      });
    }
  }
  handleDerivedCleared(observable) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    info.lastValue = void 0;
    info.changedObservables.clear();
    if (info.listenerCount > 0) {
      this._handleChange({
        instances: {
          [info.instanceId]: {
            formattedValue: void 0
          }
        }
      });
    }
  }
  handleBeginTransaction(transaction) {
    this._activeTransactions.add(transaction);
  }
  handleEndTransaction(transaction) {
    this._activeTransactions.delete(transaction);
  }
}
export {
  DevToolsLogger
};
//# sourceMappingURL=devToolsLogger.js.map
