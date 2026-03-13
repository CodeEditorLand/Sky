import { CancellationToken } from '../../../../base/common/cancellation.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../chat/common/tools/languageModelToolsService.js';
import { IExtensionsWorkbenchService } from './extensions.js';
export declare const InstallExtensionsToolId = "vscode_installExtensions";
export declare const InstallExtensionsToolData: IToolData;
export declare class InstallExtensionsTool implements IToolImpl {
    private readonly extensionsWorkbenchService;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService);
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
