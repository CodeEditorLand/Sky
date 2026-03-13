import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class ManagePluginsAction extends Action2 {
    static readonly ID = "workbench.action.chat.managePlugins";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare function registerChatPluginActions(): void;
