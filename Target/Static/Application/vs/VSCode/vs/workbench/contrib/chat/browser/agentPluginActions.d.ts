import { Action, IAction, IActionChangeEvent } from '../../../../base/common/actions.js';
import { Emitter } from '../../../../base/common/event.js';
import { IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { ActionWithDropdownActionViewItem, IActionWithDropdownActionViewItemOptions } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { IContextMenuProvider } from '../../../../base/browser/contextmenu.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEnablementModel } from '../common/enablement.js';
import { IAgentPlugin } from '../common/plugins/agentPluginService.js';
import { IPluginInstallService } from '../common/plugins/pluginInstallService.js';
import { IMarketplacePluginItem } from './agentPluginEditor/agentPluginItems.js';
export declare class InstallPluginAction extends Action {
    constructor(item: IMarketplacePluginItem, pluginInstallService: IPluginInstallService);
}
export declare class UninstallPluginAction extends Action {
    constructor(plugin: IAgentPlugin);
}
export declare class OpenPluginFolderAction extends Action {
    constructor(plugin: IAgentPlugin, commandService: ICommandService, openerService: IOpenerService);
}
export declare class OpenPluginReadmeAction extends Action {
    constructor(readmeUri: import('../../../../base/common/uri.js').URI, openerService: IOpenerService);
}
/**
 * Builds the standard context menu action groups for an installed plugin.
 */
export declare function getInstalledPluginContextMenuActions(plugin: IAgentPlugin, instantiationService: IInstantiationService): IAction[][];
/**
 * Sub-action base class that auto-hides when disabled, for use inside
 * {@link EnablementDropDownAction}.
 */
declare class EnablementSubAction extends Action {
    private _hidden;
    get hidden(): boolean;
    set hidden(v: boolean);
    constructor(id: string, label: string, cssClass: string, enabled: boolean, actionCallback: () => Promise<void>);
    protected _setEnabled(value: boolean): void;
}
interface IEnablementActionChangeEvent extends IActionChangeEvent {
    readonly menuActions?: IAction[];
}
/**
 * Dropdown action that aggregates enablement sub-actions and shows the
 * first visible one as the primary button, with others in the dropdown.
 * Hides itself entirely when all sub-actions are hidden.
 */
export declare class EnablementDropDownAction extends Action {
    readonly menuActionClassNames: string[];
    private _menuActions;
    get menuActions(): IAction[];
    private _isHidden;
    get isHidden(): boolean;
    protected readonly _onDidChange: Emitter<IEnablementActionChangeEvent>;
    get onDidChange(): import("../../../../base/common/event.js").Event<IEnablementActionChangeEvent>;
    private readonly subActions;
    constructor(id: string, subActions: EnablementSubAction[]);
    private _updateDropdown;
    run(): Promise<void>;
    dispose(): void;
}
/**
 * View item for {@link EnablementDropDownAction} that properly hides
 * the dropdown chevron when there are no secondary actions.
 */
export declare class EnablementDropdownActionViewItem extends ActionWithDropdownActionViewItem {
    constructor(action: EnablementDropDownAction, options: IActionViewItemOptions & IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    protected updateClass(): void;
}
/**
 * Creates the enable dropdown action for a plugin, containing Enable
 * and Enable (Workspace) sub-actions.
 */
export declare function createEnablePluginDropDown(plugin: IAgentPlugin, enablementModel: IEnablementModel, workspaceContextService: IWorkspaceContextService): EnablementDropDownAction;
/**
 * Creates the disable dropdown action for a plugin, containing Disable
 * and Disable (Workspace) sub-actions.
 */
export declare function createDisablePluginDropDown(plugin: IAgentPlugin, enablementModel: IEnablementModel, workspaceContextService: IWorkspaceContextService): EnablementDropDownAction;
export {};
