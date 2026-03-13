var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import * as Types from "../../../../base/common/types.js";
import * as resources from "../../../../base/common/resources.js";
import * as Objects from "../../../../base/common/objects.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { TaskDefinitionRegistry } from "./taskDefinitionRegistry.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const USER_TASKS_GROUP_KEY = "settings";
const TASK_RUNNING_STATE = new RawContextKey("taskRunning", false, nls.localize("tasks.taskRunningContext", "Whether a task is currently running."));
const TASK_TERMINAL_ACTIVE = new RawContextKey("taskTerminalActive", false, nls.localize("taskTerminalActive", "Whether the active terminal is a task terminal."));
const TASKS_CATEGORY = nls.localize2("tasksCategory", "Tasks");
var ShellQuoting;
(function(ShellQuoting2) {
  ShellQuoting2[ShellQuoting2["Escape"] = 1] = "Escape";
  ShellQuoting2[ShellQuoting2["Strong"] = 2] = "Strong";
  ShellQuoting2[ShellQuoting2["Weak"] = 3] = "Weak";
})(ShellQuoting || (ShellQuoting = {}));
const CUSTOMIZED_TASK_TYPE = "$customized";
(function(ShellQuoting2) {
  function from(value) {
    if (!value) {
      return ShellQuoting2.Strong;
    }
    switch (value.toLowerCase()) {
      case "escape":
        return ShellQuoting2.Escape;
      case "strong":
        return ShellQuoting2.Strong;
      case "weak":
        return ShellQuoting2.Weak;
      default:
        return ShellQuoting2.Strong;
    }
  }
  __name(from, "from");
  ShellQuoting2.from = from;
})(ShellQuoting || (ShellQuoting = {}));
var CommandOptions;
(function(CommandOptions2) {
  CommandOptions2.defaults = { cwd: "${workspaceFolder}" };
})(CommandOptions || (CommandOptions = {}));
var RevealKind;
(function(RevealKind2) {
  RevealKind2[RevealKind2["Always"] = 1] = "Always";
  RevealKind2[RevealKind2["Silent"] = 2] = "Silent";
  RevealKind2[RevealKind2["Never"] = 3] = "Never";
})(RevealKind || (RevealKind = {}));
(function(RevealKind2) {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "always":
        return RevealKind2.Always;
      case "silent":
        return RevealKind2.Silent;
      case "never":
        return RevealKind2.Never;
      default:
        return RevealKind2.Always;
    }
  }
  __name(fromString, "fromString");
  RevealKind2.fromString = fromString;
})(RevealKind || (RevealKind = {}));
var RevealProblemKind;
(function(RevealProblemKind2) {
  RevealProblemKind2[RevealProblemKind2["Never"] = 1] = "Never";
  RevealProblemKind2[RevealProblemKind2["OnProblem"] = 2] = "OnProblem";
  RevealProblemKind2[RevealProblemKind2["Always"] = 3] = "Always";
})(RevealProblemKind || (RevealProblemKind = {}));
(function(RevealProblemKind2) {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "always":
        return RevealProblemKind2.Always;
      case "never":
        return RevealProblemKind2.Never;
      case "onproblem":
        return RevealProblemKind2.OnProblem;
      default:
        return RevealProblemKind2.OnProblem;
    }
  }
  __name(fromString, "fromString");
  RevealProblemKind2.fromString = fromString;
})(RevealProblemKind || (RevealProblemKind = {}));
var PanelKind;
(function(PanelKind2) {
  PanelKind2[PanelKind2["Shared"] = 1] = "Shared";
  PanelKind2[PanelKind2["Dedicated"] = 2] = "Dedicated";
  PanelKind2[PanelKind2["New"] = 3] = "New";
})(PanelKind || (PanelKind = {}));
(function(PanelKind2) {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "shared":
        return PanelKind2.Shared;
      case "dedicated":
        return PanelKind2.Dedicated;
      case "new":
        return PanelKind2.New;
      default:
        return PanelKind2.Shared;
    }
  }
  __name(fromString, "fromString");
  PanelKind2.fromString = fromString;
})(PanelKind || (PanelKind = {}));
var PresentationOptions;
(function(PresentationOptions2) {
  PresentationOptions2.defaults = {
    echo: true,
    reveal: RevealKind.Always,
    revealProblems: RevealProblemKind.Never,
    focus: false,
    panel: PanelKind.Shared,
    showReuseMessage: true,
    clear: false,
    preserveTerminalName: false
  };
})(PresentationOptions || (PresentationOptions = {}));
var RuntimeType;
(function(RuntimeType2) {
  RuntimeType2[RuntimeType2["Shell"] = 1] = "Shell";
  RuntimeType2[RuntimeType2["Process"] = 2] = "Process";
  RuntimeType2[RuntimeType2["CustomExecution"] = 3] = "CustomExecution";
})(RuntimeType || (RuntimeType = {}));
(function(RuntimeType2) {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "shell":
        return RuntimeType2.Shell;
      case "process":
        return RuntimeType2.Process;
      case "customExecution":
        return RuntimeType2.CustomExecution;
      default:
        return RuntimeType2.Process;
    }
  }
  __name(fromString, "fromString");
  RuntimeType2.fromString = fromString;
  function toString(value) {
    switch (value) {
      case RuntimeType2.Shell:
        return "shell";
      case RuntimeType2.Process:
        return "process";
      case RuntimeType2.CustomExecution:
        return "customExecution";
      default:
        return "process";
    }
  }
  __name(toString, "toString");
  RuntimeType2.toString = toString;
})(RuntimeType || (RuntimeType = {}));
var CommandString;
(function(CommandString2) {
  function value(value2) {
    if (Types.isString(value2)) {
      return value2;
    } else {
      return value2.value;
    }
  }
  __name(value, "value");
  CommandString2.value = value;
})(CommandString || (CommandString = {}));
var TaskGroup;
(function(TaskGroup2) {
  TaskGroup2.Clean = { _id: "clean", isDefault: false };
  TaskGroup2.Build = { _id: "build", isDefault: false };
  TaskGroup2.Rebuild = { _id: "rebuild", isDefault: false };
  TaskGroup2.Test = { _id: "test", isDefault: false };
  function is(value) {
    return value === TaskGroup2.Clean._id || value === TaskGroup2.Build._id || value === TaskGroup2.Rebuild._id || value === TaskGroup2.Test._id;
  }
  __name(is, "is");
  TaskGroup2.is = is;
  function from(value) {
    if (value === void 0) {
      return void 0;
    } else if (Types.isString(value)) {
      if (is(value)) {
        return { _id: value, isDefault: false };
      }
      return void 0;
    } else {
      return value;
    }
  }
  __name(from, "from");
  TaskGroup2.from = from;
})(TaskGroup || (TaskGroup = {}));
var TaskScope;
(function(TaskScope2) {
  TaskScope2[TaskScope2["Global"] = 1] = "Global";
  TaskScope2[TaskScope2["Workspace"] = 2] = "Workspace";
  TaskScope2[TaskScope2["Folder"] = 3] = "Folder";
})(TaskScope || (TaskScope = {}));
var TaskSourceKind;
(function(TaskSourceKind2) {
  TaskSourceKind2.Workspace = "workspace";
  TaskSourceKind2.Extension = "extension";
  TaskSourceKind2.InMemory = "inMemory";
  TaskSourceKind2.WorkspaceFile = "workspaceFile";
  TaskSourceKind2.User = "user";
  function toConfigurationTarget(kind) {
    switch (kind) {
      case TaskSourceKind2.User:
        return 2;
      case TaskSourceKind2.WorkspaceFile:
        return 5;
      default:
        return 6;
    }
  }
  __name(toConfigurationTarget, "toConfigurationTarget");
  TaskSourceKind2.toConfigurationTarget = toConfigurationTarget;
})(TaskSourceKind || (TaskSourceKind = {}));
var DependsOrder;
(function(DependsOrder2) {
  DependsOrder2["parallel"] = "parallel";
  DependsOrder2["sequence"] = "sequence";
})(DependsOrder || (DependsOrder = {}));
var RunOnOptions;
(function(RunOnOptions2) {
  RunOnOptions2[RunOnOptions2["default"] = 1] = "default";
  RunOnOptions2[RunOnOptions2["folderOpen"] = 2] = "folderOpen";
  RunOnOptions2[RunOnOptions2["worktreeCreated"] = 3] = "worktreeCreated";
})(RunOnOptions || (RunOnOptions = {}));
var InstancePolicy;
(function(InstancePolicy2) {
  InstancePolicy2["terminateNewest"] = "terminateNewest";
  InstancePolicy2["terminateOldest"] = "terminateOldest";
  InstancePolicy2["prompt"] = "prompt";
  InstancePolicy2["warn"] = "warn";
  InstancePolicy2["silent"] = "silent";
})(InstancePolicy || (InstancePolicy = {}));
var RunOptions;
(function(RunOptions2) {
  RunOptions2.defaults = {
    reevaluateOnRerun: true,
    runOn: RunOnOptions.default,
    instanceLimit: 1,
    instancePolicy: "prompt"
    /* InstancePolicy.prompt */
  };
})(RunOptions || (RunOptions = {}));
class CommonTask {
  static {
    __name(this, "CommonTask");
  }
  constructor(id, label, type, runOptions, configurationProperties, source) {
    this._label = "";
    this._id = id;
    if (label) {
      this._label = label;
    }
    if (type) {
      this.type = type;
    }
    this.runOptions = runOptions;
    this.configurationProperties = configurationProperties;
    this._source = source;
  }
  getDefinition(useSource) {
    return void 0;
  }
  getMapKey() {
    return this._id;
  }
  getKey() {
    return void 0;
  }
  getCommonTaskId() {
    const key = { folder: this.getFolderId(), id: this._id };
    return JSON.stringify(key);
  }
  clone() {
    return this.fromObject(Object.assign({}, this));
  }
  getWorkspaceFolder() {
    return void 0;
  }
  getWorkspaceFileName() {
    return void 0;
  }
  getTelemetryKind() {
    return "unknown";
  }
  matches(key, compareId = false) {
    if (key === void 0) {
      return false;
    }
    if (Types.isString(key)) {
      return key === this._label || key === this.configurationProperties.identifier || compareId && key === this._id;
    }
    const identifier = this.getDefinition(true);
    return identifier !== void 0 && identifier._key === key._key;
  }
  getQualifiedLabel() {
    const workspaceFolder = this.getWorkspaceFolder();
    if (workspaceFolder) {
      return `${this._label} (${workspaceFolder.name})`;
    } else {
      return this._label;
    }
  }
  getTaskExecution() {
    const result = {
      id: this._id,
      task: this
    };
    return result;
  }
  addTaskLoadMessages(messages) {
    if (this._taskLoadMessages === void 0) {
      this._taskLoadMessages = [];
    }
    if (messages) {
      this._taskLoadMessages = this._taskLoadMessages.concat(messages);
    }
  }
  get taskLoadMessages() {
    return this._taskLoadMessages;
  }
}
class CustomTask extends CommonTask {
  static {
    __name(this, "CustomTask");
  }
  constructor(id, source, label, type, command, hasDefinedMatchers, runOptions, configurationProperties) {
    super(id, label, void 0, runOptions, configurationProperties, source);
    this.command = {};
    this._source = source;
    this.hasDefinedMatchers = hasDefinedMatchers;
    if (command) {
      this.command = command;
    }
  }
  clone() {
    return new CustomTask(this._id, this._source, this._label, this.type, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
  }
  customizes() {
    if (this._source && this._source.customizes) {
      return this._source.customizes;
    }
    return void 0;
  }
  getDefinition(useSource = false) {
    if (useSource && this._source.customizes !== void 0) {
      return this._source.customizes;
    } else {
      let type;
      const commandRuntime = this.command ? this.command.runtime : void 0;
      switch (commandRuntime) {
        case RuntimeType.Shell:
          type = "shell";
          break;
        case RuntimeType.Process:
          type = "process";
          break;
        case RuntimeType.CustomExecution:
          type = "customExecution";
          break;
        case void 0:
          type = "$composite";
          break;
        default:
          throw new Error("Unexpected task runtime");
      }
      const result = {
        type,
        _key: this._id,
        id: this._id
      };
      return result;
    }
  }
  static is(value) {
    return value instanceof CustomTask;
  }
  getMapKey() {
    const workspaceFolder = this._source.config.workspaceFolder;
    return workspaceFolder ? `${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._id}|${this.instance}`;
  }
  getFolderId() {
    return this._source.kind === TaskSourceKind.User ? USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
  }
  getCommonTaskId() {
    return this._source.customizes ? super.getCommonTaskId() : this.getKey() ?? super.getCommonTaskId();
  }
  /**
   * @returns A key representing the task
   */
  getKey() {
    const workspaceFolder = this.getFolderId();
    if (!workspaceFolder) {
      return void 0;
    }
    let id = this.configurationProperties.identifier;
    if (this._source.kind !== TaskSourceKind.Workspace) {
      id += this._source.kind;
    }
    const key = { type: CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id };
    return JSON.stringify(key);
  }
  getWorkspaceFolder() {
    return this._source.config.workspaceFolder;
  }
  getWorkspaceFileName() {
    return this._source.config.workspace && this._source.config.workspace.configuration ? resources.basename(this._source.config.workspace.configuration) : void 0;
  }
  getTelemetryKind() {
    if (this._source.customizes) {
      return "workspace>extension";
    } else {
      return "workspace";
    }
  }
  fromObject(object) {
    const obj = object;
    return new CustomTask(obj._id, obj._source, obj._label, obj.type, obj.command, obj.hasDefinedMatchers, obj.runOptions, obj.configurationProperties);
  }
}
class ConfiguringTask extends CommonTask {
  static {
    __name(this, "ConfiguringTask");
  }
  constructor(id, source, label, type, configures, runOptions, configurationProperties) {
    super(id, label, type, runOptions, configurationProperties, source);
    this._source = source;
    this.configures = configures;
  }
  static is(value) {
    return value instanceof ConfiguringTask;
  }
  fromObject(object) {
    return object;
  }
  getDefinition() {
    return this.configures;
  }
  getWorkspaceFileName() {
    return this._source.config.workspace && this._source.config.workspace.configuration ? resources.basename(this._source.config.workspace.configuration) : void 0;
  }
  getWorkspaceFolder() {
    return this._source.config.workspaceFolder;
  }
  getFolderId() {
    return this._source.kind === TaskSourceKind.User ? USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
  }
  getKey() {
    const workspaceFolder = this.getFolderId();
    if (!workspaceFolder) {
      return void 0;
    }
    let id = this.configurationProperties.identifier;
    if (this._source.kind !== TaskSourceKind.Workspace) {
      id += this._source.kind;
    }
    const key = { type: CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id };
    return JSON.stringify(key);
  }
}
class ContributedTask extends CommonTask {
  static {
    __name(this, "ContributedTask");
  }
  constructor(id, source, label, type, defines, command, hasDefinedMatchers, runOptions, configurationProperties) {
    super(id, label, type, runOptions, configurationProperties, source);
    this.defines = defines;
    this.hasDefinedMatchers = hasDefinedMatchers;
    this.command = command;
    this.icon = configurationProperties.icon;
    this.hide = configurationProperties.hide;
  }
  clone() {
    return new ContributedTask(this._id, this._source, this._label, this.type, this.defines, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
  }
  getDefinition() {
    return this.defines;
  }
  static is(value) {
    return value instanceof ContributedTask;
  }
  getMapKey() {
    const workspaceFolder = this._source.workspaceFolder;
    return workspaceFolder ? `${this._source.scope.toString()}|${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._source.scope.toString()}|${this._id}|${this.instance}`;
  }
  getFolderId() {
    if (this._source.scope === 3 && this._source.workspaceFolder) {
      return this._source.workspaceFolder.uri.toString();
    }
    return void 0;
  }
  getKey() {
    const key = { type: "contributed", scope: this._source.scope, id: this._id };
    key.folder = this.getFolderId();
    return JSON.stringify(key);
  }
  getWorkspaceFolder() {
    return this._source.workspaceFolder;
  }
  getTelemetryKind() {
    return "extension";
  }
  fromObject(object) {
    const obj = object;
    return new ContributedTask(obj._id, obj._source, obj._label, obj.type, obj.defines, obj.command, obj.hasDefinedMatchers, obj.runOptions, obj.configurationProperties);
  }
}
class InMemoryTask extends CommonTask {
  static {
    __name(this, "InMemoryTask");
  }
  constructor(id, source, label, type, runOptions, configurationProperties) {
    super(id, label, type, runOptions, configurationProperties, source);
    this._source = source;
  }
  clone() {
    return new InMemoryTask(this._id, this._source, this._label, this.type, this.runOptions, this.configurationProperties);
  }
  static is(value) {
    return value instanceof InMemoryTask;
  }
  getTelemetryKind() {
    return "composite";
  }
  getMapKey() {
    return `${this._id}|${this.instance}`;
  }
  getFolderId() {
    return void 0;
  }
  fromObject(object) {
    const obj = object;
    return new InMemoryTask(obj._id, obj._source, obj._label, obj.type, obj.runOptions, obj.configurationProperties);
  }
}
var ExecutionEngine;
(function(ExecutionEngine2) {
  ExecutionEngine2[ExecutionEngine2["Process"] = 1] = "Process";
  ExecutionEngine2[ExecutionEngine2["Terminal"] = 2] = "Terminal";
})(ExecutionEngine || (ExecutionEngine = {}));
(function(ExecutionEngine2) {
  ExecutionEngine2._default = ExecutionEngine2.Terminal;
})(ExecutionEngine || (ExecutionEngine = {}));
var JsonSchemaVersion;
(function(JsonSchemaVersion2) {
  JsonSchemaVersion2[JsonSchemaVersion2["V0_1_0"] = 1] = "V0_1_0";
  JsonSchemaVersion2[JsonSchemaVersion2["V2_0_0"] = 2] = "V2_0_0";
})(JsonSchemaVersion || (JsonSchemaVersion = {}));
class TaskSorter {
  static {
    __name(this, "TaskSorter");
  }
  constructor(workspaceFolders) {
    this._order = /* @__PURE__ */ new Map();
    for (let i = 0; i < workspaceFolders.length; i++) {
      this._order.set(workspaceFolders[i].uri.toString(), i);
    }
  }
  compare(a, b) {
    const aw = a.getWorkspaceFolder();
    const bw = b.getWorkspaceFolder();
    if (aw && bw) {
      let ai = this._order.get(aw.uri.toString());
      ai = ai === void 0 ? 0 : ai + 1;
      let bi = this._order.get(bw.uri.toString());
      bi = bi === void 0 ? 0 : bi + 1;
      if (ai === bi) {
        return a._label.localeCompare(b._label);
      } else {
        return ai - bi;
      }
    } else if (!aw && bw) {
      return -1;
    } else if (aw && !bw) {
      return 1;
    } else {
      return 0;
    }
  }
}
var TaskRunType;
(function(TaskRunType2) {
  TaskRunType2["SingleRun"] = "singleRun";
  TaskRunType2["Background"] = "background";
})(TaskRunType || (TaskRunType = {}));
var TaskEventKind;
(function(TaskEventKind2) {
  TaskEventKind2["Changed"] = "changed";
  TaskEventKind2["ProcessStarted"] = "processStarted";
  TaskEventKind2["ProcessEnded"] = "processEnded";
  TaskEventKind2["Terminated"] = "terminated";
  TaskEventKind2["Start"] = "start";
  TaskEventKind2["AcquiredInput"] = "acquiredInput";
  TaskEventKind2["DependsOnStarted"] = "dependsOnStarted";
  TaskEventKind2["Active"] = "active";
  TaskEventKind2["Inactive"] = "inactive";
  TaskEventKind2["End"] = "end";
  TaskEventKind2["ProblemMatcherStarted"] = "problemMatcherStarted";
  TaskEventKind2["ProblemMatcherEnded"] = "problemMatcherEnded";
  TaskEventKind2["ProblemMatcherFoundErrors"] = "problemMatcherFoundErrors";
})(TaskEventKind || (TaskEventKind = {}));
var TaskRunSource;
(function(TaskRunSource2) {
  TaskRunSource2[TaskRunSource2["System"] = 0] = "System";
  TaskRunSource2[TaskRunSource2["User"] = 1] = "User";
  TaskRunSource2[TaskRunSource2["FolderOpen"] = 2] = "FolderOpen";
  TaskRunSource2[TaskRunSource2["ConfigurationChange"] = 3] = "ConfigurationChange";
  TaskRunSource2[TaskRunSource2["Reconnect"] = 4] = "Reconnect";
  TaskRunSource2[TaskRunSource2["ChatAgent"] = 5] = "ChatAgent";
})(TaskRunSource || (TaskRunSource = {}));
var TaskEvent;
(function(TaskEvent2) {
  function common(task) {
    return {
      taskId: task._id,
      taskName: task.configurationProperties.name,
      runType: task.configurationProperties.isBackground ? "background" : "singleRun",
      group: task.configurationProperties.group,
      __task: task
    };
  }
  __name(common, "common");
  function start(task, terminalId, resolvedVariables) {
    return {
      ...common(task),
      kind: TaskEventKind.Start,
      terminalId,
      resolvedVariables
    };
  }
  __name(start, "start");
  TaskEvent2.start = start;
  function processStarted(task, terminalId, processId) {
    return {
      ...common(task),
      kind: TaskEventKind.ProcessStarted,
      terminalId,
      processId
    };
  }
  __name(processStarted, "processStarted");
  TaskEvent2.processStarted = processStarted;
  function processEnded(task, terminalId, exitCode, durationMs) {
    return {
      ...common(task),
      kind: TaskEventKind.ProcessEnded,
      terminalId,
      exitCode,
      durationMs
    };
  }
  __name(processEnded, "processEnded");
  TaskEvent2.processEnded = processEnded;
  function inactive(task, terminalId, durationMs) {
    return {
      ...common(task),
      kind: TaskEventKind.Inactive,
      terminalId,
      durationMs
    };
  }
  __name(inactive, "inactive");
  TaskEvent2.inactive = inactive;
  function terminated(task, terminalId, exitReason) {
    return {
      ...common(task),
      kind: TaskEventKind.Terminated,
      exitReason,
      terminalId
    };
  }
  __name(terminated, "terminated");
  TaskEvent2.terminated = terminated;
  function general(kind, task, terminalId) {
    return {
      ...common(task),
      kind,
      terminalId
    };
  }
  __name(general, "general");
  TaskEvent2.general = general;
  function problemMatcherEnded(task, hasErrors, terminalId) {
    return {
      ...common(task),
      kind: TaskEventKind.ProblemMatcherEnded,
      hasErrors
    };
  }
  __name(problemMatcherEnded, "problemMatcherEnded");
  TaskEvent2.problemMatcherEnded = problemMatcherEnded;
  function changed() {
    return { kind: TaskEventKind.Changed };
  }
  __name(changed, "changed");
  TaskEvent2.changed = changed;
})(TaskEvent || (TaskEvent = {}));
var KeyedTaskIdentifier;
(function(KeyedTaskIdentifier2) {
  function sortedStringify(literal) {
    const keys = Object.keys(literal).sort();
    let result = "";
    for (const key of keys) {
      let stringified = literal[key];
      if (stringified instanceof Object) {
        stringified = sortedStringify(stringified);
      } else if (typeof stringified === "string") {
        stringified = stringified.replace(/,/g, ",,");
      }
      result += key + "," + stringified + ",";
    }
    return result;
  }
  __name(sortedStringify, "sortedStringify");
  function create(value) {
    const resultKey = sortedStringify(value);
    const result = { _key: resultKey, type: value.taskType };
    Object.assign(result, value);
    return result;
  }
  __name(create, "create");
  KeyedTaskIdentifier2.create = create;
})(KeyedTaskIdentifier || (KeyedTaskIdentifier = {}));
var TaskSettingId;
(function(TaskSettingId2) {
  TaskSettingId2["AutoDetect"] = "task.autoDetect";
  TaskSettingId2["SaveBeforeRun"] = "task.saveBeforeRun";
  TaskSettingId2["ShowDecorations"] = "task.showDecorations";
  TaskSettingId2["ProblemMatchersNeverPrompt"] = "task.problemMatchers.neverPrompt";
  TaskSettingId2["SlowProviderWarning"] = "task.slowProviderWarning";
  TaskSettingId2["QuickOpenHistory"] = "task.quickOpen.history";
  TaskSettingId2["QuickOpenDetail"] = "task.quickOpen.detail";
  TaskSettingId2["QuickOpenSkip"] = "task.quickOpen.skip";
  TaskSettingId2["QuickOpenShowAll"] = "task.quickOpen.showAll";
  TaskSettingId2["AllowAutomaticTasks"] = "task.allowAutomaticTasks";
  TaskSettingId2["Reconnection"] = "task.reconnection";
  TaskSettingId2["VerboseLogging"] = "task.verboseLogging";
  TaskSettingId2["NotifyWindowOnTaskCompletion"] = "task.notifyWindowOnTaskCompletion";
})(TaskSettingId || (TaskSettingId = {}));
var TasksSchemaProperties;
(function(TasksSchemaProperties2) {
  TasksSchemaProperties2["Tasks"] = "tasks";
  TasksSchemaProperties2["SuppressTaskName"] = "tasks.suppressTaskName";
  TasksSchemaProperties2["Windows"] = "tasks.windows";
  TasksSchemaProperties2["Osx"] = "tasks.osx";
  TasksSchemaProperties2["Linux"] = "tasks.linux";
  TasksSchemaProperties2["ShowOutput"] = "tasks.showOutput";
  TasksSchemaProperties2["IsShellCommand"] = "tasks.isShellCommand";
  TasksSchemaProperties2["ServiceTestSetting"] = "tasks.service.testSetting";
})(TasksSchemaProperties || (TasksSchemaProperties = {}));
var TaskDefinition;
(function(TaskDefinition2) {
  function createTaskIdentifier(external, reporter) {
    const definition = TaskDefinitionRegistry.get(external.type);
    if (definition === void 0) {
      const copy = Objects.deepClone(external);
      delete copy._key;
      return KeyedTaskIdentifier.create(copy);
    }
    const literal = /* @__PURE__ */ Object.create(null);
    literal.type = definition.taskType;
    const required = /* @__PURE__ */ new Set();
    definition.required.forEach((element) => required.add(element));
    const properties = definition.properties;
    for (const property of Object.keys(properties)) {
      const value = external[property];
      if (value !== void 0 && value !== null) {
        literal[property] = value;
      } else if (required.has(property)) {
        const schema = properties[property];
        if (schema.default !== void 0) {
          literal[property] = Objects.deepClone(schema.default);
        } else {
          switch (schema.type) {
            case "boolean":
              literal[property] = false;
              break;
            case "number":
            case "integer":
              literal[property] = 0;
              break;
            case "string":
              literal[property] = "";
              break;
            default:
              reporter.error(nls.localize("TaskDefinition.missingRequiredProperty", "Error: the task identifier '{0}' is missing the required property '{1}'. The task identifier will be ignored.", JSON.stringify(external, void 0, 0), property));
              return void 0;
          }
        }
      }
    }
    return KeyedTaskIdentifier.create(literal);
  }
  __name(createTaskIdentifier, "createTaskIdentifier");
  TaskDefinition2.createTaskIdentifier = createTaskIdentifier;
})(TaskDefinition || (TaskDefinition = {}));
const rerunTaskIcon = registerIcon("rerun-task", Codicon.refresh, nls.localize("rerunTaskIcon", "View icon of the rerun task."));
const RerunForActiveTerminalCommandId = "workbench.action.tasks.rerunForActiveTerminal";
const RerunAllRunningTasksCommandId = "workbench.action.tasks.rerunAllRunningTasks";
export {
  CUSTOMIZED_TASK_TYPE,
  CommandOptions,
  CommandString,
  CommonTask,
  ConfiguringTask,
  ContributedTask,
  CustomTask,
  DependsOrder,
  ExecutionEngine,
  InMemoryTask,
  InstancePolicy,
  JsonSchemaVersion,
  KeyedTaskIdentifier,
  PanelKind,
  PresentationOptions,
  RerunAllRunningTasksCommandId,
  RerunForActiveTerminalCommandId,
  RevealKind,
  RevealProblemKind,
  RunOnOptions,
  RunOptions,
  RuntimeType,
  ShellQuoting,
  TASKS_CATEGORY,
  TASK_RUNNING_STATE,
  TASK_TERMINAL_ACTIVE,
  TaskDefinition,
  TaskEvent,
  TaskEventKind,
  TaskGroup,
  TaskRunSource,
  TaskRunType,
  TaskScope,
  TaskSettingId,
  TaskSorter,
  TaskSourceKind,
  TasksSchemaProperties,
  USER_TASKS_GROUP_KEY,
  rerunTaskIcon
};
//# sourceMappingURL=tasks.js.map
