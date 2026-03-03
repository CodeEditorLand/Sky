import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatWorkspaceEdit } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { ChatTreeItem } from '../../chat.js';
import { IChatMarkdownAnchorService } from './chatMarkdownAnchorService.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { ILabelService } from '../../../../../../platform/label/common/label.js';
export declare class ChatWorkspaceEditContentPart extends Disposable implements IChatContentPart {
    private readonly workspaceEdit;
    private readonly instantiationService;
    private readonly chatMarkdownAnchorService;
    private readonly labelService;
    readonly domNode: HTMLElement;
    constructor(workspaceEdit: IChatWorkspaceEdit, _context: IChatContentPartRenderContext, chatContentMarkdownRenderer: IMarkdownRenderer, instantiationService: IInstantiationService, chatMarkdownAnchorService: IChatMarkdownAnchorService, labelService: ILabelService);
    hasSameContent(other: IChatRendererContent, _followingContent: IChatRendererContent[], _element: ChatTreeItem): boolean;
}
