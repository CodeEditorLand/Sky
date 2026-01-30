import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IChatProgressRenderableResponseContent } from '../../../common/model/chatModel.js';
import { IChatConfirmation, IChatService } from '../../../common/chatService/chatService.js';
import { IChatWidgetService } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
export declare class ChatConfirmationContentPart extends Disposable implements IChatContentPart {
    private readonly instantiationService;
    private readonly chatService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    constructor(confirmation: IChatConfirmation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatService: IChatService, chatWidgetService: IChatWidgetService);
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
