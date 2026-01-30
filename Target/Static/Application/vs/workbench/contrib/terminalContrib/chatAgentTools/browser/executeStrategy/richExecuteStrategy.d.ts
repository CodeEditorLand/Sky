import type { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Event } from '../../../../../../base/common/event.js';
import type { ICommandDetectionCapability } from '../../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ITerminalLogService } from '../../../../../../platform/terminal/common/terminal.js';
import type { ITerminalInstance } from '../../../../terminal/browser/terminal.js';
import { type ITerminalExecuteStrategy, type ITerminalExecuteStrategyResult } from './executeStrategy.js';
import type { IMarker as IXtermMarker } from '@xterm/xterm';
/**
 * This strategy is used when the terminal has rich shell integration/command detection is
 * available, meaning every sequence we rely upon should be exactly where we expect it to be. In
 * particular (`633;`) `A, B, E, C, D` all happen in exactly that order. While things still could go
 * wrong in this state, minimal verification is done in this mode since rich command detection is a
 * strong signal that it's behaving correctly.
 */
export declare class RichExecuteStrategy implements ITerminalExecuteStrategy {
    private readonly _instance;
    private readonly _commandDetection;
    private readonly _logService;
    readonly type = "rich";
    private readonly _startMarker;
    private readonly _onDidCreateStartMarker;
    onDidCreateStartMarker: Event<IXtermMarker | undefined>;
    constructor(_instance: ITerminalInstance, _commandDetection: ICommandDetectionCapability, _logService: ITerminalLogService);
    execute(commandLine: string, token: CancellationToken, commandId?: string): Promise<ITerminalExecuteStrategyResult>;
    private _log;
}
