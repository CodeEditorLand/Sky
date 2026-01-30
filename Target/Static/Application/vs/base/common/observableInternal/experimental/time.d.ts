import { Disposable } from '../../lifecycle.js';
import { IObservable } from '../base.js';
import { DisposableStore, IDisposable } from '../commonFacade/deps.js';
/** Measures the total time an observable had the value "true". */
export declare class TotalTrueTimeObservable extends Disposable {
    private readonly value;
    private _totalTime;
    private _startTime;
    constructor(value: IObservable<boolean>);
    /**
     * Reports the total time the observable has been true in milliseconds.
     * E.g. `true` for 100ms, then `false` for 50ms, then `true` for 200ms results in 300ms.
    */
    totalTimeMs(): number;
    /**
     * Runs the callback when the total time the observable has been true increased by the given delta in milliseconds.
    */
    fireWhenTimeIncreasedBy(deltaTimeMs: number, callback: () => void): IDisposable;
}
/**
 * Returns an observable that is true when the input observable was true within the last `timeMs` milliseconds.
 */
export declare function wasTrueRecently(obs: IObservable<boolean>, timeMs: number, store: DisposableStore): IObservable<boolean>;
