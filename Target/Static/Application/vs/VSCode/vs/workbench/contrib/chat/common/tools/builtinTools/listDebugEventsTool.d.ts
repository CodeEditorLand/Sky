import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { IChatDebugService } from '../../chatDebugService.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../languageModelToolsService.js';
export declare const ListDebugEventsToolId = "vscode_listDebugEvents_internal";
export declare const ListDebugEventsToolData: IToolData;
export declare class ListDebugEventsTool implements IToolImpl {
    private readonly chatDebugService;
    constructor(chatDebugService: IChatDebugService);
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, _token: CancellationToken): Promise<IToolResult>;
}
