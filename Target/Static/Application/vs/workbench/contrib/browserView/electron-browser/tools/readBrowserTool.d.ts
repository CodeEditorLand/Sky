import type { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IPlaywrightService } from '../../../../../platform/browserView/common/playwrightService.js';
import { type CountTokensCallback, type IPreparedToolInvocation, type IToolData, type IToolImpl, type IToolInvocation, type IToolInvocationPreparationContext, type IToolResult, type ToolProgress } from '../../../chat/common/tools/languageModelToolsService.js';
export declare const ReadBrowserToolData: IToolData;
export declare class ReadBrowserTool implements IToolImpl {
    private readonly playwrightService;
    constructor(playwrightService: IPlaywrightService);
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, _token: CancellationToken): Promise<IToolResult>;
}
