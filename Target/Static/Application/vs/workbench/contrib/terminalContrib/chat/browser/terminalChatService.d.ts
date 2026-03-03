import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IChatTerminalToolProgressPart, ITerminalChatService, ITerminalInstance, ITerminalService } from '../../../terminal/browser/terminal.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IChatService } from '../../../chat/common/chatService/chatService.js';
/**
 * Used to manage chat tool invocations and the underlying terminal instances they create/use.
 */
export declare class TerminalChatService extends Disposable implements ITerminalChatService {
    private readonly _logService;
    private readonly _terminalService;
    private readonly _storageService;
    private readonly _contextKeyService;
    private readonly _chatService;
    _serviceBrand: undefined;
    private readonly _terminalInstancesByToolSessionId;
    private readonly _toolSessionIdByTerminalInstance;
    private readonly _chatSessionResourceByTerminalInstance;
    private readonly _terminalInstanceListenersByToolSessionId;
    private readonly _chatSessionListenersByTerminalInstance;
    private readonly _onDidContinueInBackground;
    readonly onDidContinueInBackground: Event<string>;
    private readonly _onDidRegisterTerminalInstanceForToolSession;
    readonly onDidRegisterTerminalInstanceWithToolSession: Event<ITerminalInstance>;
    private readonly _activeProgressParts;
    private _focusedProgressPart;
    private _mostRecentProgressPart;
    /**
     * Pending mappings restored from storage that have not yet been matched to a live terminal
     * instance (we match by persistentProcessId when it becomes available after reconnection).
     * toolSessionId -> persistentProcessId
     */
    private readonly _pendingRestoredMappings;
    private readonly _hasToolTerminalContext;
    private readonly _hasHiddenToolTerminalContext;
    /**
     * Tracks chat session resources that have auto approval enabled for all commands. This is a temporary
     * approval that lasts only for the duration of the session.
     */
    private readonly _sessionAutoApprovalEnabled;
    /**
     * Tracks session-scoped auto-approve rules per chat session. These are temporary rules that
     * last only for the duration of the chat session (not persisted to disk).
     */
    private readonly _sessionAutoApproveRules;
    constructor(_logService: ILogService, _terminalService: ITerminalService, _storageService: IStorageService, _contextKeyService: IContextKeyService, _chatService: IChatService);
    registerTerminalInstanceWithToolSession(terminalToolSessionId: string | undefined, instance: ITerminalInstance): void;
    getTerminalInstanceByToolSessionId(terminalToolSessionId: string | undefined): Promise<ITerminalInstance | undefined>;
    getToolSessionTerminalInstances(hiddenOnly?: boolean): readonly ITerminalInstance[];
    getToolSessionIdForInstance(instance: ITerminalInstance): string | undefined;
    registerTerminalInstanceWithChatSession(chatSessionResource: URI, instance: ITerminalInstance): void;
    getChatSessionResourceForInstance(instance: ITerminalInstance): URI | undefined;
    isBackgroundTerminal(terminalToolSessionId?: string): boolean;
    registerProgressPart(part: IChatTerminalToolProgressPart): IDisposable;
    setFocusedProgressPart(part: IChatTerminalToolProgressPart): void;
    clearFocusedProgressPart(part: IChatTerminalToolProgressPart): void;
    getFocusedProgressPart(): IChatTerminalToolProgressPart | undefined;
    getMostRecentProgressPart(): IChatTerminalToolProgressPart | undefined;
    private _getLastActiveProgressPart;
    private _isAfter;
    private _restoreFromStorage;
    private _tryAdoptRestoredMapping;
    private _persistToStorage;
    private _updateHasToolTerminalContextKeys;
    setChatSessionAutoApproval(chatSessionResource: URI, enabled: boolean): void;
    hasChatSessionAutoApproval(chatSessionResource: URI): boolean;
    addSessionAutoApproveRule(chatSessionResource: URI, key: string, value: boolean | {
        approve: boolean;
        matchCommandLine?: boolean;
    }): void;
    getSessionAutoApproveRules(chatSessionResource: URI): Readonly<Record<string, boolean | {
        approve: boolean;
        matchCommandLine?: boolean;
    }>>;
    continueInBackground(terminalToolSessionId: string): void;
}
