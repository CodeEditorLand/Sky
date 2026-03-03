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
var SessionsConfigurationService_1;
import { Disposable, DisposableStore, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { observableValue, transaction } from "../../../../base/common/observable.js";
import { joinPath, dirname, isEqual } from "../../../../base/common/resources.js";
import { parse } from "../../../../base/common/jsonc.js";
import { isMacintosh, isWindows } from "../../../../base/common/platform.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IJSONEditingService } from "../../../../workbench/services/configuration/common/jsonEditing.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IPreferencesService } from "../../../../workbench/services/preferences/common/preferences.js";
import { ITerminalService } from "../../../../workbench/contrib/terminal/browser/terminal.js";
const ISessionsConfigurationService = createDecorator("sessionsConfigurationService");
let SessionsConfigurationService = class SessionsConfigurationService2 extends Disposable {
  static {
    __name(this, "SessionsConfigurationService");
  }
  static {
    SessionsConfigurationService_1 = this;
  }
  static {
    this._LAST_RUN_TASK_LABELS_KEY = "agentSessions.lastRunTaskLabels";
  }
  static {
    this._SUPPORTED_TASK_TYPES = /* @__PURE__ */ new Set(["shell", "npm"]);
  }
  constructor(_fileService, _jsonEditingService, _preferencesService, _terminalService, _sessionsManagementService, _storageService) {
    super();
    this._fileService = _fileService;
    this._jsonEditingService = _jsonEditingService;
    this._preferencesService = _preferencesService;
    this._terminalService = _terminalService;
    this._sessionsManagementService = _sessionsManagementService;
    this._storageService = _storageService;
    this._sessionTasks = observableValue(this, []);
    this._fileWatcher = this._register(new MutableDisposable());
    this._taskTerminals = /* @__PURE__ */ new Map();
    this._lastRunTaskObservables = /* @__PURE__ */ new Map();
    this._lastRunTaskLabels = this._loadLastRunTaskLabels();
  }
  getSessionTasks(session) {
    const folder = session.worktree ?? session.repository;
    if (folder) {
      this._ensureFileWatch(folder);
    }
    if (!isEqual(this._lastRefreshedFolder, folder)) {
      this._lastRefreshedFolder = folder;
      this._refreshSessionTasks(folder);
    }
    return this._sessionTasks;
  }
  async getNonSessionTasks(session) {
    const allTasks = await this._readAllTasks(session);
    return allTasks.filter((t) => !t.inSessions);
  }
  async addTaskToSessions(task, session, target) {
    const tasksJsonUri = this._getTasksJsonUri(session, target);
    if (!tasksJsonUri) {
      return;
    }
    const tasksJson = await this._readTasksJson(tasksJsonUri);
    const tasks = tasksJson.tasks ?? [];
    const index = tasks.findIndex((t) => t.label === task.label);
    if (index === -1) {
      return;
    }
    await this._jsonEditingService.write(tasksJsonUri, [
      { path: ["tasks", index, "inSessions"], value: true }
    ], true);
    if (target === "workspace") {
      await this._commitTasksFile(session);
    }
  }
  async createAndAddTask(command, session, target) {
    const tasksJsonUri = this._getTasksJsonUri(session, target);
    if (!tasksJsonUri) {
      return void 0;
    }
    const tasksJson = await this._readTasksJson(tasksJsonUri);
    const tasks = tasksJson.tasks ?? [];
    const newTask = {
      label: command,
      type: "shell",
      command,
      inSessions: true
    };
    await this._jsonEditingService.write(tasksJsonUri, [
      { path: ["version"], value: tasksJson.version ?? "2.0.0" },
      { path: ["tasks"], value: [...tasks, newTask] }
    ], true);
    if (target === "workspace") {
      await this._commitTasksFile(session);
    }
    return newTask;
  }
  async runTask(task, session) {
    const command = this._resolveCommand(task);
    if (!command) {
      return;
    }
    const cwd = session.worktree ?? session.repository;
    if (!cwd) {
      return;
    }
    const terminalKey = `${cwd.toString()}${command}`;
    let terminal = this._getExistingTerminalInstance(terminalKey);
    if (!terminal) {
      terminal = await this._terminalService.createTerminal({
        location: TerminalLocation.Panel,
        config: { name: task.label },
        cwd
      });
      this._taskTerminals.set(terminalKey, terminal.instanceId);
    }
    await terminal.sendText(command, true);
    this._terminalService.setActiveInstance(terminal);
    await this._terminalService.revealActiveTerminal();
    if (session.repository) {
      const key = session.repository.toString();
      this._lastRunTaskLabels.set(key, task.label);
      this._saveLastRunTaskLabels();
      const obs = this._lastRunTaskObservables.get(key);
      if (obs) {
        transaction((tx) => obs.set(task.label, tx));
      }
    }
  }
  getLastRunTaskLabel(repository) {
    if (!repository) {
      return observableValue("lastRunTaskLabel", void 0);
    }
    const key = repository.toString();
    let obs = this._lastRunTaskObservables.get(key);
    if (!obs) {
      obs = observableValue("lastRunTaskLabel", this._lastRunTaskLabels.get(key));
      this._lastRunTaskObservables.set(key, obs);
    }
    return obs;
  }
  // --- private helpers ---
  _getExistingTerminalInstance(terminalKey) {
    const instanceId = this._taskTerminals.get(terminalKey);
    if (instanceId === void 0) {
      return void 0;
    }
    const instance = this._terminalService.instances.find((i) => i.instanceId === instanceId);
    if (!instance || instance.hasChildProcesses) {
      this._taskTerminals.delete(terminalKey);
      return void 0;
    }
    return instance;
  }
  _getTasksJsonUri(session, target) {
    if (target === "workspace") {
      const folder = session.worktree ?? session.repository;
      return folder ? joinPath(folder, ".vscode", "tasks.json") : void 0;
    }
    return joinPath(dirname(this._preferencesService.userSettingsResource), "tasks.json");
  }
  async _readTasksJson(uri) {
    try {
      const content = await this._fileService.readFile(uri);
      return parse(content.value.toString());
    } catch {
      return {};
    }
  }
  async _readAllTasks(session) {
    const result = [];
    const workspaceUri = this._getTasksJsonUri(session, "workspace");
    if (workspaceUri) {
      const workspaceJson = await this._readTasksJson(workspaceUri);
      if (workspaceJson.tasks) {
        result.push(...workspaceJson.tasks.filter((t) => this._isSupportedTask(t)));
      }
    }
    const userUri = this._getTasksJsonUri(session, "user");
    if (userUri) {
      const userJson = await this._readTasksJson(userUri);
      if (userJson.tasks) {
        result.push(...userJson.tasks.filter((t) => this._isSupportedTask(t)));
      }
    }
    return result;
  }
  _isSupportedTask(task) {
    return !!task.type && SessionsConfigurationService_1._SUPPORTED_TASK_TYPES.has(task.type);
  }
  _resolveCommand(task) {
    if (task.type === "npm") {
      if (!task.script) {
        return void 0;
      }
      if (task.path) {
        return `npm --prefix ${task.path} run ${task.script}`;
      }
      return `npm run ${task.script}`;
    }
    if (isWindows && task.windows?.command) {
      return task.windows.command;
    }
    if (isMacintosh && task.osx?.command) {
      return task.osx.command;
    }
    if (!isWindows && !isMacintosh && task.linux?.command) {
      return task.linux.command;
    }
    return task.command;
  }
  _ensureFileWatch(folder) {
    const tasksUri = joinPath(folder, ".vscode", "tasks.json");
    if (this._watchedResource && this._watchedResource.toString() === tasksUri.toString()) {
      return;
    }
    this._watchedResource = tasksUri;
    const disposables = new DisposableStore();
    disposables.add(this._fileService.watch(tasksUri));
    disposables.add(this._fileService.onDidFilesChange((e) => {
      if (e.affects(tasksUri)) {
        this._refreshSessionTasks(folder);
      }
    }));
    this._fileWatcher.value = disposables;
  }
  async _refreshSessionTasks(folder) {
    if (!folder) {
      transaction((tx) => this._sessionTasks.set([], tx));
      return;
    }
    const tasksUri = joinPath(folder, ".vscode", "tasks.json");
    const tasksJson = await this._readTasksJson(tasksUri);
    const sessionTasks = (tasksJson.tasks ?? []).filter((t) => t.inSessions && this._isSupportedTask(t));
    const userUri = joinPath(dirname(this._preferencesService.userSettingsResource), "tasks.json");
    const userJson = await this._readTasksJson(userUri);
    const userSessionTasks = (userJson.tasks ?? []).filter((t) => t.inSessions && this._isSupportedTask(t));
    transaction((tx) => this._sessionTasks.set([...sessionTasks, ...userSessionTasks], tx));
  }
  async _commitTasksFile(session) {
    const worktree = session.worktree;
    if (!worktree) {
      return;
    }
    const tasksUri = joinPath(worktree, ".vscode", "tasks.json");
    await this._sessionsManagementService.commitWorktreeFiles(session, [tasksUri]);
  }
  _loadLastRunTaskLabels() {
    const raw = this._storageService.get(
      SessionsConfigurationService_1._LAST_RUN_TASK_LABELS_KEY,
      -1
      /* StorageScope.APPLICATION */
    );
    if (raw) {
      try {
        return new Map(Object.entries(JSON.parse(raw)));
      } catch {
      }
    }
    return /* @__PURE__ */ new Map();
  }
  _saveLastRunTaskLabels() {
    this._storageService.store(
      SessionsConfigurationService_1._LAST_RUN_TASK_LABELS_KEY,
      JSON.stringify(Object.fromEntries(this._lastRunTaskLabels)),
      -1,
      0
      /* StorageTarget.USER */
    );
  }
};
SessionsConfigurationService = SessionsConfigurationService_1 = __decorate([
  __param(0, IFileService),
  __param(1, IJSONEditingService),
  __param(2, IPreferencesService),
  __param(3, ITerminalService),
  __param(4, ISessionsManagementService),
  __param(5, IStorageService)
], SessionsConfigurationService);
export {
  ISessionsConfigurationService,
  SessionsConfigurationService
};
//# sourceMappingURL=sessionsConfigurationService.js.map
