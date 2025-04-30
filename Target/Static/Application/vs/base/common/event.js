var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { diffSets } from "./collections.js";
import { onUnexpectedError } from "./errors.js";
import { createSingleCallFunction } from "./functional.js";
import { combinedDisposable, Disposable, DisposableMap, DisposableStore, toDisposable } from "./lifecycle.js";
import { LinkedList } from "./linkedList.js";
import { StopWatch } from "./stopwatch.js";
const _enableDisposeWithListenerWarning = false;
const _enableSnapshotPotentialLeakWarning = false;
var Event;
(function(Event2) {
  Event2.None = () => Disposable.None;
  function _addLeakageTraceLogic(options) {
    if (_enableSnapshotPotentialLeakWarning) {
      const { onDidAddListener: origListenerDidAdd } = options;
      const stack = Stacktrace.create();
      let count = 0;
      options.onDidAddListener = () => {
        if (++count === 2) {
          console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here");
          stack.print();
        }
        origListenerDidAdd?.();
      };
    }
  }
  __name(_addLeakageTraceLogic, "_addLeakageTraceLogic");
  function defer(event, disposable) {
    return debounce(event, () => void 0, 0, void 0, true, void 0, disposable);
  }
  __name(defer, "defer");
  Event2.defer = defer;
  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      let didFire = false;
      let result = void 0;
      result = event((e) => {
        if (didFire) {
          return;
        } else if (result) {
          result.dispose();
        } else {
          didFire = true;
        }
        return listener.call(thisArgs, e);
      }, null, disposables);
      if (didFire) {
        result.dispose();
      }
      return result;
    };
  }
  __name(once, "once");
  Event2.once = once;
  function onceIf(event, condition) {
    return Event2.once(Event2.filter(event, condition));
  }
  __name(onceIf, "onceIf");
  Event2.onceIf = onceIf;
  function map(event, map2, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables), disposable);
  }
  __name(map, "map");
  Event2.map = map;
  function forEach(event, each, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i) => {
      each(i);
      listener.call(thisArgs, i);
    }, null, disposables), disposable);
  }
  __name(forEach, "forEach");
  Event2.forEach = forEach;
  function filter(event, filter2, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables), disposable);
  }
  __name(filter, "filter");
  Event2.filter = filter;
  function signal(event) {
    return event;
  }
  __name(signal, "signal");
  Event2.signal = signal;
  function any(...events) {
    return (listener, thisArgs = null, disposables) => {
      const disposable = combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e))));
      return addAndReturnDisposable(disposable, disposables);
    };
  }
  __name(any, "any");
  Event2.any = any;
  function reduce(event, merge, initial, disposable) {
    let output = initial;
    return map(event, (e) => {
      output = merge(output, e);
      return output;
    }, disposable);
  }
  __name(reduce, "reduce");
  Event2.reduce = reduce;
  function snapshot(event, disposable) {
    let listener;
    const options = {
      onWillAddFirstListener() {
        listener = event(emitter.fire, emitter);
      },
      onDidRemoveLastListener() {
        listener?.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  __name(snapshot, "snapshot");
  function addAndReturnDisposable(d, store) {
    if (store instanceof Array) {
      store.push(d);
    } else if (store) {
      store.add(d);
    }
    return d;
  }
  __name(addAndReturnDisposable, "addAndReturnDisposable");
  function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
    let subscription;
    let output = void 0;
    let handle = void 0;
    let numDebouncedCalls = 0;
    let doFire;
    const options = {
      leakWarningThreshold,
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numDebouncedCalls++;
          output = merge(output, cur);
          if (leading && !handle) {
            emitter.fire(output);
            output = void 0;
          }
          doFire = /* @__PURE__ */ __name(() => {
            const _output = output;
            output = void 0;
            handle = void 0;
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }
            numDebouncedCalls = 0;
          }, "doFire");
          if (typeof delay === "number") {
            clearTimeout(handle);
            handle = setTimeout(doFire, delay);
          } else {
            if (handle === void 0) {
              handle = 0;
              queueMicrotask(doFire);
            }
          }
        });
      },
      onWillRemoveListener() {
        if (flushOnListenerRemove && numDebouncedCalls > 0) {
          doFire?.();
        }
      },
      onDidRemoveLastListener() {
        doFire = void 0;
        subscription.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  __name(debounce, "debounce");
  Event2.debounce = debounce;
  function accumulate(event, delay = 0, disposable) {
    return Event2.debounce(event, (last, e) => {
      if (!last) {
        return [e];
      }
      last.push(e);
      return last;
    }, delay, void 0, true, void 0, disposable);
  }
  __name(accumulate, "accumulate");
  Event2.accumulate = accumulate;
  function latch(event, equals = (a, b) => a === b, disposable) {
    let firstCall = true;
    let cache;
    return filter(event, (value) => {
      const shouldEmit = firstCall || !equals(value, cache);
      firstCall = false;
      cache = value;
      return shouldEmit;
    }, disposable);
  }
  __name(latch, "latch");
  Event2.latch = latch;
  function split(event, isT, disposable) {
    return [
      Event2.filter(event, isT, disposable),
      Event2.filter(event, (e) => !isT(e), disposable)
    ];
  }
  __name(split, "split");
  Event2.split = split;
  function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
    let buffer2 = _buffer.slice();
    let listener = event((e) => {
      if (buffer2) {
        buffer2.push(e);
      } else {
        emitter.fire(e);
      }
    });
    if (disposable) {
      disposable.add(listener);
    }
    const flush = /* @__PURE__ */ __name(() => {
      buffer2?.forEach((e) => emitter.fire(e));
      buffer2 = null;
    }, "flush");
    const emitter = new Emitter({
      onWillAddFirstListener() {
        if (!listener) {
          listener = event((e) => emitter.fire(e));
          if (disposable) {
            disposable.add(listener);
          }
        }
      },
      onDidAddFirstListener() {
        if (buffer2) {
          if (flushAfterTimeout) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },
      onDidRemoveLastListener() {
        if (listener) {
          listener.dispose();
        }
        listener = null;
      }
    });
    if (disposable) {
      disposable.add(emitter);
    }
    return emitter.event;
  }
  __name(buffer, "buffer");
  Event2.buffer = buffer;
  function chain(event, sythensize) {
    const fn = /* @__PURE__ */ __name((listener, thisArgs, disposables) => {
      const cs = sythensize(new ChainableSynthesis());
      return event(function(value) {
        const result = cs.evaluate(value);
        if (result !== HaltChainable) {
          listener.call(thisArgs, result);
        }
      }, void 0, disposables);
    }, "fn");
    return fn;
  }
  __name(chain, "chain");
  Event2.chain = chain;
  const HaltChainable = Symbol("HaltChainable");
  class ChainableSynthesis {
    static {
      __name(this, "ChainableSynthesis");
    }
    constructor() {
      this.steps = [];
    }
    map(fn) {
      this.steps.push(fn);
      return this;
    }
    forEach(fn) {
      this.steps.push((v) => {
        fn(v);
        return v;
      });
      return this;
    }
    filter(fn) {
      this.steps.push((v) => fn(v) ? v : HaltChainable);
      return this;
    }
    reduce(merge, initial) {
      let last = initial;
      this.steps.push((v) => {
        last = merge(last, v);
        return last;
      });
      return this;
    }
    latch(equals = (a, b) => a === b) {
      let firstCall = true;
      let cache;
      this.steps.push((value) => {
        const shouldEmit = firstCall || !equals(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit ? value : HaltChainable;
      });
      return this;
    }
    evaluate(value) {
      for (const step of this.steps) {
        value = step(value);
        if (value === HaltChainable) {
          break;
        }
      }
      return value;
    }
  }
  function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = /* @__PURE__ */ __name((...args) => result.fire(map2(...args)), "fn");
    const onFirstListenerAdd = /* @__PURE__ */ __name(() => emitter.on(eventName, fn), "onFirstListenerAdd");
    const onLastListenerRemove = /* @__PURE__ */ __name(() => emitter.removeListener(eventName, fn), "onLastListenerRemove");
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  __name(fromNodeEventEmitter, "fromNodeEventEmitter");
  Event2.fromNodeEventEmitter = fromNodeEventEmitter;
  function fromDOMEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = /* @__PURE__ */ __name((...args) => result.fire(map2(...args)), "fn");
    const onFirstListenerAdd = /* @__PURE__ */ __name(() => emitter.addEventListener(eventName, fn), "onFirstListenerAdd");
    const onLastListenerRemove = /* @__PURE__ */ __name(() => emitter.removeEventListener(eventName, fn), "onLastListenerRemove");
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  __name(fromDOMEventEmitter, "fromDOMEventEmitter");
  Event2.fromDOMEventEmitter = fromDOMEventEmitter;
  function toPromise(event, disposables) {
    return new Promise((resolve) => once(event)(resolve, null, disposables));
  }
  __name(toPromise, "toPromise");
  Event2.toPromise = toPromise;
  function fromPromise(promise) {
    const result = new Emitter();
    promise.then((res) => {
      result.fire(res);
    }, () => {
      result.fire(void 0);
    }).finally(() => {
      result.dispose();
    });
    return result.event;
  }
  __name(fromPromise, "fromPromise");
  Event2.fromPromise = fromPromise;
  function forward(from, to) {
    return from((e) => to.fire(e));
  }
  __name(forward, "forward");
  Event2.forward = forward;
  function runAndSubscribe(event, handler, initial) {
    handler(initial);
    return event((e) => handler(e));
  }
  __name(runAndSubscribe, "runAndSubscribe");
  Event2.runAndSubscribe = runAndSubscribe;
  class EmitterObserver {
    static {
      __name(this, "EmitterObserver");
    }
    constructor(_observable, store) {
      this._observable = _observable;
      this._counter = 0;
      this._hasChanged = false;
      const options = {
        onWillAddFirstListener: /* @__PURE__ */ __name(() => {
          _observable.addObserver(this);
          this._observable.reportChanges();
        }, "onWillAddFirstListener"),
        onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
          _observable.removeObserver(this);
        }, "onDidRemoveLastListener")
      };
      if (!store) {
        _addLeakageTraceLogic(options);
      }
      this.emitter = new Emitter(options);
      if (store) {
        store.add(this.emitter);
      }
    }
    beginUpdate(_observable) {
      this._counter++;
    }
    handlePossibleChange(_observable) {
    }
    handleChange(_observable, _change) {
      this._hasChanged = true;
    }
    endUpdate(_observable) {
      this._counter--;
      if (this._counter === 0) {
        this._observable.reportChanges();
        if (this._hasChanged) {
          this._hasChanged = false;
          this.emitter.fire(this._observable.get());
        }
      }
    }
  }
  function fromObservable(obs, store) {
    const observer = new EmitterObserver(obs, store);
    return observer.emitter.event;
  }
  __name(fromObservable, "fromObservable");
  Event2.fromObservable = fromObservable;
  function fromObservableLight(observable) {
    return (listener, thisArgs, disposables) => {
      let count = 0;
      let didChange = false;
      const observer = {
        beginUpdate() {
          count++;
        },
        endUpdate() {
          count--;
          if (count === 0) {
            observable.reportChanges();
            if (didChange) {
              didChange = false;
              listener.call(thisArgs);
            }
          }
        },
        handlePossibleChange() {
        },
        handleChange() {
          didChange = true;
        }
      };
      observable.addObserver(observer);
      observable.reportChanges();
      const disposable = {
        dispose() {
          observable.removeObserver(observer);
        }
      };
      if (disposables instanceof DisposableStore) {
        disposables.add(disposable);
      } else if (Array.isArray(disposables)) {
        disposables.push(disposable);
      }
      return disposable;
    };
  }
  __name(fromObservableLight, "fromObservableLight");
  Event2.fromObservableLight = fromObservableLight;
})(Event || (Event = {}));
class EventProfiling {
  static {
    __name(this, "EventProfiling");
  }
  static {
    this.all = /* @__PURE__ */ new Set();
  }
  static {
    this._idPool = 0;
  }
  constructor(name) {
    this.listenerCount = 0;
    this.invocationCount = 0;
    this.elapsedOverall = 0;
    this.durations = [];
    this.name = `${name}_${EventProfiling._idPool++}`;
    EventProfiling.all.add(this);
  }
  start(listenerCount) {
    this._stopWatch = new StopWatch();
    this.listenerCount = listenerCount;
  }
  stop() {
    if (this._stopWatch) {
      const elapsed = this._stopWatch.elapsed();
      this.durations.push(elapsed);
      this.elapsedOverall += elapsed;
      this.invocationCount += 1;
      this._stopWatch = void 0;
    }
  }
}
let _globalLeakWarningThreshold = -1;
function setGlobalLeakWarningThreshold(n) {
  const oldValue = _globalLeakWarningThreshold;
  _globalLeakWarningThreshold = n;
  return {
    dispose() {
      _globalLeakWarningThreshold = oldValue;
    }
  };
}
__name(setGlobalLeakWarningThreshold, "setGlobalLeakWarningThreshold");
class LeakageMonitor {
  static {
    __name(this, "LeakageMonitor");
  }
  static {
    this._idPool = 1;
  }
  constructor(_errorHandler, threshold, name = (LeakageMonitor._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = _errorHandler;
    this.threshold = threshold;
    this.name = name;
    this._warnCountdown = 0;
  }
  dispose() {
    this._stacks?.clear();
  }
  check(stack, listenerCount) {
    const threshold = this.threshold;
    if (threshold <= 0 || listenerCount < threshold) {
      return void 0;
    }
    if (!this._stacks) {
      this._stacks = /* @__PURE__ */ new Map();
    }
    const count = this._stacks.get(stack.value) || 0;
    this._stacks.set(stack.value, count + 1);
    this._warnCountdown -= 1;
    if (this._warnCountdown <= 0) {
      this._warnCountdown = threshold * 0.5;
      const [topStack, topCount] = this.getMostFrequentStack();
      const message = `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`;
      console.warn(message);
      console.warn(topStack);
      const error = new ListenerLeakError(message, topStack);
      this._errorHandler(error);
    }
    return () => {
      const count2 = this._stacks.get(stack.value) || 0;
      this._stacks.set(stack.value, count2 - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) {
      return void 0;
    }
    let topStack;
    let topCount = 0;
    for (const [stack, count] of this._stacks) {
      if (!topStack || topCount < count) {
        topStack = [stack, count];
        topCount = count;
      }
    }
    return topStack;
  }
}
class Stacktrace {
  static {
    __name(this, "Stacktrace");
  }
  static create() {
    const err = new Error();
    return new Stacktrace(err.stack ?? "");
  }
  constructor(value) {
    this.value = value;
  }
  print() {
    console.warn(this.value.split("\n").slice(2).join("\n"));
  }
}
class ListenerLeakError extends Error {
  static {
    __name(this, "ListenerLeakError");
  }
  constructor(message, stack) {
    super(message);
    this.name = "ListenerLeakError";
    this.stack = stack;
  }
}
class ListenerRefusalError extends Error {
  static {
    __name(this, "ListenerRefusalError");
  }
  constructor(message, stack) {
    super(message);
    this.name = "ListenerRefusalError";
    this.stack = stack;
  }
}
let id = 0;
class UniqueContainer {
  static {
    __name(this, "UniqueContainer");
  }
  constructor(value) {
    this.value = value;
    this.id = id++;
  }
}
const compactionThreshold = 2;
const forEachListener = /* @__PURE__ */ __name((listeners, fn) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners);
  } else {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i];
      if (l) {
        fn(l);
      }
    }
  }
}, "forEachListener");
class Emitter {
  static {
    __name(this, "Emitter");
  }
  constructor(options) {
    this._size = 0;
    this._options = options;
    this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(options?.onListenerError ?? onUnexpectedError, this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold) : void 0;
    this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
    this._deliveryQueue = this._options?.deliveryQueue;
  }
  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset();
      }
      if (this._listeners) {
        if (_enableDisposeWithListenerWarning) {
          const listeners = this._listeners;
          queueMicrotask(() => {
            forEachListener(listeners, (l) => l.stack?.print());
          });
        }
        this._listeners = void 0;
        this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.();
      this._leakageMon?.dispose();
    }
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    this._event ??= (callback, thisArgs, disposables) => {
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        const message = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(message);
        const tuple = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1];
        const error = new ListenerRefusalError(`${message}. HINT: Stack shows most frequent listener (${tuple[1]}-times)`, tuple[0]);
        const errorHandler = this._options?.onListenerError || onUnexpectedError;
        errorHandler(error);
        return Disposable.None;
      }
      if (this._disposed) {
        return Disposable.None;
      }
      if (thisArgs) {
        callback = callback.bind(thisArgs);
      }
      const contained = new UniqueContainer(callback);
      let removeMonitor;
      let stack;
      if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
        contained.stack = Stacktrace.create();
        removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
      }
      if (_enableDisposeWithListenerWarning) {
        contained.stack = stack ?? Stacktrace.create();
      }
      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(this);
        this._listeners = contained;
        this._options?.onDidAddFirstListener?.(this);
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate();
        this._listeners = [this._listeners, contained];
      } else {
        this._listeners.push(contained);
      }
      this._options?.onDidAddListener?.(this);
      this._size++;
      const result = toDisposable(() => {
        removeMonitor?.();
        this._removeListener(contained);
      });
      if (disposables instanceof DisposableStore) {
        disposables.add(result);
      } else if (Array.isArray(disposables)) {
        disposables.push(result);
      }
      return result;
    };
    return this._event;
  }
  _removeListener(listener) {
    this._options?.onWillRemoveListener?.(this);
    if (!this._listeners) {
      return;
    }
    if (this._size === 1) {
      this._listeners = void 0;
      this._options?.onDidRemoveLastListener?.(this);
      this._size = 0;
      return;
    }
    const listeners = this._listeners;
    const index = listeners.indexOf(listener);
    if (index === -1) {
      console.log("disposed?", this._disposed);
      console.log("size?", this._size);
      console.log("arr?", JSON.stringify(this._listeners));
      throw new Error("Attempted to dispose unknown listener");
    }
    this._size--;
    listeners[index] = void 0;
    const adjustDeliveryQueue = this._deliveryQueue.current === this;
    if (this._size * compactionThreshold <= listeners.length) {
      let n = 0;
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[n++] = listeners[i];
        } else if (adjustDeliveryQueue && n < this._deliveryQueue.end) {
          this._deliveryQueue.end--;
          if (n < this._deliveryQueue.i) {
            this._deliveryQueue.i--;
          }
        }
      }
      listeners.length = n;
    }
  }
  _deliver(listener, value) {
    if (!listener) {
      return;
    }
    const errorHandler = this._options?.onListenerError || onUnexpectedError;
    if (!errorHandler) {
      listener.value(value);
      return;
    }
    try {
      listener.value(value);
    } catch (e) {
      errorHandler(e);
    }
  }
  /** Delivers items in the queue. Assumes the queue is ready to go. */
  _deliverQueue(dq) {
    const listeners = dq.current._listeners;
    while (dq.i < dq.end) {
      this._deliver(listeners[dq.i++], dq.value);
    }
    dq.reset();
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue);
      this._perfMon?.stop();
    }
    this._perfMon?.start(this._size);
    if (!this._listeners) {
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, event);
    } else {
      const dq = this._deliveryQueue;
      dq.enqueue(this, event, this._listeners.length);
      this._deliverQueue(dq);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
}
const createEventDeliveryQueue = /* @__PURE__ */ __name(() => new EventDeliveryQueuePrivate(), "createEventDeliveryQueue");
class EventDeliveryQueuePrivate {
  static {
    __name(this, "EventDeliveryQueuePrivate");
  }
  constructor() {
    this.i = -1;
    this.end = 0;
  }
  enqueue(emitter, value, end) {
    this.i = 0;
    this.end = end;
    this.current = emitter;
    this.value = value;
  }
  reset() {
    this.i = this.end;
    this.current = void 0;
    this.value = void 0;
  }
}
class AsyncEmitter extends Emitter {
  static {
    __name(this, "AsyncEmitter");
  }
  async fireAsync(data, token, promiseJoin) {
    if (!this._listeners) {
      return;
    }
    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = new LinkedList();
    }
    forEachListener(this._listeners, (listener) => this._asyncDeliveryQueue.push([listener.value, data]));
    while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
      const [listener, data2] = this._asyncDeliveryQueue.shift();
      const thenables = [];
      const event = {
        ...data2,
        token,
        waitUntil: /* @__PURE__ */ __name((p) => {
          if (Object.isFrozen(thenables)) {
            throw new Error("waitUntil can NOT be called asynchronous");
          }
          if (promiseJoin) {
            p = promiseJoin(p, listener);
          }
          thenables.push(p);
        }, "waitUntil")
      };
      try {
        listener(event);
      } catch (e) {
        onUnexpectedError(e);
        continue;
      }
      Object.freeze(thenables);
      await Promise.allSettled(thenables).then((values) => {
        for (const value of values) {
          if (value.status === "rejected") {
            onUnexpectedError(value.reason);
          }
        }
      });
    }
  }
}
class PauseableEmitter extends Emitter {
  static {
    __name(this, "PauseableEmitter");
  }
  get isPaused() {
    return this._isPaused !== 0;
  }
  constructor(options) {
    super(options);
    this._isPaused = 0;
    this._eventQueue = new LinkedList();
    this._mergeFn = options?.merge;
  }
  pause() {
    this._isPaused++;
  }
  resume() {
    if (this._isPaused !== 0 && --this._isPaused === 0) {
      if (this._mergeFn) {
        if (this._eventQueue.size > 0) {
          const events = Array.from(this._eventQueue);
          this._eventQueue.clear();
          super.fire(this._mergeFn(events));
        }
      } else {
        while (!this._isPaused && this._eventQueue.size !== 0) {
          super.fire(this._eventQueue.shift());
        }
      }
    }
  }
  fire(event) {
    if (this._size) {
      if (this._isPaused !== 0) {
        this._eventQueue.push(event);
      } else {
        super.fire(event);
      }
    }
  }
}
class DebounceEmitter extends PauseableEmitter {
  static {
    __name(this, "DebounceEmitter");
  }
  constructor(options) {
    super(options);
    this._delay = options.delay ?? 100;
  }
  fire(event) {
    if (!this._handle) {
      this.pause();
      this._handle = setTimeout(() => {
        this._handle = void 0;
        this.resume();
      }, this._delay);
    }
    super.fire(event);
  }
}
class MicrotaskEmitter extends Emitter {
  static {
    __name(this, "MicrotaskEmitter");
  }
  constructor(options) {
    super(options);
    this._queuedEvents = [];
    this._mergeFn = options?.merge;
  }
  fire(event) {
    if (!this.hasListeners()) {
      return;
    }
    this._queuedEvents.push(event);
    if (this._queuedEvents.length === 1) {
      queueMicrotask(() => {
        if (this._mergeFn) {
          super.fire(this._mergeFn(this._queuedEvents));
        } else {
          this._queuedEvents.forEach((e) => super.fire(e));
        }
        this._queuedEvents = [];
      });
    }
  }
}
class EventMultiplexer {
  static {
    __name(this, "EventMultiplexer");
  }
  constructor() {
    this.hasListeners = false;
    this.events = [];
    this.emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => this.onFirstListenerAdd(), "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => this.onLastListenerRemove(), "onDidRemoveLastListener")
    });
  }
  get event() {
    return this.emitter.event;
  }
  add(event) {
    const e = { event, listener: null };
    this.events.push(e);
    if (this.hasListeners) {
      this.hook(e);
    }
    const dispose = /* @__PURE__ */ __name(() => {
      if (this.hasListeners) {
        this.unhook(e);
      }
      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    }, "dispose");
    return toDisposable(createSingleCallFunction(dispose));
  }
  onFirstListenerAdd() {
    this.hasListeners = true;
    this.events.forEach((e) => this.hook(e));
  }
  onLastListenerRemove() {
    this.hasListeners = false;
    this.events.forEach((e) => this.unhook(e));
  }
  hook(e) {
    e.listener = e.event((r) => this.emitter.fire(r));
  }
  unhook(e) {
    e.listener?.dispose();
    e.listener = null;
  }
  dispose() {
    this.emitter.dispose();
    for (const e of this.events) {
      e.listener?.dispose();
    }
    this.events = [];
  }
}
class DynamicListEventMultiplexer {
  static {
    __name(this, "DynamicListEventMultiplexer");
  }
  constructor(items, onAddItem, onRemoveItem, getEvent) {
    this._store = new DisposableStore();
    const multiplexer = this._store.add(new EventMultiplexer());
    const itemListeners = this._store.add(new DisposableMap());
    function addItem(instance) {
      itemListeners.set(instance, multiplexer.add(getEvent(instance)));
    }
    __name(addItem, "addItem");
    for (const instance of items) {
      addItem(instance);
    }
    this._store.add(onAddItem((instance) => {
      addItem(instance);
    }));
    this._store.add(onRemoveItem((instance) => {
      itemListeners.deleteAndDispose(instance);
    }));
    this.event = multiplexer.event;
  }
  dispose() {
    this._store.dispose();
  }
}
class EventBufferer {
  static {
    __name(this, "EventBufferer");
  }
  constructor() {
    this.data = [];
  }
  wrapEvent(event, reduce, initial) {
    return (listener, thisArgs, disposables) => {
      return event((i) => {
        const data = this.data[this.data.length - 1];
        if (!reduce) {
          if (data) {
            data.buffers.push(() => listener.call(thisArgs, i));
          } else {
            listener.call(thisArgs, i);
          }
          return;
        }
        const reduceData = data;
        if (!reduceData) {
          listener.call(thisArgs, reduce(initial, i));
          return;
        }
        reduceData.items ??= [];
        reduceData.items.push(i);
        if (reduceData.buffers.length === 0) {
          data.buffers.push(() => {
            reduceData.reducedResult ??= initial ? reduceData.items.reduce(reduce, initial) : reduceData.items.reduce(reduce);
            listener.call(thisArgs, reduceData.reducedResult);
          });
        }
      }, void 0, disposables);
    };
  }
  bufferEvents(fn) {
    const data = { buffers: new Array() };
    this.data.push(data);
    const r = fn();
    this.data.pop();
    data.buffers.forEach((flush) => flush());
    return r;
  }
}
class Relay {
  static {
    __name(this, "Relay");
  }
  constructor() {
    this.listening = false;
    this.inputEvent = Event.None;
    this.inputEventListener = Disposable.None;
    this.emitter = new Emitter({
      onDidAddFirstListener: /* @__PURE__ */ __name(() => {
        this.listening = true;
        this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
      }, "onDidAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
        this.listening = false;
        this.inputEventListener.dispose();
      }, "onDidRemoveLastListener")
    });
    this.event = this.emitter.event;
  }
  set input(event) {
    this.inputEvent = event;
    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }
  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }
}
class ValueWithChangeEvent {
  static {
    __name(this, "ValueWithChangeEvent");
  }
  static const(value) {
    return new ConstValueWithChangeEvent(value);
  }
  constructor(_value) {
    this._value = _value;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (value !== this._value) {
      this._value = value;
      this._onDidChange.fire(void 0);
    }
  }
}
class ConstValueWithChangeEvent {
  static {
    __name(this, "ConstValueWithChangeEvent");
  }
  constructor(value) {
    this.value = value;
    this.onDidChange = Event.None;
  }
}
function trackSetChanges(getData, onDidChangeData, handleItem) {
  const map = new DisposableMap();
  let oldData = new Set(getData());
  for (const d of oldData) {
    map.set(d, handleItem(d));
  }
  const store = new DisposableStore();
  store.add(onDidChangeData(() => {
    const newData = getData();
    const diff = diffSets(oldData, newData);
    for (const r of diff.removed) {
      map.deleteAndDispose(r);
    }
    for (const a of diff.added) {
      map.set(a, handleItem(a));
    }
    oldData = new Set(newData);
  }));
  store.add(map);
  return store;
}
__name(trackSetChanges, "trackSetChanges");
export {
  AsyncEmitter,
  DebounceEmitter,
  DynamicListEventMultiplexer,
  Emitter,
  Event,
  EventBufferer,
  EventMultiplexer,
  EventProfiling,
  ListenerLeakError,
  ListenerRefusalError,
  MicrotaskEmitter,
  PauseableEmitter,
  Relay,
  ValueWithChangeEvent,
  createEventDeliveryQueue,
  setGlobalLeakWarningThreshold,
  trackSetChanges
};
//# sourceMappingURL=event.js.map
