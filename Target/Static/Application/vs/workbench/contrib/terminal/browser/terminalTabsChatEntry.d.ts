import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ITerminalChatService, ITerminalService } from './terminal.js';
export declare class TerminalTabsChatEntry extends Disposable {
    private readonly _tabContainer;
    private readonly _commandService;
    private readonly _terminalChatService;
    private readonly _terminalService;
    private readonly _entry;
    private readonly _label;
    private readonly _deleteButton;
    dispose(): void;
    constructor(container: HTMLElement, _tabContainer: HTMLElement, _commandService: ICommandService, _terminalChatService: ITerminalChatService, _terminalService: ITerminalService);
    private _deleteAllHiddenTerminals;
    get element(): HTMLElement;
    update(): void;
}
