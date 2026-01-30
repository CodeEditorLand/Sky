import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../base/common/observable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IMcpService } from '../../../mcp/common/mcpTypes.js';
import { IChatAgentService } from '../participants/chatAgents.js';
import { ChatModel, IChatModel, IChatRequestModel, IChatRequestVariableData, IExportableChatData, ISerializableChatData } from '../model/chatModel.js';
import { IParsedChatRequest } from '../requestParser/chatParserTypes.js';
import { IChatCompleteResponse, IChatDetail, IChatModelReference, IChatProgress, IChatSendRequestData, IChatSendRequestOptions, IChatService, IChatSessionContext, IChatSessionStartOptions, IChatUserActionEvent } from './chatService.js';
import { IChatSessionsService } from '../chatSessionsService.js';
import { IChatSlashCommandService } from '../participants/chatSlashCommands.js';
import { IChatTransferService } from '../model/chatTransferService.js';
import { ChatAgentLocation } from '../constants.js';
export declare class ChatService extends Disposable implements IChatService {
    private readonly storageService;
    private readonly logService;
    private readonly extensionService;
    private readonly instantiationService;
    private readonly workspaceContextService;
    private readonly chatSlashCommandService;
    private readonly chatAgentService;
    private readonly configurationService;
    private readonly chatTransferService;
    private readonly chatSessionService;
    private readonly mcpService;
    _serviceBrand: undefined;
    private readonly _sessionModels;
    private readonly _pendingRequests;
    private _saveModelsEnabled;
    private _transferredSessionResource;
    get transferredSessionResource(): URI | undefined;
    private readonly _onDidSubmitRequest;
    readonly onDidSubmitRequest: Event<{
        readonly chatSessionResource: URI;
    }>;
    get onDidCreateModel(): Event<ChatModel>;
    private readonly _onDidPerformUserAction;
    readonly onDidPerformUserAction: Event<IChatUserActionEvent>;
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
    constructor(storageService: IStorageService, logService: ILogService, extensionService: IExtensionService, instantiationService: IInstantiationService, workspaceContextService: IWorkspaceContextService, chatSlashCommandService: IChatSlashCommandService, chatAgentService: IChatAgentService, configurationService: IConfigurationService, chatTransferService: IChatTransferService, chatSessionService: IChatSessionsService, mcpService: IMcpService);
    get editingSessions(): import("../editing/chatEditingService.js").IChatEditingSession[];
    isEnabled(location: ChatAgentLocation): boolean;
    private migrateData;
    private saveState;
    /**
     * Only persist local sessions from chat that are not imported.
     */
    private shouldStoreSession;
    notifyUserAction(action: IChatUserActionEvent): void;
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
    startSession(location: ChatAgentLocation, options?: IChatSessionStartOptions): IChatModelReference;
    private _startSession;
    private initializeSession;
    activateDefaultAgent(location: ChatAgentLocation): Promise<void>;
    getSession(sessionResource: URI): IChatModel | undefined;
    getActiveSessionReference(sessionResource: URI): IChatModelReference | undefined;
    getOrRestoreSession(sessionResource: URI): Promise<IChatModelReference | undefined>;
    getSessionTitle(sessionResource: URI): string | undefined;
    loadSessionFromContent(data: IExportableChatData | ISerializableChatData): IChatModelReference | undefined;
    loadSessionForResource(chatSessionResource: URI, location: ChatAgentLocation, token: CancellationToken): Promise<IChatModelReference | undefined>;
    getChatSessionFromInternalUri(sessionResource: URI): IChatSessionContext | undefined;
    resendRequest(request: IChatRequestModel, options?: IChatSendRequestOptions): Promise<void>;
    sendRequest(sessionResource: URI, request: string, options?: IChatSendRequestOptions): Promise<IChatSendRequestData | undefined>;
    private parseChatRequest;
    private refreshFollowupsCancellationToken;
    private _sendRequestAsync;
    private generateInitialChatTitleIfNeeded;
    private prepareContext;
    private getHistoryEntriesFromModel;
    removeRequest(sessionResource: URI, requestId: string): Promise<void>;
    adoptRequest(sessionResource: URI, request: IChatRequestModel): Promise<void>;
    addCompleteRequest(sessionResource: URI, message: IParsedChatRequest | string, variableData: IChatRequestVariableData | undefined, attempt: number | undefined, response: IChatCompleteResponse): Promise<void>;
    cancelCurrentRequestForSession(sessionResource: URI): void;
    hasSessions(): boolean;
    transferChatSession(transferredSessionResource: URI, toWorkspace: URI): Promise<void>;
    getChatStorageFolder(): URI;
    logChatIndex(): void;
    setTitle(sessionResource: URI, title: string): void;
    appendProgress(request: IChatRequestModel, progress: IChatProgress): void;
    private toLocalSessionId;
}
