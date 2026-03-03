import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { ChatCollapsibleContentPart } from './chatCollapsibleContentPart.js';
import { IChatContentPartRenderContext } from './chatContentParts.js';
/**
 * A collapsible content part that displays markdown content.
 * The title is shown in the collapsed state, and the full content is shown when expanded.
 */
export declare class ChatCollapsibleMarkdownContentPart extends ChatCollapsibleContentPart {
    private readonly markdownContent;
    private readonly chatContentMarkdownRenderer;
    private contentElement;
    constructor(title: string, markdownContent: string, context: IChatContentPartRenderContext, chatContentMarkdownRenderer: IMarkdownRenderer, hoverService: IHoverService, configurationService: IConfigurationService);
    protected initContent(): HTMLElement;
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], _element: ChatTreeItem): boolean;
}
