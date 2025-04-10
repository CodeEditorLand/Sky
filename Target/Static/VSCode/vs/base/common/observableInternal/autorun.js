/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DebugNameData } from './debugName.js';
import { assertFn, BugIndicatingError, DisposableStore, markAsDisposed, onBugIndicatingError, toDisposable, trackDisposable } from './commonFacade/deps.js';
import { getLogger } from './logging/logging.js';
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export function autorun(fn) {
    return new AutorunObserver(new DebugNameData(undefined, undefined, fn), fn, undefined);
}
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export function autorunOpts(options, fn) {
    return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, undefined);
}
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 *
 * Use `changeTracker.createChangeSummary` to create a "change summary" that can collect the changes.
 * Use `changeTracker.handleChange` to add a reported change to the change summary.
 * The run function is given the last change summary.
 * The change summary is discarded after the run function was called.
 *
 * @see autorun
 */
export function autorunHandleChanges(options, fn) {
    return new AutorunObserver(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.changeTracker);
}
/**
 * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
 */
export function autorunWithStoreHandleChanges(options, fn) {
    const store = new DisposableStore();
    const disposable = autorunHandleChanges({
        owner: options.owner,
        debugName: options.debugName,
        debugReferenceFn: options.debugReferenceFn ?? fn,
        changeTracker: options.changeTracker,
    }, (reader, changeSummary) => {
        store.clear();
        fn(reader, changeSummary, store);
    });
    return toDisposable(() => {
        disposable.dispose();
        store.dispose();
    });
}
/**
 * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
 */
export function autorunWithStore(fn) {
    const store = new DisposableStore();
    const disposable = autorunOpts({
        owner: undefined,
        debugName: undefined,
        debugReferenceFn: fn,
    }, reader => {
        store.clear();
        fn(reader, store);
    });
    return toDisposable(() => {
        disposable.dispose();
        store.dispose();
    });
}
export function autorunDelta(observable, handler) {
    let _lastValue;
    return autorunOpts({ debugReferenceFn: handler }, (reader) => {
        const newValue = observable.read(reader);
        const lastValue = _lastValue;
        _lastValue = newValue;
        handler({ lastValue, newValue });
    });
}
export function autorunIterableDelta(getValue, handler, getUniqueIdentifier = v => v) {
    const lastValues = new Map();
    return autorunOpts({ debugReferenceFn: getValue }, (reader) => {
        const newValues = new Map();
        const removedValues = new Map(lastValues);
        for (const value of getValue(reader)) {
            const id = getUniqueIdentifier(value);
            if (lastValues.has(id)) {
                removedValues.delete(id);
            }
            else {
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
export var AutorunState;
(function (AutorunState) {
    /**
     * A dependency could have changed.
     * We need to explicitly ask them if at least one dependency changed.
     */
    AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    /**
     * A dependency changed and we need to recompute.
     */
    AutorunState[AutorunState["stale"] = 2] = "stale";
    AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
})(AutorunState || (AutorunState = {}));
export class AutorunObserver {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? '(anonymous)';
    }
    constructor(_debugNameData, _runFn, _changeTracker) {
        this._debugNameData = _debugNameData;
        this._runFn = _runFn;
        this._changeTracker = _changeTracker;
        this._state = 2 /* AutorunState.stale */;
        this._updateCount = 0;
        this._disposed = false;
        this._dependencies = new Set();
        this._dependenciesToBeRemoved = new Set();
        this._isRunning = false;
        this._changeSummary = this._changeTracker?.createChangeSummary(undefined);
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
            o.removeObserver(this); // Warning: external call!
        }
        this._dependencies.clear();
        getLogger()?.handleAutorunDisposed(this);
        markAsDisposed(this);
    }
    _run() {
        const emptySet = this._dependenciesToBeRemoved;
        this._dependenciesToBeRemoved = this._dependencies;
        this._dependencies = emptySet;
        this._state = 3 /* AutorunState.upToDate */;
        try {
            if (!this._disposed) {
                getLogger()?.handleAutorunStarted(this);
                const changeSummary = this._changeSummary;
                try {
                    this._isRunning = true;
                    if (this._changeTracker) {
                        this._changeTracker.beforeUpdate?.(this, changeSummary);
                        this._changeSummary = this._changeTracker.createChangeSummary(changeSummary); // Warning: external call!
                    }
                    this._runFn(this, changeSummary); // Warning: external call!
                }
                catch (e) {
                    onBugIndicatingError(e);
                }
                finally {
                    this._isRunning = false;
                }
            }
        }
        finally {
            if (!this._disposed) {
                getLogger()?.handleAutorunFinished(this);
            }
            // We don't want our observed observables to think that they are (not even temporarily) not being observed.
            // Thus, we only unsubscribe from observables that are definitely not read anymore.
            for (const o of this._dependenciesToBeRemoved) {
                o.removeObserver(this); // Warning: external call!
            }
            this._dependenciesToBeRemoved.clear();
        }
    }
    toString() {
        return `Autorun<${this.debugName}>`;
    }
    // IObserver implementation
    beginUpdate(_observable) {
        if (this._state === 3 /* AutorunState.upToDate */) {
            this._state = 1 /* AutorunState.dependenciesMightHaveChanged */;
        }
        this._updateCount++;
    }
    endUpdate(_observable) {
        try {
            if (this._updateCount === 1) {
                do {
                    if (this._state === 1 /* AutorunState.dependenciesMightHaveChanged */) {
                        this._state = 3 /* AutorunState.upToDate */;
                        for (const d of this._dependencies) {
                            d.reportChanges(); // Warning: external call!
                            if (this._state === 2 /* AutorunState.stale */) {
                                // The other dependencies will refresh on demand
                                break;
                            }
                        }
                    }
                    if (this._state !== 3 /* AutorunState.upToDate */) {
                        this._run(); // Warning: indirect external call!
                    }
                } while (this._state !== 3 /* AutorunState.upToDate */);
            }
        }
        finally {
            this._updateCount--;
        }
        assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this._state === 3 /* AutorunState.upToDate */ && this._isDependency(observable)) {
            this._state = 1 /* AutorunState.dependenciesMightHaveChanged */;
        }
    }
    handleChange(observable, change) {
        if (this._isDependency(observable)) {
            getLogger()?.handleAutorunDependencyChanged(this, observable, change);
            try {
                // Warning: external call!
                const shouldReact = this._changeTracker ? this._changeTracker.handleChange({
                    changedObservable: observable,
                    change,
                    didChange: (o) => o === observable,
                }, this._changeSummary) : true;
                if (shouldReact) {
                    this._state = 2 /* AutorunState.stale */;
                }
            }
            catch (e) {
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
            throw new BugIndicatingError('The reader object cannot be used outside its compute function!');
        }
        // In case the run action disposes the autorun
        if (this._disposed) {
            return observable.get(); // warning: external call!
        }
        observable.addObserver(this); // warning: external call!
        const value = observable.get(); // warning: external call!
        this._dependencies.add(observable);
        this._dependenciesToBeRemoved.delete(observable);
        return value;
    }
    debugGetState() {
        return {
            isRunning: this._isRunning,
            updateCount: this._updateCount,
            dependencies: this._dependencies,
            state: this._state,
        };
    }
    debugRerun() {
        if (!this._isRunning) {
            this._run();
        }
        else {
            this._state = 2 /* AutorunState.stale */;
        }
    }
}
(function (autorun) {
    autorun.Observer = AutorunObserver;
})(autorun || (autorun = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3J1bi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9hdXRvcnVuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBR2hHLE9BQU8sRUFBRSxhQUFhLEVBQWtCLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQWUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN6SyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHakQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLE9BQU8sQ0FBQyxFQUE2QjtJQUNwRCxPQUFPLElBQUksZUFBZSxDQUN6QixJQUFJLGFBQWEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUMzQyxFQUFFLEVBQ0YsU0FBUyxDQUNULENBQUM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxPQUE0QixFQUFFLEVBQTZCO0lBQ3RGLE9BQU8sSUFBSSxlQUFlLENBQ3pCLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDLEVBQ25GLEVBQUUsRUFDRixTQUFTLENBQ1QsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUNuQyxPQUVDLEVBQ0QsRUFBNEQ7SUFFNUQsT0FBTyxJQUFJLGVBQWUsQ0FDekIsSUFBSSxhQUFh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