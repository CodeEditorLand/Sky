import { ITerminalSandboxService } from '../../../common/terminalSandboxService.js';
import type { ICommandLinePresenter, ICommandLinePresenterOptions, ICommandLinePresenterResult } from './commandLinePresenter.js';
/**
 * Command line presenter for sandboxed commands.
 * Extracts the original command from the sandbox wrapper for cleaner display,
 * while the actual sandboxed command runs unchanged.
 */
export declare class SandboxedCommandLinePresenter implements ICommandLinePresenter {
    private readonly _sandboxService;
    constructor(_sandboxService: ITerminalSandboxService);
    present(options: ICommandLinePresenterOptions): Promise<ICommandLinePresenterResult | undefined>;
}
