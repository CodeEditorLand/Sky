import { Separator } from '../../../../../../../base/common/actions.js';
import { IContextKeyService } from '../../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../../platform/keybinding/common/keybinding.js';
import { IChatToolInvocation } from '../../../../common/chatService/chatService.js';
import { ILanguageModelToolsConfirmationService } from '../../../../common/tools/languageModelToolsConfirmationService.js';
import { ILanguageModelToolsService } from '../../../../common/tools/languageModelToolsService.js';
import { IChatCodeBlockInfo, IChatWidgetService } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { AbstractToolConfirmationSubPart } from './abstractToolConfirmationSubPart.js';
export declare class ChatToolPostExecuteConfirmationPart extends AbstractToolConfirmationSubPart {
    private readonly confirmationService;
    private _codeblocks;
    get codeblocks(): IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatWidgetService: IChatWidgetService, languageModelToolsService: ILanguageModelToolsService, confirmationService: ILanguageModelToolsConfirmationService);
    protected createContentElement(): HTMLElement;
    protected getTitle(): string;
    protected additionalPrimaryActions(): (Separator | import("./abstractToolConfirmationSubPart.js").IAbstractToolPrimaryAction)[];
    private createResultsDisplay;
}
