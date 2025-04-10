/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from './cancellation.js';
import { BugIndicatingError, CancellationError } from './errors.js';
import { Emitter, Event } from './event.js';
import { Disposable, DisposableMap, isDisposable, MutableDisposable, toDisposable } from './lifecycle.js';
import { extUri as defaultExtUri } from './resources.js';
import { setTimeout0 } from './platform.js';
import { MicrotaskDelay } from './symbols.js';
import { Lazy } from './lazy.js';
export function isThenable(obj) {
    return !!obj && typeof obj.then === 'function';
}
/**
 * Returns a promise that can be cancelled using the provided cancellation token.
 *
 * @remarks When cancellation is requested, the promise will be rejected with a {@link CancellationError}.
 * If the promise resolves to a disposable object, it will be automatically disposed when cancellation
 * is requested.
 *
 * @param callback A function that accepts a cancellation token and returns a promise
 * @returns A promise that can be cancelled
 */
export function createCancelablePromise(callback) {
    const source = new CancellationTokenSource();
    const thenable = callback(source.token);
    let isCancelled = false;
    const promise = new Promise((resolve, reject) => {
        const subscription = source.token.onCancellationRequested(() => {
            isCancelled = true;
            subscription.dispose();
            reject(new CancellationError());
        });
        Promise.resolve(thenable).then(value => {
            subscription.dispose();
            source.dispose();
            if (!isCancelled) {
                resolve(value);
            }
            else if (isDisposable(value)) {
                // promise has been cancelled, result is disposable and will
                // be cleaned up
                value.dispose();
            }
        }, err => {
            subscription.dispose();
            source.dispose();
            reject(err);
        });
    });
    return new class {
        cancel() {
            source.cancel();
            source.dispose();
        }
        then(resolve, reject) {
            return promise.then(resolve, reject);
        }
        catch(reject) {
            return this.then(undefined, reject);
        }
        finally(onfinally) {
            return promise.finally(onfinally);
        }
    };
}
export function raceCancellation(promise, token, defaultValue) {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            resolve(defaultValue);
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}
/**
 * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
 * @see {@link raceCancellation}
 */
export function raceCancellationError(promise, token) {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            reject(new CancellationError());
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}
/**
 * Returns as soon as one of the promises resolves or rejects and cancels remaining promises
 */
export async function raceCancellablePromises(cancellablePromises) {
    let resolvedPromiseIndex = -1;
    const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
    try {
        const result = await Promise.race(promises);
        return result;
    }
    finally {
        cancellablePromises.forEach((cancellablePromise, index) => {
            if (index !== resolvedPromiseIndex) {
                cancellablePromise.cancel();
            }
        });
    }
}
export function raceTimeout(promise, timeout, onTimeout) {
    let promiseResolve = undefined;
    const timer = setTimeout(() => {
        promiseResolve?.(undefined);
        onTimeout?.();
    }, timeout);
    return Promise.race([
        promise.finally(() => clearTimeout(timer)),
        new Promise(resolve => promiseResolve = resolve)
    ]);
}
export function raceFilter(promises, filter) {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            resolve(undefined);
            return;
        }
        let resolved = false;
        let unresolvedCount = promises.length;
        for (const promise of promises) {
            promise.then(result => {
                unresolvedCount--;
                if (!resolved) {
                    if (filter(result)) {
                        resolved = true;
                        resolve(result);
                    }
                    else if (unresolvedCount === 0) {
                        // Last one has to resolve the promise
                        resolve(undefined);
                    }
                }
            }).catch(reject);
        }
    });
}
export function asPromise(callback) {
    return new Promise((resolve, reject) => {
        const item = callback();
        if (isThenable(item)) {
            item.then(resolve, reject);
        }
        else {
            resolve(item);
        }
    });
}
/**
 * Creates and returns a new promise, plus its `resolve` and `reject` callbacks.
 *
 * Replace with standardized [`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) once it is supported
 */
export function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
}
/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
export class Throttler {
    constructor() {
        this.isDisposed = false;
        this.activePromise = null;
        this.queuedPromise = null;
        this.queuedPromiseFactory = null;
    }
    queue(promiseFactory) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Throttler is disposed'));
        }
        if (this.activePromise) {
            this.queuedPromiseFactory = promiseFactory;
            if (!this.queuedPromise) {
                const onComplete = () => {
                    this.queuedPromise = null;
                    if (this.isDisposed) {
                        return;
                    }
                    const result = this.queue(this.queuedPromiseFactory);
                    this.queuedPromiseFactory = null;
                    return result;
                };
                this.queuedPromise = new Promise(resolve => {
                    this.activePromise.then(onComplete, onComplete).then(resolve);
                });
            }
            return new Promise((resolve, reject) => {
                this.queuedPromise.then(resolve, reject);
            });
        }
        this.activePromise = promiseFactory();
        return new Promise((resolve, reject) => {
            this.activePromise.then((result) => {
                this.activePromise = null;
                resolve(result);
            }, (err) => {
                this.activePromise = null;
                reject(err);
            });
        });
    }
    dispose() {
        this.isDisposed = true;
    }
}
export class Sequencer {
    constructor() {
        this.current = Promise.resolve(null);
    }
    queue(promiseTask) {
        return this.current = this.current.then(() => promiseTask(), () => promiseTask());
    }
}
export class SequencerByKey {
    constructor() {
        this.promiseMap = new Map();
    }
    queue(key, promiseTask) {
        const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
        const newPromise = runningPromise
            .catch(() => { })
            .then(promiseTask)
            .finally(() => {
            if (this.promiseMap.get(key) === newPromise) {
                this.promiseMap.delete(key);
            }
        });
        this.promiseMap.set(key, newPromise);
        return newPromise;
    }
    keys() {
        return this.promiseMap.keys();
    }
}
const timeoutDeferred = (timeout, fn) => {
    let scheduled = true;
    const handle = setTimeout(() => {
        scheduled = false;
        fn();
    }, timeout);
    return {
        isTriggered: () => scheduled,
        dispose: () => {
            clearTimeout(handle);
            scheduled = false;
        },
    };
};
const microtaskDeferred = (fn) => {
    let scheduled = true;
    queueMicrotask(() => {
        if (scheduled) {
            scheduled = false;
            fn();
        }
    });
    return {
        isTriggered: () => scheduled,
        dispose: () => { scheduled = false; },
    };
};
/**
 * A helper to delay (debounce) execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
export class Delayer {
    constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.deferred = null;
        this.completionPromise = null;
        this.doResolve = null;
        this.doReject = null;
        this.task = null;
    }
    trigger(task, delay = this.defaultDelay) {
        this.task = task;
        this.cancelTimeout();
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve, reject) => {
                this.doResolve = resolve;
                this.doReject = reject;
            }).then(() => {
                this.completionPromise = null;
                this.doResolve = null;
                if (this.task) {
                    const task = this.task;
                    this.task = null;
                    return task();
                }
                return undefined;
            });
        }
        const fn = () => {
            this.deferred = null;
            this.doResolve?.(null);
        };
        this.deferred = delay === MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
        return this.completionPromise;
    }
    isTriggered() {
        return !!this.deferred?.isTriggered();
    }
    cancel() {
        this.cancelTimeout();
        if (this.completionPromise) {
            this.doReject?.(new CancellationError());
            this.completionPromise = null;
        }
    }
    cancelTimeout() {
        this.deferred?.dispose();
        this.deferred = null;
    }
    dispose() {
        this.cancel();
    }
}
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */
export class ThrottledDelayer {
    constructor(defaultDelay) {
        this.delayer = new Delayer(defaultDelay);
        this.throttler = new Throttler();
    }
    trigger(promiseFactory, delay) {
        return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
    }
    isTriggered() {
        return this.delayer.isTriggered();
    }
    cancel() {
        this.delayer.cancel();
    }
    dispose() {
        this.delayer.dispose();
        this.throttler.dispose();
    }
}
/**
 * A barrier that is initially closed and then becomes opened permanently.
 */
export class Barrier {
    constructor() {
        this._isOpen = false;
        this._promise = new Promise((c, e) => {
            this._completePromise = c;
        });
    }
    isOpen() {
        return this._isOpen;
    }
    open() {
        this._isOpen = true;
        this._completePromise(true);
    }
    wait() {
        return this._promise;
    }
}
/**
 * A barrier that is initially closed and then becomes opened permanently after a certain period of
 * time or when open is called explicitly
 */
export class AutoOpenBarrier extends Barrier {
    constructor(autoOpenTimeMs) {
        super();
        this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
    }
    open() {
        clearTimeout(this._timeout);
        super.open();
    }
}
export function timeout(millis, token) {
    if (!token) {
        return createCancelablePromise(token => timeout(millis, token));
    }
    return new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
            disposable.dispose();
            resolve();
        }, millis);
        const disposable = token.onCancellationRequested(() => {
            clearTimeout(handle);
            disposable.dispose();
            reject(new CancellationError());
        });
    });
}
/**
 * Creates a timeout that can be disposed using its returned value.
 * @param handler The timeout handler.
 * @param timeout An optional timeout in milliseconds.
 * @param store An optional {@link DisposableStore} that will have the timeout disposable managed automatically.
 *
 * @example
 * const store = new DisposableStore;
 * // Call the timeout after 1000ms at which point it will be automatically
 * // evicted from the store.
 * const timeoutDisposable = disposableTimeout(() => {}, 1000, store);
 *
 * if (foo) {
 *   // Cancel the timeout and evict it from store.
 *   timeoutDisposable.dispose();
 * }
 */
export function disposableTimeout(handler, timeout = 0, store) {
    const timer = setTimeout(() => {
        handler();
        if (store) {
            disposable.dispose();
        }
    }, timeout);
    const disposable = toDisposable(() => {
        clearTimeout(timer);
        store?.delete(disposable);
    });
    store?.add(disposable);
    return disposable;
}
/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */
export function sequence(promiseFactories) {
    const results = [];
    let index = 0;
    const len = promiseFactories.length;
    function next() {
        return index < len ? promiseFactories[index++]() : null;
    }
    function thenHandler(result) {
        if (result !== undefined && result !== null) {
            results.push(result);
        }
        const n = next();
        if (n) {
            return n.then(thenHandler);
        }
        return Promise.resolve(results);
    }
    return Promise.resolve(null).then(thenHandler);
}
export function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
    let index = 0;
    const len = promiseFactories.length;
    const loop = () => {
        if (index >= len) {
            return Promise.resolve(defaultValue);
        }
        const factory = promiseFactories[index++];
        const promise = Promise.resolve(factory());
        return promise.then(result => {
            if (shouldStop(result)) {
                return Promise.resolve(result);
            }
            return loop();
        });
    };
    return loop();
}
export function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
    if (promiseList.length === 0) {
        return Promise.resolve(defaultValue);
    }
    let todo = promiseList.length;
    const finish = () => {
        todo = -1;
        for (const promise of promiseList) {
            promise.cancel?.();
        }
    };
    return new Promise((resolve, reject) => {
        for (const promise of promiseList) {
            promise.then(result => {
                if (--todo >= 0 && shouldStop(result)) {
                    finish();
                    resolve(result);
                }
                else if (todo === 0) {
                    resolve(defaultValue);
                }
            })
                .catch(err => {
                if (--todo >= 0) {
                    finish();
                    reject(err);
                }
            });
        }
    });
}
/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */
export class Limiter {
    constructor(maxDegreeOfParalellism) {
        this._size = 0;
        this._isDisposed = false;
        this.maxDegreeOfParalellism = maxDegreeOfParalellism;
        this.outstandingPromises = [];
        this.runningPromises = 0;
        this._onDrained = new Emitter();
    }
    /**
     *
     * @returns A promise that resolved when all work is done (onDrained) or when
     * there is nothing to do
     */
    whenIdle() {
        return this.size > 0
            ? Event.toPromise(this.onDrained)
            : Promise.resolve();
    }
    get onDrained() {
        return this._onDrained.event;
    }
    get size() {
        return this._size;
    }
    queue(factory) {
        if (this._isDisposed) {
            throw new Error('Object has been disposed');
        }
        this._size++;
        return new Promise((c, e) => {
            this.outstandingPromises.push({ factory, c, e });
            this.consume();
        });
    }
    consume() {
        while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
            const iLimitedTask = this.outstandingPromises.shift();
            this.runningPromises++;
            const promise = iLimitedTask.factory();
            promise.then(iLimitedTask.c, iLimitedTask.e);
            promise.then(() => this.consumed(), () => this.consumed());
        }
    }
    consumed() {
        if (this._isDisposed) {
            return;
        }
        this.runningPromises--;
        if (--this._size === 0) {
            this._onDrained.fire();
        }
        if (this.outstandingPromises.length > 0) {
            this.consume();
        }
    }
    clear() {
        if (this._isDisposed) {
            throw new Error('Object has been disposed');
        }
        this.outstandingPromises.length = 0;
        this._size = this.runningPromises;
    }
    dispose() {
        this._isDisposed = true;
        this.outstandingPromises.length = 0; // stop further processing
        this._size = 0;
        this._onDrained.dispose();
    }
}
/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */
export class Queue extends Limiter {
    constructor() {
        super(1);
    }
}
/**
 * Same as `Queue`, ensures that only 1 task is executed at the same time. The difference to `Queue` is that
 * there is only 1 task about to be scheduled next. As such, calling `queue` while a task is executing will
 * replace the currently queued task until it executes.
 *
 * As such, the returned promise may not be from the factory that is passed in but from the next factory that
 * is running after having called `queue`.
 */
export class LimitedQueue {
    constructor() {
        this.sequentializer = new TaskSequentializer();
        this.tasks = 0;
    }
    queue(factory) {
        if (!this.sequentializer.isRunning()) {
            return this.sequentializer.run(this.tasks++, factory());
        }
        return this.sequentializer.queue(() => {
            return this.sequentializer.run(this.tasks++, factory());
        });
    }
}
/**
 * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
 * by disposing them once the queue is empty.
 */
export class ResourceQueue {
    constructor() {
        this.queues = new Map();
        this.drainers = new Set();
        this.drainListeners = undefined;
        this.drainListenerCount = 0;
    }
    async whenDrained() {
        if (this.isDrained()) {
            return;
        }
        const promise = new DeferredPromise();
        this.drainers.add(promise);
        return promise.p;
    }
    isDrained() {
        for (const [, queue] of this.queues) {
            if (queue.size > 0) {
                return false;
            }
        }
        return true;
    }
    queueSize(resource, extUri = defaultExtUri) {
        const key = extUri.getComparisonKey(resource);
        return this.queues.get(key)?.size ?? 0;
    }
    queueFor(resource, factory, extUri = defaultExtUri) {
        const key = extUri.getComparisonKey(resource);
        let queue = this.queues.get(key);
        if (!queue) {
            queue = new Queue();
            const drainListenerId = this.drainListenerCount++;
            const drainListener = Event.once(queue.onDrained)(() => {
                queue?.dispose();
                this.queues.delete(key);
                this.onDidQueueDrain();
                this.drainListeners?.deleteAndDispose(drainListenerId);
                if (this.drainListeners?.size === 0) {
                    this.drainListeners.dispose();
                    this.drainListeners = undefined;
                }
            });
            if (!this.drainListeners) {
                this.drainListeners = new DisposableMap();
            }
            this.drainListeners.set(drainListenerId, drainListener);
            this.queues.set(key, queue);
        }
        return queue.queue(factory);
    }
    onDidQueueDrain() {
        if (!this.isDrained()) {
            return; // not done yet
        }
        this.releaseDrainers();
    }
    releaseDrainers() {
        for (const drainer of this.drainers) {
            drainer.complete();
        }
        this.drainers.clear();
    }
    dispose() {
        for (const [, queue] of this.queues) {
            queue.dispose();
        }
        this.queues.clear();
        // Even though we might still have pending
        // tasks queued, after the queues have been
        // disposed, we can no longer track them, so
        // we release drainers to prevent hanging
        // promises when the resource queue is being
        // disposed.
        this.releaseDrainers();
        this.drainListeners?.dispose();
    }
}
export class TimeoutTimer {
    constructor(runner, timeout) {
        this._isDisposed = false;
        this._token = -1;
        if (typeof runner === 'function' && typeof timeout === 'number') {
            this.setIfNotSet(runner, timeout);
        }
    }
    dispose() {
        this.cancel();
        this._isDisposed = true;
    }
    cancel() {
        if (this._token !== -1) {
            clearTimeout(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, timeout) {
        if (this._isDisposed) {
            throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed TimeoutTimer`);
        }
        this.cancel();
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
    setIfNotSet(runner, timeout) {
        if (this._isDisposed) {
            throw new BugIndicatingError(`Calling 'setIfNotSet' on a disposed TimeoutTimer`);
        }
        if (this._token !== -1) {
            // timer is already set
            return;
        }
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
}
export class IntervalTimer {
    constructor() {
        this.disposable = undefined;
        this.isDisposed = false;
    }
    cancel() {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
    cancelAndSet(runner, interval, context = globalThis) {
        if (this.isDisposed) {
            throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed IntervalTimer`);
        }
        this.cancel();
        const handle = context.setInterval(() => {
            runner();
        }, interval);
        this.disposable = toDisposable(() => {
            context.clearInterval(handle);
            this.disposable = undefined;
        });
    }
    dispose() {
        this.cancel();
        this.isDisposed = true;
    }
}
export class RunOnceScheduler {
    constructor(runner, delay) {
        this.timeoutToken = -1;
        this.runner = runner;
        this.timeout = delay;
        this.timeoutHandler = this.onTimeout.bind(this);
    }
    /**
     * Dispose RunOnceScheduler
     */
    dispose() {
        this.cancel();
        this.runner = null;
    }
    /**
     * Cancel current scheduled runner (if any).
     */
    cancel() {
        if (this.isScheduled()) {
            clearTimeout(this.timeoutToken);
            this.timeoutToken = -1;
        }
    }
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay = this.timeout) {
        this.cancel();
        this.timeoutToken = setTimeout(this.timeoutHandler, delay);
    }
    get delay() {
        return this.timeout;
    }
    set delay(value) {
        this.timeout = value;
    }
    /**
     * Returns true if scheduled.
     */
    isScheduled() {
        return this.timeoutToken !== -1;
    }
    flush() {
        if (this.isScheduled()) {
            this.cancel();
            this.doRun();
        }
    }
    onTimeout() {
        this.timeoutToken = -1;
        if (this.runner) {
            this.doRun();
        }
    }
    doRun() {
        this.runner?.();
    }
}
/**
 * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
 * > **NOTE**: Only offers 1s resolution.
 *
 * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
 * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
 * this scheduler will execute 3hrs **after waking the computer from sleep**.
 */
export class ProcessTimeRunOnceScheduler {
    constructor(runner, delay) {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.runner = runner;
        this.timeout = delay;
        this.counter = 0;
        this.intervalToken = -1;
        this.intervalHandler = this.onInterval.bind(this);
    }
    dispose() {
        this.cancel();
        this.runner = null;
    }
    cancel() {
        if (this.isScheduled()) {
            clearInterval(this.intervalToken);
            this.intervalToken = -1;
        }
    }
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay = this.timeout) {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.cancel();
        this.counter = Math.ceil(delay / 1000);
        this.intervalToken = setInterval(this.intervalHandler, 1000);
    }
    /**
     * Returns true if scheduled.
     */
    isScheduled() {
        return this.intervalToken !== -1;
    }
    onInterval() {
        this.counter--;
        if (this.counter > 0) {
            // still need to wait
            return;
        }
        // time elapsed
        clearInterval(this.intervalToken);
        this.intervalToken = -1;
        this.runner?.();
    }
}
export class RunOnceWorker extends RunOnceScheduler {
    constructor(runner, timeout) {
        super(runner, timeout);
        this.units = [];
    }
    work(unit) {
        this.units.push(unit);
        if (!this.isScheduled()) {
            this.schedule();
        }
    }
    doRun() {
        const units = this.units;
        this.units = [];
        this.runner?.(units);
    }
    dispose() {
        this.units = [];
        super.dispose();
    }
}
/**
 * The `ThrottledWorker` will accept units of work `T`
 * to handle. The contract is:
 * * there is a maximum of units the worker can handle at once (via `maxWorkChunkSize`)
 * * there is a maximum of units the worker will keep in memory for processing (via `maxBufferedWork`)
 * * after having handled `maxWorkChunkSize` units, the worker needs to rest (via `throttleDelay`)
 */
export class ThrottledWorker extends Disposable {
    constructor(options, handler) {
        super();
        this.options = options;
        this.handler = handler;
        this.pendingWork = [];
        this.throttler = this._register(new MutableDisposable());
        this.disposed = false;
        this.lastExecutionTime = 0;
    }
    /**
     * The number of work units that are pending to be processed.
     */
    get pending() { return this.pendingWork.length; }
    /**
     * Add units to be worked on. Use `pending` to figure out
     * how many units are not yet processed after this method
     * was called.
     *
     * @returns whether the work was accepted or not. If the
     * worker is disposed, it will not accept any more work.
     * If the number of pending units would become larger
     * than `maxPendingWork`, more work will also not be accepted.
     */
    work(units) {
        if (this.disposed) {
            return false; // work not accepted: disposed
        }
        // Check for reaching maximum of pending work
        if (typeof this.options.maxBufferedWork === 'number') {
            // Throttled: simple check if pending + units exceeds max pending
            if (this.throttler.value) {
                if (this.pending + units.length > this.options.maxBufferedWork) {
                    return false; // work not accepted: too much pending work
                }
            }
            // Unthrottled: same as throttled, but account for max chunk getting
            // worked on directly without being pending
            else {
                if (this.pending + units.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) {
                    return false; // work not accepted: too much pending work
                }
            }
        }
        // Add to pending units first
        for (const unit of units) {
            this.pendingWork.push(unit);
        }
        const timeSinceLastExecution = Date.now() - this.lastExecutionTime;
        if (!this.throttler.value && (!this.options.waitThrottleDelayBetweenWorkUnits || timeSinceLastExecution >= this.options.throttleDelay)) {
            // Work directly if we are not throttling and we are not
            // enforced to throttle between `work()` calls.
            this.doWork();
        }
        else if (!this.throttler.value && this.options.waitThrottleDelayBetweenWorkUnits) {
            // Otherwise, schedule the throttler to work.
            this.scheduleThrottler(Math.max(this.options.throttleDelay - timeSinceLastExecution, 0));
        }
        else {
            // Otherwise, our work will be picked up by the running throttler
        }
        return true; // work accepted
    }
    doWork() {
        this.lastExecutionTime = Date.now();
        // Extract chunk to handle and handle it
        this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize));
        // If we have remaining work, schedule it after a delay
        if (this.pendingWork.length > 0) {
            this.scheduleThrottler();
        }
    }
    scheduleThrottler(delay = this.options.throttleDelay) {
        this.throttler.value = new RunOnceScheduler(() => {
            this.throttler.clear();
            this.doWork();
        }, delay);
        this.throttler.value.schedule();
    }
    dispose() {
        super.dispose();
        this.pendingWork.length = 0;
        this.disposed = true;
    }
}
/**
 * Execute the callback the next time the browser is idle, returning an
 * {@link IDisposable} that will cancel the callback when disposed. This wraps
 * [requestIdleCallback] so it will fallback to [setTimeout] if the environment
 * doesn't support it.
 *
 * @param callback The callback to run when idle, this includes an
 * [IdleDeadline] that provides the time alloted for the idle callback by the
 * browser. Not respecting this deadline will result in a degraded user
 * experience.
 * @param timeout A timeout at which point to queue no longer wait for an idle
 * callback but queue it on the regular event loop (like setTimeout). Typically
 * this should not be used.
 *
 * [IdleDeadline]: https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline
 * [requestIdleCallback]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
 * [setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
 *
 * **Note** that there is `dom.ts#runWhenWindowIdle` which is better suited when running inside a browser
 * context
 */
export let runWhenGlobalIdle;
export let _runWhenIdle;
(function () {
    if (typeof globalThis.requestIdleCallback !== 'function' || typeof globalThis.cancelIdleCallback !== 'function') {
        _runWhenIdle = (_targetWindow, runner, timeout) => {
            setTimeout0(() => {
                if (disposed) {
                    return;
                }
                const end = Date.now() + 15; // one frame at 64fps
                const deadline = {
                    didTimeout: true,
                    timeRemaining() {
                        return Math.max(0, end - Date.now());
                    }
                };
                runner(Object.freeze(deadline));
            });
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                }
            };
        };
    }
    else {
        _runWhenIdle = (targetWindow, runner, timeout) => {
            const handle = targetWindow.requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                    targetWindow.cancelIdleCallback(handle);
                }
            };
        };
    }
    runWhenGlobalIdle = (runner, timeout) => _runWhenIdle(globalThis, runner, timeout);
})();
export class AbstractIdleValue {
    constructor(targetWindow, executor) {
        this._didRun = false;
        this._executor = () => {
            try {
                this._value = executor();
            }
            catch (err) {
                this._error = err;
            }
            finally {
                this._didRun = true;
            }
        };
        this._handle = _runWhenIdle(targetWindow, () => this._executor());
    }
    dispose() {
        this._handle.dispose();
    }
    get value() {
        if (!this._didRun) {
            this._handle.dispose();
            this._executor();
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
    get isInitialized() {
        return this._didRun;
    }
}
/**
 * An `IdleValue` that always uses the current window (which might be throttled or inactive)
 *
 * **Note** that there is `dom.ts#WindowIdleValue` which is better suited when running inside a browser
 * context
 */
export class GlobalIdleValue extends AbstractIdleValue {
    constructor(executor) {
        super(globalThis, executor);
    }
}
//#endregion
export async function retry(task, delay, retries) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await task();
        }
        catch (error) {
            lastError = error;
            await timeout(delay);
        }
    }
    throw lastError;
}
/**
 * @deprecated use `LimitedQueue` instead for an easier to use API
 */
export class TaskSequentializer {
    isRunning(taskId) {
        if (typeof taskId === 'number') {
            return this._running?.taskId === taskId;
        }
        return !!this._running;
    }
    get running() {
        return this._running?.promise;
    }
    cancelRunning() {
        this._running?.cancel();
    }
    run(taskId, promise, onCancel) {
        this._running = { taskId, cancel: () => onCancel?.(), promise };
        promise.then(() => this.doneRunning(taskId), () => this.doneRunning(taskId));
        return promise;
    }
    doneRunning(taskId) {
        if (this._running && taskId === this._running.taskId) {
            // only set running to done if the promise finished that is associated with that taskId
            this._running = undefined;
            // schedule the queued task now that we are free if we have any
            this.runQueued();
        }
    }
    runQueued() {
        if (this._queued) {
            const queued = this._queued;
            this._queued = undefined;
            // Run queued task and complete on the associated promise
            queued.run().then(queued.promiseResolve, queued.promiseReject);
        }
    }
    /**
     * Note: the promise to schedule as next run MUST itself call `run`.
     *       Otherwise, this sequentializer will report `false` for `isRunning`
     *       even when this task is running. Missing this detail means that
     *       suddenly multiple tasks will run in parallel.
     */
    queue(run) {
        // this is our first queued task, so we create associated promise with it
        // so that we can return a promise that completes when the task has
        // completed.
        if (!this._queued) {
            const { promise, resolve: promiseResolve, reject: promiseReject } = promiseWithResolvers();
            this._queued = {
                run,
                promise,
                promiseResolve: promiseResolve,
                promiseReject: promiseReject
            };
        }
        // we have a previous queued task, just overwrite it
        else {
            this._queued.run = run;
        }
        return this._queued.promise;
    }
    hasQueued() {
        return !!this._queued;
    }
    async join() {
        return this._queued?.promise ?? this._running?.promise;
    }
}
//#endregion
//#region
/**
 * The `IntervalCounter` allows to count the number
 * of calls to `increment()` over a duration of
 * `interval`. This utility can be used to conditionally
 * throttle a frequent task when a certain threshold
 * is reached.
 */
export class IntervalCounter {
    constructor(interval, nowFn = () => Date.now()) {
        this.interval = interval;
        this.nowFn = nowFn;
        this.lastIncrementTime = 0;
        this.value = 0;
    }
    increment() {
        const now = this.nowFn();
        // We are outside of the range of `interval` and as such
        // start counting from 0 and remember the time
        if (now - this.lastIncrementTime > this.interval) {
            this.lastIncrementTime = now;
            this.value = 0;
        }
        this.value++;
        return this.value;
    }
}
var DeferredOutcome;
(function (DeferredOutcome) {
    DeferredOutcome[DeferredOutcome["Resolved"] = 0] = "Resolved";
    DeferredOutcome[DeferredOutcome["Rejected"] = 1] = "Rejected";
})(DeferredOutcome || (DeferredOutcome = {}));
/**
 * Creates a promise whose resolution or rejection can be controlled imperatively.
 */
export class DeferredPromise {
    get isRejected() {
        return this.outcome?.outcome === 1 /* DeferredOutcome.Rejected */;
    }
    get isResolved() {
        return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */;
    }
    get isSettled() {
        return !!this.outcome;
    }
    get value() {
        return this.outcome?.outcome === 0 /* DeferredOutcome.Resolved */ ? this.outcome?.value : undefined;
    }
    constructor() {
        this.p = new Promise((c, e) => {
            this.completeCallback = c;
            this.errorCallback = e;
        });
    }
    complete(value) {
        return new Promise(resolve => {
            this.completeCallback(value);
            this.outcome = { outcome: 0 /* DeferredOutcome.Resolved */, value };
            resolve();
        });
    }
    error(err) {
        return new Promise(resolve => {
            this.errorCallback(err);
            this.outcome = { outcome: 1 /* DeferredOutcome.Rejected */, value: err };
            resolve();
        });
    }
    cancel() {
        return this.error(new CancellationError());
    }
}
//#endregion
//#region Promises
export var Promises;
(function (Promises) {
    /**
     * A drop-in replacement for `Promise.all` with the only difference
     * that the method awaits every promise to either fulfill or reject.
     *
     * Similar to `Promise.all`, only the first error will be returned
     * if any.
     */
    async function settled(promises) {
        let firstError = undefined;
        const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
            if (!firstError) {
                firstError = error;
            }
            return undefined; // do not rethrow so that other promises can settle
        })));
        if (typeof firstError !== 'undefined') {
            throw firstError;
        }
        return result; // cast is needed and protected by the `throw` above
    }
    Promises.settled = settled;
    /**
     * A helper to create a new `Promise<T>` with a body that is a promise
     * itself. By default, an error that raises from the async body will
     * end up as a unhandled rejection, so this utility properly awaits the
     * body and rejects the promise as a normal promise does without async
     * body.
     *
     * This method should only be used in rare cases where otherwise `async`
     * cannot be used (e.g. when callbacks are involved that require this).
     */
    function withAsyncBody(bodyFn) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                await bodyFn(resolve, reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    Promises.withAsyncBody = withAsyncBody;
})(Promises || (Promises = {}));
export class StatefulPromise {
    get value() { return this._value; }
    get error() { return this._error; }
    get isResolved() { return this._isResolved; }
    constructor(promise) {
        this._value = undefined;
        this._error = undefined;
        this._isResolved = false;
        this.promise = promise.then(value => {
            this._value = value;
            this._isResolved = true;
            return value;
        }, error => {
            this._error = error;
            this._isResolved = true;
            throw error;
        });
    }
    /**
     * Returns the resolved value.
     * Throws if the promise is not resolved yet.
     */
    requireValue() {
        if (!this._isResolved) {
            throw new BugIndicatingError('Promise is not resolved yet');
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
}
export class LazyStatefulPromise {
    constructor(_compute) {
        this._compute = _compute;
        this._promise = new Lazy(() => new StatefulPromise(this._compute()));
    }
    /**
     * Returns the resolved value.
     * Throws if the promise is not resolved yet.
     */
    requireValue() {
        return this._promise.value.requireValue();
    }
    /**
     * Returns the promise (and triggers a computation of the promise if not yet done so).
     */
    getPromise() {
        return this._promise.value.promise;
    }
    /**
     * Reads the current value without triggering a computation of the promise.
     */
    get currentValue() {
        return this._promise.rawValue?.value;
    }
}
//#endregion
//#region
var AsyncIterableSourceState;
(function (AsyncIterableSourceState) {
    AsyncIterableSourceState[AsyncIterableSourceState["Initial"] = 0] = "Initial";
    AsyncIterableSourceState[AsyncIterableSourceState["DoneOK"] = 1] = "DoneOK";
    AsyncIterableSourceState[AsyncIterableSourceState["DoneError"] = 2] = "DoneError";
})(AsyncIterableSourceState || (AsyncIterableSourceState = {}));
/**
 * A rich implementation for an `AsyncIterable<T>`.
 */
export class AsyncIterableObject {
    static fromArray(items) {
        return new AsyncIterableObject((writer) => {
            writer.emitMany(items);
        });
    }
    static fromPromise(promise) {
        return new AsyncIterableObject(async (emitter) => {
            emitter.emitMany(await promise);
        });
    }
    static fromPromisesResolveOrder(promises) {
        return new AsyncIterableObject(async (emitter) => {
            await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
        });
    }
    static merge(iterables) {
        return new AsyncIterableObject(async (emitter) => {
            await Promise.all(iterables.map(async (iterable) => {
                for await (const item of iterable) {
                    emitter.emitOne(item);
                }
            }));
        });
    }
    static { this.EMPTY = AsyncIterableObject.fromArray([]); }
    constructor(executor, onReturn) {
        this._state = 0 /* AsyncIterableSourceState.Initial */;
        this._results = [];
        this._error = null;
        this._onReturn = onReturn;
        this._onStateChanged = new Emitter();
        queueMicrotask(async () => {
            const writer = {
                emitOne: (item) => this.emitOne(item),
                emitMany: (items) => this.emitMany(items),
                reject: (error) => this.reject(error)
            };
            try {
                await Promise.resolve(executor(writer));
                this.resolve();
            }
            catch (err) {
                this.reject(err);
            }
            finally {
                writer.emitOne = undefined;
                writer.emitMany = undefined;
                writer.reject = undefined;
            }
        });
    }
    [Symbol.asyncIterator]() {
        let i = 0;
        return {
            next: async () => {
                do {
                    if (this._state === 2 /* AsyncIterableSourceState.DoneError */) {
                        throw this._error;
                    }
                    if (i < this._results.length) {
                        return { done: false, value: this._results[i++] };
                    }
                    if (this._state === 1 /* AsyncIterableSourceState.DoneOK */) {
                        return { done: true, value: undefined };
                    }
                    await Event.toPromise(this._onStateChanged.event);
                } while (true);
            },
            return: async () => {
                this._onReturn?.();
                return { done: true, value: undefined };
            }
        };
    }
    static map(iterable, mapFn) {
        return new AsyncIterableObject(async (emitter) => {
            for await (const item of iterable) {
                emitter.emitOne(mapFn(item));
            }
        });
    }
    map(mapFn) {
        return AsyncIterableObject.map(this, mapFn);
    }
    static filter(iterable, filterFn) {
        return new AsyncIterableObject(async (emitter) => {
            for await (const item of iterable) {
                if (filterFn(item)) {
                    emitter.emitOne(item);
                }
            }
        });
    }
    filter(filterFn) {
        return AsyncIterableObject.filter(this, filterFn);
    }
    static coalesce(iterable) {
        return AsyncIterableObject.filter(iterable, item => !!item);
    }
    coalesce() {
        return AsyncIterableObject.coalesce(this);
    }
    static async toPromise(iterable) {
        const result = [];
        for await (const item of iterable) {
            result.push(item);
        }
        return result;
    }
    toPromise() {
        return AsyncIterableObject.toPromise(this);
    }
    /**
     * The value will be appended at the end.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    emitOne(value) {
        if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
            return;
        }
        // it is important to add new values at the end,
        // as we may have iterators already running on the array
        this._results.push(value);
        this._onStateChanged.fire();
    }
    /**
     * The values will be appended at the end.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    emitMany(values) {
        if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
            return;
        }
        // it is important to add new values at the end,
        // as we may have iterators already running on the array
        this._results = this._results.concat(values);
        this._onStateChanged.fire();
    }
    /**
     * Calling `resolve()` will mark the result array as complete.
     *
     * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    resolve() {
        if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
            return;
        }
        this._state = 1 /* AsyncIterableSourceState.DoneOK */;
        this._onStateChanged.fire();
    }
    /**
     * Writing an error will permanently invalidate this iterable.
     * The current users will receive an error thrown, as will all future users.
     *
     * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
     */
    reject(error) {
        if (this._state !== 0 /* AsyncIterableSourceState.Initial */) {
            return;
        }
        this._state = 2 /* AsyncIterableSourceState.DoneError */;
        this._error = error;
        this._onStateChanged.fire();
    }
}
export class CancelableAsyncIterableObject extends AsyncIterableObject {
    constructor(_source, executor) {
        super(executor);
        this._source = _source;
    }
    cancel() {
        this._source.cancel();
    }
}
export function createCancelableAsyncIterable(callback) {
    const source = new CancellationTokenSource();
    const innerIterable = callback(source.token);
    return new CancelableAsyncIterableObject(source, async (emitter) => {
        const subscription = source.token.onCancellationRequested(() => {
            subscription.dispose();
            source.dispose();
            emitter.reject(new CancellationError());
        });
        try {
            for await (const item of innerIterable) {
                if (source.token.isCancellationRequested) {
                    // canceled in the meantime
                    return;
                }
                emitter.emitOne(item);
            }
            subscription.dispose();
            source.dispose();
        }
        catch (err) {
            subscription.dispose();
            source.dispose();
            emitter.reject(err);
        }
    });
}
export class AsyncIterableSource {
    /**
     *
     * @param onReturn A function that will be called when consuming the async iterable
     * has finished by the consumer, e.g the for-await-loop has be existed (break, return) early.
     * This is NOT called when resolving this source by its owner.
     */
    constructor(onReturn) {
        this._deferred = new DeferredPromise();
        this._asyncIterable = new AsyncIterableObject(emitter => {
            if (earlyError) {
                emitter.reject(earlyError);
                return;
            }
            if (earlyItems) {
                emitter.emitMany(earlyItems);
            }
            this._errorFn = (error) => emitter.reject(error);
            this._emitFn = (item) => emitter.emitOne(item);
            return this._deferred.p;
        }, onReturn);
        let earlyError;
        let earlyItems;
        this._emitFn = (item) => {
            if (!earlyItems) {
                earlyItems = [];
            }
            earlyItems.push(item);
        };
        this._errorFn = (error) => {
            if (!earlyError) {
                earlyError = error;
            }
        };
    }
    get asyncIterable() {
        return this._asyncIterable;
    }
    resolve() {
        this._deferred.complete();
    }
    reject(error) {
        this._errorFn(error);
        this._deferred.complete();
    }
    emitOne(item) {
        this._emitFn(item);
    }
}
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9hc3luYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxPQUFPLEVBQXFCLHVCQUF1QixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDL0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFnQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEksT0FBTyxFQUFFLE1BQU0sSUFBSSxhQUFhLEVBQVcsTUFBTSxnQkFBZ0IsQ0FBQztBQUVsRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDOUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVqQyxNQUFNLFVBQVUsVUFBVSxDQUFJLEdBQVk7SUFDekMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLE9BQVEsR0FBNkIsQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDO0FBQzNFLENBQUM7QUFNRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUksUUFBa0Q7SUFDNUYsTUFBTSxNQUFNLEdBQUcsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO0lBRTdDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFeEMsSUFB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