import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILanguageModelToolsService } from '../../chat/common/tools/languageModelToolsService.js';
import { IMcpRegistry } from './mcpRegistryTypes.js';
import { IMcpService } from './mcpTypes.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
export declare class McpLanguageModelToolContribution extends Disposable implements IWorkbenchContribution {
    private readonly _toolsService;
    private readonly _instantiationService;
    private readonly _mcpRegistry;
    private readonly lifecycleService;
    static readonly ID = "workbench.contrib.mcp.languageModelTools";
    constructor(_toolsService: ILanguageModelToolsService, mcpService: IMcpService, _instantiationService: IInstantiationService, _mcpRegistry: IMcpRegistry, lifecycleService: ILifecycleService);
    private _syncTools;
}
