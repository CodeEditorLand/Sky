import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { ISessionTypePickerDelegate } from '../../chat.js';
/**
 * Action view item for selecting a session target in the chat interface.
 * This picker allows switching between different chat session types contributed via extensions.
 */
export declare class SessionTypePickerActionItem extends ChatInputPickerActionViewItem {
    private readonly chatSessionPosition;
    private readonly delegate;
    private readonly chatSessionsService;
    private readonly commandService;
    private _sessionTypeItems;
    constructor(action: MenuItemAction, chatSessionPosition: 'sidebar' | 'editor', delegate: ISessionTypePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatSessionsService: IChatSessionsService, commandService: ICommandService, openerService: IOpenerService);
    private _updateAgentSessionItems;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
