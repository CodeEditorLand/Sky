import { IAction } from '../../../../../../base/common/actions.js';
import { IActionWidgetService } from '../../../../../../platform/actionWidget/browser/actionWidget.js';
import { IActionWidgetDropdownAction } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatSessionsService } from '../../../common/chatSessionsService.js';
import { AgentSessionProviders } from '../../agentSessions/agentSessions.js';
import { ISessionTypePickerDelegate } from '../../chat.js';
import { IChatInputPickerOptions } from './chatInputPickerActionItem.js';
import { ISessionTypeItem, SessionTypePickerActionItem } from './sessionTargetPickerActionItem.js';
/**
 * Action view item for delegating to a remote session (Background or Cloud).
 * This picker allows switching to remote execution providers when the session is not empty.
 */
export declare class DelegationSessionPickerActionItem extends SessionTypePickerActionItem {
    private readonly _isSessionsWindow;
    constructor(action: MenuItemAction, chatSessionPosition: 'sidebar' | 'editor', delegate: ISessionTypePickerDelegate, pickerOptions: IChatInputPickerOptions, actionWidgetService: IActionWidgetService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, chatSessionsService: IChatSessionsService, commandService: ICommandService, openerService: IOpenerService, telemetryService: ITelemetryService);
    protected _run(sessionTypeItem: ISessionTypeItem): void;
    protected _getSelectedSessionType(): AgentSessionProviders | undefined;
    protected _isSessionTypeEnabled(type: AgentSessionProviders): boolean;
    protected _isVisible(type: AgentSessionProviders): boolean;
    protected _getSessionCategory(sessionTypeItem: ISessionTypeItem): {
        label: string;
        order: number;
        showHeader: boolean;
    };
    protected _getLearnMore(): IAction;
    protected _getAdditionalActions(): IActionWidgetDropdownAction[];
}
