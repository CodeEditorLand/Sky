import { IAction } from '../../../../base/common/actions.js';
import { IMenu } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IExtensionTerminalProfile, ITerminalProfile } from '../../../../platform/terminal/common/terminal.js';
import { ITerminalLocationOptions, ITerminalService } from './terminal.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
export declare const enum TerminalContextMenuGroup {
    Chat = "0_chat",
    Create = "1_create",
    Edit = "3_edit",
    Clear = "5_clear",
    Kill = "7_kill",
    Config = "9_config"
}
export declare const enum TerminalMenuBarGroup {
    Create = "1_create",
    Run = "3_run",
    Manage = "5_manage",
    Configure = "7_configure"
}
export declare function setupTerminalMenus(): void;
export declare function getTerminalActionBarArgs(location: ITerminalLocationOptions, profiles: ITerminalProfile[], defaultProfileName: string, contributedProfiles: readonly IExtensionTerminalProfile[], terminalService: ITerminalService, dropdownMenu: IMenu, disposableStore: DisposableStore, configurationService: IConfigurationService): {
    dropdownAction: IAction;
    dropdownMenuActions: IAction[];
    className: string;
    dropdownIcon?: string;
};
