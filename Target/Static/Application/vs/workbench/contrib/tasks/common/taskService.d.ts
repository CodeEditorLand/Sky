import { Action } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IWorkspaceFolder, IWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { Task, ContributedTask, CustomTask, ITaskSet, TaskSorter, ITaskEvent, ITaskIdentifier, ConfiguringTask, TaskRunSource } from './tasks.js';
import { ITaskSummary, ITaskTerminateResponse, ITaskSystemInfo } from './taskSystem.js';
import { IStringDictionary } from '../../../../base/common/collections.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { IMarkerData } from '../../../../platform/markers/common/markers.js';
import type { SingleOrMany } from '../../../../base/common/types.js';
export type { ITaskSummary, Task, ITaskTerminateResponse as TaskTerminateResponse };
export declare const CustomExecutionSupportedContext: RawContextKey<boolean>;
export declare const ShellExecutionSupportedContext: RawContextKey<boolean>;
export declare const TaskCommandsRegistered: RawContextKey<boolean>;
export declare const ProcessExecutionSupportedContext: RawContextKey<boolean>;
export declare const ServerlessWebContext: RawContextKey<boolean>;
export declare const TasksAvailableContext: RawContextKey<boolean>;
export declare const TaskExecutionSupportedContext: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export declare const ITaskService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITaskService>;
export interface ITaskProvider {
    provideTasks(validTypes: IStringDictionary<boolean>): Promise<ITaskSet>;
    resolveTask(task: ConfiguringTask): Promise<ContributedTask | undefined>;
}
export interface IProblemMatcherRunOptions {
    attachProblemMatcher?: boolean;
}
export interface ICustomizationProperties {
    group?: string | {
        kind?: string;
        isDefault?: boolean;
    };
    problemMatcher?: SingleOrMany<string>;
    isBackground?: boolean;
    color?: string;
    icon?: string;
}
export interface ITaskFilter {
    version?: string;
    type?: string;
    task?: string;
}
interface IWorkspaceTaskResult {
    set: ITaskSet | undefined;
    configurations: {
        byIdentifier: IStringDictionary<ConfiguringTask>;
    } | undefined;
    hasErrors: boolean;
}
export interface IWorkspaceFolderTaskResult extends IWorkspaceTaskResult {
    workspaceFolder: IWorkspaceFolder;
}
export interface ITaskService {
    readonly _serviceBrand: undefined;
    readonly onDidStateChange: Event<ITaskEvent>;
    /** Fired when task providers are registered or unregistered */
    readonly onDidChangeTaskProviders: Event<void>;
    isReconnected: boolean;
    readonly onDidReconnectToTasks: Event<void>;
    supportsMultipleTaskExecutions: boolean;
    configureAction(): Action;
    run(task: Task | undefined, options?: IProblemMatcherRunOptions, runSource?: TaskRunSource): Promise<ITaskSummary | undefined>;
    inTerminal(): boolean;
    getActiveTasks(): Promise<Task[]>;
    getBusyTasks(): Promise<Task[]>;
    terminate(task: Task): Promise<ITaskTerminateResponse>;
    tasks(filter?: ITaskFilter): Promise<Task[]>;
    rerun(terminalInstanceId: number): void;
    /**
     * Gets tasks currently known to the task system. Unlike {@link tasks},
     * this does not activate extensions or prompt for workspace trust.
     */
    getKnownTasks(filter?: ITaskFilter): Promise<Task[]>;
    taskTypes(): string[];
    getWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    getSavedTasks(type: 'persistent' | 'historical'): Promise<(Task | ConfiguringTask)[]>;
    removeRecentlyUsedTask(taskRecentlyUsedKey: string): void;
    getTerminalsForTasks(tasks: SingleOrMany<Task>): URI[] | undefined;
    getTaskProblems(instanceId: number): Map<string, {
        resources: URI[];
        markers: IMarkerData[];
    }> | undefined;
    /**
     * @param alias The task's name, label or defined identifier.
     */
    getTask(workspaceFolder: IWorkspace | IWorkspaceFolder | string, alias: string | ITaskIdentifier, compareId?: boolean): Promise<Task | undefined>;
    tryResolveTask(configuringTask: ConfiguringTask): Promise<Task | undefined>;
    createSorter(): TaskSorter;
    getTaskDescription(task: Task | ConfiguringTask): string | undefined;
    customize(task: ContributedTask | CustomTask | ConfiguringTask, properties?: {}, openConfig?: boolean): Promise<void>;
    openConfig(task: CustomTask | ConfiguringTask | undefined): Promise<boolean>;
    registerTaskProvider(taskProvider: ITaskProvider, type: string): IDisposable;
    registerTaskSystem(scheme: string, taskSystemInfo: ITaskSystemInfo): void;
    readonly onDidChangeTaskSystemInfo: Event<void>;
    readonly onDidChangeTaskConfig: Event<void>;
    readonly hasTaskSystemInfo: boolean;
    registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): void;
    extensionCallbackTaskComplete(task: Task, result: number | undefined): Promise<void>;
}
export interface ITaskTerminalStatus {
    terminalId: number;
    status: string;
}
