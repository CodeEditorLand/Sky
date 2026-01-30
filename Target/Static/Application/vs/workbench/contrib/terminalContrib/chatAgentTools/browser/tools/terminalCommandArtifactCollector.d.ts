import { IChatTerminalToolInvocationData } from '../../../../chat/common/chatService/chatService.js';
import { ITerminalInstance } from '../../../../terminal/browser/terminal.js';
import { ITerminalLogService } from '../../../../../../platform/terminal/common/terminal.js';
export declare class TerminalCommandArtifactCollector {
    private readonly _logService;
    constructor(_logService: ITerminalLogService);
    capture(toolSpecificData: IChatTerminalToolInvocationData, instance: ITerminalInstance, commandId: string | undefined): Promise<void>;
    private _captureCommandOutput;
    private _applyTheme;
    private _createTerminalCommandUri;
    private _tryGetCommand;
}
