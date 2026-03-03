/**
 * @module Effect/Clipboard/Implementation/ClipboardHelper
 * @description
 * Helper functions for creating clipboard error instances.
 * Used by the clipboard service implementations.
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Main implementation
 * @category Implementation
 */
import type { ClipboardProblem } from "../Type/ClipboardProblem.js";
/**
 * Create a "ClipboardNotAvailable" error
 * @param reason - The reason why clipboard is not available
 * @returns A ClipboardProblem instance
 */
export declare const CreateNotAvailableError: (Reason: string) => ClipboardProblem;
/**
 * Create a "ClipboardReadError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export declare const CreateReadError: (Error: Error) => ClipboardProblem;
/**
 * Create a "ClipboardWriteError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export declare const CreateWriteError: (Error: Error) => ClipboardProblem;
/**
 * Create a "ClipboardPermissionDenied" error
 * @param reason - The reason for permission denial
 * @returns A ClipboardProblem instance
 */
export declare const CreatePermissionDeniedError: (Reason: string) => ClipboardProblem;
/**
 * Create a "ClipboardFormatNotSupported" error
 * @param format - The unsupported format
 * @returns A ClipboardProblem instance
 */
export declare const CreateFormatNotSupportedError: (Format: string) => ClipboardProblem;
/**
 * Create a "ClipboardSizeExceeded" error
 * @param size - The size that was attempted
 * @param limit - The size limit
 * @returns A ClipboardProblem instance
 */
export declare const CreateSizeExceededError: (Size: number, Limit: number) => ClipboardProblem;
declare const helpers: {
    CreateNotAvailableError: (Reason: string) => ClipboardProblem;
    CreateReadError: (Error: Error) => ClipboardProblem;
    CreateWriteError: (Error: Error) => ClipboardProblem;
    CreatePermissionDeniedError: (Reason: string) => ClipboardProblem;
    CreateFormatNotSupportedError: (Format: string) => ClipboardProblem;
    CreateSizeExceededError: (Size: number, Limit: number) => ClipboardProblem;
};
export default helpers;
//# sourceMappingURL=ClipboardHelper.d.ts.map