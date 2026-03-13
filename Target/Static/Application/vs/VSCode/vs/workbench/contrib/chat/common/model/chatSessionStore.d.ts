import { Disposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IUserDataProfilesService } from '../../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { IWorkspaceEditingService } from '../../../../services/workspaces/common/workspaceEditing.js';
import { IChatSessionStats, IChatSessionTiming, ResponseModelState } from '../chatService/chatService.js';
import { ChatAgentLocation } from '../constants.js';
import { ChatModel, ISerializableChatData, ISerializableChatsData, ISerializedChatDataReference } from './chatModel.js';
export declare class ChatSessionStore extends Disposable {
    private readonly fileService;
    private readonly environmentService;
    private readonly logService;
    private readonly workspaceContextService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly lifecycleService;
    private readonly userDataProfilesService;
    private readonly configurationService;
    private readonly workspaceEditingService;
    private readonly dialogService;
    private readonly openerService;
    private storageRoot;
    private readonly previousEmptyWindowStorageRoot;
    private readonly transferredSessionStorageRoot;
    private readonly storeQueue;
    private storeTask;
    private shuttingDown;
    constructor(fileService: IFileService, environmentService: IEnvironmentService, logService: ILogService, workspaceContextService: IWorkspaceContextService, telemetryService: ITelemetryService, storageService: IStorageService, lifecycleService: ILifecycleService, userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService, workspaceEditingService: IWorkspaceEditingService, dialogService: IDialogService, openerService: IOpenerService);
    private handleWorkspaceTransition;
    private migrateSessionsToNewWorkspace;
    storeSessions(sessions: ChatModel[]): Promise<void>;
    storeSessionsMetadataOnly(sessions: ChatModel[]): Promise<void>;
    storeTransferSession(transferData: IChatTransfer, session: ChatModel): Promise<void>;
    private getTransferredSessionIndex;
    private static readonly TRANSFER_EXPIRATION_MS;
    getTransferredSessionData(): URI | undefined;
    readTransferredSession(sessionResource: URI): Promise<ISerializedChatDataReference | undefined>;
    private cleanupTransferredSession;
    private _didReportIssue;
    private writeSession;
    private writeSessionMetadataOnly;
    private flushIndex;
    private getIndexStorageScope;
    private trimEntries;
    private internalDeleteSession;
    hasSessions(): boolean;
    isSessionEmpty(sessionId: string): boolean;
    deleteSession(sessionId: string): Promise<void>;
    clearAllSessions(): Promise<void>;
    setSessionTitle(sessionId: string, title: string): Promise<void>;
    private reportError;
    private indexCache;
    private internalGetIndex;
    getIndex(): Promise<IChatSessionIndex>;
    getMetadataForSessionSync(sessionResource: URI): IChatSessionEntryMetadata | undefined;
    private getIndexKey;
    logIndex(): void;
    migrateDataIfNeeded(getInitialData: () => ISerializableChatsData | undefined): Promise<void>;
    private migrate;
    readSession(sessionId: string): Promise<ISerializedChatDataReference | undefined>;
    private readSessionFromLocation;
    private readSessionFromPreviousLocation;
    private getStorageLocation;
    private getTransferredSessionStorageLocation;
    getChatStorageFolder(): URI;
}
export interface IChatSessionEntryMetadata {
    sessionId: string;
    title: string;
    lastMessageDate: number;
    timing: IChatSessionTiming;
    initialLocation?: ChatAgentLocation;
    hasPendingEdits?: boolean;
    stats?: IChatSessionStats;
    lastResponseState: ResponseModelState;
    /**
     * This only exists because the migrated data from the storage service had empty sessions persisted, and it's impossible to know which ones are
     * currently in use. Now, `clearSession` deletes empty sessions, so old ones shouldn't take up space in the store anymore, but we still need to
     * filter the old ones out of history.
     */
    isEmpty?: boolean;
    /**
     * Whether this session was loaded from an external provider (eg background/cloud sessions).
     */
    isExternal?: boolean;
}
export type IChatSessionIndex = Record<string, IChatSessionEntryMetadata>;
export interface IChatTransfer {
    toWorkspace: URI;
    sessionResource: URI;
    timestampInMilliseconds: number;
}
export interface IChatTransfer2 extends IChatTransfer {
    chat: ISerializableChatData;
}
