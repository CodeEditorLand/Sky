import type { CancellationToken } from '../../../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../../../../platform/telemetry/common/telemetry.js';
import { type CountTokensCallback, type IPreparedToolInvocation, type IToolData, type IToolImpl, type IToolInvocation, type IToolInvocationPreparationContext, type IToolResult, type ToolProgress } from '../../../../../chat/common/tools/languageModelToolsService.js';
import { ITaskService } from '../../../../../tasks/common/taskService.js';
import { ITerminalService } from '../../../../../terminal/browser/terminal.js';
export declare const GetTaskOutputToolData: IToolData;
export interface IGetTaskOutputInputParams {
    id: string;
    workspaceFolder: string;
}
export declare class GetTaskOutputTool extends Disposable implements IToolImpl {
    private readonly _tasksService;
    private readonly _terminalService;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _telemetryService;
    constructor(_tasksService: ITaskService, _terminalService: ITerminalService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private _isTaskActive;
}
