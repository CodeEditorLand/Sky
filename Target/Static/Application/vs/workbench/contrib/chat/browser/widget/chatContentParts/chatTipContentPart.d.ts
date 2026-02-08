import './media/chatTipContent.css';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatTip } from '../../chatTipService.js';
export declare class ChatTipContentPart extends Disposable {
    readonly domNode: HTMLElement;
    constructor(tip: IChatTip, renderer: IMarkdownRenderer);
}
