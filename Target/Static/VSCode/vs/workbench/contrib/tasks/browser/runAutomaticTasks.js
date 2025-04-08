var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as nls from "../../../../nls.js";
import * as resources from "../../../../base/common/resources.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ITaskService, IWorkspaceFolderTaskResult } from "../common/taskService.js";
import { RunOnOptions, Task, TaskRunSource, TaskSource, TaskSourceKind, TASKS_CATEGORY, WorkspaceFileTaskSource, IWorkspaceTaskSource } from "../common/tasks.js";
import { IQuickPickItem, IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { ConfigurationTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { URI } from "../../../../base/common/uri.js";
import { Event } from "../../../../base/common/event.js";
import { ILogService } from "../../../../platform/log/common/log.js";
const ALLOW_AUTOMATIC_TASKS = "task.allowAutomaticTasks";
let RunAutomaticTasks = class extends Disposable {
  constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService) {
    super();
    this._taskService = _taskService;
    this._configurationService = _configurationService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._logService = _logService;
    if (this._taskService.isReconnected) {
      this._tryRunTasks();
    } else {
      this._register(Event.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
    }
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
  }
  static {
    __name(this, "RunAutomaticTasks");
  }
  _hasRunTasks = false;
  async _tryRunTasks() {
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      return;
    }
    if (this._hasRunTasks || this._configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === "off") {
      return;
    }
    this._hasRunTasks = true;
    this._logService.trace("RunAutomaticTasks: Trying to run tasks.");
    if (!this._taskService.hasTaskSystemInfo) {
      this._logService.trace("RunAutomaticTasks: Awaiting task system info.");
      await Event.toPromise(Event.once(this._taskService.onDidChangeTaskSystemInfo));
    }
    let workspaceTasks = await this._taskService.getWorkspaceTasks(TaskRunSource.FolderOpen);
    this._logService.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
    let autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
    this._logService.trace(`RunAutomaticTasks: taskNames=${JSON.stringify(autoTasks.taskNames)}`);
    if (autoTasks.taskNames.length === 0) {
      const updatedWithinTimeout = await Promise.race([
        new Promise((resolve) => {
          Event.toPromise(Event.once(this._taskService.onDidChangeTaskConfig)).then(() => resolve(true));
        }),
        new Promise((resolve) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve(false);
          }, 1e4);
        })
      ]);
      if (!updatedWithinTimeout) {
        this._logService.trace(`RunAutomaticTasks: waited some extra time, but no update of tasks configuration`);
        return;
      }
      workspaceTasks = await this._taskService.getWorkspaceTasks(TaskRunSource.FolderOpen);
      autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
      this._logService.trace(`RunAutomaticTasks: updated taskNames=${JSON.stringify(autoTasks.taskNames)}`);
    }
    this._runWithPermission(this._taskService, this._configurationService, autoTasks.tasks, autoTasks.taskNames);
  }
  _runTasks(taskService, tasks) {
    tasks.forEach((task) => {
      if (task instanceof Promise) {
        task.then((promiseResult) => {
          if (promiseResult) {
            taskService.run(promiseResult);
          }
        });
      } else {
        taskService.run(task);
      }
    });
  }
  _getTaskSource(source) {
    const taskKind = TaskSourceKind.toConfigurationTarget(source.kind);
    switch (taskKind) {
      case ConfigurationTarget.WORKSPACE_FOLDER: {
        return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
      }
      case ConfigurationTarget.WORKSPACE: {
        return source.config.workspace?.configuration ?? void 0;
      }
    }
    return void 0;
  }
  _findAutoTasks(taskService, workspaceTaskResult) {
    const tasks = new Array();
    const taskNames = new Array();
    const locations = /* @__PURE__ */ new Map();
    if (workspaceTaskResult) {
      workspaceTaskResult.forEach((resultElement) => {
        if (resultElement.set) {
          resultElement.set.tasks.forEach((task) => {
            if (task.runOptions.runOn === RunOnOptions.folderOpen) {
              tasks.push(task);
              taskNames.push(task._label);
              const location = this._getTaskSource(task._source);
              if (location) {
                locations.set(location.fsPath, location);
              }
            }
          });
        }
        if (resultElement.configurations) {
          for (const configuredTask of Object.values(resultElement.configurations.byIdentifier)) {
            if (configuredTask.runOptions.runOn === RunOnOptions.folderOpen) {
              tasks.push(new Promise((resolve) => {
                taskService.getTask(resultElement.workspaceFolder, configuredTask._id, true).then((task) => resolve(task));
              }));
              if (configuredTask._label) {
                taskNames.push(configuredTask._label);
              } else {
                taskNames.push(configuredTask.configures.task);
              }
              const location = this._getTaskSource(configuredTask._source);
              if (location) {
                locations.set(location.fsPath, location);
              }
            }
          }
        }
      });
    }
    return { tasks, taskNames, locations };
  }
  async _runWithPermission(taskService, configurationService, tasks, taskNames) {
    if (taskNames.length === 0) {
      return;
    }
    if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === "off") {
      return;
    }
    this._runTasks(taskService, tasks);
  }
};
RunAutomaticTasks = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, ILogService)
], RunAutomaticTasks);
class ManageAutomaticTaskRunning extends Action2 {
  static {
    __name(this, "ManageAutomaticTaskRunning");
  }
  static ID = "workbench.action.tasks.manageAutomaticRunning";
  static LABEL = nls.localize("workbench.action.tasks.manageAutomaticRunning", "Manage Automatic Tasks");
  constructor() {
    super({
      id: ManageAutomaticTaskRunning.ID,
      title: ManageAutomaticTaskRunning.LABEL,
      category: TASKS_CATEGORY
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const allowItem = { label: nls.localize("workbench.action.tasks.allowAutomaticTasks", "Allow Automatic Tasks") };
    const disallowItem = { label: nls.localize("workbench.action.tasks.disallowAutomaticTasks", "Disallow Automatic Tasks") };
    const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
    if (!value) {
      return;
    }
    configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value === allowItem ? "on" : "off", ConfigurationTarget.USER);
  }
}
export {
  ManageAutomaticTaskRunning,
  RunAutomaticTasks
};
//# sourceMappingURL=runAutomaticTasks.js.map
