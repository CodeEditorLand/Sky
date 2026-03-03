import { OperatingSystem } from '../../../../../base/common/platform.js';
import type { ToolConfirmationAction } from '../../../chat/common/tools/languageModelToolsService.js';
import type { ICommandApprovalResultWithReason } from './tools/commandLineAnalyzer/autoApprove/commandLineAutoApprover.js';
export declare function isPowerShell(envShell: string, os: OperatingSystem): boolean;
export declare function isWindowsPowerShell(envShell: string): boolean;
export declare function isZsh(envShell: string, os: OperatingSystem): boolean;
export declare function isBash(envShell: string, os: OperatingSystem): boolean;
export declare function isFish(envShell: string, os: OperatingSystem): boolean;
export declare const TRUNCATION_MESSAGE = "\n\n[... PREVIOUS OUTPUT TRUNCATED ...]\n\n";
export declare function truncateOutputKeepingTail(output: string, maxLength: number): string;
export declare function sanitizeTerminalOutput(output: string): string;
export declare function generateAutoApproveActions(commandLine: string, subCommands: string[], autoApproveResult: {
    subCommandResults: ICommandApprovalResultWithReason[];
    commandLineResult: ICommandApprovalResultWithReason;
}): ToolConfirmationAction[];
export declare function dedupeRules(rules: ICommandApprovalResultWithReason[]): ICommandApprovalResultWithReason[];
export interface IExtractedCdPrefix {
    /** The directory path that was extracted from the cd command */
    directory: string;
    /** The command to run after the cd */
    command: string;
}
/**
 * Extracts a cd prefix from a command line, returning the directory and remaining command.
 * Does not check if the directory matches the current cwd - just extracts the pattern.
 */
export declare function extractCdPrefix(commandLine: string, shell: string, os: OperatingSystem): IExtractedCdPrefix | undefined;
