import { Action, IAction } from '../../../../base/common/actions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ContributionEnablementState, IEnablementModel } from '../common/enablement.js';
/**
 * Creates the four standard enablement actions (Enable, Enable Workspace,
 * Disable, Disable Workspace) for a contribution identified by a string key.
 */
export declare function createEnablementActions(key: string, enablementModel: IEnablementModel, idPrefix: string): [enable: Action, enableWorkspace: Action, disable: Action, disableWorkspace: Action];
/**
 * Builds the standard enablement context-menu action group for a
 * contribution. Returns either the enable or disable actions depending
 * on the current state, with workspace variants included only when a
 * workspace is open.
 */
export declare function buildEnablementContextMenuGroup(enablementState: ContributionEnablementState, key: string, enablementModel: IEnablementModel, workspaceContextService: IWorkspaceContextService, idPrefix: string): IAction[];
