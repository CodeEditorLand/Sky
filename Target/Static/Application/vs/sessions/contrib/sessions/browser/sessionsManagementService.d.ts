import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ISessionOpenOptions } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsOpener.js';
import { IChatWidgetService } from '../../../../workbench/contrib/chat/browser/chat.js';
import { IChatSessionsService } from '../../../../workbench/contrib/chat/common/chatSessionsService.js';
import { IChatService } from '../../../../workbench/contrib/chat/common/chatService/chatService.js';
import { IAgentSessionsService } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { AgentSessionProviders } from '../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js';
import { INewSession } from '../../chat/browser/newSession.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILanguageModelsService } from '../../../../workbench/contrib/chat/common/languageModels.js';
export declare const IsNewChatSessionContext: RawContextKey<boolean>;
/**
 * An active session item extends IChatSessionItem with repository information.
 * - For agent session items: repository is the workingDirectory from metadata
 * - For new sessions: repository comes from the session option with id 'repository'
 */
export interface IActiveSessionItem {
    readonly resource: URI;
    readonly isUntitled: boolean;
    readonly label: string | undefined;
    readonly repository: URI | undefined;
    readonly worktree: URI | undefined;
    readonly providerType: string;
}
export interface ISessionsManagementService {
    readonly _serviceBrand: undefined;
    /**
     * Observable for the currently active session.
     */
    readonly activeSession: IObservable<IActiveSessionItem | undefined>;
    /**
     * Returns the currently active session, if any.
     */
    getActiveSession(): IActiveSessionItem | undefined;
    /**
     * Select an existing session as the active session.
     * Sets `isNewChatSession` context to false and opens the session.
     */
    openSession(sessionResource: URI, openOptions?: ISessionOpenOptions): Promise<void>;
    /**
     * Switch to the new-session view.
     * No-op if the current session is already a new session.
     */
    openNewSessionView(): void;
    /**
     * Create a pending session object for the given target type.
     * Local sessions collect options locally; remote sessions notify the extension.
     */
    createNewSessionForTarget(target: AgentSessionProviders, sessionResource: URI, defaultRepoUri?: URI): Promise<INewSession>;
    /**
     * Open a new session, apply options, and send the initial request.
     * Looks up the session by resource URI and builds send options from it.
     * When `openNewSessionView` is true, opens a new session view after sending
     * instead of navigating to the newly created session.
     */
    sendRequestForNewSession(sessionResource: URI, options?: {
        openNewSessionView?: boolean;
    }): Promise<void>;
    /**
     * Commit files in a worktree and refresh the agent sessions model
     * so the Changes view reflects the update.
     */
    commitWorktreeFiles(session: IActiveSessionItem, fileUris: URI[]): Promise<void>;
}
export declare const ISessionsManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISessionsManagementService>;
export declare class SessionsManagementService extends Disposable implements ISessionsManagementService {
    private readonly storageService;
    private readonly uriIdentityService;
    private readonly agentSessionsService;
    private readonly chatSessionsService;
    private readonly chatWidgetService;
    private readonly chatService;
    private readonly instantiationService;
    private readonly logService;
    private readonly commandService;
    private readonly languageModelsService;
    readonly _serviceBrand: undefined;
    private readonly _activeSession;
    readonly activeSession: IObservable<IActiveSessionItem | undefined>;
    private readonly _newActiveSessionDisposables;
    private readonly _newSession;
    private lastSelectedSession;
    private readonly isNewChatSessionContext;
    constructor(storageService: IStorageService, uriIdentityService: IUriIdentityService, agentSessionsService: IAgentSessionsService, chatSessionsService: IChatSessionsService, chatWidgetService: IChatWidgetService, chatService: IChatService, instantiationService: IInstantiationService, logService: ILogService, contextKeyService: IContextKeyService, commandService: ICommandService, languageModelsService: ILanguageModelsService);
    private refreshActiveSessionFromModel;
    private showNextSession;
    private getRepositoryFromMetadata;
    private getRepositoryFromSessionOption;
    getActiveSession(): IActiveSessionItem | undefined;
    openSession(sessionResource: URI, openOptions?: ISessionOpenOptions): Promise<void>;
    createNewSessionForTarget(target: AgentSessionProviders, sessionResource: URI, defaultRepoUri?: URI): Promise<INewSession>;
    /**
     * Open an existing agent session - set it as active and reveal it.
     */
    private openExistingSession;
    /**
     * Open a new remote session - load the model first, then show it in the ChatViewPane.
     */
    private openNewSession;
    sendRequestForNewSession(sessionResource: URI, options?: {
        openNewSessionView?: boolean;
    }): Promise<void>;
    private doSendRequestForNewSession;
    openNewSessionView(): void;
    private setActiveSession;
    private doSetActiveSession;
    private equalsSessionItem;
    commitWorktreeFiles(session: IActiveSessionItem, fileUris: URI[]): Promise<void>;
    private loadLastSelectedSession;
    private saveLastSelectedSession;
}
