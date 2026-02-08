import { IChatMarkdownContent, IChatThinkingPart, IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService/chatService.js';
import { IChatContentPartRenderContext, IChatContentPart } from './chatContentParts.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { ChatCollapsibleContentPart } from './chatCollapsibleContentPart.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import { ILanguageModelsService } from '../../../common/languageModels.js';
import './media/chatThinkingContent.css';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
export declare function getToolInvocationIcon(toolId: string): ThemeIcon;
export declare function createThinkingIcon(icon: ThemeIcon): HTMLElement;
export declare class ChatThinkingContentPart extends ChatCollapsibleContentPart implements IChatContentPart {
    private readonly chatContentMarkdownRenderer;
    private streamingCompleted;
    private readonly instantiationService;
    private readonly configurationService;
    private readonly chatMarkdownAnchorService;
    private readonly languageModelsService;
    readonly codeblocks: undefined;
    readonly codeblocksPartId: undefined;
    private readonly _onDidChangeHeight;
    private id;
    private content;
    private currentThinkingValue;
    private currentTitle;
    private defaultTitle;
    private textContainer;
    private markdownResult;
    private wrapper;
    private fixedScrollingMode;
    private autoScrollEnabled;
    private scrollableElement;
    private lastExtractedTitle;
    private extractedTitles;
    private toolInvocationCount;
    private appendedItemCount;
    private isActive;
    private toolInvocations;
    private singleItemInfo;
    private lazyItems;
    private hasExpandedOnce;
    private workingSpinnerElement;
    private workingSpinnerLabel;
    private availableMessagesByCategory;
    private readonly toolWrappersByCallId;
    private readonly toolDisposables;
    private pendingRemovals;
    private pendingScrollDisposable;
    private mutationObserverDisposable;
    private isUpdatingDimensions;
    private getRandomWorkingMessage;
    constructor(content: IChatThinkingPart, context: IChatContentPartRenderContext, chatContentMarkdownRenderer: IMarkdownRenderer, streamingCompleted: boolean, instantiationService: IInstantiationService, configurationService: IConfigurationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, languageModelsService: ILanguageModelsService, hoverService: IHoverService);
    protected shouldInitEarly(): boolean;
    protected initContent(): HTMLElement;
    private handleScroll;
    private syncDimensionsAndScheduleScroll;
    private updateScrollDimensions;
    private scrollToBottom;
    /**
     * updates scroll dimensions when streaming is complete.
     */
    private updateScrollDimensionsForCompletion;
    private renderMarkdown;
    private setDropdownClickable;
    private updateDropdownClickability;
    private appendToWrapper;
    resetId(): void;
    collapseContent(): void;
    updateThinking(content: IChatThinkingPart): void;
    getIsActive(): boolean;
    markAsInactive(): void;
    finalizeTitleIfDefault(): void;
    private setGeneratedTitleOnToolInvocations;
    private generateTitleViaLLM;
    private restoreSingleItemToOriginalPosition;
    private setFallbackTitle;
    /**
     * Appends a tool invocation or content item to the thinking group.
     * The factory is called lazily - only when the thinking section is expanded.
     * If already expanded, the factory is called immediately.
     */
    appendItem(factory: () => {
        domNode: HTMLElement;
        disposable?: IDisposable;
    }, toolInvocationId?: string, toolInvocationOrMarkdown?: IChatToolInvocation | IChatToolInvocationSerialized | IChatMarkdownContent, originalParent?: HTMLElement): void;
    /**
     * removes/re-establishes a lazy item from the thinking container
     * this is needed so we can check if there are confirmations still needed
     */
    removeLazyItem(toolInvocationId: string): boolean;
    private processPendingRemovals;
    private removeStreamingToolEntry;
    private trackToolMetadata;
    private appendItemToDOM;
    private materializeLazyItem;
    setupThinkingContainer(content: IChatThinkingPart): void;
    protected setTitle(title: string, omitPrefix?: boolean): void;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], _element: ChatTreeItem): boolean;
    dispose(): void;
}
