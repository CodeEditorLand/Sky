import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { ITerminalSandboxService } from '../../../common/terminalSandboxService.js';
import type { ICommandLineAnalyzer, ICommandLineAnalyzerOptions, ICommandLineAnalyzerResult } from './commandLineAnalyzer.js';
export declare class CommandLineSandboxAnalyzer extends Disposable implements ICommandLineAnalyzer {
    private readonly _sandboxService;
    constructor(_sandboxService: ITerminalSandboxService);
    analyze(_options: ICommandLineAnalyzerOptions): Promise<ICommandLineAnalyzerResult>;
}
