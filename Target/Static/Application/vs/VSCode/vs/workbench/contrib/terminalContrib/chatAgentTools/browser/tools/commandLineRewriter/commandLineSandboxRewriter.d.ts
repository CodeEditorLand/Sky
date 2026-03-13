import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { ITerminalSandboxService } from '../../../common/terminalSandboxService.js';
import type { ICommandLineRewriter, ICommandLineRewriterOptions, ICommandLineRewriterResult } from './commandLineRewriter.js';
export declare class CommandLineSandboxRewriter extends Disposable implements ICommandLineRewriter {
    private readonly _sandboxService;
    constructor(_sandboxService: ITerminalSandboxService);
    rewrite(options: ICommandLineRewriterOptions): Promise<ICommandLineRewriterResult | undefined>;
}
