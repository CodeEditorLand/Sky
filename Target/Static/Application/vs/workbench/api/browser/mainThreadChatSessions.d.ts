import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IObservable } from '../../../base/common/observable.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IAgentSessionsService } from '../../contrib/chat/browser/agentSessions/agentSessionsService.js';
import { IChatWidgetService } from '../../contrib/chat/browser/chat.js';
import { IChatContentInlineReference, IChatProgress, IChatService } from '../../contrib/chat/common/chatService/chatService.js';
import { IChatSession, IChatSessionHistoryItem, IChatSessionItem, IChatSessionProviderOptionItem, IChatSessionsService } from '../../contrib/chat/common/chatSessionsService.js';
import { IChatAgentRequest } from '../../contrib/chat/common/participants/chatAgents.js';
import { IChatTodoListService } from '../../contrib/chat/common/tools/chatTodoListService.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { Dto } from '../../services/extensions/common/proxyIdentifier.js';
import { ExtHostChatSessionsShape, IChatProgressDto, IChatSessionItemsChange, MainThreadChatSessionsShape } from '../common/extHost.protocol.js';
export declare class ObservableChatSession extends Disposable implements IChatSession {
    readonly sessionResource: URI;
    readonly providerHandle: number;
    readonly history: Array<IChatSessionHistoryItem>;
    title?: string;
    private _options?;
    get options(): Record<string, string | IChatSessionProviderOptionItem> | undefined;
    private readonly _progressObservable;
    private readonly _isCompleteObservable;
    private readonly _onWillDispose;
    readonly onWillDispose: import("../../../base/common/event.js").Event<void>;
    private readonly _pendingProgressChunks;
    private _isInitialized;
    private _interruptionWasCanceled;
    private _disposalPending;
    private _initializationPromise?;
    interruptActiveResponseCallback?: () => Promise<boolean>;
    requestHandler?: (request: IChatAgentRequest, progress: (progress: IChatProgress[]) => void, history: any[], token: CancellationToken) => Promise<void>;
    private readonly _proxy;
    private readonly _providerHandle;
    private readonly _logService;
    private readonly _dialogService;
    get progressObs(): IObservable<IChatProgress[]>;
    get isCompleteObs(): IObservable<boolean>;
    constructor(resource: URI, providerHandle: number, proxy: ExtHostChatSessionsShape, logService: ILogService, dialogService: IDialogService);
    initialize(token: CancellationToken): Promise<void>;
    private _doInitializeContent;
    /**
     * Handle progress chunks coming from the extension host.
     * If the session is not initialized yet, the chunks will be queued.
     */
    handleProgressChunk(requestId: string, progress: IChatProgress[]): void;
    /**
     * Handle progress completion from the extension host.
     */
    handleProgressComplete(requestId: string): void;
    private _addProgress;
    private _markComplete;
    dispose(): void;
}
export declare class MainThreadChatSessions extends Disposable implements MainThreadChatSessionsShape {
    private readonly _extHostContext;
    private readonly _agentSessionsService;
    private readonly _chatSessionsService;
    private readonly _chatService;
    private readonly _chatWidgetService;
    private readonly _chatTodoListService;
    private readonly _dialogService;
    private readonly _editorService;
    private readonly editorGroupService;
    private readonly _logService;
    private readonly _itemControllerRegistrations;
    private readonly _contentProvidersRegistrations;
    private readonly _sessionTypeToHandle;
    private readonly _activeSessions;
    private readonly _sessionDisposables;
    private readonly _proxy;
    constructor(_extHostContext: IExtHostContext, _agentSessionsService: IAgentSessionsService, _chatSessionsService: IChatSessionsService, _chatService: IChatService, _chatWidgetService: IChatWidgetService, _chatTodoListService: IChatTodoListService, _dialogService: IDialogService, _editorService: IEditorService, editorGroupService: IEditorGroupsService, _logService: ILogService);
    private _getHandleForSessionType;
    $registerChatSessionItemController(handle: number, chatSessionType: string): void;
    private getController;
    $onDidChangeChatSessionItems(handle: number): void;
    private _resolveSessionItem;
    $updateChatSessionItems(controllerHandle: number, change: IChatSessionItemsChange): Promise<void>;
    $addOrUpdateChatSessionItem(controllerHandle: number, item: Dto<IChatSessionItem>): Promise<void>;
    $onDidChangeChatSessionOptions(handle: number, sessionResourceComponents: UriComponents, updates: ReadonlyArray<{
        optionId: string;
        value: string;
    }>): void;
    $onDidCommitChatSessionItem(handle: number, originalComponents: UriComponents, modifiedCompoennts: UriComponents): Promise<void>;
    private handleSessionModelOverrides;
    private _provideChatSessionContent;
    $unregisterChatSessionItemController(handle: number): void;
    $registerChatSessionContentProvider(handle: number, chatSessionScheme: string): void;
    $unregisterChatSessionContentProvider(handle: number): void;
    $handleProgressChunk(handle: number, sessionResource: UriComponents, requestId: string, chunks: (IChatProgressDto | [IChatProgressDto, number])[]): Promise<void>;
    $handleProgressComplete(handle: number, sessionResource: UriComponents, requestId: string): void;
    $handleAnchorResolve(handle: number, sesssionResource: UriComponents, requestId: string, requestHandle: string, anchor: Dto<IChatContentInlineReference>): void;
    $onDidChangeChatSessionProviderOptions(handle: number): void;
    private _refreshProviderOptions;
    dispose(): void;
    private _reviveTooltip;
    /**
     * Notify the extension about option changes for a session
     */
    notifyOptionsChange(handle: number, sessionResource: URI, updates: ReadonlyArray<{
        optionId: string;
        value: string | IChatSessionProviderOptionItem | undefined;
    }>): Promise<void>;
}
