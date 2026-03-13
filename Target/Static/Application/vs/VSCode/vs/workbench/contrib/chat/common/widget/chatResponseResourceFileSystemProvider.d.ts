import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ReadableStreamEvents } from '../../../../../base/common/stream.js';
import { URI } from '../../../../../base/common/uri.js';
import { FileSystemProviderCapabilities, FileType, IFileService, IFileSystemProvider, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IStat } from '../../../../../platform/files/common/files.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatService } from '../chatService/chatService.js';
export declare const IChatResponseResourceFileSystemProvider: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatResponseResourceFileSystemProvider>;
export interface IChatResponseResourceFileSystemProvider extends IFileSystemProvider {
    readonly _serviceBrand: undefined;
    /**
     * Associates arbitrary data with a URI in the chat response resource filesystem.
     * The data is scoped to the given session and automatically cleaned up when
     * the session is disposed.
     * Returns a URI that can later be read via the file service.
     */
    associate(sessionResource: URI, data: Uint8Array | {
        base64: string;
    }, name?: string): URI;
}
export declare class ChatResponseResourceFileSystemProvider extends Disposable implements IChatResponseResourceFileSystemProvider, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileReadStreamCapability {
    private readonly chatService;
    private readonly _fileService;
    readonly _serviceBrand: undefined;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    readonly capabilities: FileSystemProviderCapabilities;
    /** In-memory store for data associated via {@link associate}, keyed by URI. */
    private readonly _associated;
    /** Tracks which associated URIs belong to which session, for cleanup on dispose. */
    private readonly _sessionAssociations;
    constructor(chatService: IChatService, _fileService: IFileService);
    associate(sessionResource: URI, data: Uint8Array | {
        base64: string;
    }, name?: string): URI;
    readFile(resource: URI): Promise<Uint8Array>;
    readFileStream(resource: URI): ReadableStreamEvents<Uint8Array>;
    stat(resource: URI): Promise<IStat>;
    delete(): Promise<void>;
    watch(): IDisposable;
    mkdir(): Promise<void>;
    readdir(): Promise<[string, FileType][]>;
    rename(): Promise<void>;
    writeFile(): Promise<void>;
    private findMatchingInvocation;
    private lookupURI;
}
export declare class ChatResponseResourceWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chatResponseResourceWorkbenchContribution";
    constructor(chatResponseResourceFsProvider: IChatResponseResourceFileSystemProvider, fileService: IFileService);
}
