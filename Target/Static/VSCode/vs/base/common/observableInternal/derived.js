/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BaseObservable, _setDerivedOpts, } from './base.js';
import { DebugNameData } from './debugName.js';
import { BugIndicatingError, DisposableStore, assertFn, onBugIndicatingError, strictEquals } from './commonFacade/deps.js';
import { getLogger } from './logging/logging.js';
export function derived(computeFnOrOwner, computeFn) {
    if (computeFn !== undefined) {
        return new Derived(new DebugNameData(computeFnOrOwner, undefined, computeFn), computeFn, undefined, undefined, strictEquals);
    }
    return new Derived(new DebugNameData(undefined, undefined, computeFnOrOwner), computeFnOrOwner, undefined, undefined, strictEquals);
}
export function derivedWithSetter(owner, computeFn, setter) {
    return new DerivedWithSetter(new DebugNameData(owner, undefined, computeFn), computeFn, undefined, undefined, strictEquals, setter);
}
export function derivedOpts(options, computeFn) {
    return new Derived(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn), computeFn, undefined, options.onLastObserverRemoved, options.equalsFn ?? strictEquals);
}
_setDerivedOpts(derivedOpts);
/**
 * Represents an observable that is derived from other observables.
 * The value is only recomputed when absolutely needed.
 *
 * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
 *
 * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
 * Use `handleChange` to add a reported change to the change summary.
 * The compute function is given the last change summary.
 * The change summary is discarded after the compute function was called.
 *
 * @see derived
 */
export function derivedHandleChanges(options, computeFn) {
    return new Derived(new DebugNameData(options.owner, options.debugName, undefined), computeFn, options.changeTracker, undefined, options.equalityComparer ?? strictEquals);
}
export function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
    let computeFn;
    let owner;
    if (computeFnOrUndefined === undefined) {
        computeFn = computeFnOrOwner;
        owner = undefined;
    }
    else {
        owner = computeFnOrOwner;
        computeFn = computeFnOrUndefined;
    }
    // Intentionally re-assigned in case an inactive observable is re-used later
    // eslint-disable-next-line local/code-no-potentially-unsafe-disposables
    let store = new DisposableStore();
    return new Derived(new DebugNameData(owner, undefined, computeFn), r => {
        if (store.isDisposed) {
            store = new DisposableStore();
        }
        else {
            store.clear();
        }
        return computeFn(r, store);
    }, undefined, () => store.dispose(), strictEquals);
}
export function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
    let computeFn;
    let owner;
    if (computeFnOrUndefined === undefined) {
        computeFn = computeFnOrOwner;
        owner = undefined;
    }
    else {
        owner = computeFnOrOwner;
        computeFn = computeFnOrUndefined;
    }
    let store = undefined;
    return new Derived(new DebugNameData(owner, undefined, computeFn), r => {
        if (!store) {
            store = new DisposableStore();
        }
        else {
            store.clear();
        }
        const result = computeFn(r);
        if (result) {
            store.add(result);
        }
        return result;
    }, undefined, () => {
        if (store) {
            store.dispose();
            store = undefined;
        }
    }, strictEquals);
}
export var DerivedState;
(function (DerivedState) {
    /** Initial state, no previous value, recomputation needed */
    DerivedState[DerivedState["initial"] = 0] = "initial";
    /**
     * A dependency could have changed.
     * We need to explicitly ask them if at least one dependency changed.
     */
    DerivedState[DerivedState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    /**
     * A dependency changed and we need to recompute.
     * After recomputation, we need to check the previous value to see if we changed as well.
     */
    DerivedState[DerivedState["stale"] = 2] = "stale";
    /**
     * No change reported, our cached value is up to date.
     */
    DerivedState[DerivedState["upToDate"] = 3] = "upToDate";
})(DerivedState || (DerivedState = {}));
export class Derived extends BaseObservable {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? '(anonymous)';
    }
    constructor(_debugNameData, _computeFn, _changeTracker, _handleLastObserverRemoved = undefined, _equalityComparator) {
        super();
        this._debugNameData = _debugNameData;
        this._computeFn = _computeFn;
        this._changeTracker = _changeTracker;
        this._handleLastObserverRemoved = _handleLastObserverRemoved;
        this._equalityComparator = _equalityComparator;
        this._state = 0 /* DerivedState.initial */;
        this._value = undefined;
        this._updateCount = 0;
        this._dependencies = new Set();
        this._dependenciesToBeRemoved = new Set();
        this._changeSummary = undefined;
        this._isUpdating = false;
        this._isComputing = false;
        this._didReportChange = false;
        this._removedObserverToCallEndUpdateOn = null;
        // IReader Implementation
        this._isReaderValid = false;
        this._changeSummary = this._changeTracker?.createChangeSummary(undefined);
    }
    onLastObserverRemoved() {
        /**
         * We are not tracking changes anymore, thus we have to assume
         * that our cache is invalid.
         */
        this._state = 0 /* DerivedState.initial */;
        this._value = undefined;
        getLogger()?.handleDerivedCleared(this);
        for (const d of this._dependencies) {
            d.removeObserver(this);
        }
        this._dependencies.clear();
        this._handleLastObserverRemoved?.();
    }
    get() {
        const checkEnabled = false; // TODO set to true
        if (this._isComputing && checkEnabled) {
            // investigate why this fails in the diff editor!
            throw new BugIndicatingError('Cyclic deriveds are not supported yet!');
        }
        if (this._observers.size === 0) {
            let result;
            // Without observers, we don't know when to clean up stuff.
            // Thus, we don't cache anything to prevent memory leaks.
            try {
                this._isReaderValid = true;
                let changeSummary = undefined;
                if (this._changeTracker) {
                    changeSummary = this._changeTracker.createChangeSummary(undefined);
                    this._changeTracker.beforeUpdate?.(this, changeSummary);
                }
                result = this._computeFn(this, changeSummary);
            }
            finally {
                this._isReaderValid = false;
            }
            // Clear new dependencies
            this.onLastObserverRemoved();
            return result;
        }
        else {
            do {
                // We might not get a notification for a dependency that changed while it is updating,
                // thus we also have to ask all our depedencies if they changed in this case.
                if (this._state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                    for (const d of this._dependencies) {
                        /** might call {@link handleChange} indirectly, which could make us stale */
                        d.reportChanges();
                        if (this._state === 2 /* DerivedState.stale */) {
                            // The other dependencies will refresh on demand, so early break
                            break;
                        }
                    }
                }
                // We called report changes of all dependencies.
                // If we are still not stale, we can assume to be up to date again.
                if (this._state === 1 /* DerivedState.dependenciesMightHaveChanged */) {
                    this._state = 3 /* DerivedState.upToDate */;
                }
                if (this._state !== 3 /* DerivedState.upToDate */) {
                    this._recompute();
                }
                // In case recomputation changed one of our dependencies, we need to recompute again.
            } while (this._state !== 3 /* DerivedState.upToDate */);
            return this._value;
        }
    }
    _recompute() {
        const emptySet = this._dependenciesToBeRemoved;
        this._dependenciesToBeRemoved = this._dependencies;
        this._dependencies = emptySet;
        const hadValue = this._state !== 0 /* DerivedState.initial */;
        const oldValue = this._value;
        this._state = 3 /* DerivedState.upToDate */;
        let didChange = false;
        this._isComputing = true;
        this._didReportChange = false;
        try {
            const changeSummary = this._changeSummary;
            try {
                this._isReaderValid = true;
                if (this._changeTracker) {
                    this._changeTracker.beforeUpdate?.(this, changeSummary);
                    this._changeSummary = this._changeTracker?.createChangeSummary(changeSummary);
                }
                /** might call {@link handleChange} indirectly, which could invalidate us */
                this._value = this._computeFn(this, changeSummary);
            }
            finally {
                this._isReaderValid = false;
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this._dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this._dependenciesToBeRemoved.clear();
            }
            didChange = this._didReportChange || (hadValue && !(this._equalityComparator(oldValue, this._value)));
            getLogger()?.handleObservableUpdated(this, {
                oldValue,
                newValue: this._value,
                change: undefined,
                didChange,
                hadValue,
            });
        }
        catch (e) {
            onBugIndicatingError(e);
        }
        this._isComputing = false;
        if (!this._didReportChange && didChange) {
            for (const r of this._observers) {
                r.handleChange(this, undefined);
            }
        }
        else {
            this._didReportChange = false;
        }
    }
    toString() {
        return `LazyDerived<${this.debugName}>`;
    }
    // IObserver Implementation
    beginUpdate(_observable) {
        if (this._isUpdating) {
            throw new BugIndicatingError('Cyclic deriveds are not supported yet!');
        }
        this._updateCount++;
        this._isUpdating = true;
        try {
            const propagateBeginUpdate = this._updateCount === 1;
            if (this._state === 3 /* DerivedState.upToDate */) {
                this._state = 1 /* DerivedState.dependenciesMightHaveChanged */;
                // If we propagate begin update, that will already signal a possible change.
                if (!propagateBeginUpdate) {
                    for (const r of this._observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
            if (propagateBeginUpdate) {
                for (const r of this._observers) {
                    r.beginUpdate(this); // This signals a possible change
                }
            }
        }
        finally {
            this._isUpdating = false;
        }
    }
    endUpdate(_observable) {
        this._updateCount--;
        if (this._updateCount === 0) {
            // End update could change the observer list.
            const observers = [...this._observers];
            for (const r of observers) {
                r.endUpdate(this);
            }
            if (this._removedObserverToCallEndUpdateOn) {
                const observers = [...this._removedObserverToCallEndUpdateOn];
                this._removedObserverToCallEndUpdateOn = null;
                for (const r of observers) {
                    r.endUpdate(this);
                }
            }
        }
        assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
        // In all other states, observers already know that we might have changed.
        if (this._state === 3 /* DerivedState.upToDate */ && this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
            this._state = 1 /* DerivedState.dependenciesMightHaveChanged */;
            for (const r of this._observers) {
                r.handlePossibleChange(this);
            }
        }
    }
    handleChange(observable, change) {
        if (this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
            getLogger()?.handleDerivedDependencyChanged(this, observable, change);
            let shouldReact = false;
            try {
                shouldReact = this._changeTracker ? this._changeTracker.handleChange({
                    changedObservable: observable,
                    change,
                    didChange: (o) => o === observable,
                }, this._changeSummary) : true;
            }
            catch (e) {
                onBugIndicatingError(e);
            }
            const wasUpToDate = this._state === 3 /* DerivedState.upToDate */;
            if (shouldReact && (this._state === 1 /* DerivedState.dependenciesMightHaveChanged */ || wasUpToDate)) {
                this._state = 2 /* DerivedState.stale */;
                if (wasUpToDate) {
                    for (const r of this._observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
        }
    }
    readObservable(observable) {
        if (!this._isReaderValid) {
            throw new BugIndicatingError('The reader object cannot be used outside its compute function!');
        }
        // Subscribe before getting the value to enable caching
        observable.addObserver(this);
        /** This might call {@link handleChange} indirectly, which could invalidate us */
        const value = observable.get();
        // Which is why we only add the observable to the dependencies now.
        this._dependencies.add(observable);
        this._dependenciesToBeRemoved.delete(observable);
        return value;
    }
    reportChange(change) {
        if (!this._isReaderValid) {
            throw new BugIndicatingError('The reader object cannot be used outside its compute function!');
        }
        this._didReportChange = true;
        // TODO add logging
        for (const r of this._observers) {
            r.handleChange(this, change);
        }
    }
    addObserver(observer) {
        const shouldCallBeginUpdate = !this._observers.has(observer) && this._updateCount > 0;
        super.addObserver(observer);
        if (shouldCallBeginUpdate) {
            if (this._removedObserverToCallEndUpdateOn && this._removedObserverToCallEndUpdateOn.has(observer)) {
                this._removedObserverToCallEndUpdateOn.delete(observer);
            }
            else {
                observer.beginUpdate(this);
            }
        }
    }
    removeObserver(observer) {
        if (this._observers.has(observer) && this._updateCount > 0) {
            if (!this._removedObserverToCallEndUpdateOn) {
                this._removedObserverToCallEndUpdateOn = new Set();
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
            value: this._value,
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
export class DerivedWithSetter extends Derived {
    constructor(debugNameData, computeFn, changeTracker, handleLastObserverRemoved = undefined, equalityComparator, set) {
        super(debugNameData, computeFn, changeTracker, handleLastObserverRemoved, equalityComparator);
        this.set = set;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVyaXZlZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL0Q6L0RldmVsb3Blci9BcHBsaWNhdGlvbi9Db2RlRWRpdG9yTGFuZC9MYW5kL0RlcGVuZGVuY3kvTWljcm9zb2Z0L0RlcGVuZGVuY3kvRWRpdG9yL3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL29ic2VydmFibGVJbnRlcm5hbC9kZXJpdmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLE9BQU8sRUFBRSxjQUFjLEVBQTZGLGVBQWUsR0FBRyxNQUFNLFdBQVcsQ0FBQztBQUN4SixPQUFPLEVBQUUsYUFBYSxFQUE4QixNQUFNLGdCQUFnQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQWlDLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxSixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFrQmpELE1BQU0sVUFBVSxPQUFPLENBQW9CLGdCQUF1RSxFQUFFLFNBQWdFO0lBQ25MLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzdCLE9BQU8sSUFBSSxPQUFPLENBQ2pCLElBQUksYUFBYSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFDekQsU0FBUyxFQUNULFNBQVMsRUFDVCxTQUFTLEVBQ1QsWUFBWSxDQUNaLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FDakIsSUFBSSxhQUFhLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxnQkFBdUIsQ0FBQyxFQUNoRSxnQkFBdUIsRUFDdkIsU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLENBQ1osQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUksS0FBNkIsRUFBRSxTQUFpQyxFQUFFLE1BQWlFO0lBQ3ZLLE9BQU8sSUFBSSxpQkFBaUIs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