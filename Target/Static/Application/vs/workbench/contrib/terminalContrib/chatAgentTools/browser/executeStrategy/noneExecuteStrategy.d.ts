import type { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Event } from '../../../../../../base/common/event.js';
import { ITerminalLogService } from '../../../../../../platform/terminal/common/terminal.js';
import { type ITerminalExecuteStrategy, type ITerminalExecuteStrategyResult } from './executeStrategy.js';
import type { IMarker as IXtermMarker } from '@xterm/xterm';
import { ITerminalInstance } from '../../../../terminal/browser/terminal.js';
/**
 * This strategy is used when no shell integration is available. There are very few extension APIs
 * available in this case. This uses similar strategies to the basic integration strategy, but
 * with `sendText` instead of `shellIntegration.executeCommand` and relying on idle events instead
 * of execution events.
 */
export declare class NoneExecuteStrategy implements ITerminalExecuteStrategy {
    private readonly _instance;
    private readonly _hasReceivedUserInput;
    private readonly _logService;
    readonly type = "none";
    private readonly _startMarker;
    private readonly _onDidCreateStartMarker;
    onDidCreateStartMarker: Event<IXtermMarker | undefined>;
    constructor(_instance: ITerminalInstance, _hasReceivedUserInput: () => boolean, _logService: ITerminalLogService);
    execute(commandLine: string, token: CancellationToken, commandId?: string): Promise<ITerminalExecuteStrategyResult>;
    private _log;
}
