import { Action2 } from '../../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
import { IAgentSession, IMarshalledAgentSessionContext } from '../agentSessionsModel.js';
import { ToggleTitleBarConfigAction } from '../../../../../browser/parts/titlebar/titlebarActions.js';
export declare class EnterAgentSessionProjectionAction extends Action2 {
    static readonly ID = "agentSession.enterAgentSessionProjection";
    constructor();
    run(accessor: ServicesAccessor, context?: IAgentSession | IMarshalledAgentSessionContext): Promise<void>;
}
export declare class ExitAgentSessionProjectionAction extends Action2 {
    static readonly ID = "agentSession.exitAgentSessionProjection";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleAgentStatusAction extends ToggleTitleBarConfigAction {
    constructor();
}
export declare class ToggleUnifiedAgentsBarAction extends ToggleTitleBarConfigAction {
    constructor();
}
