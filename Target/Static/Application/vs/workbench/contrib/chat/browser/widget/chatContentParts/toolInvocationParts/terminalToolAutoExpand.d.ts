import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { Event } from '../../../../../../../base/common/event.js';
import type { ICommandDetectionCapability } from '../../../../../../../platform/terminal/common/capabilities/capabilities.js';
/**
 * The auto-expand algorithm for terminal tool progress parts.
 *
 * The algorithm is:
 * 1. When command executes, kick off 500ms timeout - if hit without data events, expand only if there's real output
 * 2. On first data event, wait 50ms and expand if command not yet finished
 * 3. Fast commands (finishing quickly) should NOT auto-expand to prevent flickering
 */
export interface ITerminalToolAutoExpandOptions {
    /**
     * The command detection capability to listen for command events.
     */
    readonly commandDetection: ICommandDetectionCapability;
    /**
     * Event fired when data is received from the terminal.
     */
    readonly onWillData: Event<unknown>;
    /**
     * Check if the output should auto-expand (e.g. not already expanded, user hasn't toggled).
     */
    shouldAutoExpand(): boolean;
    /**
     * Check if there is real output (not just shell integration sequences).
     */
    hasRealOutput(): boolean;
}
/**
 * Timeout constants for the auto-expand algorithm.
 */
export declare const enum TerminalToolAutoExpandTimeout {
    /**
     * Timeout in milliseconds to wait when no data events are received before checking for auto-expand.
     */
    NoData = 500,
    /**
     * Timeout in milliseconds to wait after first data event before checking for auto-expand.
     * This prevents flickering for fast commands like `ls` that finish quickly.
     */
    DataEvent = 50
}
export declare class TerminalToolAutoExpand extends Disposable {
    private readonly _options;
    private _commandFinished;
    private _receivedData;
    private _dataEventTimeout;
    private _noDataTimeout;
    private readonly _onDidRequestExpand;
    readonly onDidRequestExpand: Event<void>;
    constructor(_options: ITerminalToolAutoExpandOptions);
    private _setupListeners;
    private _clearAutoExpandTimeouts;
}
