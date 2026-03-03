import { Action2 } from '../../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
/**
 * Action ID for showing the unified quick access widget.
 */
export declare const UNIFIED_QUICK_ACCESS_ACTION_ID = "workbench.action.unifiedQuickAccess";
/**
 * Action to show the unified quick access widget with tabbed providers.
 */
export declare class ShowUnifiedQuickAccessAction extends Action2 {
    static readonly ID = "workbench.action.unifiedQuickAccess";
    constructor();
    run(accessor: ServicesAccessor, initialTabId?: string): void;
}
/**
 * Action to show the unified quick access widget starting on the Agent Sessions tab.
 */
export declare class ShowAgentSessionsQuickAccessAction extends Action2 {
    static readonly ID = "workbench.action.showAgentSessionsQuickAccess";
    constructor();
    run(accessor: ServicesAccessor): void;
}
/**
 * Action to show the unified quick access widget starting on the Commands tab.
 */
export declare class ShowCommandsQuickAccessAction extends Action2 {
    static readonly ID = "workbench.action.showCommandsQuickAccess";
    constructor();
    run(accessor: ServicesAccessor): void;
}
/**
 * Action to show the unified quick access widget starting on the Files tab.
 */
export declare class ShowFilesQuickAccessAction extends Action2 {
    static readonly ID = "workbench.action.showFilesQuickAccess";
    constructor();
    run(accessor: ServicesAccessor): void;
}
