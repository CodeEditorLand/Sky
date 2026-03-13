import type { CancellationToken } from '../../../../../base/common/cancellation.js';
import { OperatingSystem } from '../../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService, ITerminalProfile } from '../../../../../platform/terminal/common/terminal.js';
import { ITerminalService, type ITerminalInstance } from '../../../terminal/browser/terminal.js';
export declare const enum ShellIntegrationQuality {
    None = "none",
    Basic = "basic",
    Rich = "rich"
}
export interface IToolTerminal {
    instance: ITerminalInstance;
    shellIntegrationQuality: ShellIntegrationQuality;
    receivedUserInput?: boolean;
    isBackground?: boolean;
}
export declare class ToolTerminalCreator {
    private readonly _configurationService;
    private readonly _logService;
    private readonly _terminalService;
    /**
     * The shell preference cached for the lifetime of the window. This allows skipping previous
     * shell approaches that failed in previous runs to save time.
     */
    private static _lastSuccessfulShell;
    constructor(_configurationService: IConfigurationService, _logService: ITerminalLogService, _terminalService: ITerminalService);
    createTerminal(shellOrProfile: string | ITerminalProfile, os: OperatingSystem, token: CancellationToken): Promise<IToolTerminal>;
    /**
     * Synchronously update shell integration quality based on the terminal instance's current
     * capabilities. This is a defensive change to avoid no shell integration being sticky
     * https://github.com/microsoft/vscode/issues/260880
     *
     * Only upgrade quality just in case.
     */
    refreshShellIntegrationQuality(toolTerminal: IToolTerminal): void;
    private _createCopilotTerminal;
    private _waitForShellIntegration;
}
