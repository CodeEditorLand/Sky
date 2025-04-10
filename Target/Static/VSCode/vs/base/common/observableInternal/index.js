/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// This is a facade for the observable implementation. Only import from here!
export { observableValueOpts } from './api.js';
export { autorun, autorunDelta, autorunHandleChanges, autorunOpts, autorunWithStore, autorunWithStoreHandleChanges, autorunIterableDelta } from './autorun.js';
export { asyncTransaction, disposableObservableValue, globalTransaction, observableValue, subtransaction, transaction, TransactionImpl, } from './base.js';
export { derived, derivedDisposable, derivedHandleChanges, derivedOpts, derivedWithSetter, derivedWithStore } from './derived.js';
export { ObservableLazy, ObservableLazyPromise, ObservablePromise, PromiseResult, } from './promise.js';
export { derivedWithCancellationToken, waitForState } from './utilsCancellation.js';
export { constObservable, debouncedObservableDeprecated, debouncedObservable, derivedConstOnceDefined, derivedObservableWithCache, derivedObservableWithWritableCache, keepObserved, latestChangedValue, mapObservableArrayCached, observableFromEvent, observableFromEventOpts, observableFromPromise, observableFromValueWithChangeEvent, observableSignal, observableSignalFromEvent, recomputeInitiallyAndOnChange, runOnChange, runOnChangeWithStore, runOnChangeWithCancellationToken, signalFromObservable, ValueWithChangeEventFromObservable, wasEventTriggeredRecently, } from './utils.js';
export { recordChanges } from './changeTracker.js';
import { addLogger, setLogObservableFn } from './logging/logging.js';
import { ConsoleObservableLogger, logObservableToConsole } from './logging/consoleObservableLogger.js';
import { DevToolsLogger } from './logging/debugger/devToolsLogger.js';
import { env } from '../process.js';
setLogObservableFn(logObservableToConsole);
// Remove "//" in the next line to enable logging
const enableLogging = false;
if (enableLogging) {
    addLogger(new ConsoleObservableLogger());
}
if (env && env['VSCODE_DEV_DEBUG']) {
    // To debug observables you also need the extension "ms-vscode.debug-value-editor"
    addLogger(DevToolsLogger.getInstance());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9EOi9EZXZlbG9wZXIvQXBwbGljYXRpb24vQ29kZUVkaXRvckxhbmQvTGFuZC9EZXBlbmRlbmN5L01pY3Jvc29mdC9EZXBlbmRlbmN5L0VkaXRvci9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9vYnNlcnZhYmxlSW50ZXJuYWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsNkVBQTZFO0FBRTdFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsNkJBQTZCLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDL0osT0FBTyxFQUFFLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGVBQWUsR0FBNEksTUFBTSxXQUFXLENBQUM7QUFDcFMsT0FBTyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQXVCLE1BQU0sY0FBYyxDQUFDO0FBQ3ZKLE9BQU8sRUFBRSxjQUFjLEVBQUUscUJBQXFCLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDO0FBQ3hHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNwRixPQUFPLEVBQUUsZUFBZSxFQUFFLDZCQUE2QixFQUFFLG1CQUFtQixFQUFFLHVCQUF1QixFQUFFLDBCQUEwQixFQUFFLGtDQUFrQyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSxxQkFBcUIsRUFBRSxrQ0FBa0MsRUFBRSxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBRSw2QkFBNkIsRUFBRSxXQUFXLEVBQUUsb0JBQW9CLEVBQUUsZ0NBQWdDLEVBQUUsb0JBQW9CLEVBQUUsa0NBQWtDLEVBQUUseUJBQXlCLEdBQTJCLE1BQU0sWUFBWSxDQUFDO0FBRTlsQixPQUFPLEVBQTRDLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTdGLE9BQU8sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUN2RyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDdEUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRTNDLGlEQUFpRDtBQUNqRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBRXpCO0FBRUYsSUFBSSxhQUFhLEVBQUUsQ0FBQztJQUNuQixTQUFTLENBQUMsSUFBSSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7SUFDcEMsa0ZBQWtGO0lBQ2xGLFNBQVMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDIn0=