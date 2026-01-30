import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IToolInvocationContext, ToolProgress } from '../../../chat/common/tools/languageModelToolsService.js';
import { Task } from '../../../tasks/common/tasks.js';
import { ITaskService } from '../../../tasks/common/taskService.js';
import { ITerminalInstance } from '../../../terminal/browser/terminal.js';
import { IExecution, IPollingResult, OutputMonitorState } from './tools/monitoring/types.js';
export declare function getTaskDefinition(id: string): {
    taskLabel: string;
    taskType: string;
};
export declare function getTaskRepresentation(task: IConfiguredTask | Task): string;
export declare function getTaskKey(task: Task): string;
export declare function tasksMatch(a: Task, b: Task): boolean;
export declare function getTaskForTool(id: string | undefined, taskDefinition: {
    taskLabel?: string;
    taskType?: string;
}, workspaceFolder: string, configurationService: IConfigurationService, taskService: ITaskService, allowParentTask?: boolean): Promise<Task | undefined>;
/**
 * Represents a configured task in the system.
 *
 * This interface is used to define tasks that can be executed within the workspace.
 * It includes optional properties for identifying and describing the task.
 *
 * Properties:
 * - `type`: (optional) The type of the task, which categorizes it (e.g., "build", "test").
 * - `label`: (optional) A user-facing label for the task, typically used for display purposes.
 * - `script`: (optional) A script associated with the task, if applicable.
 * - `command`: (optional) A command associated with the task, if applicable.
 *
 */
export interface IConfiguredTask {
    label?: string;
    type?: string;
    script?: string;
    command?: string;
    args?: string[];
    isBackground?: boolean;
    problemMatcher?: string[];
    group?: string;
}
export declare function resolveDependencyTasks(parentTask: Task, workspaceFolder: string, configurationService: IConfigurationService, taskService: ITaskService): Promise<Task[] | undefined>;
/**
 * Collects output, polling duration, and idle status for all terminals.
 */
export declare function collectTerminalResults(terminals: ITerminalInstance[], task: Task, instantiationService: IInstantiationService, invocationContext: IToolInvocationContext, progress: ToolProgress, token: CancellationToken, disposableStore: DisposableStore, isActive?: (task: Task) => Promise<boolean>, dependencyTasks?: Task[], taskService?: ITaskService): Promise<Array<{
    name: string;
    output: string;
    resources?: ILinkLocation[];
    pollDurationMs: number;
    state: OutputMonitorState;
    inputToolManualAcceptCount: number;
    inputToolManualRejectCount: number;
    inputToolManualChars: number;
    inputToolManualShownCount: number;
    inputToolFreeFormInputShownCount: number;
    inputToolFreeFormInputCount: number;
}>>;
export declare function taskProblemPollFn(execution: IExecution, token: CancellationToken, taskService: ITaskService): Promise<IPollingResult | undefined>;
export interface ILinkLocation {
    uri: URI;
    range?: Range;
}
