import type { CancellationToken } from '../../../../../../base/common/cancellation.js';
import type { Event } from '../../../../../../base/common/event.js';
import { DisposableStore, type IDisposable } from '../../../../../../base/common/lifecycle.js';
import type { ITerminalInstance } from '../../../../terminal/browser/terminal.js';
import type { IMarker as IXtermMarker } from '@xterm/xterm';
export interface ITerminalExecuteStrategy extends IDisposable {
    readonly type: 'rich' | 'basic' | 'none';
    /**
     * Executes a command line and gets a result designed to be passed directly to an LLM. The
     * result will include information about the exit code.
     * @param commandLine The command line to execute
     * @param token Cancellation token
     * @param commandId Optional predefined command ID to link the command
     */
    execute(commandLine: string, token: CancellationToken, commandId?: string): Promise<ITerminalExecuteStrategyResult>;
    readonly onDidCreateStartMarker: Event<IXtermMarker | undefined>;
}
export interface ITerminalExecuteStrategyResult {
    output: string | undefined;
    additionalInformation?: string;
    exitCode?: number;
    error?: string;
    didEnterAltBuffer?: boolean;
}
export declare function waitForIdle(onData: Event<unknown>, idleDurationMs: number): Promise<void>;
export interface IPromptDetectionResult {
    /**
     * Whether a prompt was detected.
     */
    detected: boolean;
    /**
     * The reason for logging.
     */
    reason?: string;
}
/**
 * Detects if the given text content appears to end with a common prompt pattern.
 */
export declare function detectsCommonPromptPattern(cursorLine: string): IPromptDetectionResult;
/**
 * Enhanced version of {@link waitForIdle} that uses prompt detection heuristics. After the terminal
 * idles for the specified period, checks if the terminal's cursor line looks like a common prompt.
 * If not, extends the timeout to give the command more time to complete.
 */
export declare function waitForIdleWithPromptHeuristics(onData: Event<unknown>, instance: ITerminalInstance, idlePollIntervalMs: number, extendedTimeoutMs: number): Promise<IPromptDetectionResult>;
/**
 * Tracks the terminal for being idle on a prompt input. This must be called before `executeCommand`
 * is called.
 */
export declare function trackIdleOnPrompt(instance: ITerminalInstance, idleDurationMs: number, store: DisposableStore): Promise<void>;
