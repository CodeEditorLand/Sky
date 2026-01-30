import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { ChatErrorLevel } from '../../../common/chatService/chatService.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { IChatContentPart } from './chatContentParts.js';
export declare class ChatErrorContentPart extends Disposable implements IChatContentPart {
    private readonly errorDetails;
    readonly domNode: HTMLElement;
    constructor(kind: ChatErrorLevel, content: IMarkdownString, errorDetails: IChatRendererContent, renderer: IMarkdownRenderer);
    hasSameContent(other: IChatRendererContent): boolean;
}
export declare class ChatErrorWidget extends Disposable {
    readonly domNode: HTMLElement;
    constructor(kind: ChatErrorLevel, content: IMarkdownString, renderer: IMarkdownRenderer);
}
