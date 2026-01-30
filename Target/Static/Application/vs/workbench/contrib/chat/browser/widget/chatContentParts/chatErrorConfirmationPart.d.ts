import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ChatErrorLevel, IChatResponseErrorDetailsConfirmationButton, IChatService } from '../../../common/chatService/chatService.js';
import { IChatErrorDetailsPart, IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { IChatWidgetService } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
export declare class ChatErrorConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly errorDetails;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    constructor(kind: ChatErrorLevel, content: IMarkdownString, errorDetails: IChatErrorDetailsPart, confirmationButtons: IChatResponseErrorDetailsConfirmationButton[], renderer: IMarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatWidgetService: IChatWidgetService, chatService: IChatService);
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
