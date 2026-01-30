import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import type { ICommandLineRewriter, ICommandLineRewriterOptions, ICommandLineRewriterResult } from './commandLineRewriter.js';
export declare class CommandLineCdPrefixRewriter extends Disposable implements ICommandLineRewriter {
    rewrite(options: ICommandLineRewriterOptions): ICommandLineRewriterResult | undefined;
}
