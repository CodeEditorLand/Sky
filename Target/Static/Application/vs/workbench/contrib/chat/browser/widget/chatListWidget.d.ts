import { IMouseWheelEvent } from '../../../../../base/browser/mouseEvent.js';
import { ITreeFilter } from '../../../../../base/browser/ui/tree/tree.js';
import { Event } from '../../../../../base/common/event.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ScrollEvent } from '../../../../../base/common/scrollable.js';
import { URI } from '../../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IChatFollowup, IChatService } from '../../common/chatService/chatService.js';
import { ChatAgentLocation, ChatModeKind } from '../../common/constants.js';
import { IChatRequestModeInfo } from '../../common/model/chatModel.js';
import { IChatRequestViewModel, IChatResponseViewModel, IChatViewModel } from '../../common/model/chatViewModel.js';
import { CodeBlockModelCollection } from '../../common/widget/codeBlockModelCollection.js';
import { ChatTreeItem, IChatAccessibilityService, IChatCodeBlockInfo, IChatFileTreeInfo, IChatListItemRendererOptions } from '../chat.js';
import { CodeBlockPart } from './chatContentParts/codeBlockPart.js';
import { IChatListItemTemplate } from './chatListRenderer.js';
import { ChatEditorOptions } from './chatOptions.js';
export interface IChatListWidgetStyles {
    listForeground?: string;
    listBackground?: string;
}
export interface IChatListWidgetOptions {
    /**
     * Options for the list item renderer.
     */
    readonly rendererOptions?: IChatListItemRendererOptions;
    /**
     * Default height for list elements.
     */
    readonly defaultElementHeight?: number;
    /**
     * DOM node for overflow widgets (e.g., code editors).
     */
    readonly overflowWidgetsDomNode?: HTMLElement;
    /**
     * Optional style overrides for the list.
     */
    readonly styles?: IChatListWidgetStyles;
    /**
     * Callback to get the current chat mode.
     */
    readonly currentChatMode?: () => ChatModeKind;
    /**
     * View ID for editor options (used in ChatWidget context).
     */
    readonly viewId?: string;
    /**
     * Input editor background color key.
     */
    readonly inputEditorBackground?: string;
    /**
     * Result editor background color key.
     */
    readonly resultEditorBackground?: string;
    /**
     * Optional filter for the tree.
     */
    readonly filter?: ITreeFilter<ChatTreeItem, FuzzyScore>;
    /**
     * Optional code block model collection to use.
     * If not provided, one will be created.
     */
    readonly codeBlockModelCollection?: CodeBlockModelCollection;
    /**
     * Initial view model.
     */
    readonly viewModel?: IChatViewModel;
    /**
     * Optional pre-created editor options.
     * If provided, these will be used instead of creating new ones.
     */
    readonly editorOptions?: ChatEditorOptions;
    /**
     * The chat location (for rerun requests).
     */
    readonly location?: ChatAgentLocation;
    /**
     * Callback to get current language model ID (for rerun requests).
     */
    readonly getCurrentLanguageModelId?: () => string | undefined;
    /**
     * Callback to get current mode info (for rerun requests).
     */
    readonly getCurrentModeInfo?: () => IChatRequestModeInfo | undefined;
    /**
     * The render style for the chat widget. Affects minimum height behavior.
     */
    readonly renderStyle?: 'compact' | 'minimal';
}
/**
 * A reusable widget that encapsulates chat list/tree rendering.
 * This can be used in various contexts such as the main chat widget,
 * hover previews, etc.
 */
export declare class ChatListWidget extends Disposable {
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly chatService;
    private readonly contextMenuService;
    private readonly logService;
    private readonly configurationService;
    private readonly chatAccessibilityService;
    private readonly _onDidScroll;
    readonly onDidScroll: Event<ScrollEvent>;
    private readonly _onDidChangeContentHeight;
    readonly onDidChangeContentHeight: Event<void>;
    private readonly _onDidClickFollowup;
    readonly onDidClickFollowup: Event<IChatFollowup>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidChangeItemHeight;
    /** Event fired when an item's height changes. Used for dynamic layout mode. */
    readonly onDidChangeItemHeight: Event<{
        element: ChatTreeItem;
        height: number;
    }>;
    /**
     * Event fired when a request item is clicked.
     */
    get onDidClickRequest(): Event<IChatListItemTemplate>;
    /**
     * Event fired when an item is re-rendered.
     */
    get onDidRerender(): Event<IChatListItemTemplate>;
    /**
     * Event fired when a template is disposed.
     */
    get onDidDispose(): Event<IChatListItemTemplate>;
    /**
     * Event fired when focus moves outside the editing area.
     */
    get onDidFocusOutside(): Event<void>;
    private readonly _tree;
    private readonly _renderer;
    private readonly _codeBlockModelCollection;
    private _viewModel;
    private _visible;
    private _lastItem;
    private _mostRecentlyFocusedItemIndex;
    private _scrollLock;
    private _settingChangeCounter;
    private _visibleChangeCount;
    private readonly _container;
    private readonly _scrollDownButton;
    private readonly _lastItemIdContextKey;
    private readonly _location;
    private readonly _getCurrentLanguageModelId;
    private readonly _getCurrentModeInfo;
    private readonly _renderStyle;
    get domNode(): HTMLElement;
    get scrollTop(): number;
    set scrollTop(value: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get contentHeight(): number;
    /**
     * Whether the list is scrolled to the bottom.
     */
    get isScrolledToBottom(): boolean;
    /**
     * The last item in the list.
     */
    get lastItem(): ChatTreeItem | undefined;
    constructor(container: HTMLElement, options: IChatListWidgetOptions, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, chatService: IChatService, contextMenuService: IContextMenuService, logService: ILogService, configurationService: IConfigurationService, chatAccessibilityService: IChatAccessibilityService);
    /**
     * Update scroll-down button visibility based on scroll position and scroll lock.
     */
    private updateScrollDownButtonVisibility;
    /**
     * Handle context menu events.
     */
    private handleContextMenu;
    /**
     * Set the view model for the list to render.
     */
    setViewModel(viewModel: IChatViewModel | undefined): void;
    /**
     * Refresh the list from the current view model.
     * Uses internal state for diff identity calculation.
     */
    refresh(): void;
    /**
     * Set scroll lock state.
     */
    setScrollLock(value: boolean): void;
    /**
     * Get scroll lock state.
     */
    get scrollLock(): boolean;
    /**
     * Set the visible change count (for diff identity).
     */
    setVisibleChangeCount(value: number): void;
    /**
     * Scroll to reveal an element if editing.
     */
    scrollToCurrentItem(currentElement: IChatRequestViewModel): void;
    /**
     * Rerender the tree.
     */
    rerender(): void;
    private getItems;
    /**
     * Delegate scroll events from a mouse wheel event to the tree.
     */
    delegateScrollFromMouseWheelEvent(event: IMouseWheelEvent): void;
    /**
     * Whether the tree has a specific element.
     */
    hasElement(element: ChatTreeItem): boolean;
    /**
     * Update the height of an element.
     */
    private _updateElementHeight;
    /**
     * Scroll to reveal an element.
     */
    reveal(element: ChatTreeItem, relativeTop?: number): void;
    /**
     * Get the focused elements.
     */
    getFocus(): ChatTreeItem[];
    /**
     * Set the focused elements.
     */
    setFocus(elements: ChatTreeItem[]): void;
    focusItem(item: ChatTreeItem): void;
    /**
     * Focus the last item in the list. Returns the index of the focused item.
     * @param useMostRecentlyFocusedIndex If true, use the mostRecentlyFocusedIndex if valid
     */
    focusLastItem(useMostRecentlyFocusedIndex?: boolean): number;
    /**
     * Scroll the list to reveal the last item.
     */
    scrollToEnd(): void;
    private _withPersistedAutoScroll;
    /**
     * Focus the list.
     */
    focus(): void;
    /**
     * Get the DOM focus state.
     */
    isDOMFocused(): boolean;
    /**
     * Get code block info for a response.
     */
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    /**
     * Get code block info by URI.
     */
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    /**
     * Get file tree info for a response.
     */
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    /**
     * Get the last focused file tree for a response.
     */
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    /**
     * Get editors currently in use.
     */
    editorsInUse(): Iterable<CodeBlockPart>;
    /**
     * Get template data for a request ID.
     */
    getTemplateDataForRequestId(requestId: string | undefined): IChatListItemTemplate | undefined;
    /**
     * Update renderer options.
     */
    updateRendererOptions(options: IChatListItemRendererOptions): void;
    /**
     * Set the visibility of the list.
     */
    setVisible(visible: boolean): void;
    /**
     * Layout the list.
     */
    layout(height: number, width: number): void;
    private _bodyDimension;
    private _previousLastItemMinHeight;
    private updateLastItemMinHeight;
}
