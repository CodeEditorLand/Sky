import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { URI, UriComponents } from '../../../../../base/common/uri.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IChatAgentAttachmentCapabilities, IChatAgentService } from '../../common/participants/chatAgents.js';
import { IChatSession, IChatSessionContentProvider, IChatSessionItem, IChatSessionItemProvider, IChatSessionOptionsWillNotifyExtensionEvent, IChatSessionProviderOptionGroup, IChatSessionProviderOptionItem, IChatSessionsExtensionPoint, IChatSessionsService } from '../../common/chatSessionsService.js';
import { IChatModel } from '../../common/model/chatModel.js';
import { IChatService } from '../../common/chatService/chatService.js';
export declare class ChatSessionsService extends Disposable implements IChatSessionsService {
    private readonly _logService;
    private readonly _chatAgentService;
    private readonly _extensionService;
    private readonly _contextKeyService;
    private readonly _menuService;
    private readonly _themeService;
    private readonly _labelService;
    readonly _serviceBrand: undefined;
    private readonly _itemsProviders;
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
    readonly onDidChangeSessionItems: Event<{
        readonly chatSessionType: string;
    }>;
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
    private readonly _sessionTypeIcons;
    private readonly _sessionTypeWelcomeTitles;
    private readonly _sessionTypeWelcomeMessages;
    private readonly _sessionTypeWelcomeTips;
    private readonly _sessionTypeInputPlaceholders;
    private readonly _sessions;
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
    private _disposeSessionsForContribution;
    private _registerAgent;
    getAllChatSessionContributions(): IChatSessionsExtensionPoint[];
    private _updateHasCanDelegateProvidersContextKey;
    getChatSessionContribution(chatSessionType: string): IChatSessionsExtensionPoint | undefined;
    activateChatSessionItemProvider(chatViewType: string): Promise<void>;
    private doActivateChatSessionItemProvider;
    canResolveChatSession(chatSessionResource: URI): Promise<boolean>;
    getChatSessionItems(providersToResolve: readonly string[] | undefined, token: CancellationToken): Promise<Array<{
        readonly chatSessionType: string;
        readonly items: IChatSessionItem[];
    }>>;
    registerChatSessionItemProvider(provider: IChatSessionItemProvider): IDisposable;
    registerChatSessionContentProvider(chatSessionType: string, provider: IChatSessionContentProvider): IDisposable;
    registerChatModelChangeListeners(chatService: IChatService, chatSessionType: string, onChange: () => void): IDisposable;
    getInProgressSessionDescription(chatModel: IChatModel): string | undefined;
    getOrCreateChatSession(sessionResource: URI, token: CancellationToken): Promise<IChatSession>;
    hasAnySessionOptions(sessionResource: URI): boolean;
    getSessionOption(sessionResource: URI, optionId: string): string | IChatSessionProviderOptionItem | undefined;
    setSessionOption(sessionResource: URI, optionId: string, value: string | IChatSessionProviderOptionItem): boolean;
    /**
     * Store option groups for a session type
     */
    setOptionGroupsForSessionType(chatSessionType: string, handle: number, optionGroups?: IChatSessionProviderOptionGroup[]): void;
    /**
     * Get available option groups for a session type
     */
    getOptionGroupsForSessionType(chatSessionType: string): IChatSessionProviderOptionGroup[] | undefined;
    /**
     * Notify extension about option changes for a session
     */
    notifySessionOptionsChange(sessionResource: URI, updates: ReadonlyArray<{
        optionId: string;
        value: string | IChatSessionProviderOptionItem;
    }>): Promise<void>;
    /**
     * Get the icon for a specific session type
     */
    getIconForSessionType(chatSessionType: string): ThemeIcon | URI | undefined;
    /**
     * Get the welcome title for a specific session type
     */
    getWelcomeTitleForSessionType(chatSessionType: string): string | undefined;
    /**
     * Get the welcome message for a specific session type
     */
    getWelcomeMessageForSessionType(chatSessionType: string): string | undefined;
    /**
     * Get the input placeholder for a specific session type
     */
    getInputPlaceholderForSessionType(chatSessionType: string): string | undefined;
    /**
     * Get the capabilities for a specific session type
     */
    getCapabilitiesForSessionType(chatSessionType: string): IChatAgentAttachmentCapabilities | undefined;
    /**
     * Get the customAgentTarget for a specific session type.
     * When set, the mode picker should show filtered custom agents matching this target.
     */
    getCustomAgentTargetForSessionType(chatSessionType: string): string | undefined;
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
    readonly chatResource?: UriComponents;
    readonly replaceEditor?: boolean;
};
export declare function getResourceForNewChatSession(options: NewChatSessionOpenOptions): URI;
