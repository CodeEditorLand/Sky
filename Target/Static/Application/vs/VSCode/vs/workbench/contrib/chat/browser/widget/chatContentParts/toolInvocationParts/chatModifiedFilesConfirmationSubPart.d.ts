import { ICommandService } from '../../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../../platform/keybinding/common/keybinding.js';
import { IMarkdownRendererService } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IChatToolInvocation } from '../../../../common/chatService/chatService.js';
import { ILanguageModelToolsService } from '../../../../common/tools/languageModelToolsService.js';
import { IChatCodeBlockInfo, IChatWidgetService } from '../../../chat.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { CollapsibleListPool } from '../chatReferencesContentPart.js';
import { IEditorService } from '../../../../../../services/editor/common/editorService.js';
import { AbstractToolConfirmationSubPart } from './abstractToolConfirmationSubPart.js';
export declare class ChatModifiedFilesConfirmationSubPart extends AbstractToolConfirmationSubPart {
    private readonly listPool;
    private readonly markdownRendererService;
    private readonly editorService;
    private readonly commandService;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation, context: IChatContentPartRenderContext, listPool: CollapsibleListPool, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatWidgetService: IChatWidgetService, languageModelToolsService: ILanguageModelToolsService, markdownRendererService: IMarkdownRendererService, editorService: IEditorService, commandService: ICommandService);
    private createButtons;
    private createWidgetContentElement;
    private createModifiedFilesElement;
    private openAllChanges;
    protected createContentElement(): HTMLElement | string;
    protected getTitle(): string;
}
