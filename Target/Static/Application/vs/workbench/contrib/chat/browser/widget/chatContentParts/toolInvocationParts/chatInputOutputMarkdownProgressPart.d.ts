import { IMarkdownString } from '../../../../../../../base/common/htmlContent.js';
import { ILanguageService } from '../../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../../editor/common/services/model.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IChatToolInvocation, IChatToolInvocationSerialized } from '../../../../common/chatService/chatService.js';
import { IToolResultInputOutputDetails } from '../../../../common/tools/languageModelToolsService.js';
import { IChatCodeBlockInfo } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
export declare class ChatInputOutputMarkdownProgressPart extends BaseChatToolInvocationSubPart {
    /** Remembers expanded tool parts on re-render */
    private static readonly _expandedByDefault;
    readonly domNode: HTMLElement;
    private _codeblocks;
    get codeblocks(): IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation | IChatToolInvocationSerialized, context: IChatContentPartRenderContext, codeBlockStartIndex: number, message: string | IMarkdownString, subtitle: string | IMarkdownString | undefined, input: string, output: IToolResultInputOutputDetails['output'] | undefined, isError: boolean, instantiationService: IInstantiationService, modelService: IModelService, languageService: ILanguageService);
    private getAutoApproveMessageContent;
}
