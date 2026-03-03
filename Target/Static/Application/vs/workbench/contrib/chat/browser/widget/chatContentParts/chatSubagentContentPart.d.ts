import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatHookPart, IChatMarkdownContent, IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { CodeBlockModelCollection } from '../../../common/widget/codeBlockModelCollection.js';
import { ChatTreeItem } from '../../chat.js';
import { ChatCollapsibleContentPart } from './chatCollapsibleContentPart.js';
import { EditorPool } from './chatContentCodePools.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import { CollapsibleListPool } from './chatReferencesContentPart.js';
import './media/chatSubagentContent.css';
/**
 * This is generally copied from ChatThinkingContentPart. We are still experimenting with both UIs so I'm not
 * trying to refactor to share code. Both could probably be simplified when stable.
 */
export declare class ChatSubagentContentPart extends ChatCollapsibleContentPart implements IChatContentPart {
    readonly subAgentInvocationId: string;
    private readonly context;
    private readonly chatContentMarkdownRenderer;
    private readonly listPool;
    private readonly editorPool;
    private readonly currentWidthDelegate;
    private readonly codeBlockModelCollection;
    private readonly announcedToolProgressKeys;
    private readonly instantiationService;
    private readonly chatMarkdownAnchorService;
    private wrapper;
    private isActive;
    private hasToolItems;
    private readonly isInitiallyComplete;
    private promptContainer;
    private resultContainer;
    private lastItemWrapper;
    private readonly layoutScheduler;
    private description;
    private agentName;
    private prompt;
    private readonly lazyItems;
    private hasExpandedOnce;
    private pendingPromptRender;
    private pendingResultText;
    private currentRunningToolMessage;
    private modelName;
    private readonly _hoverDisposable;
    private toolsWaitingForConfirmation;
    private userManuallyExpanded;
    private autoExpandedForConfirmation;
    private titleShimmerSpan;
    private titleDetailContainer;
    private titleDetailRendered;
    /**
     * Check if a tool invocation is the parent subagent tool (the tool that spawns a subagent).
     * A parent subagent tool has subagent toolSpecificData but no subAgentInvocationId.
     */
    private static isParentSubagentTool;
    /**
     * Extracts subagent info (description, agentName, prompt) from a tool invocation.
     */
    private static extractSubagentInfo;
    constructor(subAgentInvocationId: string, toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, chatContentMarkdownRenderer: IMarkdownRenderer, listPool: CollapsibleListPool, editorPool: EditorPool, currentWidthDelegate: () => number, codeBlockModelCollection: CodeBlockModelCollection, announcedToolProgressKeys: Set<string>, instantiationService: IInstantiationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, hoverService: IHoverService, configurationService: IConfigurationService);
    protected initContent(): HTMLElement;
    /**
     * Renders the prompt as a collapsible section at the start of the content.
     * If the wrapper doesn't exist yet (lazy init) or subagent is initially complete,
     * this is deferred until expanded.
     */
    private renderPromptSection;
    private doRenderPromptSection;
    getIsActive(): boolean;
    markAsInactive(): void;
    finalizeTitle(): void;
    private updateTitle;
    private updateHover;
    /**
     * Tracks a tool invocation's state for:
     * 1. Updating the title with the current tool message (persists even after completion)
     * 2. Auto-expanding when a tool is waiting for confirmation
     * 3. Auto-collapsing when the confirmation is addressed
     * This method is public to support testing.
     */
    trackToolState(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized): void;
    /**
     * Watches the tool invocation for completion and renders the result.
     * Handles both live and serialized invocations.
     */
    private watchToolCompletion;
    /**
     * Renders the result text as a collapsible section.
     * If the wrapper doesn't exist yet (lazy init) or subagent is initially complete,
     * this is deferred until expanded.
     */
    renderResultText(resultText: string): void;
    private doRenderResultText;
    /**
     * Appends a tool invocation to the subagent group.
     * The tool part is created lazily - only when the subagent section is expanded,
     * unless it's actively streaming (not initially complete), in which case render immediately.
     */
    appendToolInvocation(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, codeBlockStartIndex: number): void;
    /**
     * Appends a markdown item (e.g., an edit pill) to the subagent content part.
     * This is used to route codeblockUri parts with subAgentInvocationId to this subagent's container.
     */
    appendMarkdownItem(factory: () => {
        domNode: HTMLElement;
        disposable?: IDisposable;
    }, _codeblocksPartId: string | undefined, _markdown: IChatMarkdownContent, _originalParent?: HTMLElement): void;
    /**
     * Appends a hook item (blocked/warning) to the subagent content part.
     */
    appendHookItem(factory: () => {
        domNode: HTMLElement;
        disposable?: IDisposable;
    }, hookPart: IChatHookPart): void;
    /**
     * Appends a hook item's DOM node to the wrapper.
     */
    private appendHookItemToDOM;
    /**
     * Appends a markdown item's DOM node to the wrapper.
     */
    private appendMarkdownItemToDOM;
    protected shouldInitEarly(): boolean;
    /**
     * Creates a ChatToolInvocationPart for the given tool invocation.
     */
    private createToolPart;
    /**
     * Appends a tool part's DOM node to the wrapper with appropriate icon wrapper.
     */
    private appendToolPartToDOM;
    /**
     * Materializes a lazy item by creating the content and adding it to the DOM.
     */
    private materializeLazyItem;
    /**
     * Materializes all pending lazy content (prompt, tool items, result) when the section is expanded.
     * This is called when first expanded, but the wrapper must exist (created by base class initContent).
     */
    private materializePendingContent;
    private performLayout;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], _element: ChatTreeItem): boolean;
}
