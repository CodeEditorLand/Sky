import type { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { type IPreparedToolInvocation, type IToolData, type IToolImpl, type IToolInvocation, type IToolInvocationPreparationContext, type IToolResult, type CountTokensCallback, type ToolProgress } from '../../../../chat/common/tools/languageModelToolsService.js';
import { ITerminalService } from '../../../../terminal/browser/terminal.js';
export declare const GetTerminalLastCommandToolData: IToolData;
export declare class GetTerminalLastCommandTool extends Disposable implements IToolImpl {
    private readonly _terminalService;
    constructor(_terminalService: ITerminalService);
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
