import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../languageModelToolsService.js';
export declare const ConfirmationToolId = "vscode_get_confirmation";
export declare const ConfirmationToolWithOptionsId = "vscode_get_confirmation_with_options";
export declare const ConfirmationToolData: IToolData;
export declare const ConfirmationToolWithOptionsData: IToolData;
export interface IConfirmationToolParams {
    title: string;
    message: string;
    confirmationType?: 'basic' | 'terminal';
    terminalCommand?: string;
    buttons?: string[];
}
export declare class ConfirmationTool implements IToolImpl {
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
