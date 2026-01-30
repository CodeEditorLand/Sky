import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo, IChatWidgetService } from '../../../chat.js';
import { IChatOutputRendererService } from '../../../chatOutputItemRenderer.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
export declare class ChatToolOutputSubPart extends BaseChatToolInvocationSubPart {
    private readonly context;
    private readonly chatOutputItemRendererService;
    private readonly chatWidgetService;
    private readonly instantiationService;
    /** Remembers cached state on re-render */
    private static readonly _cachedStates;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    private readonly _disposeCts;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, chatOutputItemRendererService: IChatOutputRendererService, chatWidgetService: IChatWidgetService, instantiationService: IInstantiationService);
    dispose(): void;
    private createOutputPart;
}
