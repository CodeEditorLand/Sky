import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import type { TreeSitterCommandParser } from '../../treeSitterCommandParser.js';
import type { ICommandLineRewriter, ICommandLineRewriterOptions, ICommandLineRewriterResult } from './commandLineRewriter.js';
export declare class CommandLinePwshChainOperatorRewriter extends Disposable implements ICommandLineRewriter {
    private readonly _treeSitterCommandParser;
    constructor(_treeSitterCommandParser: TreeSitterCommandParser);
    rewrite(options: ICommandLineRewriterOptions): Promise<ICommandLineRewriterResult | undefined>;
}
