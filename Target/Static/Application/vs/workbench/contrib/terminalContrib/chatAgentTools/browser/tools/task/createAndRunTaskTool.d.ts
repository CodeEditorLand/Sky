import { CancellationToken } from '../../../../../../../base/common/cancellation.js';
import { ITelemetryService } from '../../../../../../../platform/telemetry/common/telemetry.js';
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from '../../../../../chat/common/tools/languageModelToolsService.js';
import { ITaskService } from '../../../../../tasks/common/taskService.js';
import { ITerminalService } from '../../../../../terminal/browser/terminal.js';
import { IFileService } from '../../../../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../../platform/instantiation/common/instantiation.js';
export declare class CreateAndRunTaskTool implements IToolImpl {
    private readonly _tasksService;
    private readonly _telemetryService;
    private readonly _terminalService;
    private readonly _fileService;
    private readonly _configurationService;
    private readonly _instantiationService;
    constructor(_tasksService: ITaskService, _telemetryService: ITelemetryService, _terminalService: ITerminalService, _fileService: IFileService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private _isTaskActive;
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
export declare const CreateAndRunTaskToolData: IToolData;
