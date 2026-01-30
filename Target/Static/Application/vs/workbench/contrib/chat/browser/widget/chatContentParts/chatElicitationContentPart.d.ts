import { Disposable, IDisposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IChatProgressRenderableResponseContent } from '../../../common/model/chatModel.js';
import { IChatElicitationRequest, IChatElicitationRequestSerialized } from '../../../common/chatService/chatService.js';
import { IChatAccessibilityService } from '../../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
export declare class ChatElicitationContentPart extends Disposable implements IChatContentPart {
    private readonly elicitation;
    private readonly instantiationService;
    private readonly chatAccessibilityService;
    private readonly contextKeyService;
    private readonly keybindingService;
    readonly domNode: HTMLElement;
    private readonly _onDidChangeHeight;
    readonly onDidChangeHeight: import("../../../../../../base/common/event.js").Event<void>;
    private readonly _confirmWidget;
    get codeblocks(): import("../../chat.js").IChatCodeBlockInfo[] | undefined;
    get codeblocksPartId(): string | undefined;
    constructor(elicitation: IChatElicitationRequest | IChatElicitationRequestSerialized, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, chatAccessibilityService: IChatAccessibilityService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    private getMessageToRender;
    hasSameContent(other: IChatProgressRenderableResponseContent): boolean;
    addDisposable(disposable: IDisposable): void;
}
