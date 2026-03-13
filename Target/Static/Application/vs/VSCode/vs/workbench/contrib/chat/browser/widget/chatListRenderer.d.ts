import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from '../../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { CachedListVirtualDelegate, IListElementRenderDetails } from '../../../../../base/browser/ui/list/list.js';
import { ITreeNode, ITreeRenderer } from '../../../../../base/browser/ui/tree/tree.js';
import { IAction } from '../../../../../base/common/actions.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { ScrollEvent } from '../../../../../base/common/scrollable.js';
import { URI } from '../../../../../base/common/uri.js';
import { MenuWorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IChatEntitlementService } from '../../../../services/chat/common/chatEntitlementService.js';
import { IWorkbenchIssueService } from '../../../issue/common/issue.js';
import { IChatFollowup, IChatService, IChatThinkingPart } from '../../common/chatService/chatService.js';
import { IChatResponseViewModel, IChatViewModel } from '../../common/model/chatViewModel.js';
import { CodeBlockModelCollection } from '../../common/widget/codeBlockModelCollection.js';
import { ChatModeKind } from '../../common/constants.js';
import { ChatTreeItem, IChatCodeBlockInfo, IChatFileTreeInfo, IChatListItemRendererOptions, IChatWidgetService } from '../chat.js';
import { ChatAgentHover } from './chatAgentHover.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts/chatContentParts.js';
import { ChatEditorOptions } from './chatOptions.js';
import { CodeBlockPart } from './chatContentParts/codeBlockPart.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { ChatPendingDragController } from './chatPendingDragAndDrop.js';
import { IWorkbenchEnvironmentService } from '../../../../services/environment/common/environmentService.js';
export interface IChatListItemTemplate {
    currentElement?: ChatTreeItem;
    /**
     * The parts that are currently rendered in the template. Note that these are purposely not added to elementDisposables-
     * they are disposed in a separate cycle after diffing with the next content to render.
     */
    renderedParts?: IChatContentPart[];
    /**
     * Element used to track whether the template is mounted in the DOM.
     */
    renderedPartsMounted?: boolean;
    /** Drag handle element for reordering pending requests, if currently rendered. */
    dragHandle?: HTMLElement;
    readonly rowContainer: HTMLElement;
    readonly titleToolbar?: MenuWorkbenchToolBar;
    readonly header?: HTMLElement;
    readonly footerToolbar: MenuWorkbenchToolBar;
    readonly footerDetailsContainer: HTMLElement;
    readonly avatarContainer: HTMLElement;
    readonly username: HTMLElement;
    readonly detail: HTMLElement;
    readonly value: HTMLElement;
    readonly contextKeyService: IContextKeyService;
    readonly instantiationService: IInstantiationService;
    readonly templateDisposables: IDisposable;
    readonly elementDisposables: DisposableStore;
    readonly agentHover: ChatAgentHover;
    readonly requestHover: HTMLElement;
    readonly disabledOverlay: HTMLElement;
    readonly checkpointToolbar: MenuWorkbenchToolBar;
    readonly checkpointRestoreToolbar: MenuWorkbenchToolBar;
    readonly checkpointContainer: HTMLElement;
    readonly checkpointRestoreContainer: HTMLElement;
}
interface IItemHeightChangeParams {
    element: ChatTreeItem;
    height: number;
}
export interface IChatRendererDelegate {
    container: HTMLElement;
    getListLength(): number;
    currentChatMode(): ChatModeKind;
    readonly onDidScroll?: Event<ScrollEvent>;
}
export declare class ChatListItemRenderer extends Disposable implements ITreeRenderer<ChatTreeItem, FuzzyScore, IChatListItemTemplate> {
    private rendererOptions;
    private readonly delegate;
    private readonly codeBlockModelCollection;
    private viewModel;
    private readonly instantiationService;
    private readonly configService;
    private readonly logService;
    private readonly contextKeyService;
    private readonly themeService;
    private readonly commandService;
    private readonly hoverService;
    private readonly chatWidgetService;
    private readonly chatEntitlementService;
    private readonly chatService;
    private readonly accessibilitySignalService;
    private readonly accessibilityService;
    private readonly environmentService;
    static readonly ID = "item";
    private readonly codeBlocksByResponseId;
    private readonly codeBlocksByEditorUri;
    private readonly fileTreesByResponseId;
    private readonly focusedFileTreesByResponseId;
    private readonly templateDataByRequestId;
    private readonly responseTemplateDataByRequestId;
    /** Track pending question carousels by session resource for auto-skip on chat submission */
    private readonly pendingQuestionCarousels;
    private readonly _notifiedQuestionCarousels;
    private readonly chatContentMarkdownRenderer;
    private readonly markdownDecorationsRenderer;
    protected readonly _onDidClickFollowup: Emitter<IChatFollowup>;
    readonly onDidClickFollowup: Event<IChatFollowup>;
    private readonly _onDidClickRerunWithAgentOrCommandDetection;
    readonly onDidClickRerunWithAgentOrCommandDetection: Event<{
        readonly sessionResource: URI;
        readonly requestId: string;
    }>;
    private readonly _onDidClickRequest;
    readonly onDidClickRequest: Event<IChatListItemTemplate>;
    private readonly _onDidRerender;
    readonly onDidRerender: Event<IChatListItemTemplate>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<IChatListItemTemplate>;
    private readonly _onDidFocusOutside;
    readonly onDidFocusOutside: Event<void>;
    protected readonly _onDidChangeItemHeight: Emitter<IItemHeightChangeParams>;
    readonly onDidChangeItemHeight: Event<IItemHeightChangeParams>;
    private readonly _onDidUpdateViewModel;
    private readonly _editorPool;
    private readonly _toolEditorPool;
    private readonly _diffEditorPool;
    private readonly _treePool;
    private readonly _contentReferencesListPool;
    private _currentLayoutWidth;
    private _isVisible;
    private _elementBeingRendered;
    private _onDidChangeVisibility;
    /**
     * Tool invocations get their own so that the ChatViewModel doesn't overwrite it.
     * TODO@roblourens shouldn't use the CodeBlockModelCollection at all
     */
    private readonly _toolInvocationCodeBlockCollection;
    private readonly _inlineTextModels;
    /**
     * Prevents re-announcement of already rendered chat progress
     * by screen readers
     */
    private readonly _announcedToolProgressKeys;
    constructor(editorOptions: ChatEditorOptions, rendererOptions: IChatListItemRendererOptions, delegate: IChatRendererDelegate, codeBlockModelCollection: CodeBlockModelCollection, overflowWidgetsDomNode: HTMLElement | undefined, viewModel: IChatViewModel | undefined, instantiationService: IInstantiationService, configService: IConfigurationService, logService: ILogService, contextKeyService: IContextKeyService, themeService: IThemeService, commandService: ICommandService, hoverService: IHoverService, chatWidgetService: IChatWidgetService, chatEntitlementService: IChatEntitlementService, chatService: IChatService, accessibilitySignalService: IAccessibilitySignalService, accessibilityService: IAccessibilityService, environmentService: IWorkbenchEnvironmentService);
    private _pendingDragController;
    set pendingDragController(controller: ChatPendingDragController);
    updateOptions(options: IChatListItemRendererOptions): void;
    get templateId(): string;
    editorsInUse(): Iterable<CodeBlockPart>;
    private traceLayout;
    private fireItemHeightChange;
    /**
     * Compute a rate to render at in words/s.
     */
    private getProgressiveRenderRate;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    updateViewModel(viewModel: IChatViewModel | undefined): void;
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    getTemplateDataForRequestId(requestId?: string): IChatListItemTemplate | undefined;
    setVisible(visible: boolean): void;
    layout(width: number): void;
    renderTemplate(container: HTMLElement): IChatListItemTemplate;
    renderElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate): void;
    /**
     * Dispose the rendered parts in the template, which aren't done in disposeElement
     * so they can be reused when a new render is started.
     */
    private clearRenderedParts;
    private renderChatTreeItem;
    private renderPendingDivider;
    private renderDetail;
    private renderConfirmationAction;
    private renderAvatar;
    private getAgentIcon;
    private renderChatResponseBasic;
    private shouldShowWorkingProgress;
    private getChatFileChangesSummaryPart;
    private renderChatRequest;
    /**
     *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
     */
    private doNextProgressiveRender;
    private renderChatContentDiff;
    /**
     * Returns all content parts that should be rendered, and trimmed markdown content. We will diff this with the current rendered set.
     */
    private getNextProgressiveRenderContent;
    private shouldShowFileChangesSummary;
    private getDataForProgressiveRender;
    private diff;
    private isRenderedPartInsideThinking;
    private hasEditCodeblockUri;
    private isCodeblockComplete;
    private shouldPinPart;
    private getLastThinkingPart;
    /**
     * Determines if a thinking part at the given content index is "look-ahead complete".
     * A thinking part is look-ahead complete if there are subsequent parts that will NOT
     * be pinned to it, meaning we know this thinking part is already done even though
     * the overall response is still in progress.
     */
    private isThinkingLookAheadComplete;
    private getSubagentPart;
    private finalizeAllSubagentParts;
    private handleSubagentToolGrouping;
    private finalizeCurrentThinkingPart;
    private renderChatContentPart;
    dispose(): void;
    private renderChatErrorDetails;
    private renderUndoStop;
    private renderNoContent;
    private renderTreeData;
    private renderMultiDiffData;
    private renderContentReferencesListData;
    private renderCodeCitations;
    private handleRenderedCodeblocks;
    private renderToolInvocation;
    private setupConfirmationTransitionWatcher;
    private renderExtensionsContent;
    private renderHookPart;
    private renderPullRequestContent;
    private renderProgressTask;
    private renderConfirmation;
    private renderElicitation;
    private renderQuestionCarousel;
    private _getCarouselStableKey;
    private _notifyOnQuestionCarousel;
    private removeCarouselFromTracking;
    private renderChangesSummary;
    private renderAttachments;
    private renderTextEdit;
    private renderMarkdown;
    renderThinkingPart(content: IChatThinkingPart, context: IChatContentPartRenderContext, templateData: IChatListItemTemplate): IChatContentPart;
    disposeElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate, details?: IListElementRenderDetails): void;
    private renderMcpServersInteractionRequired;
    private renderDisabledClaudeHooks;
    disposeTemplate(templateData: IChatListItemTemplate): void;
    private hoverVisible;
    private hoverHidden;
}
export declare class ChatListDelegate extends CachedListVirtualDelegate<ChatTreeItem> {
    private readonly defaultElementHeight;
    constructor(defaultElementHeight: number);
    protected estimateHeight(element: ChatTreeItem): number;
    getTemplateId(element: ChatTreeItem): string;
    hasDynamicHeight(element: ChatTreeItem): boolean;
}
export declare class ChatVoteDownButton extends DropdownMenuActionViewItem {
    private readonly commandService;
    private readonly issueService;
    private readonly logService;
    constructor(action: IAction, options: IDropdownMenuActionViewItemOptions | undefined, commandService: ICommandService, issueService: IWorkbenchIssueService, logService: ILogService, contextMenuService: IContextMenuService);
    getActions(): readonly IAction[];
    render(container: HTMLElement): void;
    private getVoteDownDetailAction;
}
export {};
