var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../nls.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import * as Types from "../../../base/common/types.js";
import * as Platform from "../../../base/common/platform.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { ContributedTask, ConfiguringTask, CommandOptions, RuntimeType, CustomTask, TaskSourceKind, TaskDefinition, PresentationOptions, RunOptions } from "../../contrib/tasks/common/tasks.js";
import { ITaskService } from "../../contrib/tasks/common/taskService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { TaskEventKind } from "../common/shared/tasks.js";
import { IConfigurationResolverService } from "../../services/configurationResolver/common/configurationResolver.js";
import { ErrorNoTelemetry } from "../../../base/common/errors.js";
import { ConfigurationResolverExpression } from "../../services/configurationResolver/common/configurationResolverExpression.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
var TaskExecutionDTO;
(function(TaskExecutionDTO2) {
  function from(value) {
    return {
      id: value.id,
      task: TaskDTO.from(value.task)
    };
  }
  __name(from, "from");
  TaskExecutionDTO2.from = from;
})(TaskExecutionDTO || (TaskExecutionDTO = {}));
var TaskProblemMatcherStartedDto;
(function(TaskProblemMatcherStartedDto2) {
  function from(value) {
    return {
      execution: {
        id: value.execution.id,
        task: TaskDTO.from(value.execution.task)
      }
    };
  }
  __name(from, "from");
  TaskProblemMatcherStartedDto2.from = from;
})(TaskProblemMatcherStartedDto || (TaskProblemMatcherStartedDto = {}));
var TaskProblemMatcherEndedDto;
(function(TaskProblemMatcherEndedDto2) {
  function from(value) {
    return {
      execution: {
        id: value.execution.id,
        task: TaskDTO.from(value.execution.task)
      },
      hasErrors: value.hasErrors
    };
  }
  __name(from, "from");
  TaskProblemMatcherEndedDto2.from = from;
})(TaskProblemMatcherEndedDto || (TaskProblemMatcherEndedDto = {}));
var TaskProcessStartedDTO;
(function(TaskProcessStartedDTO2) {
  function from(value, processId) {
    return {
      id: value.id,
      processId
    };
  }
  __name(from, "from");
  TaskProcessStartedDTO2.from = from;
})(TaskProcessStartedDTO || (TaskProcessStartedDTO = {}));
var TaskProcessEndedDTO;
(function(TaskProcessEndedDTO2) {
  function from(value, exitCode) {
    return {
      id: value.id,
      exitCode
    };
  }
  __name(from, "from");
  TaskProcessEndedDTO2.from = from;
})(TaskProcessEndedDTO || (TaskProcessEndedDTO = {}));
var TaskDefinitionDTO;
(function(TaskDefinitionDTO2) {
  function from(value) {
    const result = Object.assign(/* @__PURE__ */ Object.create(null), value);
    delete result._key;
    return result;
  }
  __name(from, "from");
  TaskDefinitionDTO2.from = from;
  function to(value, executeOnly) {
    let result = TaskDefinition.createTaskIdentifier(value, console);
    if (result === void 0 && executeOnly) {
      result = {
        _key: generateUuid(),
        type: "$executeOnly"
      };
    }
    return result;
  }
  __name(to, "to");
  TaskDefinitionDTO2.to = to;
})(TaskDefinitionDTO || (TaskDefinitionDTO = {}));
var TaskPresentationOptionsDTO;
(function(TaskPresentationOptionsDTO2) {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), value);
  }
  __name(from, "from");
  TaskPresentationOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return PresentationOptions.defaults;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), PresentationOptions.defaults, value);
  }
  __name(to, "to");
  TaskPresentationOptionsDTO2.to = to;
})(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));
var RunOptionsDTO;
(function(RunOptionsDTO2) {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), value);
  }
  __name(from, "from");
  RunOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return RunOptions.defaults;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), RunOptions.defaults, value);
  }
  __name(to, "to");
  RunOptionsDTO2.to = to;
})(RunOptionsDTO || (RunOptionsDTO = {}));
var ProcessExecutionOptionsDTO;
(function(ProcessExecutionOptionsDTO2) {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return {
      cwd: value.cwd,
      env: value.env
    };
  }
  __name(from, "from");
  ProcessExecutionOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return CommandOptions.defaults;
    }
    return {
      cwd: value.cwd || CommandOptions.defaults.cwd,
      env: value.env
    };
  }
  __name(to, "to");
  ProcessExecutionOptionsDTO2.to = to;
})(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));
var ProcessExecutionDTO;
(function(ProcessExecutionDTO2) {
  function is(value) {
    const candidate = value;
    return candidate && !!candidate.process;
  }
  __name(is, "is");
  ProcessExecutionDTO2.is = is;
  function from(value) {
    const process = Types.isString(value.name) ? value.name : value.name.value;
    const args = value.args ? value.args.map((value2) => Types.isString(value2) ? value2 : value2.value) : [];
    const result = {
      process,
      args
    };
    if (value.options) {
      result.options = ProcessExecutionOptionsDTO.from(value.options);
    }
    return result;
  }
  __name(from, "from");
  ProcessExecutionDTO2.from = from;
  function to(value) {
    const result = {
      runtime: RuntimeType.Process,
      name: value.process,
      args: value.args,
      presentation: void 0
    };
    result.options = ProcessExecutionOptionsDTO.to(value.options);
    return result;
  }
  __name(to, "to");
  ProcessExecutionDTO2.to = to;
})(ProcessExecutionDTO || (ProcessExecutionDTO = {}));
var ShellExecutionOptionsDTO;
(function(ShellExecutionOptionsDTO2) {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    const result = {
      cwd: value.cwd || CommandOptions.defaults.cwd,
      env: value.env
    };
    if (value.shell) {
      result.executable = value.shell.executable;
      result.shellArgs = value.shell.args;
      result.shellQuoting = value.shell.quoting;
    }
    return result;
  }
  __name(from, "from");
  ShellExecutionOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    const result = {
      cwd: value.cwd,
      env: value.env
    };
    if (value.executable) {
      result.shell = {
        executable: value.executable
      };
      if (value.shellArgs) {
        result.shell.args = value.shellArgs;
      }
      if (value.shellQuoting) {
        result.shell.quoting = value.shellQuoting;
      }
    }
    return result;
  }
  __name(to, "to");
  ShellExecutionOptionsDTO2.to = to;
})(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));
var ShellExecutionDTO;
(function(ShellExecutionDTO2) {
  function is(value) {
    const candidate = value;
    return candidate && (!!candidate.commandLine || !!candidate.command);
  }
  __name(is, "is");
  ShellExecutionDTO2.is = is;
  function from(value) {
    const result = {};
    if (value.name && Types.isString(value.name) && (value.args === void 0 || value.args === null || value.args.length === 0)) {
      result.commandLine = value.name;
    } else {
      result.command = value.name;
      result.args = value.args;
    }
    if (value.options) {
      result.options = ShellExecutionOptionsDTO.from(value.options);
    }
    return result;
  }
  __name(from, "from");
  ShellExecutionDTO2.from = from;
  function to(value) {
    const result = {
      runtime: RuntimeType.Shell,
      name: value.commandLine ? value.commandLine : value.command,
      args: value.args,
      presentation: void 0
    };
    if (value.options) {
      result.options = ShellExecutionOptionsDTO.to(value.options);
    }
    return result;
  }
  __name(to, "to");
  ShellExecutionDTO2.to = to;
})(ShellExecutionDTO || (ShellExecutionDTO = {}));
var CustomExecutionDTO;
(function(CustomExecutionDTO2) {
  function is(value) {
    const candidate = value;
    return candidate && candidate.customExecution === "customExecution";
  }
  __name(is, "is");
  CustomExecutionDTO2.is = is;
  function from(value) {
    return {
      customExecution: "customExecution"
    };
  }
  __name(from, "from");
  CustomExecutionDTO2.from = from;
  function to(value) {
    return {
      runtime: RuntimeType.CustomExecution,
      presentation: void 0
    };
  }
  __name(to, "to");
  CustomExecutionDTO2.to = to;
})(CustomExecutionDTO || (CustomExecutionDTO = {}));
var TaskSourceDTO;
(function(TaskSourceDTO2) {
  function from(value) {
    const result = {
      label: value.label
    };
    if (value.kind === TaskSourceKind.Extension) {
      result.extensionId = value.extension;
      if (value.workspaceFolder) {
        result.scope = value.workspaceFolder.uri;
      } else {
        result.scope = value.scope;
      }
    } else if (value.kind === TaskSourceKind.Workspace) {
      result.extensionId = "$core";
      result.scope = value.config.workspaceFolder ? value.config.workspaceFolder.uri : 1;
    }
    return result;
  }
  __name(from, "from");
  TaskSourceDTO2.from = from;
  function to(value, workspace) {
    let scope;
    let workspaceFolder;
    if (value.scope === void 0 || typeof value.scope === "number" && value.scope !== 1) {
      if (workspace.getWorkspace().folders.length === 0) {
        scope = 1;
        workspaceFolder = void 0;
      } else {
        scope = 3;
        workspaceFolder = workspace.getWorkspace().folders[0];
      }
    } else if (typeof value.scope === "number") {
      scope = value.scope;
    } else {
      scope = 3;
      workspaceFolder = workspace.getWorkspaceFolder(URI.revive(value.scope)) ?? void 0;
    }
    const result = {
      kind: TaskSourceKind.Extension,
      label: value.label,
      extension: value.extensionId,
      scope,
      workspaceFolder
    };
    return result;
  }
  __name(to, "to");
  TaskSourceDTO2.to = to;
})(TaskSourceDTO || (TaskSourceDTO = {}));
var TaskHandleDTO;
(function(TaskHandleDTO2) {
  function is(value) {
    const candidate = value;
    return candidate && Types.isString(candidate.id) && !!candidate.workspaceFolder;
  }
  __name(is, "is");
  TaskHandleDTO2.is = is;
})(TaskHandleDTO || (TaskHandleDTO = {}));
var TaskDTO;
(function(TaskDTO2) {
  function from(task) {
    if (task === void 0 || task === null || !CustomTask.is(task) && !ContributedTask.is(task) && !ConfiguringTask.is(task)) {
      return void 0;
    }
    const result = {
      _id: task._id,
      name: task.configurationProperties.name,
      definition: TaskDefinitionDTO.from(task.getDefinition(true)),
      source: TaskSourceDTO.from(task._source),
      execution: void 0,
      presentationOptions: !ConfiguringTask.is(task) && task.command ? TaskPresentationOptionsDTO.from(task.command.presentation) : void 0,
      isBackground: task.configurationProperties.isBackground,
      problemMatchers: [],
      hasDefinedMatchers: ContributedTask.is(task) ? task.hasDefinedMatchers : false,
      runOptions: RunOptionsDTO.from(task.runOptions)
    };
    result.group = TaskGroupDTO.from(task.configurationProperties.group);
    if (task.configurationProperties.detail) {
      result.detail = task.configurationProperties.detail;
    }
    if (!ConfiguringTask.is(task) && task.command) {
      switch (task.command.runtime) {
        case RuntimeType.Process:
          result.execution = ProcessExecutionDTO.from(task.command);
          break;
        case RuntimeType.Shell:
          result.execution = ShellExecutionDTO.from(task.command);
          break;
        case RuntimeType.CustomExecution:
          result.execution = CustomExecutionDTO.from(task.command);
          break;
      }
    }
    if (task.configurationProperties.problemMatchers) {
      for (const matcher of task.configurationProperties.problemMatchers) {
        if (Types.isString(matcher)) {
          result.problemMatchers.push(matcher);
        }
      }
    }
    return result;
  }
  __name(from, "from");
  TaskDTO2.from = from;
  function to(task, workspace, executeOnly, icon, hide) {
    if (!task || typeof task.name !== "string") {
      return void 0;
    }
    let command;
    if (task.execution) {
      if (ShellExecutionDTO.is(task.execution)) {
        command = ShellExecutionDTO.to(task.execution);
      } else if (ProcessExecutionDTO.is(task.execution)) {
        command = ProcessExecutionDTO.to(task.execution);
      } else if (CustomExecutionDTO.is(task.execution)) {
        command = CustomExecutionDTO.to(task.execution);
      }
    }
    if (!command) {
      return void 0;
    }
    command.presentation = TaskPresentationOptionsDTO.to(task.presentationOptions);
    const source = TaskSourceDTO.to(task.source, workspace);
    const label = nls.localize("task.label", "{0}: {1}", source.label, task.name);
    const definition = TaskDefinitionDTO.to(task.definition, executeOnly);
    const id = CustomExecutionDTO.is(task.execution) && task._id ? task._id : `${task.source.extensionId}.${definition._key}`;
    const result = new ContributedTask(
      id,
      // uuidMap.getUUID(identifier)
      source,
      label,
      definition.type,
      definition,
      command,
      task.hasDefinedMatchers,
      RunOptionsDTO.to(task.runOptions),
      {
        name: task.name,
        identifier: label,
        group: task.group,
        isBackground: !!task.isBackground,
        problemMatchers: task.problemMatchers.slice(),
        detail: task.detail,
        icon,
        hide
      }
    );
    return result;
  }
  __name(to, "to");
  TaskDTO2.to = to;
})(TaskDTO || (TaskDTO = {}));
var TaskGroupDTO;
(function(TaskGroupDTO2) {
  function from(value) {
    if (value === void 0) {
      return void 0;
    }
    return {
      _id: typeof value === "string" ? value : value._id,
      isDefault: typeof value === "string" ? false : typeof value.isDefault === "string" ? false : value.isDefault
    };
  }
  __name(from, "from");
  TaskGroupDTO2.from = from;
})(TaskGroupDTO || (TaskGroupDTO = {}));
var TaskFilterDTO;
(function(TaskFilterDTO2) {
  function from(value) {
    return value;
  }
  __name(from, "from");
  TaskFilterDTO2.from = from;
  function to(value) {
    return value;
  }
  __name(to, "to");
  TaskFilterDTO2.to = to;
})(TaskFilterDTO || (TaskFilterDTO = {}));
let MainThreadTask = class MainThreadTask2 extends Disposable {
  static {
    __name(this, "MainThreadTask");
  }
  constructor(extHostContext, _taskService, _workspaceContextServer, _configurationResolverService) {
    super();
    this._taskService = _taskService;
    this._workspaceContextServer = _workspaceContextServer;
    this._configurationResolverService = _configurationResolverService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTask);
    this._providers = /* @__PURE__ */ new Map();
    this._register(this._taskService.onDidStateChange(async (event) => {
      if (event.kind === TaskEventKind.Changed) {
        return;
      }
      const task = event.__task;
      if (event.kind === TaskEventKind.Start) {
        const execution = TaskExecutionDTO.from(task.getTaskExecution());
        let resolvedDefinition = execution.task.definition;
        if (execution.task?.execution && CustomExecutionDTO.is(execution.task.execution) && event.resolvedVariables) {
          const expr = ConfigurationResolverExpression.parse(execution.task.definition);
          for (const replacement of expr.unresolved()) {
            const value = event.resolvedVariables.get(replacement.inner);
            if (value !== void 0) {
              expr.resolve(replacement, value);
            }
          }
          resolvedDefinition = await this._configurationResolverService.resolveAsync(task.getWorkspaceFolder(), expr);
        }
        this._proxy.$onDidStartTask(execution, event.terminalId, resolvedDefinition);
      } else if (event.kind === TaskEventKind.ProcessStarted) {
        this._proxy.$onDidStartTaskProcess(TaskProcessStartedDTO.from(task.getTaskExecution(), event.processId));
      } else if (event.kind === TaskEventKind.ProcessEnded) {
        this._proxy.$onDidEndTaskProcess(TaskProcessEndedDTO.from(task.getTaskExecution(), event.exitCode));
      } else if (event.kind === TaskEventKind.End) {
        this._proxy.$OnDidEndTask(TaskExecutionDTO.from(task.getTaskExecution()));
      } else if (event.kind === TaskEventKind.ProblemMatcherStarted) {
        this._proxy.$onDidStartTaskProblemMatchers(TaskProblemMatcherStartedDto.from({ execution: task.getTaskExecution() }));
      } else if (event.kind === TaskEventKind.ProblemMatcherEnded) {
        this._proxy.$onDidEndTaskProblemMatchers(TaskProblemMatcherEndedDto.from({ execution: task.getTaskExecution(), hasErrors: false }));
      } else if (event.kind === TaskEventKind.ProblemMatcherFoundErrors) {
        this._proxy.$onDidEndTaskProblemMatchers(TaskProblemMatcherEndedDto.from({ execution: task.getTaskExecution(), hasErrors: true }));
      }
    }));
  }
  dispose() {
    for (const value of this._providers.values()) {
      value.disposable.dispose();
    }
    this._providers.clear();
    super.dispose();
  }
  $createTaskId(taskDTO) {
    return new Promise((resolve, reject) => {
      const task = TaskDTO.to(taskDTO, this._workspaceContextServer, true);
      if (task) {
        resolve(task._id);
      } else {
        reject(new Error("Task could not be created from DTO"));
      }
    });
  }
  $registerTaskProvider(handle, type) {
    const provider = {
      provideTasks: /* @__PURE__ */ __name((validTypes) => {
        return Promise.resolve(this._proxy.$provideTasks(handle, validTypes)).then((value) => {
          const tasks = [];
          for (const dto of value.tasks) {
            const task = TaskDTO.to(dto, this._workspaceContextServer, true);
            if (task) {
              tasks.push(task);
            } else {
              console.error(`Task System: can not convert task: ${JSON.stringify(dto.definition, void 0, 0)}. Task will be dropped`);
            }
          }
          const processedExtension = {
            ...value.extension,
            extensionLocation: URI.revive(value.extension.extensionLocation)
          };
          return {
            tasks,
            extension: processedExtension
          };
        });
      }, "provideTasks"),
      resolveTask: /* @__PURE__ */ __name((task) => {
        const dto = TaskDTO.from(task);
        if (dto) {
          dto.name = dto.name === void 0 ? "" : dto.name;
          return Promise.resolve(this._proxy.$resolveTask(handle, dto)).then((resolvedTask) => {
            if (resolvedTask) {
              return TaskDTO.to(resolvedTask, this._workspaceContextServer, true, task.configurationProperties.icon, task.configurationProperties.hide);
            }
            return void 0;
          });
        }
        return Promise.resolve(void 0);
      }, "resolveTask")
    };
    const disposable = this._taskService.registerTaskProvider(provider, type);
    this._providers.set(handle, { disposable, provider });
    return Promise.resolve(void 0);
  }
  $unregisterTaskProvider(handle) {
    const provider = this._providers.get(handle);
    if (provider) {
      provider.disposable.dispose();
      this._providers.delete(handle);
    }
    return Promise.resolve(void 0);
  }
  $fetchTasks(filter) {
    return this._taskService.tasks(TaskFilterDTO.to(filter)).then((tasks) => {
      const result = [];
      for (const task of tasks) {
        const item = TaskDTO.from(task);
        if (item) {
          result.push(item);
        }
      }
      return result;
    });
  }
  getWorkspace(value) {
    let workspace;
    if (typeof value === "string") {
      workspace = value;
    } else {
      const workspaceObject = this._workspaceContextServer.getWorkspace();
      const uri = URI.revive(value);
      if (workspaceObject.configuration?.toString() === uri.toString()) {
        workspace = workspaceObject;
      } else {
        workspace = this._workspaceContextServer.getWorkspaceFolder(uri);
      }
    }
    return workspace;
  }
  async $getTaskExecution(value) {
    if (TaskHandleDTO.is(value)) {
      const workspace = this.getWorkspace(value.workspaceFolder);
      if (workspace) {
        const task = await this._taskService.getTask(workspace, value.id, true);
        if (task) {
          return {
            id: task._id,
            task: TaskDTO.from(task)
          };
        }
        throw new Error("Task not found");
      } else {
        throw new Error("No workspace folder");
      }
    } else {
      const task = TaskDTO.to(value, this._workspaceContextServer, true);
      return {
        id: task._id,
        task: TaskDTO.from(task)
      };
    }
  }
  // Passing in a TaskHandleDTO will cause the task to get re-resolved, which is important for tasks are coming from the core,
  // such as those gotten from a fetchTasks, since they can have missing configuration properties.
  $executeTask(value) {
    return new Promise((resolve, reject) => {
      if (TaskHandleDTO.is(value)) {
        const workspace = this.getWorkspace(value.workspaceFolder);
        if (workspace) {
          this._taskService.getTask(workspace, value.id, true).then((task) => {
            if (!task) {
              reject(new Error("Task not found"));
            } else {
              const result = {
                id: value.id,
                task: TaskDTO.from(task)
              };
              this._taskService.run(task).then((summary) => {
                if (summary?.exitCode === void 0 || summary.exitCode !== 0) {
                  this._proxy.$OnDidEndTask(result);
                }
              }, (reason) => {
              });
              resolve(result);
            }
          }, (_error) => {
            reject(new Error("Task not found"));
          });
        } else {
          reject(new Error("No workspace folder"));
        }
      } else {
        const task = TaskDTO.to(value, this._workspaceContextServer, true);
        this._taskService.run(task).then(void 0, (reason) => {
        });
        const result = {
          id: task._id,
          task: TaskDTO.from(task)
        };
        resolve(result);
      }
    });
  }
  $customExecutionComplete(id, result) {
    return new Promise((resolve, reject) => {
      this._taskService.getActiveTasks().then((tasks) => {
        for (const task of tasks) {
          if (id === task._id) {
            this._taskService.extensionCallbackTaskComplete(task, result).then((value) => {
              resolve(void 0);
            }, (error) => {
              reject(error);
            });
            return;
          }
        }
        reject(new Error("Task to mark as complete not found"));
      });
    });
  }
  $terminateTask(id) {
    return new Promise((resolve, reject) => {
      this._taskService.getActiveTasks().then((tasks) => {
        for (const task of tasks) {
          if (id === task._id) {
            this._taskService.terminate(task).then((value) => {
              resolve(void 0);
            }, (error) => {
              reject(void 0);
            });
            return;
          }
        }
        reject(new ErrorNoTelemetry("Task to terminate not found"));
      });
    });
  }
  $registerTaskSystem(key, info) {
    let platform;
    switch (info.platform) {
      case "Web":
        platform = 0;
        break;
      case "win32":
        platform = 3;
        break;
      case "darwin":
        platform = 1;
        break;
      case "linux":
        platform = 2;
        break;
      default:
        platform = Platform.platform;
    }
    this._taskService.registerTaskSystem(key, {
      platform,
      uriProvider: /* @__PURE__ */ __name((path) => {
        return URI.from({ scheme: info.scheme, authority: info.authority, path });
      }, "uriProvider"),
      context: this._extHostContext,
      resolveVariables: /* @__PURE__ */ __name((workspaceFolder, toResolve, target) => {
        const vars = [];
        toResolve.variables.forEach((item) => vars.push(item));
        return Promise.resolve(this._proxy.$resolveVariables(workspaceFolder.uri, { process: toResolve.process, variables: vars })).then((values) => {
          const partiallyResolvedVars = Array.from(Object.values(values.variables));
          return new Promise((resolve, reject) => {
            this._configurationResolverService.resolveWithInteraction(workspaceFolder, partiallyResolvedVars, "tasks", void 0, target).then((resolvedVars) => {
              if (!resolvedVars) {
                resolve(void 0);
              }
              const result = {
                process: void 0,
                variables: /* @__PURE__ */ new Map()
              };
              for (let i = 0; i < partiallyResolvedVars.length; i++) {
                const variableName = vars[i].substring(2, vars[i].length - 1);
                if (resolvedVars && values.variables[vars[i]] === vars[i]) {
                  const resolved = resolvedVars.get(variableName);
                  if (typeof resolved === "string") {
                    result.variables.set(variableName, resolved);
                  }
                } else {
                  result.variables.set(variableName, partiallyResolvedVars[i]);
                }
              }
              if (Types.isString(values.process)) {
                result.process = values.process;
              }
              resolve(result);
            }, (reason) => {
              reject(reason);
            });
          });
        });
      }, "resolveVariables"),
      findExecutable: /* @__PURE__ */ __name((command, cwd, paths) => {
        return this._proxy.$findExecutable(command, cwd, paths);
      }, "findExecutable")
    });
  }
  async $registerSupportedExecutions(custom, shell, process) {
    return this._taskService.registerSupportedExecutions(custom, shell, process);
  }
};
MainThreadTask = __decorate([
  extHostNamedCustomer(MainContext.MainThreadTask),
  __param(1, ITaskService),
  __param(2, IWorkspaceContextService),
  __param(3, IConfigurationResolverService)
], MainThreadTask);
export {
  MainThreadTask,
  TaskProblemMatcherEndedDto,
  TaskProblemMatcherStartedDto
};
//# sourceMappingURL=mainThreadTask.js.map
