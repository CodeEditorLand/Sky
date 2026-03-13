import { Event } from '../../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileService, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat } from '../../../../../../platform/files/common/files.js';
/**
 * URI scheme for internal chat prompt files (skills, instructions, agents, etc.)
 * backed by a readonly virtual filesystem.
 */
export declare const CHAT_INTERNAL_SCHEME = "vscode-chat-internal";
/**
 * A readonly virtual filesystem provider for internal chat prompt files.
 *
 * Files are registered at startup via {@link registerFile} and cannot be
 * modified or deleted afterwards.
 */
export declare class ChatInternalFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    private readonly files;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    readonly capabilities: number;
    /**
     * Register a file with static content. Must be called before the
     * file can be read. Typically called once at startup.
     */
    registerFile(uri: URI, content: string): void;
    watch(): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void>;
    rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void>;
}
/**
 * Registers the internal chat filesystem provider with the file service,
 * populates it with built-in files, and returns both the provider (for
 * event subscription) and a disposable for cleanup.
 */
export declare function registerChatInternalFileSystem(fileService: IFileService): {
    provider: ChatInternalFileSystemProvider;
    disposable: IDisposable;
};
