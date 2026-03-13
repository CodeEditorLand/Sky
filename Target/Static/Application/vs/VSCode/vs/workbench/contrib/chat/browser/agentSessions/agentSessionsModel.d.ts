import { Event } from '../../../../../base/common/event.js';
import { IMarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { MarshalledId } from '../../../../../base/common/marshallingIds.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI } from '../../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { ChatSessionStatus as AgentSessionStatus, IChatSessionItem, IChatSessionsService } from '../../common/chatSessionsService.js';
import { IChatWidgetService } from '../chat.js';
export { ChatSessionStatus as AgentSessionStatus, isSessionInProgressStatus } from '../../common/chatSessionsService.js';
export interface IAgentSessionsModel {
    readonly onWillResolve: Event<void>;
    readonly onDidResolve: Event<void>;
    readonly onDidChangeSessions: Event<void>;
    readonly onDidChangeSessionArchivedState: Event<IAgentSession>;
    readonly resolved: boolean;
    readonly sessions: IAgentSession[];
    getSession(resource: URI): IAgentSession | undefined;
    resolve(provider: string | string[] | undefined): Promise<void>;
}
interface IAgentSessionData extends Omit<IChatSessionItem, 'archived' | 'iconPath'> {
    readonly providerType: string;
    readonly providerLabel: string;
    readonly resource: URI;
    readonly status: AgentSessionStatus;
    readonly tooltip?: string | IMarkdownString;
    readonly label: string;
    readonly description?: string | IMarkdownString;
    readonly badge?: string | IMarkdownString;
    readonly icon: ThemeIcon;
    readonly timing: IChatSessionItem['timing'];
    readonly changes?: IChatSessionItem['changes'];
}
/**
 * Checks if the provided changes object represents valid diff information.
 */
export declare function hasValidDiff(changes: IAgentSession['changes']): boolean;
/**
 * Gets a summary of agent session changes, converting from array format to object format if needed.
 */
export declare function getAgentChangesSummary(changes: IAgentSession['changes']): {
    files: number;
    insertions: number;
    deletions: number;
} | undefined;
export interface IAgentSession extends IAgentSessionData {
    isArchived(): boolean;
    setArchived(archived: boolean): void;
    isRead(): boolean;
    setRead(read: boolean): void;
}
export declare function isLocalAgentSessionItem(session: IAgentSession): boolean;
export declare function isAgentSession(obj: unknown): obj is IAgentSession;
export declare function isAgentSessionsModel(obj: unknown): obj is IAgentSessionsModel;
export declare const enum AgentSessionSection {
    Today = "today",
    Yesterday = "yesterday",
    Week = "week",
    Older = "older",
    Archived = "archived",
    More = "more",
    Repository = "repository"
}
export interface IAgentSessionSection {
    readonly section: AgentSessionSection;
    readonly label: string;
    readonly sessions: IAgentSession[];
}
export declare function isAgentSessionSection(obj: unknown): obj is IAgentSessionSection;
export interface IMarshalledAgentSessionContext {
    readonly $mid: MarshalledId.AgentSessionContext;
    readonly session: IAgentSession;
    readonly sessions: IAgentSession[];
}
export declare function isMarshalledAgentSessionContext(thing: unknown): thing is IMarshalledAgentSessionContext;
export declare class AgentSessionsModel extends Disposable implements IAgentSessionsModel {
    private readonly chatSessionsService;
    private readonly lifecycleService;
    private readonly instantiationService;
    private readonly storageService;
    private readonly productService;
    private readonly chatWidgetService;
    private readonly workspaceContextService;
    private readonly workspaceTrustManagementService;
    private readonly _onWillResolve;
    readonly onWillResolve: Event<void>;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<void>;
    private readonly _onDidChangeSessions;
    readonly onDidChangeSessions: Event<void>;
    private readonly _onDidChangeSessionArchivedState;
    readonly onDidChangeSessionArchivedState: Event<IAgentSession>;
    private _resolved;
    get resolved(): boolean;
    private _sessions;
    get sessions(): IAgentSession[];
    private readonly resolver;
    private readonly providersToResolve;
    private readonly cache;
    private readonly logger;
    constructor(chatSessionsService: IChatSessionsService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, storageService: IStorageService, productService: IProductService, chatWidgetService: IChatWidgetService, workspaceContextService: IWorkspaceContextService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
    private registerListeners;
    getSession(resource: URI): IAgentSession | undefined;
    resolve(provider: string | string[] | undefined): Promise<void>;
    private doResolve;
    /**
     * Update the sessions by fetching from the service. This does not trigger an explicit refresh
     */
    private updateItems;
    private toAgentSession;
    private static readonly UNREAD_MARKER;
    private readonly sessionStates;
    private isArchived;
    private setArchived;
    private isRead;
    private sessionTimeForReadStateTracking;
    private setRead;
    private static readonly READ_DATE_BASELINE_KEY;
    private readonly readDateBaseline;
    private resolveReadDateBaseline;
}
