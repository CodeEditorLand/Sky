import type { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IPlaywrightService } from '../../../../../platform/browserView/common/playwrightService.js';
import { type CountTokensCallback, type IPreparedToolInvocation, type IToolData, type IToolImpl, type IToolInvocation, type IToolInvocationPreparationContext, type IToolResult, type ToolProgress } from '../../../chat/common/tools/languageModelToolsService.js';
import { IBrowserViewWorkbenchService } from '../../common/browserView.js';
export declare const ScreenshotBrowserToolData: IToolData;
export declare class ScreenshotBrowserTool implements IToolImpl {
    private readonly browserViewWorkbenchService;
    private readonly playwrightService;
    constructor(browserViewWorkbenchService: IBrowserViewWorkbenchService, playwrightService: IPlaywrightService);
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, _token: CancellationToken): Promise<IToolResult>;
}
