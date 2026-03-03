/**
 * @module FileSystem/Implementation/FileSystemProviderImplementation
 * @description
 * Implementation of the FileSystemProvider service using Tauri IPC to communicate with Mountain.
 * @see {@link FileSystem/Interface/FileSystemProviderService} Service interface
 * @category Implementation
 */
import { Layer, Context } from "effect";
import type { FileSystemProviderService } from "../Interface/FileSystemProvider";
/**
 * Mountain IPC command names for file system operations
 * These must match the commands defined in Element/Mountain/Source/IPC/WindServiceHandlers.rs
 */
declare const MountainCommands: {
    readonly READ: "file:read";
    readonly WRITE: "file:write";
    readonly STAT: "file:stat";
    readonly DELETE: "file:delete";
    readonly MKDIR: "file:mkdir";
    readonly RMDIR: "file:delete";
    readonly READDIR: "file:readdir";
    readonly COPY: "file:copy";
    readonly MOVE: "file:move";
};
/**
 * Tag for accessing the FileSystemProvider service
 */
export declare const FileSystemProviderTag: Context.Tag<FileSystemProviderService, FileSystemProviderService>;
/**
 * Live implementation layer for FileSystemProvider service.
 * Accesses Mountain's file system operations through Wind's IPC service.
 */
export declare const FileSystemProviderLive: Layer.Layer<FileSystemProviderService, never, import("../../Effect").IPC>;
export { MountainCommands };
export default FileSystemProviderLive;
//# sourceMappingURL=FileSystemProviderImplementation.d.ts.map