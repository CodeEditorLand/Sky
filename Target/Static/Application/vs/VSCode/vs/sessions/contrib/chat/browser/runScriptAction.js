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
import { equals } from "../../../../base/common/arrays.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { autorun, derivedOpts } from "../../../../base/common/observable.js";
import { localize, localize2 } from "../../../../nls.js";
import { MenuId, registerAction2, Action2, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { SessionsCategories } from "../../../common/categories.js";
import { IsActiveSessionBackgroundProviderContext, ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { Menus } from "../../../browser/menus.js";
import { ISessionsConfigurationService } from "./sessionsConfigurationService.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
import { RunScriptCustomTaskWidget } from "./runScriptCustomTaskWidget.js";
const RunScriptDropdownMenuId = MenuId.for("AgentSessionsRunScriptDropdown");
const RUN_SCRIPT_ACTION_ID = "workbench.action.agentSessions.runScript";
const RUN_SCRIPT_ACTION_PRIMARY_ID = "workbench.action.agentSessions.runScriptPrimary";
const CONFIGURE_DEFAULT_RUN_ACTION_ID = "workbench.action.agentSessions.configureDefaultRunAction";
function getTaskDisplayLabel(task) {
  if (task.label && task.label.length > 0) {
    return task.label;
  }
  if (task.script && task.script.length > 0) {
    return task.script;
  }
  if (task.command && task.command.length > 0) {
    return task.command;
  }
  if (task.task && task.task.toString().length > 0) {
    return task.task.toString();
  }
  return "";
}
__name(getTaskDisplayLabel, "getTaskDisplayLabel");
function getTaskCommandPreview(task) {
  if (task.command && task.command.length > 0) {
    return task.command;
  }
  if (task.script && task.script.length > 0) {
    return localize("npmTaskCommandPreview", "npm run {0}", task.script);
  }
  if (task.task && task.task.toString().length > 0) {
    return task.task.toString();
  }
  return getTaskDisplayLabel(task);
}
__name(getTaskCommandPreview, "getTaskCommandPreview");
let RunScriptContribution = class RunScriptContribution2 extends Disposable {
  static {
    __name(this, "RunScriptContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessions.runScript";
  }
  constructor(_activeSessionService, _keybindingService, _quickInputService, _sessionsConfigService) {
    super();
    this._activeSessionService = _activeSessionService;
    this._keybindingService = _keybindingService;
    this._quickInputService = _quickInputService;
    this._sessionsConfigService = _sessionsConfigService;
    this._activeRunState = derivedOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name((a, b) => {
        if (a === b) {
          return true;
        }
        if (!a || !b) {
          return false;
        }
        return a.session === b.session && a.lastRunTaskLabel === b.lastRunTaskLabel && equals(a.tasks, b.tasks, (t1, t2) => t1.label === t2.label && t1.command === t2.command);
      }, "equalsFn")
    }, (reader) => {
      const activeSession = this._activeSessionService.activeSession.read(reader);
      if (!activeSession) {
        return void 0;
      }
      const tasks = this._sessionsConfigService.getSessionTasks(activeSession).read(reader);
      const lastRunTaskLabel = this._sessionsConfigService.getLastRunTaskLabel(activeSession.repository).read(reader);
      return { session: activeSession, tasks, lastRunTaskLabel };
    }).recomputeInitiallyAndOnChange(this._store);
    this._registerActions();
  }
  _registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RUN_SCRIPT_ACTION_PRIMARY_ID,
          title: { value: localize("runPrimaryTask", "Run Primary Task"), original: "Run Primary Task" },
          icon: Codicon.play,
          category: SessionsCategories.Sessions,
          f1: true
        });
      }
      async run() {
        const activeState = that._activeRunState.get();
        if (!activeState) {
          return;
        }
        const { tasks, session, lastRunTaskLabel } = activeState;
        if (tasks.length === 0) {
          const task = await that._showConfigureQuickPick(session);
          if (task) {
            await that._sessionsConfigService.runTask(task, session);
          }
          return;
        }
        const mruIndex = lastRunTaskLabel !== void 0 ? tasks.findIndex((t) => t.label === lastRunTaskLabel) : -1;
        const primaryTask = tasks[mruIndex >= 0 ? mruIndex : 0];
        await that._sessionsConfigService.runTask(primaryTask, session);
      }
    }));
    this._register(autorun((reader) => {
      const activeState = this._activeRunState.read(reader);
      if (!activeState) {
        return;
      }
      const { tasks, session, lastRunTaskLabel } = activeState;
      const configureScriptPrecondition = session.worktree ?? session.repository ? ContextKeyExpr.true() : ContextKeyExpr.false();
      const mruIndex = lastRunTaskLabel !== void 0 ? tasks.findIndex((t) => t.label === lastRunTaskLabel) : -1;
      if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const actionId = `${RUN_SCRIPT_ACTION_ID}.${i}`;
          const isPrimary = i === (mruIndex >= 0 ? mruIndex : 0);
          reader.store.add(registerAction2(class extends Action2 {
            constructor() {
              super({
                id: actionId,
                title: getTaskDisplayLabel(task),
                tooltip: !isPrimary ? localize("runActionTooltip", "Run '{0}' in terminal", getTaskDisplayLabel(task)) : localize("runActionTooltipKeybinding", "Run '{0}' in terminal ({1})", getTaskDisplayLabel(task), that._keybindingService.lookupKeybinding(RUN_SCRIPT_ACTION_PRIMARY_ID)?.getLabel() ?? ""),
                icon: Codicon.play,
                category: SessionsCategories.Sessions,
                menu: [{
                  id: RunScriptDropdownMenuId,
                  group: "0_scripts",
                  order: i === mruIndex ? -1 : i
                }]
              });
            }
            async run() {
              await that._sessionsConfigService.runTask(task, session);
            }
          }));
        }
      }
      reader.store.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: CONFIGURE_DEFAULT_RUN_ACTION_ID,
            title: localize2("configureDefaultRunAction", "Add Action..."),
            category: SessionsCategories.Sessions,
            icon: Codicon.play,
            precondition: configureScriptPrecondition,
            menu: [{
              id: RunScriptDropdownMenuId,
              group: tasks.length === 0 ? "navigation" : "1_configure",
              order: 0
            }]
          });
        }
        async run() {
          const task = await that._showConfigureQuickPick(session);
          if (task) {
            await that._sessionsConfigService.runTask(task, session);
          }
        }
      }));
    }));
  }
  async _showConfigureQuickPick(session) {
    const nonSessionTasks = await this._sessionsConfigService.getNonSessionTasks(session);
    if (nonSessionTasks.length === 0) {
      return this._showCustomCommandInput(session);
    }
    const items = [];
    items.push({ type: "separator", label: localize("custom", "Custom") });
    items.push({
      label: localize("enterCustomCommand", "Enter Custom Command..."),
      description: localize("enterCustomCommandDesc", "Create a new shell task")
    });
    if (nonSessionTasks.length > 0) {
      items.push({ type: "separator", label: localize("existingTasks", "Existing Tasks") });
      for (const { task, target } of nonSessionTasks) {
        items.push({
          label: getTaskDisplayLabel(task),
          description: task.command,
          task,
          source: target
        });
      }
    }
    const picked = await this._quickInputService.pick(items, {
      placeHolder: localize("pickRunAction", "Select a task or enter a custom command")
    });
    if (!picked) {
      return void 0;
    }
    const pickedItem = picked;
    if (pickedItem.task) {
      return this._showCustomCommandInput(session, { task: pickedItem.task, target: pickedItem.source ?? "workspace" });
    } else {
      return this._showCustomCommandInput(session);
    }
  }
  async _showCustomCommandInput(session, existingTask) {
    const taskConfiguration = await this._showCustomCommandWidget(session, existingTask);
    if (!taskConfiguration) {
      return void 0;
    }
    if (existingTask) {
      await this._sessionsConfigService.addTaskToSessions(existingTask.task, session, existingTask.target, { runOn: taskConfiguration.runOn ?? "default" });
      return {
        ...existingTask.task,
        inSessions: true,
        ...taskConfiguration.runOn ? { runOptions: { runOn: taskConfiguration.runOn } } : {}
      };
    }
    return this._sessionsConfigService.createAndAddTask(taskConfiguration.label, taskConfiguration.command, session, taskConfiguration.target, taskConfiguration.runOn ? { runOn: taskConfiguration.runOn } : void 0);
  }
  _showCustomCommandWidget(session, existingTask) {
    const workspaceTargetDisabledReason = !(session.worktree ?? session.repository) ? localize("workspaceStorageUnavailableTooltip", "Workspace storage is unavailable for this session") : void 0;
    return new Promise((resolve) => {
      const disposables = new DisposableStore();
      let settled = false;
      const quickWidget = disposables.add(this._quickInputService.createQuickWidget());
      quickWidget.title = existingTask ? localize("addExistingActionWidgetTitle", "Add Existing Action...") : localize("addActionWidgetTitle", "Add Action...");
      quickWidget.description = existingTask ? localize("addExistingActionWidgetDescription", "Enable an existing task for sessions and configure when it should run") : localize("addActionWidgetDescription", "Create a shell task and configure how it should be saved and run");
      quickWidget.ignoreFocusOut = true;
      const widget = disposables.add(new RunScriptCustomTaskWidget({
        label: existingTask?.task.label,
        labelDisabledReason: existingTask ? localize("existingTaskLabelLocked", "This name comes from an existing task and cannot be changed here.") : void 0,
        command: existingTask ? getTaskCommandPreview(existingTask.task) : void 0,
        commandDisabledReason: existingTask ? localize("existingTaskCommandLocked", "This command comes from an existing task and cannot be changed here.") : void 0,
        target: existingTask?.target,
        targetDisabledReason: existingTask ? localize("existingTaskTargetLocked", "This existing task cannot be moved between workspace and user storage.") : workspaceTargetDisabledReason,
        runOn: existingTask?.task.runOptions?.runOn === "worktreeCreated" ? "worktreeCreated" : void 0
      }));
      quickWidget.widget = widget.domNode;
      const complete = /* @__PURE__ */ __name((result) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(result);
        quickWidget.hide();
      }, "complete");
      disposables.add(widget.onDidSubmit((result) => complete(result)));
      disposables.add(widget.onDidCancel(() => complete(void 0)));
      disposables.add(quickWidget.onDidHide(() => {
        if (!settled) {
          settled = true;
          resolve(void 0);
        }
        disposables.dispose();
      }));
      quickWidget.show();
      widget.focus();
    });
  }
};
RunScriptContribution = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, IKeybindingService),
  __param(2, IQuickInputService),
  __param(3, ISessionsConfigurationService)
], RunScriptContribution);
MenuRegistry.appendMenuItem(Menus.TitleBarSessionMenu, {
  submenu: RunScriptDropdownMenuId,
  isSplitButton: true,
  title: localize2("run", "Run"),
  icon: Codicon.play,
  group: "navigation",
  order: 8,
  when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), IsActiveSessionBackgroundProviderContext)
});
class RunScriptNotAvailableAction extends Action2 {
  static {
    __name(this, "RunScriptNotAvailableAction");
  }
  constructor() {
    super({
      id: "workbench.action.agentSessions.runScript.notAvailable",
      title: localize2("run", "Run"),
      tooltip: localize("runScriptNotAvailableTooltip", "Run Script is not available for this session type"),
      icon: Codicon.play,
      precondition: ContextKeyExpr.false(),
      menu: [{
        id: Menus.TitleBarSessionMenu,
        group: "navigation",
        order: 8,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), IsActiveSessionBackgroundProviderContext.toNegated())
      }]
    });
  }
  run() {
  }
}
registerAction2(RunScriptNotAvailableAction);
KeybindingsRegistry.registerKeybindingRule({
  id: RUN_SCRIPT_ACTION_PRIMARY_ID,
  primary: 63,
  weight: 200 + 100,
  when: IsAuxiliaryWindowContext.toNegated()
});
export {
  RunScriptContribution,
  RunScriptDropdownMenuId
};
//# sourceMappingURL=runScriptAction.js.map
