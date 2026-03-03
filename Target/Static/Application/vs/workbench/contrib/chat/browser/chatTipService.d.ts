import { Event } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IChatService } from '../common/chatService/chatService.js';
import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { TipTrackingCommands } from './chatTipStorageKeys.js';
export { TipTrackingCommands, };
/** @deprecated Use TipTrackingCommands.AttachFilesReferenceUsed */
export declare const ATTACH_FILES_REFERENCE_TRACKING_COMMAND: "chat.tips.attachFiles.referenceUsed";
/** @deprecated Use TipTrackingCommands.CreateAgentInstructionsUsed */
export declare const CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND: "chat.tips.createAgentInstructions.commandUsed";
/** @deprecated Use TipTrackingCommands.CreatePromptUsed */
export declare const CREATE_PROMPT_TRACKING_COMMAND: "chat.tips.createPrompt.commandUsed";
/** @deprecated Use TipTrackingCommands.CreateAgentUsed */
export declare const CREATE_AGENT_TRACKING_COMMAND: "chat.tips.createAgent.commandUsed";
/** @deprecated Use TipTrackingCommands.CreateSkillUsed */
export declare const CREATE_SKILL_TRACKING_COMMAND: "chat.tips.createSkill.commandUsed";
export declare const IChatTipService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTipService>;
export interface IChatTip {
    readonly id: string;
    readonly content: MarkdownString;
    readonly enabledCommands?: readonly string[];
}
export interface IChatTipService {
    readonly _serviceBrand: undefined;
    /**
     * Fired when the current tip is dismissed.
     */
    readonly onDidDismissTip: Event<void>;
    /**
     * Fired when the user navigates to a different tip (previous/next).
     */
    readonly onDidNavigateTip: Event<IChatTip>;
    /**
     * Fired when the tip widget is hidden without dismissing the tip.
     */
    readonly onDidHideTip: Event<void>;
    /**
     * Fired when tips are disabled.
     */
    readonly onDidDisableTips: Event<void>;
    /**
     * Gets a tip to show on the welcome/getting-started view.
     * Returns the same tip on repeated calls for stable rerenders.
     */
    getWelcomeTip(contextKeyService: IContextKeyService): IChatTip | undefined;
    /**
     * Resets tip state for a new conversation.
     * Call this when the chat widget binds to a new model.
     */
    resetSession(): void;
    /**
     * Dismisses the current tip and allows a new one to be picked for the same request.
     * The dismissed tip will not be shown again for this user on this application installation.
     */
    dismissTip(): void;
    /**
     * Hides the tip widget without permanently dismissing the tip.
     * The tip may be shown again in a future session.
     */
    hideTip(): void;
    /**
     * Disables tips permanently by setting the `chat.tips.enabled` configuration to false.
     */
    disableTips(): Promise<void>;
    /**
     * Navigates to the next tip in the catalog without permanently dismissing the current one.
     */
    navigateToNextTip(): IChatTip | undefined;
    /**
     * Navigates to the previous tip in the catalog without permanently dismissing the current one.
     */
    navigateToPreviousTip(): IChatTip | undefined;
    /**
     * Gets the next eligible tip after the current one, without requiring multiple tips.
     * Used after dismissing a tip to show the next available tip (even if it's the only one left).
     */
    getNextEligibleTip(): IChatTip | undefined;
    /**
     * Returns whether there are multiple eligible tips for navigation.
     */
    hasMultipleTips(): boolean;
    /**
     * Clears all dismissed tips so they can be shown again.
     */
    clearDismissedTips(): void;
}
export type { ITipDefinition } from './chatTipCatalog.js';
export { TipEligibilityTracker } from './chatTipEligibilityTracker.js';
export declare class ChatTipService extends Disposable implements IChatTipService {
    private readonly _productService;
    private readonly _configurationService;
    private readonly _storageService;
    private readonly _chatService;
    private readonly _logService;
    private readonly _chatEntitlementService;
    private readonly _commandService;
    private readonly _telemetryService;
    private readonly _keybindingService;
    readonly _serviceBrand: undefined;
    private readonly _onDidDismissTip;
    readonly onDidDismissTip: Event<void>;
    private readonly _onDidNavigateTip;
    readonly onDidNavigateTip: Event<IChatTip>;
    private readonly _onDidHideTip;
    readonly onDidHideTip: Event<void>;
    private readonly _onDidDisableTips;
    readonly onDidDisableTips: Event<void>;
    /**
     * The request ID that was assigned a tip (for stable rerenders).
     */
    private _tipRequestId;
    /**
     * The tip that was shown (for stable rerenders).
     */
    private _shownTip;
    /**
     * The scoped context key service from the chat widget, stored when
     * {@link getWelcomeTip} is first called so that navigation methods
     * can evaluate when-clause eligibility against the correct context.
     */
    private _contextKeyService;
    private readonly _tracker;
    private readonly _createSlashCommandsUsageTracker;
    private _yoloModeEverEnabled;
    private _thinkingPhrasesEverModified;
    private readonly _tipCommandListener;
    constructor(_productService: IProductService, _configurationService: IConfigurationService, _storageService: IStorageService, _chatService: IChatService, instantiationService: IInstantiationService, _logService: ILogService, _chatEntitlementService: IChatEntitlementService, _commandService: ICommandService, _telemetryService: ITelemetryService, _keybindingService: IKeybindingService);
    private _hasFileOrFolderReference;
    private _getCreateSlashCommandTrackingId;
    private _toCreateSlashCommandTrackingId;
    resetSession(): void;
    dismissTip(): void;
    clearDismissedTips(): void;
    private _getDismissedTipIds;
    hideTip(): void;
    disableTips(): Promise<void>;
    getWelcomeTip(contextKeyService: IContextKeyService): IChatTip | undefined;
    private _findNextEligibleTip;
    private _pickTip;
    navigateToNextTip(): IChatTip | undefined;
    navigateToPreviousTip(): IChatTip | undefined;
    getNextEligibleTip(): IChatTip | undefined;
    hasMultipleTips(): boolean;
    private _navigateTip;
    private _hasNavigableTip;
    private _getNavigableTip;
    private _isEligible;
    private _isSettingModified;
    private _getCurrentChatModelId;
    private _isChatLocation;
    private _isChatQuotaExceeded;
    private _isCopilotEnabled;
    private _createTip;
    private _logTipTelemetry;
    private _trackTipCommandClicks;
    private _readApplicationWithProfileFallback;
}
