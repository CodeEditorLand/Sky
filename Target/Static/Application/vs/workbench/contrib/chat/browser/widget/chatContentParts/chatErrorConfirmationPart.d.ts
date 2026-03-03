import { IMarkdownString } from '../../../../../../base/common/htmlContent.js';
import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IMarkdownRenderer } from '../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ChatErrorLevel, IChatResponseErrorDetailsConfirmationButton, IChatService } from '../../../common/chatService/chatService.js';
import { IChatErrorDetailsPart, IChatRendererContent } from '../../../common/model/chatViewModel.js';
import { IChatAccessibilityService, IChatWidgetService } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
export declare class ChatErrorConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly errorDetails;
    private readonly chatAccessibilityService;
    readonly domNode: HTMLElement;
    constructor(kind: ChatErrorLevel, content: IMarkdownString, errorDetails: IChatErrorDetailsPart, confirmationButtons: IChatResponseErrorDetailsConfirmationButton[], renderer: IMarkdownRenderer, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatWidgetService: IChatWidgetService, chatService: IChatService, chatAccessibilityService: IChatAccessibilityService);
    hasSameContent(other: IChatRendererContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
