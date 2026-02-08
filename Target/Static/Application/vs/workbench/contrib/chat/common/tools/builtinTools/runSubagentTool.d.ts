import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IConfigurationChangeEvent, IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { IChatAgentService } from '../../participants/chatAgents.js';
import { IChatService } from '../../chatService/chatService.js';
import { ILanguageModelsService } from '../../languageModels.js';
import { CountTokensCallback, ILanguageModelToolsService, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../languageModelToolsService.js';
import { IPromptsService } from '../../promptSyntax/service/promptsService.js';
export interface IRunSubagentToolInputParams {
    prompt: string;
    description: string;
    agentName?: string;
}
export declare class RunSubagentTool extends Disposable implements IToolImpl {
    private readonly chatAgentService;
    private readonly chatService;
    private readonly languageModelToolsService;
    private readonly languageModelsService;
    private readonly logService;
    private readonly toolsService;
    private readonly configurationService;
    private readonly promptsService;
    private readonly instantiationService;
    static readonly Id = "runSubagent";
    readonly onDidUpdateToolData: Event<IConfigurationChangeEvent>;
    constructor(chatAgentService: IChatAgentService, chatService: IChatService, languageModelToolsService: ILanguageModelToolsService, languageModelsService: ILanguageModelsService, logService: ILogService, toolsService: ILanguageModelToolsService, configurationService: IConfigurationService, promptsService: IPromptsService, instantiationService: IInstantiationService);
    getToolData(): IToolData;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private getSubAgentByName;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
