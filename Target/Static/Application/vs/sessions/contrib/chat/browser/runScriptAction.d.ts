import { Disposable } from '../../../../base/common/lifecycle.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkbenchContribution } from '../../../../workbench/common/contributions.js';
import { ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { ISessionsConfigurationService } from './sessionsConfigurationService.js';
export declare const RunScriptDropdownMenuId: MenuId;
/**
 * Workbench contribution that adds a split dropdown action to the auxiliary bar title
 * for running a task via tasks.json.
 */
export declare class RunScriptContribution extends Disposable implements IWorkbenchContribution {
    private readonly _activeSessionService;
    private readonly _quickInputService;
    private readonly _sessionsConfigService;
    static readonly ID = "workbench.contrib.agentSessions.runScript";
    private readonly _activeRunState;
    constructor(_activeSessionService: ISessionsManagementService, _quickInputService: IQuickInputService, _sessionsConfigService: ISessionsConfigurationService);
    private _registerActions;
    private _showConfigureQuickPick;
    private _showCustomCommandInput;
    private _pickStorageTarget;
}
