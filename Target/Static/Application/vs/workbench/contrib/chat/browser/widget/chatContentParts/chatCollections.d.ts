import { IDisposable } from '../../../../../../base/common/lifecycle.js';
export declare class ResourcePool<T extends IDisposable> implements IDisposable {
    private readonly _itemFactory;
    private readonly pool;
    private _inUse;
    get inUse(): ReadonlySet<T>;
    constructor(_itemFactory: () => T);
    get(): T;
    release(item: T): void;
    /**
     * Clear and dispose the items in the pool that are not in use.
     */
    clear(): void;
    dispose(): void;
}
export interface IDisposableReference<T> extends IDisposable {
    object: T;
    isStale: () => boolean;
}
