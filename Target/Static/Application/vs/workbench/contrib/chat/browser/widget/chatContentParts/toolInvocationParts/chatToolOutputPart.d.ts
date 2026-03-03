import { Event } from '../../../../../../../base/common/event.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo, IChatWidgetService } from '../../../chat.js';
import { IChatOutputRendererService } from '../../../chatOutputItemRenderer.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
import { IChatToolOutputStateCache } from './chatToolOutputStateCache.js';
export declare class ChatToolOutputSubPart extends BaseChatToolInvocationSubPart {
    private readonly context;
    private readonly onDidRemount;
    private readonly chatOutputItemRendererService;
    private readonly chatWidgetService;
    private readonly instantiationService;
    private readonly stateCache;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    private readonly _disposeCts;
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, onDidRemount: Event<void>, chatOutputItemRendererService: IChatOutputRendererService, chatWidgetService: IChatWidgetService, instantiationService: IInstantiationService, stateCache: IChatToolOutputStateCache);
    dispose(): void;
    private createOutputPart;
}
