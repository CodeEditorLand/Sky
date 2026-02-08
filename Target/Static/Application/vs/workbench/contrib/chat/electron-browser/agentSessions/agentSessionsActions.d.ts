import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { Action2 } from '../../../../../platform/actions/common/actions.js';
export declare class OpenAgentSessionsWindowAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SwitchToAgentSessionsModeAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class SwitchToNormalModeAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
