/**
 * @module FileSystem/Error/FileSystemProviderError
 * @description
 * Error types for FileSystemProvider operations.
 * @category Error
 */
import { FileSystemErrorCode } from "../Type/FileSystemType.js";
/**
 * Base error class for file system provider operations
 */
export declare class FileSystemProviderError extends Error {
    _tag: string;
    readonly code: FileSystemErrorCode;
    constructor(message: string, code: FileSystemErrorCode, cause?: unknown);
}
/**
 * File not found error
 */
export declare class FileNotFoundError extends FileSystemProviderError {
    constructor(path: string, cause?: unknown);
}
/**
 * File exists error
 */
export declare class FileExistsError extends FileSystemProviderError {
    constructor(path: string, cause?: unknown);
}
/**
 * Permission error
 */
export declare class PermissionError extends FileSystemProviderError {
    constructor(path: string, cause?: unknown);
}
/**
 * Invalid path error
 */
export declare class InvalidPathError extends FileSystemProviderError {
    constructor(path: string, cause?: unknown);
}
/**
 * Not supported error
 */
export declare class NotSupportedError extends FileSystemProviderError {
    constructor(operation: string, cause?: unknown);
}
/**
 * Unknown file system error
 */
export declare class UnknownFileSystemError extends FileSystemProviderError {
    constructor(message: string, cause?: unknown);
}
/**
 * Check if an error is a FileSystemProviderError
 */
export declare function isFileSystemProviderError(error: unknown): error is FileSystemProviderError;
/**
 * Check if an error is a FileNotFoundError
 */
export declare function isFileNotFoundError(error: unknown): error is FileNotFoundError;
/**
 * Check if an error is a FileExistsError
 */
export declare function isFileExistsError(error: unknown): error is FileExistsError;
/**
 * Check if an error is a PermissionError
 */
export declare function isPermissionError(error: unknown): error is PermissionError;
/**
 * Check if an error is an InvalidPathError
 */
export declare function isInvalidPathError(error: unknown): error is InvalidPathError;
/**
 * Check if an error is a NotSupportedError
 */
export declare function isNotSupportedError(error: unknown): error is NotSupportedError;
/**
 * Check if an error is an UnknownFileSystemError
 */
export declare function isUnknownFileSystemError(error: unknown): error is UnknownFileSystemError;
/**
 * Convert a generic error to a FileSystemProviderError
 * @param error - Error to convert
 * @param context - Additional context (e.g., path, operation)
 * @param contextValue - Specific context value (e.g., actual path)
 * @returns FileSystemProviderError
 */
export declare function toFileSystemProviderError(error: unknown, context: string, contextValue?: string): FileSystemProviderError;
//# sourceMappingURL=FileSystemProviderError.d.ts.map