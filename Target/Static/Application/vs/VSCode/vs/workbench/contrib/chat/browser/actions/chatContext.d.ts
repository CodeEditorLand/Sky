import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatContextPickService, IChatContextValueItem } from '../attachments/chatContextPickService.js';
import { IChatRequestVariableEntry } from '../../common/attachments/chatVariableEntries.js';
import { ILanguageModelToolsService } from '../../common/tools/languageModelToolsService.js';
import { IChatWidget, IChatWidgetService } from '../chat.js';
import { IChatDebugService } from '../../common/chatDebugService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { URI } from '../../../../../base/common/uri.js';
/**
 * Command ID that extensions can call to enable debug tools for the current
 * chat session. Sets the context key and immediately flushes tool updates so
 * that newly-enabled tools are visible on the next `vscode.lm.tools` read.
 */
export declare const EnableChatDebugToolsCommandId = "chat.enableDebugTools";
export declare class ChatContextContributions extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.contextContributions";
    constructor(instantiationService: IInstantiationService, contextPickService: IChatContextPickService, chatDebugService: IChatDebugService, contextKeyService: IContextKeyService, languageModelToolsService: ILanguageModelToolsService, chatWidgetService: IChatWidgetService);
}
export declare class TerminalContext implements IChatContextValueItem {
    private readonly _resource;
    private readonly _terminalService;
    readonly type = "valuePick";
    readonly icon: ThemeIcon;
    readonly label: string;
    constructor(_resource: URI, _terminalService: ITerminalService);
    isEnabled(widget: IChatWidget): boolean;
    asAttachment(widget: IChatWidget): Promise<IChatRequestVariableEntry | undefined>;
    private asValue;
}
