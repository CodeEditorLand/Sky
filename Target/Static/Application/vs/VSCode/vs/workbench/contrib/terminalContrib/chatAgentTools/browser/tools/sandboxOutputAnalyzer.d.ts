import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ITerminalSandboxService } from '../../common/terminalSandboxService.js';
import type { IOutputAnalyzer, IOutputAnalyzerOptions } from './outputAnalyzer.js';
export declare class SandboxOutputAnalyzer extends Disposable implements IOutputAnalyzer {
    private readonly _sandboxService;
    constructor(_sandboxService: ITerminalSandboxService);
    analyze(options: IOutputAnalyzerOptions): Promise<string | undefined>;
}
