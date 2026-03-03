/**
 * @module FileSystem/Type/FileSystemType
 * @description
 * Type definitions for file system operations matching VSCode's IFileSystemProvider interface.
 * @category Type
 */
import type { FileType } from "./FileType.js";
import type { URI } from "./URI.js";
/**
 * File statistics (size, type, permissions, timestamps)
 */
export interface IStat {
    /** File type (file, directory, symlink) */
    readonly type: FileType;
    /** File size in bytes */
    readonly size: number;
    /** Creation time (Unix timestamp in milliseconds) */
    readonly ctime: number;
    /** Modification time (Unix timestamp in milliseconds) */
    readonly mtime: number;
    /** Permissions (Unix-style, e.g., 0o755) */
    readonly permissions?: number;
}
/**
 * Options for writing to files
 */
export interface IFileWriteOptions {
    /** If true, create the file if it doesn't exist */
    readonly create: boolean;
    /** If true, overwrite existing file */
    readonly overwrite: boolean;
}
/**
 * Options for watching file/directory changes
 */
export interface IWatchOptions {
    /** Whether to watch recursively (for directories) */
    readonly recursive: boolean;
    /** Whether to watch for file creation */
    readonly exclusive?: boolean;
}
/**
 * Disposable resource (e.g., file watcher)
 */
export interface IDisposable {
    /** Dispose of the resource */
    readonly dispose: () => void | Promise<void>;
}
/**
 * VSCode-like file system provider interface
 * Provides methods for file and directory operations
 */
export interface IFileSystemProvider {
    /**
     * Read file contents as binary data
     * @param uri - URI of the file to read
     * @returns Promise resolving to file contents as Uint8Array
     */
    readFile: (uri: URI) => Promise<Uint8Array>;
    /**
     * Write data to a file
     * @param uri - URI of the file to write
     * @param content - File content as Uint8Array
     * @param options - Write options (create, overwrite)
     * @returns Promise that resolves when write is complete
     */
    writeFile: (uri: URI, content: Uint8Array, options?: IFileWriteOptions) => Promise<void>;
    /**
     * Delete a file or directory
     * @param uri - URI of the file/directory to delete
     * @returns Promise that resolves when deletion is complete
     */
    delete: (uri: URI) => Promise<void>;
    /**
     * Copy a file or directory
     * @param source - Source URI
     * @param destination - Destination URI
     * @returns Promise that resolves when copy is complete
     */
    copy: (source: URI, destination: URI) => Promise<void>;
    /**
     * Move/rename a file or directory
     * @param source - Source URI
     * @param destination - Destination URI
     * @returns Promise that resolves when move is complete
     */
    move: (source: URI, destination: URI) => Promise<void>;
    /**
     * List directory contents
     * @param uri - URI of the directory to read
     * @returns Promise resolving to array of [name, FileType] tuples
     */
    readdir: (uri: URI) => Promise<[string, FileType][]>;
    /**
     * Create a directory
     * @param uri - URI of the directory to create
     * @param options - Options (e.g., recursive creation)
     * @returns Promise that resolves when directory is created
     */
    mkdir: (uri: URI, options?: {
        recursive: boolean;
    }) => Promise<void>;
    /**
     * Remove a directory
     * @param uri - URI of the directory to remove
     * @returns Promise that resolves when directory is removed
     */
    rmdir: (uri: URI) => Promise<void>;
    /**
     * Get file/directory statistics
     * @param uri - URI of the file/directory to stat
     * @returns Promise resolving to file statistics
     */
    stat: (uri: URI) => Promise<IStat>;
    /**
     * Watch file/directory for changes
     * @param uri - URI to watch
     * @param options - Watch options
     * @returns Disposable for stopping the watch
     */
    watch?: (uri: URI, options: IWatchOptions) => IDisposable;
}
/**
 * Base error type for file system operations
 */
export declare class FileSystemError extends Error {
    readonly code: FileSystemErrorCode;
    constructor(message: string, code: FileSystemErrorCode);
}
/**
 * Error codes for file system operations
 */
export declare enum FileSystemErrorCode {
    /** File not found */
    FileNotFound = "FileNotFound",
    /** File already exists */
    FileExists = "FileExists",
    /** Permission denied */
    NoPermissions = "NoPermissions",
    /** Invalid file path or URI */
    InvalidPath = "InvalidPath",
    /** Operation not supported */
    NotSupported = "NotSupported",
    /** Unknown error */
    Unknown = "Unknown"
}
//# sourceMappingURL=FileSystemType.d.ts.map