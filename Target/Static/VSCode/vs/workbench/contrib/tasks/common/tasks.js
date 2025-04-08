var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import * as Types from "../../../../base/common/types.js";
import * as resources from "../../../../base/common/resources.js";
import { IJSONSchemaMap } from "../../../../base/common/jsonSchema.js";
import * as Objects from "../../../../base/common/objects.js";
import { UriComponents, URI } from "../../../../base/common/uri.js";
import { ProblemMatcher } from "./problemMatcher.js";
import { IWorkspaceFolder, IWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { RawContextKey, ContextKeyExpression } from "../../../../platform/contextkey/common/contextkey.js";
import { TaskDefinitionRegistry } from "./taskDefinitionRegistry.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { TerminalExitReason } from "../../../../platform/terminal/common/terminal.js";
const USER_TASKS_GROUP_KEY = "settings";
const TASK_RUNNING_STATE = new RawContextKey("taskRunning", false, nls.localize("tasks.taskRunningContext", "Whether a task is currently running."));
const TASK_TERMINAL_ACTIVE = new RawContextKey("taskTerminalActive", false, nls.localize("taskTerminalActive", "Whether the active terminal is a task terminal."));
const TASKS_CATEGORY = nls.localize2("tasksCategory", "Tasks");
var ShellQuoting = /* @__PURE__ */ ((ShellQuoting2) => {
  ShellQuoting2[ShellQuoting2["Escape"] = 1] = "Escape";
  ShellQuoting2[ShellQuoting2["Strong"] = 2] = "Strong";
  ShellQuoting2[ShellQuoting2["Weak"] = 3] = "Weak";
  return ShellQuoting2;
})(ShellQuoting || {});
const CUSTOMIZED_TASK_TYPE = "$customized";
((ShellQuoting2) => {
  function from(value) {
    if (!value) {
      return 2 /* Strong */;
    }
    switch (value.toLowerCase()) {
      case "escape":
        return 1 /* Escape */;
      case "strong":
        return 2 /* Strong */;
      case "weak":
        return 3 /* Weak */;
      default:
        return 2 /* Strong */;
    }
  }
  ShellQuoting2.from = from;
  __name(from, "from");
})(ShellQuoting || (ShellQuoting = {}));
var CommandOptions;
((CommandOptions2) => {
  CommandOptions2.defaults = { cwd: "${workspaceFolder}" };
})(CommandOptions || (CommandOptions = {}));
var RevealKind = /* @__PURE__ */ ((RevealKind2) => {
  RevealKind2[RevealKind2["Always"] = 1] = "Always";
  RevealKind2[RevealKind2["Silent"] = 2] = "Silent";
  RevealKind2[RevealKind2["Never"] = 3] = "Never";
  return RevealKind2;
})(RevealKind || {});
((RevealKind2) => {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "always":
        return 1 /* Always */;
      case "silent":
        return 2 /* Silent */;
      case "never":
        return 3 /* Never */;
      default:
        return 1 /* Always */;
    }
  }
  RevealKind2.fromString = fromString;
  __name(fromString, "fromString");
})(RevealKind || (RevealKind = {}));
var RevealProblemKind = /* @__PURE__ */ ((RevealProblemKind2) => {
  RevealProblemKind2[RevealProblemKind2["Never"] = 1] = "Never";
  RevealProblemKind2[RevealProblemKind2["OnProblem"] = 2] = "OnProblem";
  RevealProblemKind2[RevealProblemKind2["Always"] = 3] = "Always";
  return RevealProblemKind2;
})(RevealProblemKind || {});
((RevealProblemKind2) => {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "always":
        return 3 /* Always */;
      case "never":
        return 1 /* Never */;
      case "onproblem":
        return 2 /* OnProblem */;
      default:
        return 2 /* OnProblem */;
    }
  }
  RevealProblemKind2.fromString = fromString;
  __name(fromString, "fromString");
})(RevealProblemKind || (RevealProblemKind = {}));
var PanelKind = /* @__PURE__ */ ((PanelKind2) => {
  PanelKind2[PanelKind2["Shared"] = 1] = "Shared";
  PanelKind2[PanelKind2["Dedicated"] = 2] = "Dedicated";
  PanelKind2[PanelKind2["New"] = 3] = "New";
  return PanelKind2;
})(PanelKind || {});
((PanelKind2) => {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "shared":
        return 1 /* Shared */;
      case "dedicated":
        return 2 /* Dedicated */;
      case "new":
        return 3 /* New */;
      default:
        return 1 /* Shared */;
    }
  }
  PanelKind2.fromString = fromString;
  __name(fromString, "fromString");
})(PanelKind || (PanelKind = {}));
var PresentationOptions;
((PresentationOptions2) => {
  PresentationOptions2.defaults = {
    echo: true,
    reveal: 1 /* Always */,
    revealProblems: 1 /* Never */,
    focus: false,
    panel: 1 /* Shared */,
    showReuseMessage: true,
    clear: false
  };
})(PresentationOptions || (PresentationOptions = {}));
var RuntimeType = /* @__PURE__ */ ((RuntimeType2) => {
  RuntimeType2[RuntimeType2["Shell"] = 1] = "Shell";
  RuntimeType2[RuntimeType2["Process"] = 2] = "Process";
  RuntimeType2[RuntimeType2["CustomExecution"] = 3] = "CustomExecution";
  return RuntimeType2;
})(RuntimeType || {});
((RuntimeType2) => {
  function fromString(value) {
    switch (value.toLowerCase()) {
      case "shell":
        return 1 /* Shell */;
      case "process":
        return 2 /* Process */;
      case "customExecution":
        return 3 /* CustomExecution */;
      default:
        return 2 /* Process */;
    }
  }
  RuntimeType2.fromString = fromString;
  __name(fromString, "fromString");
  function toString(value) {
    switch (value) {
      case 1 /* Shell */:
        return "shell";
      case 2 /* Process */:
        return "process";
      case 3 /* CustomExecution */:
        return "customExecution";
      default:
        return "process";
    }
  }
  RuntimeType2.toString = toString;
  __name(toString, "toString");
})(RuntimeType || (RuntimeType = {}));
var CommandString;
((CommandString2) => {
  function value(value2) {
    if (Types.isString(value2)) {
      return value2;
    } else {
      return value2.value;
    }
  }
  CommandString2.value = value;
  __name(value, "value");
})(CommandString || (CommandString = {}));
var TaskGroup;
((TaskGroup2) => {
  TaskGroup2.Clean = { _id: "clean", isDefault: false };
  TaskGroup2.Build = { _id: "build", isDefault: false };
  TaskGroup2.Rebuild = { _id: "rebuild", isDefault: false };
  TaskGroup2.Test = { _id: "test", isDefault: false };
  function is(value) {
    return value === TaskGroup2.Clean._id || value === TaskGroup2.Build._id || value === TaskGroup2.Rebuild._id || value === TaskGroup2.Test._id;
  }
  TaskGroup2.is = is;
  __name(is, "is");
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
  TaskGroup2.from = from;
  __name(from, "from");
})(TaskGroup || (TaskGroup = {}));
var TaskScope = /* @__PURE__ */ ((TaskScope2) => {
  TaskScope2[TaskScope2["Global"] = 1] = "Global";
  TaskScope2[TaskScope2["Workspace"] = 2] = "Workspace";
  TaskScope2[TaskScope2["Folder"] = 3] = "Folder";
  return TaskScope2;
})(TaskScope || {});
var TaskSourceKind;
((TaskSourceKind2) => {
  TaskSourceKind2.Workspace = "workspace";
  TaskSourceKind2.Extension = "extension";
  TaskSourceKind2.InMemory = "inMemory";
  TaskSourceKind2.WorkspaceFile = "workspaceFile";
  TaskSourceKind2.User = "user";
  function toConfigurationTarget(kind) {
    switch (kind) {
      case TaskSourceKind2.User:
        return ConfigurationTarget.USER;
      case TaskSourceKind2.WorkspaceFile:
        return ConfigurationTarget.WORKSPACE;
      default:
        return ConfigurationTarget.WORKSPACE_FOLDER;
    }
  }
  TaskSourceKind2.toConfigurationTarget = toConfigurationTarget;
  __name(toConfigurationTarget, "toConfigurationTarget");
})(TaskSourceKind || (TaskSourceKind = {}));
var DependsOrder = /* @__PURE__ */ ((DependsOrder2) => {
  DependsOrder2["parallel"] = "parallel";
  DependsOrder2["sequence"] = "sequence";
  return DependsOrder2;
})(DependsOrder || {});
var RunOnOptions = /* @__PURE__ */ ((RunOnOptions2) => {
  RunOnOptions2[RunOnOptions2["default"] = 1] = "default";
  RunOnOptions2[RunOnOptions2["folderOpen"] = 2] = "folderOpen";
  return RunOnOptions2;
})(RunOnOptions || {});
var RunOptions;
((RunOptions2) => {
  RunOptions2.defaults = { reevaluateOnRerun: true, runOn: 1 /* default */, instanceLimit: 1 };
})(RunOptions || (RunOptions = {}));
class CommonTask {
  static {
    __name(this, "CommonTask");
  }
  /**
   * The task's internal id
   */
  _id;
  /**
   * The cached label.
   */
  _label = "";
  type;
  runOptions;
  configurationProperties;
  _source;
  _taskLoadMessages;
  constructor(id, label, type, runOptions, configurationProperties, source) {
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
  // CUSTOMIZED_TASK_TYPE
  instance;
  /**
   * Indicated the source of the task (e.g. tasks.json or extension)
   */
  _source;
  hasDefinedMatchers;
  /**
   * The command configuration
   */
  command = {};
  constructor(id, source, label, type, command, hasDefinedMatchers, runOptions, configurationProperties) {
    super(id, label, void 0, runOptions, configurationProperties, source);
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
        case 1 /* Shell */:
          type = "shell";
          break;
        case 2 /* Process */:
          type = "process";
          break;
        case 3 /* CustomExecution */:
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
    return new CustomTask(object._id, object._source, object._label, object.type, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
  }
}
class ConfiguringTask extends CommonTask {
  static {
    __name(this, "ConfiguringTask");
  }
  /**
   * Indicated the source of the task (e.g. tasks.json or extension)
   */
  _source;
  configures;
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
  instance;
  defines;
  hasDefinedMatchers;
  /**
   * The command configuration
   */
  command;
  /**
   * The icon for the task
   */
  icon;
  /**
   * Don't show the task in the run task quickpick
   */
  hide;
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
    if (this._source.scope === 3 /* Folder */ && this._source.workspaceFolder) {
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
    return new ContributedTask(object._id, object._source, object._label, object.type, object.defines, object.command, object.hasDefinedMatchers, object.runOptions, object.configurationProperties);
  }
}
class InMemoryTask extends CommonTask {
  static {
    __name(this, "InMemoryTask");
  }
  /**
   * Indicated the source of the task (e.g. tasks.json or extension)
   */
  _source;
  instance;
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
    return new InMemoryTask(object._id, object._source, object._label, object.type, object.runOptions, object.configurationProperties);
  }
}
var ExecutionEngine = /* @__PURE__ */ ((ExecutionEngine2) => {
  ExecutionEngine2[ExecutionEngine2["Process"] = 1] = "Process";
  ExecutionEngine2[ExecutionEngine2["Terminal"] = 2] = "Terminal";
  return ExecutionEngine2;
})(ExecutionEngine || {});
((ExecutionEngine2) => {
  ExecutionEngine2._default = 2 /* Terminal */;
})(ExecutionEngine || (ExecutionEngine = {}));
var JsonSchemaVersion = /* @__PURE__ */ ((JsonSchemaVersion2) => {
  JsonSchemaVersion2[JsonSchemaVersion2["V0_1_0"] = 1] = "V0_1_0";
  JsonSchemaVersion2[JsonSchemaVersion2["V2_0_0"] = 2] = "V2_0_0";
  return JsonSchemaVersion2;
})(JsonSchemaVersion || {});
class TaskSorter {
  static {
    __name(this, "TaskSorter");
  }
  _order = /* @__PURE__ */ new Map();
  constructor(workspaceFolders) {
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
var TaskRunType = /* @__PURE__ */ ((TaskRunType2) => {
  TaskRunType2["SingleRun"] = "singleRun";
  TaskRunType2["Background"] = "background";
  return TaskRunType2;
})(TaskRunType || {});
var TaskEventKind = /* @__PURE__ */ ((TaskEventKind2) => {
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
  return TaskEventKind2;
})(TaskEventKind || {});
var TaskRunSource = /* @__PURE__ */ ((TaskRunSource2) => {
  TaskRunSource2[TaskRunSource2["System"] = 0] = "System";
  TaskRunSource2[TaskRunSource2["User"] = 1] = "User";
  TaskRunSource2[TaskRunSource2["FolderOpen"] = 2] = "FolderOpen";
  TaskRunSource2[TaskRunSource2["ConfigurationChange"] = 3] = "ConfigurationChange";
  TaskRunSource2[TaskRunSource2["Reconnect"] = 4] = "Reconnect";
  return TaskRunSource2;
})(TaskRunSource || {});
var TaskEvent;
((TaskEvent2) => {
  function common(task) {
    return {
      taskId: task._id,
      taskName: task.configurationProperties.name,
      runType: task.configurationProperties.isBackground ? "background" /* Background */ : "singleRun" /* SingleRun */,
      group: task.configurationProperties.group,
      __task: task
    };
  }
  __name(common, "common");
  function start(task, terminalId, resolvedVariables) {
    return {
      ...common(task),
      kind: "start" /* Start */,
      terminalId,
      resolvedVariables
    };
  }
  TaskEvent2.start = start;
  __name(start, "start");
  function processStarted(task, terminalId, processId) {
    return {
      ...common(task),
      kind: "processStarted" /* ProcessStarted */,
      terminalId,
      processId
    };
  }
  TaskEvent2.processStarted = processStarted;
  __name(processStarted, "processStarted");
  function processEnded(task, terminalId, exitCode) {
    return {
      ...common(task),
      kind: "processEnded" /* ProcessEnded */,
      terminalId,
      exitCode
    };
  }
  TaskEvent2.processEnded = processEnded;
  __name(processEnded, "processEnded");
  function terminated(task, terminalId, exitReason) {
    return {
      ...common(task),
      kind: "terminated" /* Terminated */,
      exitReason,
      terminalId
    };
  }
  TaskEvent2.terminated = terminated;
  __name(terminated, "terminated");
  function general(kind, task, terminalId) {
    return {
      ...common(task),
      kind,
      terminalId
    };
  }
  TaskEvent2.general = general;
  __name(general, "general");
  function changed() {
    return { kind: "changed" /* Changed */ };
  }
  TaskEvent2.changed = changed;
  __name(changed, "changed");
})(TaskEvent || (TaskEvent = {}));
var KeyedTaskIdentifier;
((KeyedTaskIdentifier2) => {
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
  KeyedTaskIdentifier2.create = create;
  __name(create, "create");
})(KeyedTaskIdentifier || (KeyedTaskIdentifier = {}));
var TaskSettingId = /* @__PURE__ */ ((TaskSettingId2) => {
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
  return TaskSettingId2;
})(TaskSettingId || {});
var TasksSchemaProperties = /* @__PURE__ */ ((TasksSchemaProperties2) => {
  TasksSchemaProperties2["Tasks"] = "tasks";
  TasksSchemaProperties2["SuppressTaskName"] = "tasks.suppressTaskName";
  TasksSchemaProperties2["Windows"] = "tasks.windows";
  TasksSchemaProperties2["Osx"] = "tasks.osx";
  TasksSchemaProperties2["Linux"] = "tasks.linux";
  TasksSchemaProperties2["ShowOutput"] = "tasks.showOutput";
  TasksSchemaProperties2["IsShellCommand"] = "tasks.isShellCommand";
  TasksSchemaProperties2["ServiceTestSetting"] = "tasks.service.testSetting";
  return TasksSchemaProperties2;
})(TasksSchemaProperties || {});
var TaskDefinition;
((TaskDefinition2) => {
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
              reporter.error(nls.localize(
                "TaskDefinition.missingRequiredProperty",
                "Error: the task identifier '{0}' is missing the required property '{1}'. The task identifier will be ignored.",
                JSON.stringify(external, void 0, 0),
                property
              ));
              return void 0;
          }
        }
      }
    }
    return KeyedTaskIdentifier.create(literal);
  }
  TaskDefinition2.createTaskIdentifier = createTaskIdentifier;
  __name(createTaskIdentifier, "createTaskIdentifier");
})(TaskDefinition || (TaskDefinition = {}));
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
  JsonSchemaVersion,
  KeyedTaskIdentifier,
  PanelKind,
  PresentationOptions,
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
  USER_TASKS_GROUP_KEY
};
//# sourceMappingURL=tasks.js.map
