/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeCommonType
 * @description
 * Shared common types used across multiple VSCode type definitions.
 * Event and IDisposable are defined here to avoid circular dependencies.
 * @category Type
 */
/**
 * Event type definition
 * Represents an event that can be subscribed to with a listener function
 */
export interface Event<T> {
    (listener: (e: T) => any): IDisposable;
}
/**
 * Disposable interface
 * Represents an object that can be disposed to release resources
 */
export interface IDisposable {
    dispose(): void;
}
//# sourceMappingURL=VSCodeCommonType.d.ts.map