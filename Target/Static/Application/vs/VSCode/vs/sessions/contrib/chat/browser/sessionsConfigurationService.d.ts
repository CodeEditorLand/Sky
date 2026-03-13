import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IActiveSessionItem, ISessionsManagementService } from '../../sessions/browser/sessionsManagementService.js';
import { IJSONEditingService } from '../../../../workbench/services/configuration/common/jsonEditing.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPreferencesService } from '../../../../workbench/services/preferences/common/preferences.js';
import { ITerminalService } from '../../../../workbench/contrib/terminal/browser/terminal.js';
import { CommandString } from '../../../../workbench/contrib/tasks/common/taskConfiguration.js';
export type TaskStorageTarget = 'user' | 'workspace';
type TaskRunOnOption = 'default' | 'folderOpen' | 'worktreeCreated';
interface ITaskRunOptions {
    readonly runOn?: TaskRunOnOption;
}
/**
 * Shape of a single task entry inside tasks.json.
 */
export interface ITaskEntry {
    readonly label: string;
    readonly task?: CommandString;
    readonly script?: string;
    readonly type?: string;
    readonly command?: string;
    readonly args?: CommandString[];
    readonly inSessions?: boolean;
    readonly runOptions?: ITaskRunOptions;
    readonly windows?: {
        command?: string;
        args?: CommandString[];
    };
    readonly osx?: {
        command?: string;
        args?: CommandString[];
    };
    readonly linux?: {
        command?: string;
        args?: CommandString[];
    };
    readonly [key: string]: unknown;
}
export interface INonSessionTaskEntry {
    readonly task: ITaskEntry;
    readonly target: TaskStorageTarget;
}
export interface ISessionsConfigurationService {
    readonly _serviceBrand: undefined;
    /**
     * Observable list of tasks with `inSessions: true`, automatically
     * updated when the tasks.json file changes.
     */
    getSessionTasks(session: IActiveSessionItem): IObservable<readonly ITaskEntry[]>;
    /**
     * Returns tasks that do NOT have `inSessions: true` — used as
     * suggestions in the "Add Run Action" picker.
     */
    getNonSessionTasks(session: IActiveSessionItem): Promise<readonly INonSessionTaskEntry[]>;
    /**
     * Sets `inSessions: true` on an existing task (identified by label),
     * updating it in place in its tasks.json.
     */
    addTaskToSessions(task: ITaskEntry, session: IActiveSessionItem, target: TaskStorageTarget, options?: ITaskRunOptions): Promise<void>;
    /**
     * Creates a new shell task with `inSessions: true` and writes it to
     * the appropriate tasks.json (user or workspace).
     */
    createAndAddTask(label: string | undefined, command: string, session: IActiveSessionItem, target: TaskStorageTarget, options?: ITaskRunOptions): Promise<ITaskEntry | undefined>;
    /**
     * Runs a task entry in a terminal, resolving the correct platform
     * command and using the session worktree as cwd.
     */
    runTask(task: ITaskEntry, session: IActiveSessionItem): Promise<void>;
    /**
     * Observable label of the most recently run task for the given repository.
     */
    getLastRunTaskLabel(repository: URI | undefined): IObservable<string | undefined>;
}
export declare const ISessionsConfigurationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISessionsConfigurationService>;
export declare class SessionsConfigurationService extends Disposable implements ISessionsConfigurationService {
    private readonly _fileService;
    private readonly _jsonEditingService;
    private readonly _preferencesService;
    private readonly _terminalService;
    private readonly _sessionsManagementService;
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    private static readonly _LAST_RUN_TASK_LABELS_KEY;
    private static readonly _SUPPORTED_TASK_TYPES;
    private readonly _sessionTasks;
    private readonly _fileWatcher;
    /** Maps `cwd.toString() + command` to the terminal `instanceId`. */
    private readonly _taskTerminals;
    private readonly _knownSessionWorktrees;
    private readonly _lastRunTaskLabels;
    private readonly _lastRunTaskObservables;
    private _watchedResource;
    private _lastRefreshedFolder;
    constructor(_fileService: IFileService, _jsonEditingService: IJSONEditingService, _preferencesService: IPreferencesService, _terminalService: ITerminalService, _sessionsManagementService: ISessionsManagementService, _storageService: IStorageService);
    getSessionTasks(session: IActiveSessionItem): IObservable<readonly ITaskEntry[]>;
    getNonSessionTasks(session: IActiveSessionItem): Promise<readonly INonSessionTaskEntry[]>;
    addTaskToSessions(task: ITaskEntry, session: IActiveSessionItem, target: TaskStorageTarget, options?: ITaskRunOptions): Promise<void>;
    createAndAddTask(label: string | undefined, command: string, session: IActiveSessionItem, target: TaskStorageTarget, options?: ITaskRunOptions): Promise<ITaskEntry | undefined>;
    runTask(task: ITaskEntry, session: IActiveSessionItem): Promise<void>;
    getLastRunTaskLabel(repository: URI | undefined): IObservable<string | undefined>;
    private _getExistingTerminalInstance;
    private _getTasksJsonUri;
    private _readTasksJson;
    private _readAllTasks;
    private _isSupportedTask;
    private _resolveCommand;
    private _appendArgs;
    private _handleActiveSessionChange;
    private _runWorktreeCreatedTasks;
    private _ensureFileWatch;
    private _refreshSessionTasks;
    private _commitTasksFile;
    private _loadLastRunTaskLabels;
    private _saveLastRunTaskLabels;
}
export {};
