/**
 * @module FileSystemPolyfill
 *
 * @description
 * Polyfill for Node.js fs module in the renderer sandbox.
 * Maps fs operations to Mountain file system commands.
 *
 * @feature_set
 * - readFile(path, encoding) → Mountain file:read
 * - writeFile(path, data, encoding) → Mountain file:write
 * - unlink(path) → Mountain file:delete
 * - rm(path, options) → Mountain file:delete (with recursive)
 * - rename(oldPath, newPath) → Mountain file:move
 * - copyFile(src, dest) → Mountain file:copy
 * - mkdir(path, options) → Mountain file:mkdir
 * - rmdir(path) → Mountain file:delete (rmdir)
 * - readdir(path) → Mountain file:readdir
 * - stat(path) → Mountain file:stat
 *
 * @feature_not_supported (browser/Tauri limitations)
 * - readFile(fd, buffer, offset, length, position) - No fd ops in Tauri
 * - writeFile(fd, buffer, offset, length, position) - No fd ops in Tauri
 * - open(path, flags, mode) - No fd ops in Tauri
 * - close(fd) - No fd ops in Tauri
 * - readSync, writeSync, etc. - Sync operations not supported
 * - watch, watchFile, unwatchFile - File watching requires backend service
 *
 * @phase 4 of Approach A3 implementation
 */
/**
 * File stats interface (partial Node.js fs.Stats)
 */
interface Stats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}
/**
 * Directory entry
 */
interface Dirent {
    name: string;
    path: string;
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}
/**
 * Mkdir options
 */
interface MkdirOptions {
    recursive?: boolean;
    mode?: number;
}
/**
 * Rm options
 */
interface RmOptions {
    recursive?: boolean;
    force?: boolean;
    maxRetries?: number;
    retryDelay?: number;
}
/**
 * Read file options
 */
interface ReadFileOptions {
    encoding?: BufferEncoding | null;
    flag?: string;
}
/**
 * Write file options
 */
interface WriteFileOptions {
    encoding?: BufferEncoding | null;
    mode?: number;
    flag?: string;
}
/**
 * Copy file options
 */
interface CopyFileOptions {
    mode?: number;
    flags?: number;
}
/**
 * Read file from Mountain file system
 */
declare function readFile(path: string, options?: ReadFileOptions | BufferEncoding): Promise<string | Buffer>;
/**
 * Write file to Mountain file system
 */
declare function writeFile(path: string, data: string | Buffer, options?: WriteFileOptions | BufferEncoding): Promise<void>;
/**
 * Delete file from Mountain file system
 */
declare function unlink(path: string): Promise<void>;
/**
 * Remove file or directory (recursive)
 */
declare function rm(path: string, options?: RmOptions): Promise<void>;
/**
 * Rename/move file or directory
 */
declare function rename(oldPath: string, newPath: string): Promise<void>;
/**
 * Copy file
 */
declare function copyFile(src: string, dest: string, options?: CopyFileOptions): Promise<void>;
/**
 * Make directory
 */
declare function mkdir(path: string, options?: MkdirOptions | number | boolean): Promise<void>;
/**
 * Remove directory
 */
declare function rmdir(path: string): Promise<void>;
/**
 * Read directory
 */
declare function readdir(path: string, options?: {
    withFileTypes?: boolean;
}): Promise<string[] | Dirent[]>;
/**
 * Get file stats
 */
declare function stat(path: string): Promise<Stats>;
/**
 * Check if file exists
 */
declare function exists(path: string): Promise<boolean>;
/**
 * Not supported: Cannot open file descriptors in browser/Tauri
 */
declare function open(): never;
/**
 * Not supported: Cannot read from file descriptors in browser/Tauri
 */
declare function read(): never;
/**
 * Not supported: Cannot write to file descriptors in browser/Tauri
 */
declare function write(): never;
/**
 * Not supported: Cannot close file descriptors in browser/Tauri
 */
declare function close(): never;
/**
 * Not supported: Synchronous operations not supported
 */
declare function readFileSync(): never;
/**
 * Not supported: Synchronous operations not supported
 */
declare function writeFileSync(): never;
/**
 * Not supported: File watching requires backend service
 */
declare function watch(): never;
/**
 * Not supported: File watching requires backend service
 */
declare function watchFile(): never;
/**
 * Not supported: Symbolic links not fully supported in sandbox
 */
declare function symlink(): never;
/**
 * Not supported: Symbolic links not fully supported in sandbox
 */
declare function readlink(): never;
/**
 * Not supported: Cannot modify file permissions in sandbox
 */
declare function chmod(): never;
/**
 * Not supported: Cannot modify file permissions in sandbox
 */
declare function chown(): never;
/**
 * Install the file system polyfill
 */
export declare function installFileSystemPolyfill(): void;
declare const _default: {
    install: typeof installFileSystemPolyfill;
    module: {
        readFile: typeof readFile;
        writeFile: typeof writeFile;
        unlink: typeof unlink;
        rm: typeof rm;
        rename: typeof rename;
        copyFile: typeof copyFile;
        mkdir: typeof mkdir;
        rmdir: typeof rmdir;
        readdir: typeof readdir;
        stat: typeof stat;
        exists: typeof exists;
        constants: {
            O_RDONLY: number;
            O_WRONLY: number;
            O_RDWR: number;
            O_CREAT: number;
            O_TRUNC: number;
            O_APPEND: number;
        };
        open: typeof open;
        read: typeof read;
        write: typeof write;
        close: typeof close;
        readFileSync: typeof readFileSync;
        writeFileSync: typeof writeFileSync;
        watch: typeof watch;
        watchFile: typeof watchFile;
        symlink: typeof symlink;
        readlink: typeof readlink;
        chmod: typeof chmod;
        chown: typeof chown;
        promises: {
            readFile: typeof readFile;
            writeFile: typeof writeFile;
            unlink: typeof unlink;
            rm: typeof rm;
            rename: typeof rename;
            copyFile: typeof copyFile;
            mkdir: typeof mkdir;
            rmdir: typeof rmdir;
            readdir: typeof readdir;
            stat: typeof stat;
            exists: typeof exists;
        };
    };
    readFile: typeof readFile;
    writeFile: typeof writeFile;
    unlink: typeof unlink;
    rm: typeof rm;
    rename: typeof rename;
    copyFile: typeof copyFile;
    mkdir: typeof mkdir;
    rmdir: typeof rmdir;
    readdir: typeof readdir;
    stat: typeof stat;
    exists: typeof exists;
};
export default _default;
//# sourceMappingURL=FileSystemPolyfill.d.ts.map