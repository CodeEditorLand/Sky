import { VSBuffer } from '../../../../../base/common/buffer.js';
/** IMPORTANT: `Key` comes first. Then we should sort in order of least->most expensive to diff */
declare const enum TransformKind {
    Key = 0,
    Primitive = 1,
    Array = 2,
    Object = 3
}
/** Schema entries sorted with key properties first */
export type SchemaEntries = [string, Transform<unknown, unknown>][];
interface TransformBase<TFrom, TTo> {
    readonly kind: TransformKind;
    /** Extracts the serializable value from the source object */
    extract(from: TFrom): TTo;
}
/** Transform for primitive values (keys and values) that can be compared for equality */
export interface TransformValue<TFrom, TTo> extends TransformBase<TFrom, TTo> {
    readonly kind: TransformKind.Key | TransformKind.Primitive;
    /** Compares two serialized values for equality */
    equals(a: TTo, b: TTo): boolean;
}
/** Transform for arrays with an item schema */
export interface TransformArray<TFrom, TTo> extends TransformBase<TFrom, TTo> {
    readonly kind: TransformKind.Array;
    /** The schema for array items */
    readonly itemSchema: TransformObject<unknown, unknown> | TransformValue<unknown, unknown>;
}
/** Transform for objects with child properties */
export interface TransformObject<TFrom, TTo> extends TransformBase<TFrom, TTo> {
    readonly kind: TransformKind.Object;
    /** Schema entries sorted with Key properties first */
    readonly children: SchemaEntries;
    /** Checks if the object is sealed (won't change). */
    sealed?(obj: TTo, wasSerialized: boolean): boolean;
}
export type Transform<TFrom, TTo> = TransformValue<TFrom, TTo> | TransformArray<TFrom, TTo> | TransformObject<TFrom, TTo>;
export type Schema<TFrom, TTo> = {
    [K in keyof Required<TTo>]: Transform<TFrom, TTo[K]>;
};
/**
 * A primitive that will be tracked and compared first. If this is changed, the entire
 * object is thrown out and re-stored.
 */
export declare function key<T, R = T>(comparator?: (a: R, b: R) => boolean): TransformValue<T, R>;
/** A value that will be tracked and replaced if the comparator is not equal. */
export declare function value<T, R extends string | number | boolean | undefined>(): TransformValue<T, R>;
export declare function value<T, R>(comparator: (a: R, b: R) => boolean): TransformValue<T, R>;
/** An array that will use the schema to compare items positionally. */
export declare function array<T, R>(schema: TransformObject<T, R> | TransformValue<T, R>): TransformArray<readonly T[], R[]>;
export interface ObjectOptions<R> {
    /**
     * Returns true if the object is sealed and will never change again.
     * When comparing two sealed objects, only key fields are compared
     * (to detect replacement), but other fields are not diffed.
     */
    sealed?: (obj: R, wasSerialized: boolean) => boolean;
}
/** An object schema. */
export declare function object<T, R extends object>(schema: Schema<T, R>, options?: ObjectOptions<R>): TransformObject<T, R>;
/**
 * Defines a getter on the object to extract a value, compared with the given schema.
 * It should return the value that will get serialized in the resulting log file.
 */
export declare function t<T, O, R>(getter: (obj: T) => O, schema: Transform<O, R>): Transform<T, R>;
/** Shortcut for t(fn, value()) */
export declare function v<T, R extends string | number | boolean | undefined>(getter: (obj: T) => R): TransformValue<T, R>;
export declare function v<T, R>(getter: (obj: T) => R, comparator: (a: R, b: R) => boolean): TransformValue<T, R>;
/**
 * An implementation of an append-based mutation logger. Given a `Transform`
 * definition of an object, it can recreate it from a file on disk. It is
 * then stateful, and given a `write` call it can update the log in a minimal
 * way.
 */
export declare class ObjectMutationLog<TFrom, TTo> {
    private readonly _transform;
    private readonly _compactAfterEntries;
    private _previous;
    private _entryCount;
    constructor(_transform: Transform<TFrom, TTo>, _compactAfterEntries?: number);
    /**
     * Creates an initial log file from the given object.
     */
    createInitial(current: TFrom): VSBuffer;
    /**
     * Creates an initial log file from the serialized object.
     */
    createInitialFromSerialized(value: TTo): VSBuffer;
    /**
     * Reads and reconstructs the state from a log file.
     */
    read(content: VSBuffer): TTo;
    /**
     * Writes updates to the log. Returns the operation type and data to write.
     */
    write(current: TFrom): {
        op: 'append' | 'replace';
        data: VSBuffer;
    };
    private _applySet;
    private _applyPush;
    private _diff;
    private _diffObject;
    private _diffArray;
    private _hasKeyMismatch;
}
export {};
