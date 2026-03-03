import { IAction } from '../../../../../../base/common/actions.js';
import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownAction } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { AgentSessionProviders } from '../../agentSessions/agentSessions.js';
import { ChatInputPickerActionViewItem, IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { ISessionTypePickerDelegate } from '../../chat.js';
export interface ISessionTypeItem {
    type: AgentSessionProviders;
    label: string;
    hoverDescription: string;
    commandId: string;
}
/**
 * Action view item for selecting a session target in the chat interface.
 * This picker allows switching between different chat session types for new/empty sessions.
 */
export declare class SessionTypePickerActionItem extends ChatInputPickerActionViewItem {
    protected readonly chatSessionPosition: 'sidebar' | 'editor';
    protected readonly delegate: ISessionTypePickerDelegate;
    protected readonly keybindingService: IKeybindingService;
    protected readonly chatSessionsService: IChatSessionsService;
    protected readonly commandService: ICommandService;
    protected readonly openerService: IOpenerService;
    private _sessionTypeItems;
    constructor(action: MenuItemAction, chatSessionPosition: 'sidebar' | 'editor', delegate: ISessionTypePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatSessionsService: IChatSessionsService, commandService: ICommandService, openerService: IOpenerService, telemetryService: ITelemetryService);
    protected _run(sessionTypeItem: ISessionTypeItem): void;
    protected _getSelectedSessionType(): AgentSessionProviders | undefined;
    protected _getAdditionalActions(): IActionWidgetDropdownAction[];
    protected _getLearnMore(): IAction;
    private _updateAgentSessionItems;
    protected _isVisible(type: AgentSessionProviders): boolean;
    protected _isSessionTypeEnabled(type: AgentSessionProviders): boolean;
    protected _getSessionCategory(sessionTypeItem: ISessionTypeItem): {
        label: string;
        order: number;
    };
    protected _getSessionDescription(sessionTypeItem: ISessionTypeItem): string | undefined;
    protected renderLabel(element: HTMLElement): IDisposable | null;
}
