import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { ChatCollapsibleContentPart } from './chatCollapsibleContentPart.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../common/chatService/chatService.js';
import './media/chatSubagentContent.css';
/**
 * This is generally copied from ChatThinkingContentPart. We are still experimenting with both UIs so I'm not
 * trying to refactor to share code. Both could probably be simplified when stable.
 */
export declare class ChatSubagentContentPart extends ChatCollapsibleContentPart implements IChatContentPart {
    readonly subAgentInvocationId: string;
    private readonly context;
    private readonly chatContentMarkdownRenderer;
    private readonly instantiationService;
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
    /**
     * Extracts subagent info (description, agentName, prompt) from a tool invocation.
     */
    private static extractSubagentInfo;
    constructor(subAgentInvocationId: string, toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, chatContentMarkdownRenderer: IMarkdownRenderer, instantiationService: IInstantiationService, hoverService: IHoverService);
    protected initContent(): HTMLElement;
    /**
     * Renders the prompt as a collapsible section at the start of the content.
     */
    private renderPromptSection;
    getIsActive(): boolean;
    markAsInactive(): void;
    finalizeTitle(): void;
    private updateTitle;
    /**
     * Watches the tool invocation for completion and renders the result.
     * Handles both live and serialized invocations.
     */
    private watchToolCompletion;
    renderResultText(resultText: string): void;
    appendItem(content: HTMLElement, toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized): void;
    private performLayout;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], _element: ChatTreeItem): boolean;
}
