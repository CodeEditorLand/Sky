import { ILanguageService } from '../../../../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../../../../platform/dialogs/common/dialogs.js';
import { IHoverService } from '../../../../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../../../platform/keybinding/common/keybinding.js';
import { IMarkdownRenderer } from '../../../../../../../platform/markdown/browser/markdownRenderer.js';
import { IStorageService } from '../../../../../../../platform/storage/common/storage.js';
import { IPreferencesService } from '../../../../../../services/preferences/common/preferences.js';
import { ITerminalChatService } from '../../../../../terminal/browser/terminal.js';
import { IChatToolInvocation, type IChatTerminalToolInvocationData, type ILegacyChatTerminalToolInvocationData } from '../../../../common/chatService/chatService.js';
import type { CodeBlockModelCollection } from '../../../../common/widget/codeBlockModelCollection.js';
import { IChatCodeBlockInfo, IChatWidgetService } from '../../../chat.js';
import { EditorPool } from '../chatContentCodePools.js';
import { IChatContentPartRenderContext } from '../chatContentParts.js';
import { BaseChatToolInvocationSubPart } from './chatToolInvocationSubPart.js';
export declare const enum TerminalToolConfirmationStorageKeys {
    TerminalAutoApproveWarningAccepted = "chat.tools.terminal.autoApprove.warningAccepted"
}
export interface ITerminalNewAutoApproveRule {
    key: string;
    value: boolean | {
        approve: boolean;
        matchCommandLine?: boolean;
    };
    scope: 'session' | 'workspace' | 'user';
}
export type TerminalNewAutoApproveButtonData = ({
    type: 'enable';
} | {
    type: 'configure';
} | {
    type: 'skip';
} | {
    type: 'newRule';
    rule: ITerminalNewAutoApproveRule | ITerminalNewAutoApproveRule[];
} | {
    type: 'sessionApproval';
});
export declare class ChatTerminalToolConfirmationSubPart extends BaseChatToolInvocationSubPart {
    private readonly context;
    private readonly renderer;
    private readonly editorPool;
    private readonly currentWidthDelegate;
    private readonly codeBlockModelCollection;
    private readonly codeBlockStartIndex;
    private readonly instantiationService;
    private readonly dialogService;
    private readonly keybindingService;
    private readonly modelService;
    private readonly languageService;
    private readonly configurationService;
    private readonly contextKeyService;
    private readonly chatWidgetService;
    private readonly preferencesService;
    private readonly storageService;
    private readonly terminalChatService;
    readonly domNode: HTMLElement;
    readonly codeblocks: IChatCodeBlockInfo[];
    constructor(toolInvocation: IChatToolInvocation, terminalData: IChatTerminalToolInvocationData | ILegacyChatTerminalToolInvocationData, context: IChatContentPartRenderContext, renderer: IMarkdownRenderer, editorPool: EditorPool, currentWidthDelegate: () => number, codeBlockModelCollection: CodeBlockModelCollection, codeBlockStartIndex: number, instantiationService: IInstantiationService, dialogService: IDialogService, keybindingService: IKeybindingService, modelService: IModelService, languageService: ILanguageService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, chatWidgetService: IChatWidgetService, preferencesService: IPreferencesService, storageService: IStorageService, terminalChatService: ITerminalChatService, textModelService: ITextModelService, hoverService: IHoverService);
    private _createButtons;
    private _showAutoApproveWarning;
    private _getUniqueCodeBlockUri;
    private _appendMarkdownPart;
}
