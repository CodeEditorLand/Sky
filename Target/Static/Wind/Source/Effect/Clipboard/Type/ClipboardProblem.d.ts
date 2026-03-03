/**
 * @module Effect/Clipboard/Type/ClipboardProblem
 * @description
 * Error types with categorization for clipboard operations.
 * Represents the union of all possible clipboard-related errors.
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Usage context
 * @category Type
 */
/**
 * Clipboard error types with categorization
 * Microsoft VSCode Reference: Clipboard error handling patterns
 */
export type ClipboardProblem = {
    readonly _tag: "ClipboardNotAvailable";
    readonly reason: string;
} | {
    readonly _tag: "ClipboardReadError";
    readonly error: Error;
} | {
    readonly _tag: "ClipboardWriteError";
    readonly error: Error;
} | {
    readonly _tag: "ClipboardPermissionDenied";
    readonly reason: string;
} | {
    readonly _tag: "ClipboardFormatNotSupported";
    readonly format: string;
} | {
    readonly _tag: "ClipboardSizeExceeded";
    readonly size: number;
    readonly limit: number;
};
//# sourceMappingURL=ClipboardProblem.d.ts.map