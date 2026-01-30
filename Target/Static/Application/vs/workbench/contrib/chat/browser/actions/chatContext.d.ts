import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { IChatContextPickService, IChatContextValueItem } from '../attachments/chatContextPickService.js';
import { IChatRequestVariableEntry } from '../../common/attachments/chatVariableEntries.js';
import { IChatWidget } from '../chat.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { URI } from '../../../../../base/common/uri.js';
export declare class ChatContextContributions extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.contextContributions";
    constructor(instantiationService: IInstantiationService, contextPickService: IChatContextPickService);
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
