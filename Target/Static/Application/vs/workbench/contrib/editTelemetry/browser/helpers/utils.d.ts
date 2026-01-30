import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IObservableWithChange, RemoveUndefined } from '../../../../../base/common/observable.js';
export declare function sumByCategory<T, TCategory extends string>(items: readonly T[], getValue: (item: T) => number, getCategory: (item: T) => TCategory): Record<TCategory, number | undefined>;
export declare function mapObservableDelta<T, TDelta, TDeltaNew>(obs: IObservableWithChange<T, TDelta>, mapFn: (value: TDelta) => TDeltaNew, store: DisposableStore): IObservableWithChange<T, TDeltaNew>;
export declare function iterateObservableChanges<T, TChange>(obs: IObservableWithChange<T, TChange>, store: DisposableStore): AsyncIterable<{
    value: T;
    prevValue: T;
    change: RemoveUndefined<TChange>[];
}>;
