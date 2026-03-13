import { IChatTerminalToolInvocationData } from '../../../../chat/common/chatService/chatService.js';
import { ITerminalInstance } from '../../../../terminal/browser/terminal.js';
import { ITerminalLogService } from '../../../../../../platform/terminal/common/terminal.js';
export declare class TerminalCommandArtifactCollector {
    private readonly _logService;
    constructor(_logService: ITerminalLogService);
    capture(toolSpecificData: IChatTerminalToolInvocationData, instance: ITerminalInstance, commandId: string | undefined): Promise<void>;
    private _captureCommandOutput;
    /**
     * Captures output from a partial/current command that hasn't finished yet.
     * This is used when the command is cancelled mid-execution.
     */
    private _capturePartialCommandOutput;
    private _applyTheme;
    private _createTerminalCommandUri;
    private _tryGetCommand;
}
