import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRendererService } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import './media/chatDisabledClaudeHooksContent.css';
export declare class ChatDisabledClaudeHooksContentPart extends Disposable implements IChatContentPart {
    private readonly _openerService;
    private readonly _markdownRendererService;
    readonly domNode: HTMLElement;
    constructor(_context: IChatContentPartRenderContext, _openerService: IOpenerService, _markdownRendererService: IMarkdownRendererService);
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
