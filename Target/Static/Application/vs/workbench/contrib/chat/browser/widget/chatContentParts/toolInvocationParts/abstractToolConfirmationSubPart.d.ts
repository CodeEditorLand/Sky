import { Separator } from '../../../../../../../base/common/actions.js';
import { IContextKeyService } from '../../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../../platform/keybinding/common/keybinding.js';
import { ConfirmedReason, IChatToolInvocation } from '../../../../common/chatService/chatService.js';
import { ILanguageModelToolsService } from '../../../../common/tools/languageModelToolsService.js';
import { IChatWidgetService } from '../../../chat.js';
import { IChatConfirmationButton } from '../chatConfirmationWidget.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
export interface IToolConfirmationConfig {
    allowActionId: string;
    skipActionId: string;
    allowLabel: string;
    skipLabel: string;
    partType: string;
    subtitle?: string;
}
type AbstractToolPrimaryAction = IChatConfirmationButton<(() => void)> | Separator;
/**
 * Base class for a tool confirmation.
 *
 * note that implementors MUST call render() after they construct.
 */
export declare abstract class AbstractToolConfirmationSubPart extends BaseChatToolInvocationSubPart {
    protected readonly toolInvocation: IChatToolInvocation;
    protected readonly context: IChatContentPartRenderContext;
    protected readonly instantiationService: IInstantiationService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly chatWidgetService: IChatWidgetService;
    protected readonly languageModelToolsService: ILanguageModelToolsService;
    domNode: HTMLElement;
    constructor(toolInvocation: IChatToolInvocation, context: IChatContentPartRenderContext, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatWidgetService: IChatWidgetService, languageModelToolsService: ILanguageModelToolsService);
    protected render(config: IToolConfirmationConfig): void;
    protected confirmWith(toolInvocation: IChatToolInvocation, reason: ConfirmedReason): void;
    protected additionalPrimaryActions(): AbstractToolPrimaryAction[];
    protected abstract createContentElement(): HTMLElement | string;
    protected abstract getTitle(): string;
}
export {};
