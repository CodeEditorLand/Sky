var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
import * as nls from "../../../../nls.js";
import * as resources from "../../../../base/common/resources.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ITaskService } from "../common/taskService.js";
import { RunOnOptions, TaskSourceKind, TASKS_CATEGORY } from "../common/tasks.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Event } from "../../../../base/common/event.js";
import { ILogService } from "../../../../platform/log/common/log.js";
const HAS_PROMPTED_FOR_AUTOMATIC_TASKS = "task.hasPromptedForAutomaticTasks.v2";
const ALLOW_AUTOMATIC_TASKS = "task.allowAutomaticTasks";
let RunAutomaticTasks = class RunAutomaticTasks2 extends Disposable {
  static {
    __name(this, "RunAutomaticTasks");
  }
  constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService, _storageService, _notificationService, _openerService) {
    super();
    this._taskService = _taskService;
    this._configurationService = _configurationService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._hasRunTasks = false;
    if (this._taskService.isReconnected) {
      this._tryRunTasks();
    } else {
      this._register(Event.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
    }
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
  }
  async _tryRunTasks() {
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      return;
    }
    const { value, userValue } = this._configurationService.inspect(ALLOW_AUTOMATIC_TASKS);
    if (this._hasRunTasks || value === "off" && userValue !== void 0) {
      return;
    }
    this._hasRunTasks = true;
    this._logService.trace("RunAutomaticTasks: Trying to run tasks.");
    if (!this._taskService.hasTaskSystemInfo) {
      this._logService.trace("RunAutomaticTasks: Awaiting task system info.");
      await Event.toPromise(Event.once(this._taskService.onDidChangeTaskSystemInfo));
    }
    let workspaceTasks = await this._taskService.getWorkspaceTasks(
      2
      /* TaskRunSource.FolderOpen */
    );
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
      workspaceTasks = await this._taskService.getWorkspaceTasks(
        2
        /* TaskRunSource.FolderOpen */
      );
      autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
      this._logService.trace(`RunAutomaticTasks: updated taskNames=${JSON.stringify(autoTasks.taskNames)}`);
    }
    this._runWithPermission(this._taskService, this._configurationService, this._storageService, this._notificationService, this._openerService, autoTasks.tasks, autoTasks.taskNames, autoTasks.locations);
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
      case 6: {
        return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
      }
      case 5: {
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
  async _runWithPermission(taskService, configurationService, storageService, notificationService, openerService, tasks, taskNames, locations) {
    if (taskNames.length === 0) {
      return;
    }
    if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === "on") {
      this._runTasks(taskService, tasks);
      return;
    }
    const hasShownPromptForAutomaticTasks = storageService.getBoolean(HAS_PROMPTED_FOR_AUTOMATIC_TASKS, 1, false);
    if (hasShownPromptForAutomaticTasks) {
      return;
    }
    const allow = await this._showPrompt(notificationService, storageService, openerService, configurationService, taskNames, locations);
    if (allow) {
      this._runTasks(taskService, tasks);
    }
  }
  _showPrompt(notificationService, storageService, openerService, configurationService, taskNames, locations) {
    return new Promise((resolve) => {
      notificationService.prompt(Severity.Info, nls.localize("tasks.run.allowAutomatic", "This workspace has tasks ({0}) defined ({1}) that run automatically when you open this workspace. Do you allow automatic tasks to run when you open this workspace?", taskNames.join(", "), Array.from(locations.keys()).join(", ")), [
        {
          label: nls.localize("allow", "Allow and Run"),
          run: /* @__PURE__ */ __name(() => {
            resolve(true);
            configurationService.updateValue(
              ALLOW_AUTOMATIC_TASKS,
              "on",
              2
              /* ConfigurationTarget.USER */
            );
          }, "run")
        },
        {
          label: nls.localize("disallow", "Disallow"),
          run: /* @__PURE__ */ __name(() => {
            resolve(false);
            configurationService.updateValue(
              ALLOW_AUTOMATIC_TASKS,
              "off",
              2
              /* ConfigurationTarget.USER */
            );
          }, "run")
        },
        {
          label: locations.size === 1 ? nls.localize("openTask", "Open File") : nls.localize("openTasks", "Open Files"),
          run: /* @__PURE__ */ __name(async () => {
            for (const location of locations) {
              await openerService.open(location[1]);
            }
            resolve(false);
          }, "run")
        }
      ], { onCancel: /* @__PURE__ */ __name(() => resolve(false), "onCancel") });
      storageService.store(
        HAS_PROMPTED_FOR_AUTOMATIC_TASKS,
        true,
        1,
        1
        /* StorageTarget.MACHINE */
      );
    });
  }
};
RunAutomaticTasks = __decorate([
  __param(0, ITaskService),
  __param(1, IConfigurationService),
  __param(2, IWorkspaceTrustManagementService),
  __param(3, ILogService),
  __param(4, IStorageService),
  __param(5, INotificationService),
  __param(6, IOpenerService)
], RunAutomaticTasks);
class ManageAutomaticTaskRunning extends Action2 {
  static {
    __name(this, "ManageAutomaticTaskRunning");
  }
  static {
    this.ID = "workbench.action.tasks.manageAutomaticRunning";
  }
  static {
    this.LABEL = nls.localize("workbench.action.tasks.manageAutomaticRunning", "Manage Automatic Tasks");
  }
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
    configurationService.updateValue(
      ALLOW_AUTOMATIC_TASKS,
      value === allowItem ? "on" : "off",
      2
      /* ConfigurationTarget.USER */
    );
  }
}
export {
  ManageAutomaticTaskRunning,
  RunAutomaticTasks
};
//# sourceMappingURL=runAutomaticTasks.js.map
