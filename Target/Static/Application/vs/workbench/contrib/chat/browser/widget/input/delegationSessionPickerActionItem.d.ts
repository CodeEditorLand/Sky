import { IAction } from '../../../../../../base/common/actions.js';
import { IActionWidgetDropdownAction } from '../../../../../../platform/actionWidget/browser/actionWidgetDropdown.js';
import { AgentSessionProviders } from '../../agentSessions/agentSessions.js';
import { ISessionTypeItem, SessionTypePickerActionItem } from './sessionTargetPickerActionItem.js';
/**
 * Action view item for delegating to a remote session (Background or Cloud).
 * This picker allows switching to remote execution providers when the session is not empty.
 */
export declare class DelegationSessionPickerActionItem extends SessionTypePickerActionItem {
    protected _run(sessionTypeItem: ISessionTypeItem): void;
    protected _getSelectedSessionType(): AgentSessionProviders | undefined;
    protected _isSessionTypeEnabled(type: AgentSessionProviders): boolean;
    protected _isVisible(type: AgentSessionProviders): boolean;
    protected _getSessionCategory(sessionTypeItem: ISessionTypeItem): {
        label: string;
        order: number;
        showHeader: boolean;
    };
    protected _getSessionDescription(sessionTypeItem: ISessionTypeItem): string | undefined;
    protected _getLearnMore(): IAction;
    protected _getAdditionalActions(): IActionWidgetDropdownAction[];
}
