import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../../../chat/common/tools/languageModelToolsService.js';
import { RunInTerminalTool } from './runInTerminalTool.js';
export declare const ConfirmTerminalCommandToolData: IToolData;
export declare class ConfirmTerminalCommandTool extends RunInTerminalTool {
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
