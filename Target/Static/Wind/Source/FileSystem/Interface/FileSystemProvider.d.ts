/**
 * @module FileSystem/Interface/FileSystemProvider
 * @description
 * Interface for the FileSystemProvider service.
 * Defines the service contract following Wind's architectural pattern.
 * @see {@link FileSystem/Implementation/FileSystemProviderImplementation} Default implementation
 * @category Interface
 */
import type { Effect } from "effect";
import type { IFileSystemProvider } from "../Type/FileSystemType.js";
import type { FileSystemProviderError } from "../Error/FileSystemProviderError.js";
/**
 * Service interface for FileSystemProvider operations.
 * Provides methods for file system operations via Tauri IPC to Mountain.
 */
export interface FileSystemProviderService {
    /**
     * Get the underlying IFileSystemProvider interface
     * @returns Effect that resolves to the file system provider
     */
    readonly getProvider: Effect.Effect<IFileSystemProvider, FileSystemProviderError>;
    /**
     * Read file contents as binary data
     * @param uri - URI of the file to read
     * @returns Effect resolving to file contents as Uint8Array
     */
    readonly readFile: (uri: string) => Effect.Effect<Uint8Array, FileSystemProviderError>;
    /**
     * Write data to a file
     * @param uri - URI of the file to write
     * @param content - File content as Uint8Array
     * @param options - Write options (create, overwrite)
     * @returns Effect that completes when write is complete
     */
    readonly writeFile: (uri: string, content: Uint8Array, options?: {
        create?: boolean;
        overwrite?: boolean;
    }) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * Delete a file or directory
     * @param uri - URI of the file/directory to delete
     * @returns Effect that completes when deletion is complete
     */
    readonly delete: (uri: string) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * Copy a file or directory
     * @param source - Source URI
     * @param destination - Destination URI
     * @returns Effect that completes when copy is complete
     */
    readonly copy: (source: string, destination: string) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * Move/rename a file or directory
     * @param source - Source URI
     * @param destination - Destination URI
     * @returns Effect that completes when move is complete
     */
    readonly move: (source: string, destination: string) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * List directory contents
     * @param uri - URI of the directory to read
     * @returns Effect resolving to array of [name, FileType] tuples
     */
    readonly readdir: (uri: string) => Effect.Effect<[string, number][], FileSystemProviderError>;
    /**
     * Create a directory
     * @param uri - URI of the directory to create
     * @param options - Options (e.g., recursive creation)
     * @returns Effect that completes when directory is created
     */
    readonly mkdir: (uri: string, options?: {
        recursive?: boolean;
    }) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * Remove a directory
     * @param uri - URI of the directory to remove
     * @returns Effect that completes when directory is removed
     */
    readonly rmdir: (uri: string) => Effect.Effect<void, FileSystemProviderError>;
    /**
     * Get file/directory statistics
     * @param uri - URI of the file/directory to stat
     * @returns Effect resolving to file statistics
     */
    readonly stat: (uri: string) => Effect.Effect<{
        type: number;
        size: number;
        ctime: number;
        mtime: number;
        permissions?: number;
    }, FileSystemProviderError>;
}
//# sourceMappingURL=FileSystemProvider.d.ts.map