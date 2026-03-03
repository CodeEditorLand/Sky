import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import type { ICommandLineRewriter, ICommandLineRewriterOptions, ICommandLineRewriterResult } from './commandLineRewriter.js';
/**
 * Rewriter that prepends a space to commands to prevent them from being added to shell history for
 * certain shells. This depends on $VSCODE_PREVENT_SHELL_HISTORY being handled in shell integration
 * scripts to set `HISTCONTROL=ignorespace` (bash) or `HIST_IGNORE_SPACE` (zsh) env vars. The
 * prepended space is harmless so we don't try to remove it if shell integration isn't functional.
 */
export declare class CommandLinePreventHistoryRewriter extends Disposable implements ICommandLineRewriter {
    private readonly _configurationService;
    constructor(_configurationService: IConfigurationService);
    rewrite(options: ICommandLineRewriterOptions): ICommandLineRewriterResult | undefined;
}
