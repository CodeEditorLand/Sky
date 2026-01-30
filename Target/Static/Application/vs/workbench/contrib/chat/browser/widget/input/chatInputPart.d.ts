import { IHistoryNavigationWidget } from '../../../../../../base/browser/history.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable, ISettableObservable } from '../../../../../../base/common/observable.js';
import { URI } from '../../../../../../base/common/uri.js';
import { CodeEditorWidget } from '../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IModelService } from '../../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../../editor/common/services/resolverService.js';
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { MenuId } from '../../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { ISharedWebContentExtractorService } from '../../../../../../platform/webContentExtractor/common/webContentExtractor.js';
import { IWorkbenchAssignmentService } from '../../../../../services/assignment/common/assignmentService.js';
import { IChatEntitlementService } from '../../../../../services/chat/common/chatEntitlementService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IChatAgentService } from '../../../common/participants/chatAgents.js';
import { IChatEditingSession } from '../../../common/editing/chatEditingService.js';
import { IChatModelInputState, IChatRequestModeInfo, IInputModel } from '../../../common/model/chatModel.js';
import { IChatMode, IChatModeService } from '../../../common/chatModes.js';
import { IChatFollowup, IChatService } from '../../../common/chatService/chatService.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { ChatRequestVariableSet, IChatRequestVariableEntry } from '../../../common/attachments/chatVariableEntries.js';
import { IChatResponseViewModel } from '../../../common/model/chatViewModel.js';
import { ChatAgentLocation, ChatModeKind } from '../../../common/constants.js';
import { ILanguageModelChatMetadata, ILanguageModelChatMetadataAndIdentifier, ILanguageModelsService } from '../../../common/languageModels.js';
import { ILanguageModelToolsService } from '../../../common/tools/languageModelToolsService.js';
import { IAgentSessionsService } from '../../agentSessions/agentSessionsService.js';
import { IChatWidget, ISessionTypePickerDelegate } from '../../chat.js';
import { ChatAttachmentModel } from '../../attachments/chatAttachmentModel.js';
import { IChatContextService } from '../../contextContrib/chatContextService.js';
import { ChatDragAndDrop } from '../chatDragAndDrop.js';
import { ChatSelectedTools } from './chatSelectedTools.js';
import { ChatImplicitContext } from '../../attachments/chatImplicitContext.js';
import { ChatRelatedFiles } from '../../attachments/chatInputRelatedFilesContrib.js';
export interface IChatInputStyles {
    overlayBackground: string;
    listForeground: string;
    listBackground: string;
}
export interface IChatInputPartOptions {
    defaultMode?: IChatMode;
    renderFollowups: boolean;
    renderStyle?: 'compact';
    renderInputToolbarBelowInput: boolean;
    menus: {
        executeToolbar: MenuId;
        telemetrySource: string;
        inputSideToolbar?: MenuId;
    };
    editorOverflowWidgetsDomNode?: HTMLElement;
    renderWorkingSet: boolean;
    enableImplicitContext?: boolean;
    supportsChangingModes?: boolean;
    dndContainer?: HTMLElement;
    widgetViewKindTag: string;
    /**
     * Optional delegate for the session target picker.
     * When provided, allows the input part to maintain independent state for the selected session type.
     */
    sessionTypePickerDelegate?: ISessionTypePickerDelegate;
}
export interface IWorkingSetEntry {
    uri: URI;
}
export declare class ChatInputPart extends Disposable implements IHistoryNavigationWidget {
    private readonly location;
    private readonly options;
    private readonly inline;
    private readonly modelService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly keybindingService;
    private readonly accessibilityService;
    private readonly languageModelsService;
    private readonly logService;
    private readonly fileService;
    private readonly editorService;
    private readonly themeService;
    private readonly textModelResolverService;
    private readonly storageService;
    private readonly labelService;
    private readonly agentService;
    private readonly sharedWebExtracterService;
    private readonly experimentService;
    private readonly entitlementService;
    private readonly chatModeService;
    private readonly toolService;
    private readonly chatService;
    private readonly chatSessionsService;
    private readonly chatContextService;
    private readonly agentSessionsService;
    private static _counter;
    private _workingSetCollapsed;
    private readonly _chatInputTodoListWidget;
    private readonly _chatEditingTodosDisposables;
    private _lastEditingSessionResource;
    private _onDidLoadInputState;
    readonly onDidLoadInputState: Event<void>;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidBlur;
    readonly onDidBlur: Event<void>;
    private _onDidChangeContext;
    readonly onDidChangeContext: Event<{
        removed?: IChatRequestVariableEntry[];
        added?: IChatRequestVariableEntry[];
    }>;
    private _onDidAcceptFollowup;
    readonly onDidAcceptFollowup: Event<{
        followup: IChatFollowup;
        response: IChatResponseViewModel | undefined;
    }>;
    private _onDidClickOverlay;
    readonly onDidClickOverlay: Event<void>;
    private readonly _attachmentModel;
    private _widget?;
    get attachmentModel(): ChatAttachmentModel;
    readonly selectedToolsModel: ChatSelectedTools;
    getAttachedContext(sessionResource: URI): ChatRequestVariableSet;
    getAttachedAndImplicitContext(sessionResource: URI): ChatRequestVariableSet;
    private _indexOfLastAttachedContextDeletedWithKeyboard;
    private _indexOfLastOpenedContext;
    private _implicitContext;
    get implicitContext(): ChatImplicitContext | undefined;
    private _relatedFiles;
    get relatedFiles(): ChatRelatedFiles | undefined;
    private _hasFileAttachmentContextKey;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    private readonly inputEditorMaxHeight;
    private inputEditorHeight;
    private container;
    private inputSideToolbarContainer?;
    private followupsContainer;
    private readonly followupsDisposables;
    private attachmentsContainer;
    private chatInputOverlay;
    private readonly overlayClickListener;
    private attachedContextContainer;
    private readonly attachedContextDisposables;
    private relatedFilesContainer;
    private chatEditingSessionWidgetContainer;
    private chatInputTodoListWidgetContainer;
    private chatInputWidgetsContainer;
    private readonly _widgetController;
    readonly inputPartHeight: ISettableObservable<number, void>;
    private _inputEditor;
    private _inputEditorElement;
    private _inputModel;
    private readonly _modelSyncDisposables;
    private _isSyncingToOrFromInputModel;
    private readonly _syncTextDebounced;
    private executeToolbar;
    private inputActionsToolbar;
    private addFilesToolbar;
    private addFilesButton;
    get inputEditor(): CodeEditorWidget;
    readonly dnd: ChatDragAndDrop;
    private history;
    private historyNavigationBackwardsEnablement;
    private historyNavigationForewardsEnablement;
    private inputModel;
    private inputEditorHasText;
    private chatCursorAtTop;
    private inputEditorHasFocus;
    private currentlyEditingInputKey;
    private chatModeKindKey;
    private withinEditSessionKey;
    private filePartOfEditSessionKey;
    private chatSessionHasOptions;
    private chatSessionOptionsValid;
    private agentSessionTypeKey;
    private modelWidget;
    private modeWidget;
    private sessionTargetWidget;
    private chatSessionPickerWidgets;
    private chatSessionPickerContainer;
    private _lastSessionPickerAction;
    private readonly _waitForPersistedLanguageModel;
    private readonly _chatSessionOptionEmitters;
    /**
     * Scoped context key service for this chat input part.
     * Used to isolate option group context keys to this specific chat input instance.
     */
    private _scopedContextKeyService;
    /**
     * Map of option group ID to its context key.
     * Keys follow the pattern `chatSessionOption.<groupId>` and hold the currently selected option item ID.
     */
    private readonly _optionContextKeys;
    private _currentLanguageModel;
    get currentLanguageModel(): string | undefined;
    get selectedLanguageModel(): ILanguageModelChatMetadataAndIdentifier | undefined;
    private _onDidChangeCurrentChatMode;
    readonly onDidChangeCurrentChatMode: Event<void>;
    private _onDidChangeCurrentLanguageModel;
    readonly onDidChangeCurrentLanguageModel: Event<ILanguageModelChatMetadataAndIdentifier>;
    private readonly _currentModeObservable;
    get currentModeKind(): ChatModeKind;
    get currentModeObs(): IObservable<IChatMode>;
    get currentModeInfo(): IChatRequestModeInfo;
    private cachedWidth;
    private cachedExecuteToolbarWidth;
    private cachedInputToolbarWidth;
    readonly inputUri: URI;
    private _workingSetLinesAddedSpan;
    private _workingSetLinesRemovedSpan;
    private readonly _chatEditsActionsDisposables;
    private readonly _chatEditsDisposables;
    private readonly _renderingChatEdits;
    private _chatEditsListPool;
    private _chatEditList;
    get selectedElements(): URI[];
    private _attemptedWorkingSetEntriesCount;
    /**
     * The number of working set entries that the user actually wanted to attach.
     * This is less than or equal to {@link ChatInputPart.chatEditWorkingSetFiles}.
     */
    get attemptedWorkingSetEntriesCount(): number;
    /**
     * Number consumers holding the 'generating' lock.
     */
    private _generating?;
    private _emptyInputState;
    private _chatSessionIsEmpty;
    constructor(location: ChatAgentLocation, options: IChatInputPartOptions, styles: IChatInputStyles, inline: boolean, modelService: IModelService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService, accessibilityService: IAccessibilityService, languageModelsService: ILanguageModelsService, logService: ILogService, fileService: IFileService, editorService: IEditorService, themeService: IThemeService, textModelResolverService: ITextModelService, storageService: IStorageService, labelService: ILabelService, agentService: IChatAgentService, sharedWebExtracterService: ISharedWebContentExtractorService, experimentService: IWorkbenchAssignmentService, entitlementService: IChatEntitlementService, chatModeService: IChatModeService, toolService: ILanguageModelToolsService, chatService: IChatService, chatSessionsService: IChatSessionsService, chatContextService: IChatContextService, agentSessionsService: IAgentSessionsService);
    private setImplicitContextEnablement;
    setIsWithinEditSession(inInsideDiff: boolean, isFilePartOfEditSession: boolean): void;
    private getSelectedModelStorageKey;
    private getSelectedModelIsDefaultStorageKey;
    private initSelectedModel;
    setEditing(enabled: boolean): void;
    switchModel(modelMetadata: Pick<ILanguageModelChatMetadata, 'vendor' | 'id' | 'family'>): void;
    switchModelByQualifiedName(qualifiedModelName: string): boolean;
    switchToNextModel(): void;
    openModelPicker(): void;
    openModePicker(): void;
    openSessionTargetPicker(): void;
    openChatSessionPicker(): void;
    /**
     * Create picker widgets for all option groups available for the current session type.
     */
    private createChatSessionPickerWidgets;
    /**
     * Set the input model reference for syncing input state
     */
    setInputModel(model: IInputModel, chatSessionIsEmpty: boolean): void;
    private _setEmptyModelState;
    /**
     * Sync from model to view (when model state changes)
     */
    private _syncFromModel;
    /**
     * Sync current input state to the input model
     */
    private _syncInputStateToModel;
    setCurrentLanguageModel(model: ILanguageModelChatMetadataAndIdentifier): void;
    private checkModelSupported;
    /**
     * By ID- prefer this method
     */
    setChatMode(mode: ChatModeKind | string, storeSelection?: boolean): void;
    private setChatMode2;
    private modelSupportedForDefaultAgent;
    private modelSupportedForInlineChat;
    private getModels;
    private setCurrentLanguageModelToDefault;
    /**
     * Get the current input state for history
     */
    getCurrentInputState(): IChatModelInputState;
    private _getAriaLabel;
    private validateCurrentChatMode;
    private getDefaultModeExperimentStorageKey;
    logInputHistory(): void;
    setVisible(visible: boolean): void;
    /** If consumers are busy generating the chat input, returns the promise resolved when they finish */
    get generating(): Promise<void> | undefined;
    /** Disables the input submissions buttons until the disposable is disposed. */
    startGenerating(): IDisposable;
    get element(): HTMLElement;
    showPreviousValue(): Promise<void>;
    showNextValue(): Promise<void>;
    private navigateHistory;
    setValue(value: string, transient: boolean): void;
    focus(): void;
    hasFocus(): boolean;
    /**
     * Reset the input and update history.
     * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
     */
    acceptInput(isUserQuery?: boolean): Promise<void>;
    validateAgentMode(): void;
    private _getFilteredEntry;
    private _acceptInputForVoiceover;
    private _handleAttachedContextChange;
    private getOrCreateOptionEmitter;
    /**
     * Get or create a context key for an option group.
     * Context keys follow the pattern `chatSessionOption.<groupId>`.
     */
    private getOrCreateOptionContextKey;
    /**
     * Update the context key for an option group with the current selection.
     * This enables `when` expressions on other option groups to react to changes.
     */
    private updateOptionContextKey;
    /**
     * Evaluate whether an option group should be visible based on its `when` expression.
     * Returns true if the option group should be visible, false otherwise.
     */
    private evaluateOptionGroupVisibility;
    /**
     * Computes which option groups should be visible for the current session.
     *
     * A picker should show if and only if:
     * 1. We can determine a session type (from session context OR delegate)
     * 2. That session type has option groups registered
     * 3. At least one option group has items AND passes its `when` clause
     *
     * This method also updates the `chatSessionHasOptions` context key, which controls
     * whether the picker action is shown in the toolbar via its `when` clause.
     *
     * @returns The result containing visible group IDs and related context, or undefined
     *          if there are no visible option groups
     */
    private computeVisibleOptionGroups;
    /**
     * Refresh all registered option groups for the current chat session.
     * Fires events for each option group with their current selection.
     */
    private refreshChatSessionPickers;
    private hideAllSessionPickerWidgets;
    private disposeSessionPickerWidgets;
    /**
     * Get the current option for a specific option group.
     * If no option is currently set, initializes with the first item as default.
     */
    private getCurrentOptionForGroup;
    private getEffectiveSessionType;
    /**
     * Updates the agentSessionType context key based on delegate or actual session.
     */
    private updateAgentSessionTypeContextKey;
    /**
     * Updates the widget lock state based on a session type.
     * Local sessions unlock from coding agent mode, while remote/cloud sessions lock to coding agent mode.
     */
    private updateWidgetLockStateFromSessionType;
    /**
     * Updates the widget controller based on session type.
     */
    private tryUpdateWidgetController;
    render(container: HTMLElement, initialValue: string, widget: IChatWidget): void;
    toggleChatInputOverlay(editing: boolean): void;
    renderAttachedContext(): void;
    private hasImplicitContextBlock;
    private isAttachmentAlreadyAttached;
    private handleAttachmentDeletion;
    private handleAttachmentOpen;
    private handleAttachmentNavigation;
    renderChatTodoListWidget(chatSessionResource: URI): Promise<void>;
    clearTodoListWidget(sessionResource: URI | undefined, force: boolean): void;
    setWorkingSetCollapsed(collapsed: boolean): void;
    renderChatEditingSessionState(chatEditingSession: IChatEditingSession | null): void;
    private renderChatEditingSessionWithEntries;
    renderChatRelatedFiles(): Promise<void>;
    renderFollowups(items: IChatFollowup[] | undefined, response: IChatResponseViewModel | undefined): Promise<void>;
    /**
     * Layout the input part with the given width. Height is intrinsic - determined by content
     * and detected via ResizeObserver, which updates `inputPartHeight` for the parent to observe.
     */
    layout(width: number): void;
    private previousInputEditorDimension;
    private _layout;
    private getLayoutData;
}
