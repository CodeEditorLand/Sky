import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { IChatDebugService } from '../chatDebugService.js';
import { IMcpService } from '../../../mcp/common/mcpTypes.js';
import { IChatAgentService } from '../participants/chatAgents.js';
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IExportableChatData, ISerializableChatData } from '../model/chatModel.js';
import { IParsedChatRequest } from '../requestParser/chatParserTypes.js';
import { ChatRequestQueueKind, ChatSendResult, IChatCompleteResponse, IChatDetail, IChatModelReference, IChatProgress, IChatSendRequestOptions, IChatService, IChatSessionContext, IChatSessionStartOptions, IChatUserActionEvent } from './chatService.js';
import { IChatSessionsService } from '../chatSessionsService.js';
import { IChatSlashCommandService } from '../participants/chatSlashCommands.js';
import { IChatTransferService } from '../model/chatTransferService.js';
import { ChatAgentLocation } from '../constants.js';
import { ILanguageModelsService } from '../languageModels.js';
import { IPromptsService } from '../promptSyntax/service/promptsService.js';
export declare class ChatService extends Disposable implements IChatService {
    private readonly storageService;
    private readonly logService;
    private readonly telemetryService;
    private readonly extensionService;
    private readonly instantiationService;
    private readonly workspaceContextService;
    private readonly chatSlashCommandService;
    private readonly chatAgentService;
    private readonly configurationService;
    private readonly chatTransferService;
    private readonly chatSessionService;
    private readonly mcpService;
    private readonly promptsService;
    private readonly chatEntitlementService;
    private readonly languageModelsService;
    private readonly chatDebugService;
    _serviceBrand: undefined;
    private readonly _sessionModels;
    private readonly _pendingRequests;
    private readonly _queuedRequestDeferreds;
    private _saveModelsEnabled;
    private _transferredSessionResource;
    get transferredSessionResource(): URI | undefined;
    private readonly _onDidSubmitRequest;
    readonly onDidSubmitRequest: Event<{
        readonly chatSessionResource: URI;
        readonly message?: IParsedChatRequest;
    }>;
    get onDidCreateModel(): Event<ChatModel>;
    private readonly _onDidPerformUserAction;
    readonly onDidPerformUserAction: Event<IChatUserActionEvent>;
    private readonly _onDidReceiveQuestionCarouselAnswer;
    readonly onDidReceiveQuestionCarouselAnswer: Event<{
        requestId: string;
        resolveId: string;
        answers: Record<string, unknown> | undefined;
    }>;
    private readonly _onDidDisposeSession;
    readonly onDidDisposeSession: Event<{
        readonly sessionResource: URI[];
        reason: "cleared";
    }>;
    private readonly _sessionFollowupCancelTokens;
    private readonly _chatServiceTelemetry;
    private readonly _chatSessionStore;
    readonly requestInProgressObs: IObservable<boolean>;
    readonly chatModels: IObservable<Iterable<IChatModel>>;
    /**
     * For test use only
     */
    setSaveModelsEnabled(enabled: boolean): void;
    /**
     * For test use only
     */
    waitForModelDisposals(): Promise<void>;
    get edits2Enabled(): boolean;
    private get isEmptyWindow();
    constructor(storageService: IStorageService, logService: ILogService, telemetryService: ITelemetryService, extensionService: IExtensionService, instantiationService: IInstantiationService, workspaceContextService: IWorkspaceContextService, chatSlashCommandService: IChatSlashCommandService, chatAgentService: IChatAgentService, configurationService: IConfigurationService, chatTransferService: IChatTransferService, chatSessionService: IChatSessionsService, mcpService: IMcpService, promptsService: IPromptsService, chatEntitlementService: IChatEntitlementService, languageModelsService: ILanguageModelsService, chatDebugService: IChatDebugService);
    get editingSessions(): import("../editing/chatEditingService.js").IChatEditingSession[];
    isEnabled(location: ChatAgentLocation): boolean;
    private migrateData;
    private saveState;
    /**
     * Only persist local sessions from chat that are not imported.
     */
    private shouldStoreSession;
    notifyUserAction(action: IChatUserActionEvent): void;
    notifyQuestionCarouselAnswer(requestId: string, resolveId: string, answers: Record<string, unknown> | undefined): void;
    setChatSessionTitle(sessionResource: URI, title: string): Promise<void>;
    private trace;
    private info;
    private error;
    private deserializeChats;
    /**
     * todo@connor4312 This will be cleaned up with the globalization of edits.
     */
    private reviveSessionsWithEdits;
    /**
     * Returns an array of chat details for all persisted chat sessions that have at least one request.
     * Chat sessions that have already been loaded into the chat view are excluded from the result.
     * Imported chat sessions are also excluded from the result.
     * TODO this is only used by the old "show chats" command which can be removed when the pre-agents view
     * options are removed.
     */
    getLocalSessionHistory(): Promise<IChatDetail[]>;
    /**
     * Returns an array of chat details for all local live chat sessions.
     */
    getLiveSessionItems(): Promise<IChatDetail[]>;
    /**
     * Returns an array of chat details for all local chat sessions in history (not currently loaded).
     */
    getHistorySessionItems(): Promise<IChatDetail[]>;
    getMetadataForSession(sessionResource: URI): Promise<IChatDetail | undefined>;
    private shouldBeInHistory;
    removeHistoryEntry(sessionResource: URI): Promise<void>;
    clearAllHistoryEntries(): Promise<void>;
    startNewLocalSession(location: ChatAgentLocation, options?: IChatSessionStartOptions): IChatModelReference;
    private _startSession;
    private initializeSession;
    activateDefaultAgent(location: ChatAgentLocation): Promise<void>;
    getSession(sessionResource: URI): IChatModel | undefined;
    acquireExistingSession(sessionResource: URI): IChatModelReference | undefined;
    private acquireOrRestoreLocalSession;
    getSessionTitle(sessionResource: URI): string | undefined;
    loadSessionFromData(data: IExportableChatData | ISerializableChatData): IChatModelReference;
    acquireOrLoadSession(sessionResource: URI, location: ChatAgentLocation, token: CancellationToken): Promise<IChatModelReference | undefined>;
    private loadRemoteSession;
    getChatSessionFromInternalUri(sessionResource: URI): IChatSessionContext | undefined;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    private queuePendingRequest;
    sendRequest(sessionResource: URI, request: string, options?: IChatSendRequestOptions): Promise<ChatSendResult>;
    private parseChatRequest;
    private refreshFollowupsCancellationToken;
    private _sendRequestAsync;
    processPendingRequests(sessionResource: URI): void;
    /**
     * Process the next pending request from the model's queue, if any.
     * Called after a request completes to continue processing queued requests.
     */
    private processNextPendingRequest;
    private generateInitialChatTitleIfNeeded;
    private prepareContext;
    private getHistoryEntriesFromModel;
    removeRequest(sessionResource: URI, requestId: string): Promise<void>;
    adoptRequest(sessionResource: URI, request: IChatRequestModel): Promise<void>;
    addCompleteRequest(sessionResource: URI, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): Promise<void>;
    cancelCurrentRequestForSession(sessionResource: URI, source?: string): void;
    setYieldRequested(sessionResource: URI): void;
    removePendingRequest(sessionResource: URI, requestId: string): void;
    setPendingRequests(sessionResource: URI, requests: readonly {
        requestId: string;
        kind: ChatRequestQueueKind;
    }[]): void;
    hasSessions(): boolean;
    transferChatSession(transferredSessionResource: URI, toWorkspace: URI): Promise<void>;
    getChatStorageFolder(): URI;
    logChatIndex(): void;
    setSessionTitle(sessionResource: URI, title: string): void;
    appendProgress(request: IChatRequestModel, progress: IChatProgress): void;
    private toLocalSessionId;
}
