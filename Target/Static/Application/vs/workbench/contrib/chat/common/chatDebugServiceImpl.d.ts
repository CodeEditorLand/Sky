import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ChatDebugLogLevel, IChatDebugEvent, IChatDebugLogProvider, IChatDebugResolvedEventContent, IChatDebugService } from './chatDebugService.js';
export declare class ChatDebugServiceImpl extends Disposable implements IChatDebugService {
    readonly _serviceBrand: undefined;
    private static readonly MAX_EVENTS;
    private readonly _buffer;
    private _head;
    private _size;
    private readonly _onDidAddEvent;
    readonly onDidAddEvent: Event<IChatDebugEvent>;
    private readonly _providers;
    private readonly _invocationCts;
    /** Events that were returned by providers (not internally logged). */
    private readonly _providerEvents;
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
    registerProvider(provider: IChatDebugLogProvider): IDisposable;
    invokeProviders(sessionResource: URI): Promise<void>;
    private _invokeProvider;
    endSession(sessionResource: URI): void;
    private _clearProviderEvents;
    resolveEvent(eventId: string): Promise<IChatDebugResolvedEventContent | undefined>;
    dispose(): void;
}
