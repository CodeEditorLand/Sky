import { IMarkdownRenderer } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation } from '../../../../common/chatService/chatService.js';
import { IChatCodeBlockInfo } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
/**
 * Sub-part for rendering a tool invocation in the streaming state.
 * This shows progress while the tool arguments are being streamed from the LM.
 */
export declare class ChatToolStreamingSubPart extends BaseChatToolInvocationSubPart {
    private readonly context;
    private readonly renderer;
    private readonly instantiationService;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation, context: IChatContentPartRenderContext, renderer: IMarkdownRenderer, instantiationService: IInstantiationService);
    private createStreamingPart;
}
