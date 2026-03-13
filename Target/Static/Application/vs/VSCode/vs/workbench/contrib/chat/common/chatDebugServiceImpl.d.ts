import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ChatDebugLogLevel, IChatDebugEvent, IChatDebugLogProvider, IChatDebugResolvedEventContent, IChatDebugService } from './chatDebugService.js';
export declare class ChatDebugServiceImpl extends Disposable implements IChatDebugService {
    readonly _serviceBrand: undefined;
    static readonly MAX_EVENTS_PER_SESSION = 10000;
    static readonly MAX_SESSIONS = 5;
    /** Per-session event buffers. Ordered from oldest to newest session (LRU). */
    private readonly _sessionBuffers;
    /** Ordered list of session URIs for LRU eviction. */
    private readonly _sessionOrder;
    private readonly _onDidAddEvent;
    readonly onDidAddEvent: Event<IChatDebugEvent>;
    private readonly _onDidClearProviderEvents;
    readonly onDidClearProviderEvents: Event<URI>;
    private readonly _onDidAttachDebugData;
    readonly onDidAttachDebugData: Event<URI>;
    private readonly _debugDataAttachedSessions;
    private readonly _providers;
    private readonly _invocationCts;
    /** Events that were returned by providers (not internally logged). */
    private readonly _providerEvents;
    /** Session URIs created via import, allowed through the invokeProviders guard. */
    private readonly _importedSessions;
    /** Human-readable titles for imported sessions. */
    private readonly _importedSessionTitles;
    activeSessionResource: URI | undefined;
    log(sessionResource: URI, name: string, details?: string, level?: ChatDebugLogLevel, options?: {
        id?: string;
        category?: string;
        parentEventId?: string;
    }): void;
    addEvent(event: IChatDebugEvent): void;
    addProviderEvent(event: IChatDebugEvent): void;
    getEvents(sessionResource?: URI): readonly IChatDebugEvent[];
    getSessionResources(): readonly URI[];
    clear(): void;
    /** Remove all ancillary state for an evicted session. */
    private _evictSession;
    registerProvider(provider: IChatDebugLogProvider): IDisposable;
    hasInvokedProviders(sessionResource: URI): boolean;
    invokeProviders(sessionResource: URI): Promise<void>;
    private _invokeProvider;
    endSession(sessionResource: URI): void;
    private _clearProviderEvents;
    markDebugDataAttached(sessionResource: URI): void;
    hasAttachedDebugData(sessionResource: URI): boolean;
    resolveEvent(eventId: string): Promise<IChatDebugResolvedEventContent | undefined>;
    isCoreEvent(event: IChatDebugEvent): boolean;
    setImportedSessionTitle(sessionResource: URI, title: string): void;
    getImportedSessionTitle(sessionResource: URI): string | undefined;
    exportLog(sessionResource: URI): Promise<Uint8Array | undefined>;
    importLog(data: Uint8Array): Promise<URI | undefined>;
    dispose(): void;
}
