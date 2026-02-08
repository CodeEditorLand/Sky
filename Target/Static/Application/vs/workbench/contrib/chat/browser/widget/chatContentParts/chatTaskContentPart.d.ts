import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatTask, IChatTaskSerialized } from '../../../common/chatService/chatService.js';
import { IChatProgressRenderableResponseContent } from '../../../common/model/chatModel.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { CollapsibleListPool } from './chatReferencesContentPart.js';
export declare class ChatTaskContentPart extends Disposable implements IChatContentPart {
    private readonly task;
    readonly domNode: HTMLElement;
    private isSettled;
    constructor(task: IChatTask | IChatTaskSerialized, contentReferencesListPool: CollapsibleListPool, chatContentMarkdownRenderer: IMarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
