import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IChatAgentAttachmentCapabilities, IChatAgentService } from '../../common/participants/chatAgents.js';
import { IChatNewSessionRequest, IChatSession, IChatSessionContentProvider, IChatSessionItem, IChatSessionItemController, IChatSessionItemsDelta, IChatSessionOptionsWillNotifyExtensionEvent, IChatSessionProviderOptionGroup, IChatSessionProviderOptionItem, IChatSessionsService, ResolvedChatSessionsExtensionPoint } from '../../common/chatSessionsService.js';
import { IChatModel } from '../../common/model/chatModel.js';
import { Target } from '../../common/promptSyntax/promptTypes.js';
export declare class ChatSessionsService extends Disposable implements IChatSessionsService {
    private readonly _logService;
    private readonly _chatAgentService;
    private readonly _extensionService;
    private readonly _contextKeyService;
    private readonly _menuService;
    private readonly _themeService;
    private readonly _labelService;
    readonly _serviceBrand: undefined;
    private readonly _itemControllers;
    private readonly _contributions;
    private readonly _contributionDisposables;
    private readonly _contentProviders;
    private readonly _alternativeIdMap;
    private readonly _contextKeys;
    private readonly _onDidChangeItemsProviders;
    readonly onDidChangeItemsProviders: Event<{
        readonly chatSessionType: string;
    }>;
    private readonly _onDidChangeSessionItems;
    readonly onDidChangeSessionItems: Event<IChatSessionItemsDelta>;
    private readonly _onDidChangeAvailability;
    readonly onDidChangeAvailability: Event<void>;
    private readonly _onDidChangeInProgress;
    get onDidChangeInProgress(): Event<void>;
    private readonly _onDidChangeContentProviderSchemes;
    get onDidChangeContentProviderSchemes(): Event<{
        readonly added: string[];
        readonly removed: string[];
    }>;
    private readonly _onDidChangeSessionOptions;
    get onDidChangeSessionOptions(): Event<URI>;
    private readonly _onDidChangeOptionGroups;
    get onDidChangeOptionGroups(): Event<string>;
    private readonly _onRequestNotifyExtension;
    get onRequestNotifyExtension(): Event<IChatSessionOptionsWillNotifyExtensionEvent>;
    private readonly inProgressMap;
    private readonly _sessionTypeOptions;
    private readonly _sessionTypeNewSessionOptions;
    private readonly _sessions;
    private readonly _resourceAliases;
    private readonly _hasCanDelegateProvidersKey;
    constructor(_logService: ILogService, _chatAgentService: IChatAgentService, _extensionService: IExtensionService, _contextKeyService: IContextKeyService, _menuService: IMenuService, _themeService: IThemeService, _labelService: ILabelService);
    reportInProgress(chatSessionType: string, count: number): void;
    getInProgress(): {
        displayName: string;
        count: number;
    }[];
    private updateInProgressStatus;
    private registerContribution;
    private _isContributionAvailable;
    /**
     * Resolves a session type to its primary type, checking for alternative IDs.
     * @param sessionType The session type or alternative ID to resolve
     * @returns The primary session type, or undefined if not found or not available
     */
    private _resolveToPrimaryType;
    private _registerMenuItems;
    private _registerCommands;
    private _evaluateAvailability;
    private _enableContribution;
    /**
     * Disposes of all sessions that belong to a contribution
     *
     * @returns List of session resources that were disposed.
     */
    private _disposeSessionsForContribution;
    private _registerAgent;
    getAllChatSessionContributions(): ResolvedChatSessionsExtensionPoint[];
    private _updateHasCanDelegateProvidersContextKey;
    getChatSessionContribution(chatSessionType: string): ResolvedChatSessionsExtensionPoint | undefined;
    private resolveChatSessionContribution;
    private getContributionIcon;
    private resolveIconForCurrentColorTheme;
    activateChatSessionItemProvider(chatViewType: string): Promise<void>;
    private doActivateChatSessionItemController;
    canResolveChatSession(sessionType: string): Promise<boolean>;
    private tryActivateControllers;
    getChatSessionItems(providersToResolve: readonly string[] | undefined, token: CancellationToken): AsyncIterable<{
        readonly chatSessionType: string;
        readonly items: readonly IChatSessionItem[];
    }>;
    refreshChatSessionItems(providersToResolve: readonly string[] | undefined, token: CancellationToken): Promise<void>;
    registerChatSessionItemController(chatSessionType: string, controller: IChatSessionItemController): IDisposable;
    registerChatSessionContentProvider(chatSessionType: string, provider: IChatSessionContentProvider): IDisposable;
    getInProgressSessionDescription(chatModel: IChatModel): string | undefined;
    createNewChatSessionItem(chatSessionType: string, request: IChatNewSessionRequest, token: CancellationToken): Promise<IChatSessionItem | undefined>;
    getOrCreateChatSession(sessionResource: URI, token: CancellationToken): Promise<IChatSession>;
    hasAnySessionOptions(sessionResource: URI): boolean;
    getSessionOption(sessionResource: URI, optionId: string): string | IChatSessionProviderOptionItem | undefined;
    setSessionOption(sessionResource: URI, optionId: string, value: string | IChatSessionProviderOptionItem): boolean;
    /**
     * Resolve a resource through the alias map. If the resource is a real
     * resource that has been aliased to an untitled resource, return the
     * untitled resource (the canonical key in {@link _sessions}).
     */
    private _resolveResource;
    registerSessionResourceAlias(untitledResource: URI, realResource: URI): void;
    /**
     * Store option groups for a session type
     */
    setOptionGroupsForSessionType(chatSessionType: string, handle: number, optionGroups?: IChatSessionProviderOptionGroup[]): void;
    /**
     * Get available option groups for a session type
     */
    getOptionGroupsForSessionType(chatSessionType: string): IChatSessionProviderOptionGroup[] | undefined;
    getNewSessionOptionsForSessionType(chatSessionType: string): Record<string, string | IChatSessionProviderOptionItem> | undefined;
    setNewSessionOptionsForSessionType(chatSessionType: string, options: Record<string, string | IChatSessionProviderOptionItem>): void;
    /**
     * Notify extension about option changes for a session
     */
    notifySessionOptionsChange(sessionResource: URI, updates: ReadonlyArray<{
        optionId: string;
        value: string | IChatSessionProviderOptionItem;
    }>): Promise<void>;
    /**
     * Get the capabilities for a specific session type
     */
    getCapabilitiesForSessionType(chatSessionType: string): IChatAgentAttachmentCapabilities | undefined;
    /**
     * Get the customAgentTarget for a specific session type.
     * When set, the mode picker should show filtered custom agents matching this target.
     */
    getCustomAgentTargetForSessionType(chatSessionType: string): Target;
    requiresCustomModelsForSessionType(chatSessionType: string): boolean;
    getContentProviderSchemes(): string[];
}
export declare enum ChatSessionPosition {
    Editor = "editor",
    Sidebar = "sidebar"
}
export type NewChatSessionOpenOptions = {
    readonly type: string;
    readonly position: ChatSessionPosition;
    readonly displayName: string;
    readonly replaceEditor?: boolean;
};
export declare function getResourceForNewChatSession(options: NewChatSessionOpenOptions): URI;
