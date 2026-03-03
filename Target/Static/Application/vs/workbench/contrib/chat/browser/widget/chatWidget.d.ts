import './media/chat.css';
import './media/chatAgentHover.css';
import './media/chatViewWelcome.css';
import { IMouseWheelEvent } from '../../../../../base/browser/mouseEvent.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { IChatAgentAttachmentCapabilities, IChatAgentCommand, IChatAgentData, IChatAgentService } from '../../common/participants/chatAgents.js';
import { IChatEditingService } from '../../common/editing/chatEditingService.js';
import { IChatLayoutService } from '../../common/widget/chatLayoutService.js';
import { IChatModel, IChatModelInputState, IChatResponseModel } from '../../common/model/chatModel.js';
import { IChatModeService } from '../../common/chatModes.js';
import { IParsedChatRequest } from '../../common/requestParser/chatParserTypes.js';
import { IChatLocationData, IChatSendRequestOptions, IChatService } from '../../common/chatService/chatService.js';
import { IChatSessionsService } from '../../common/chatSessionsService.js';
import { IChatSlashCommandService } from '../../common/participants/chatSlashCommands.js';
import { IChatTodoListService } from '../../common/tools/chatTodoListService.js';
import { ChatViewModel, IChatResponseViewModel } from '../../common/model/chatViewModel.js';
import { ChatAgentLocation } from '../../common/constants.js';
import { ILanguageModelToolsService } from '../../common/tools/languageModelToolsService.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
import { ChatTreeItem, IChatAcceptInputOptions, IChatAccessibilityService, IChatCodeBlockInfo, IChatFileTreeInfo, IChatWidget, IChatWidgetService, IChatWidgetViewContext, IChatWidgetViewModelChangeEvent, IChatWidgetViewOptions } from '../chat.js';
import { ChatAttachmentModel } from '../attachments/chatAttachmentModel.js';
import { IChatAttachmentResolveService } from '../attachments/chatAttachmentResolveService.js';
import { ChatInputPart, IChatInputStyles } from './input/chatInputPart.js';
import { IChatTipService } from '../chatTipService.js';
import { IAgentSessionsService } from '../agentSessions/agentSessionsService.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
export interface IChatWidgetStyles extends IChatInputStyles {
    readonly inputEditorBackground: string;
    readonly resultEditorBackground: string;
}
export interface IChatWidgetContrib extends IDisposable {
    readonly id: string;
    /**
     * A piece of state which is related to the input editor of the chat widget.
     * Takes in the `contrib` object that will be saved in the {@link IChatModelInputState}.
     */
    getInputState?(contrib: Record<string, unknown>): void;
    /**
     * Called with the result of getInputState when navigating input history.
     */
    setInputState?(contrib: Readonly<Record<string, unknown>>): void;
}
export interface IChatWidgetLocationOptions {
    location: ChatAgentLocation;
    resolveData?(): IChatLocationData | undefined;
}
export declare function isQuickChat(widget: IChatWidget): boolean;
export declare class ChatWidget extends Disposable implements IChatWidget {
    private readonly viewOptions;
    private readonly styles;
    private readonly codeEditorService;
    private readonly configurationService;
    private readonly dialogService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly chatService;
    private readonly chatAgentService;
    private readonly chatWidgetService;
    private readonly chatAccessibilityService;
    private readonly logService;
    private readonly themeService;
    private readonly chatSlashCommandService;
    private readonly telemetryService;
    private readonly promptsService;
    private readonly toolsService;
    private readonly chatModeService;
    private readonly chatLayoutService;
    private readonly chatEntitlementService;
    private readonly chatSessionsService;
    private readonly agentSessionsService;
    private readonly chatTodoListService;
    private readonly lifecycleService;
    private readonly chatAttachmentResolveService;
    private readonly chatTipService;
    private readonly chatDebugService;
    static readonly CONTRIBS: {
        new (...args: [IChatWidget, ...any]): IChatWidgetContrib;
    }[];
    private readonly _onDidSubmitAgent;
    readonly onDidSubmitAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    private _onDidChangeAgent;
    readonly onDidChangeAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidChangeViewModel;
    readonly onDidChangeViewModel: Event<IChatWidgetViewModelChangeEvent>;
    private _onDidScroll;
    readonly onDidScroll: Event<void>;
    private _onDidAcceptInput;
    readonly onDidAcceptInput: Event<void>;
    private _onDidHide;
    readonly onDidHide: Event<void>;
    private _onDidShow;
    readonly onDidShow: Event<void>;
    private _onDidChangeParsedInput;
    readonly onDidChangeParsedInput: Event<void>;
    private _onDidChangeActiveInputEditor;
    readonly onDidChangeActiveInputEditor: Event<void>;
    private readonly _onWillMaybeChangeHeight;
    readonly onWillMaybeChangeHeight: Event<void>;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: Event<number>;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: Event<void>;
    private _onDidChangeEmptyState;
    readonly onDidChangeEmptyState: Event<void>;
    contribs: ReadonlyArray<IChatWidgetContrib>;
    private listContainer;
    private container;
    get domNode(): HTMLElement;
    private listWidget;
    private readonly _codeBlockModelCollection;
    private readonly visibilityTimeoutDisposable;
    private readonly visibilityAnimationFrameDisposable;
    private readonly inputPartDisposable;
    private readonly inlineInputPartDisposable;
    private inputContainer;
    private focusedInputDOM;
    private editorOptions;
    private recentlyRestoredCheckpoint;
    private welcomeMessageContainer;
    private readonly welcomePart;
    private readonly _gettingStartedTipPart;
    private _gettingStartedTipPartRef;
    private readonly chatSuggestNextWidget;
    private bodyDimension;
    private visibleChangeCount;
    private requestInProgress;
    private agentInInput;
    private _visible;
    get visible(): boolean;
    private _instructionFilesCheckPromise;
    private _instructionFilesExist;
    private _isRenderingWelcome;
    private _lockedAgent?;
    private readonly _lockedToCodingAgentContextKey;
    private readonly _agentSupportsAttachmentsContextKey;
    private readonly _sessionIsEmptyContextKey;
    private readonly _hasPendingRequestsContextKey;
    private readonly _sessionHasDebugDataContextKey;
    private _attachmentCapabilities;
    private readonly viewModelDisposables;
    private _viewModel;
    private set viewModel(value);
    get viewModel(): ChatViewModel | undefined;
    private readonly _editingSession;
    private readonly _viewModelObs;
    private parsedChatRequest;
    get parsedInput(): IParsedChatRequest;
    get scopedContextKeyService(): IContextKeyService;
    private readonly _location;
    get location(): ChatAgentLocation;
    readonly viewContext: IChatWidgetViewContext;
    get supportsChangingModes(): boolean;
    get locationData(): IChatLocationData | undefined;
    constructor(location: ChatAgentLocation | IChatWidgetLocationOptions, viewContext: IChatWidgetViewContext | undefined, viewOptions: IChatWidgetViewOptions, styles: IChatWidgetStyles, codeEditorService: ICodeEditorService, configurationService: IConfigurationService, dialogService: IDialogService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, chatService: IChatService, chatAgentService: IChatAgentService, chatWidgetService: IChatWidgetService, chatAccessibilityService: IChatAccessibilityService, logService: ILogService, themeService: IThemeService, chatSlashCommandService: IChatSlashCommandService, chatEditingService: IChatEditingService, telemetryService: ITelemetryService, promptsService: IPromptsService, toolsService: ILanguageModelToolsService, chatModeService: IChatModeService, chatLayoutService: IChatLayoutService, chatEntitlementService: IChatEntitlementService, chatSessionsService: IChatSessionsService, agentSessionsService: IAgentSessionsService, chatTodoListService: IChatTodoListService, lifecycleService: ILifecycleService, chatAttachmentResolveService: IChatAttachmentResolveService, chatTipService: IChatTipService, chatDebugService: IChatDebugService);
    private _lastSelectedAgent;
    set lastSelectedAgent(agent: IChatAgentData | undefined);
    get lastSelectedAgent(): IChatAgentData | undefined;
    private _updateAgentCapabilitiesContextKeys;
    get supportsFileReferences(): boolean;
    get attachmentCapabilities(): IChatAgentAttachmentCapabilities;
    /**
     * Either the inline input (when editing) or the main input part
     */
    get input(): ChatInputPart;
    /**
     * The main input part at the buttom of the chat widget. Use `input` to get the active input (main or inline editing part).
     */
    get inputPart(): ChatInputPart;
    private get inlineInputPart();
    get inputEditor(): ICodeEditor;
    get contentHeight(): number;
    get scrollTop(): number;
    set scrollTop(value: number);
    get attachmentModel(): ChatAttachmentModel;
    render(parent: HTMLElement): void;
    focusInput(): void;
    focusTodosView(): boolean;
    toggleTodosViewFocus(): boolean;
    focusQuestionCarousel(): boolean;
    toggleQuestionCarouselFocus(): boolean;
    navigateToPreviousQuestion(): boolean;
    navigateToNextQuestion(): boolean;
    toggleTipFocus(): boolean;
    hasInputFocus(): boolean;
    refreshParsedInput(): void;
    getSibling(item: ChatTreeItem, type: 'next' | 'previous'): ChatTreeItem | undefined;
    clear(): Promise<void>;
    private onDidChangeItems;
    /**
     * Updates the DOM visibility of welcome view and chat list immediately
     */
    private updateChatViewVisibility;
    isEmpty(): boolean;
    /**
     * Renders the welcome view content when needed.
     */
    private renderWelcomeViewContentIfNeeded;
    private renderGettingStartedTipIfNeeded;
    private _getGenerateInstructionsMessage;
    /**
     * Checks if any agent instruction files (.github/copilot-instructions.md or AGENTS.md) exist in the workspace.
     * Used to determine whether to show the "Generate Agent Instructions" hint.
     *
     * @returns true if instruction files exist OR if instruction features are disabled (to hide the hint)
     */
    private _checkForAgentInstructionFiles;
    private getWelcomeViewContent;
    private renderChatEditingSessionState;
    private renderFollowups;
    private renderChatSuggestNextWidget;
    private handleNextPromptSelection;
    handleDelegationExitIfNeeded(sourceAgent: Pick<IChatAgentData, 'id' | 'name'> | undefined, targetAgent: IChatAgentData | undefined): Promise<void>;
    private _shouldExitAfterDelegation;
    /**
     * Handles the exit of the panel chat when a delegation to another session occurs.
     * Waits for the response to complete and any pending confirmations to be resolved,
     * then clears the widget unless the final message is an error.
     */
    private _handleDelegationExit;
    private archiveLocalParentSession;
    setVisible(visible: boolean): void;
    private createList;
    startEditing(requestId: string): void;
    private clickedRequest;
    finishedEditing(completedEdit?: boolean): void;
    private getWidgetViewKindTag;
    private createInput;
    private onDidStyleChange;
    setModel(model: IChatModel | undefined): void;
    getFocus(): ChatTreeItem | undefined;
    reveal(item: ChatTreeItem, relativeTop?: number): void;
    focus(item: ChatTreeItem): void;
    setInputPlaceholder(placeholder: string): void;
    resetInputPlaceholder(): void;
    setInput(value?: string): void;
    getInput(): string;
    getContrib<T extends IChatWidgetContrib>(id: string): T | undefined;
    lockToCodingAgent(name: string, displayName: string, agentId: string): void;
    unlockFromCodingAgent(): void;
    get isLockedToCodingAgent(): boolean;
    get lockedAgentId(): string | undefined;
    logInputHistory(): void;
    acceptInput(query?: string, options?: IChatAcceptInputOptions): Promise<IChatResponseModel | undefined>;
    rerunLastRequest(): Promise<void>;
    private _applyPromptFileIfSet;
    private _acceptInput;
    private _resolveDirectoryImageAttachments;
    private confirmPendingRequestsBeforeSend;
    getModeRequestOptions(): Partial<IChatSendRequestOptions>;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    focusResponseItem(lastFocused?: boolean): void;
    layout(height: number, width: number): void;
    private _dynamicMessageLayoutData?;
    setDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    updateDynamicChatTreeItemLayout(numOfChatTreeItems: number, maxHeight: number): void;
    get isDynamicChatTreeItemLayoutEnabled(): boolean;
    set isDynamicChatTreeItemLayoutEnabled(value: boolean);
    layoutDynamicChatTreeItemMode(): void;
    saveState(): void;
    getViewState(): IChatModelInputState | undefined;
    private updateChatInputContext;
    private _switchToAgentByName;
    private _applyPromptMetadata;
    /**
     * Adds additional instructions to the context
     * - instructions that have a 'applyTo' pattern that matches the current input
     * - instructions referenced in the copilot settings 'copilot-instructions'
     * - instructions referenced in an already included instruction file
     */
    private _autoAttachInstructions;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
}
