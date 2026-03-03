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
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun, derivedOpts } from "../../../../base/common/observable.js";
import { localize, localize2 } from "../../../../nls.js";
import { MenuId, registerAction2, Action2, MenuRegistry } from "../../../../platform/actions/common/actions.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { SessionsCategories } from "../../../common/categories.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { Menus } from "../../../browser/menus.js";
import { ISessionsConfigurationService } from "./sessionsConfigurationService.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
const RunScriptDropdownMenuId = MenuId.for("AgentSessionsRunScriptDropdown");
const RUN_SCRIPT_ACTION_ID = "workbench.action.agentSessions.runScript";
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
let RunScriptContribution = class RunScriptContribution2 extends Disposable {
  static {
    __name(this, "RunScriptContribution");
  }
  static {
    this.ID = "workbench.contrib.agentSessions.runScript";
  }
  constructor(_activeSessionService, _quickInputService, _sessionsConfigService) {
    super();
    this._activeSessionService = _activeSessionService;
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
          reader.store.add(registerAction2(class extends Action2 {
            constructor() {
              super({
                id: actionId,
                title: getTaskDisplayLabel(task),
                tooltip: localize("runActionTooltip", "Run '{0}' in terminal", getTaskDisplayLabel(task)),
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
            title: localize2("configureDefaultRunAction", "Add Run Action..."),
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
          await that._showConfigureQuickPick(session);
        }
      }));
    }));
  }
  async _showConfigureQuickPick(session) {
    const nonSessionTasks = await this._sessionsConfigService.getNonSessionTasks(session);
    if (nonSessionTasks.length === 0) {
      await this._showCustomCommandInput(session);
      return;
    }
    const items = [];
    items.push({ type: "separator", label: localize("custom", "Custom") });
    items.push({
      label: localize("enterCustomCommand", "Enter Custom Command..."),
      description: localize("enterCustomCommandDesc", "Create a new shell task")
    });
    if (nonSessionTasks.length > 0) {
      items.push({ type: "separator", label: localize("existingTasks", "Existing Tasks") });
      for (const task of nonSessionTasks) {
        items.push({
          label: getTaskDisplayLabel(task),
          description: task.command,
          task,
          source: "workspace"
        });
      }
    }
    const picked = await this._quickInputService.pick(items, {
      placeHolder: localize("pickRunAction", "Select a task or enter a custom command")
    });
    if (!picked) {
      return;
    }
    const pickedItem = picked;
    if (pickedItem.task) {
      await this._sessionsConfigService.addTaskToSessions(pickedItem.task, session, pickedItem.source ?? "workspace");
    } else {
      await this._showCustomCommandInput(session);
    }
  }
  async _showCustomCommandInput(session) {
    const command = await this._quickInputService.input({
      placeHolder: localize("enterCommandPlaceholder", "Enter command (e.g., npm run dev)"),
      prompt: localize("enterCommandPrompt", "This command will be run as a task in the integrated terminal")
    });
    if (!command) {
      return;
    }
    const target = await this._pickStorageTarget(session);
    if (!target) {
      return;
    }
    const newTask = await this._sessionsConfigService.createAndAddTask(command, session, target);
    if (newTask) {
      await this._sessionsConfigService.runTask(newTask, session);
    }
  }
  async _pickStorageTarget(session) {
    const hasWorktree = !!session.worktree;
    const hasRepository = !!session.repository;
    const items = [
      {
        target: "user",
        label: localize("storeInUserSettings", "User Settings"),
        description: localize("storeInUserSettingsDesc", "Available in all sessions")
      },
      hasWorktree ? {
        target: "workspace",
        label: localize("storeInWorkspaceWorktreeSettings", "Workspace (Worktree)"),
        description: localize("storeInWorkspaceWorktreeSettingsDesc", "Stored in session worktree")
      } : hasRepository ? {
        target: "workspace",
        label: localize("storeInWorkspaceSettings", "Workspace"),
        description: localize("storeInWorkspace", "Stored in the workspace")
      } : {
        target: "workspace",
        label: localize("storeInWorkspaceSettingsDisable", "Workspace Unavailable"),
        description: localize("storeInWorkspaceDisabled", "Stored in the workspace Unavailable"),
        disabled: true,
        italic: true
      }
    ];
    return new Promise((resolve) => {
      const picker = this._quickInputService.createQuickPick({ useSeparators: true });
      picker.placeholder = localize("pickStorageTarget", "Where should this action be saved?");
      picker.items = items;
      picker.onDidAccept(() => {
        const selected = picker.activeItems[0];
        if (selected && (selected.target !== "workspace" || hasWorktree)) {
          resolve(selected.target);
          picker.dispose();
        }
      });
      picker.onDidHide(() => {
        resolve(void 0);
        picker.dispose();
      });
      picker.show();
    });
  }
};
RunScriptContribution = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, IQuickInputService),
  __param(2, ISessionsConfigurationService)
], RunScriptContribution);
MenuRegistry.appendMenuItem(Menus.TitleBarRight, {
  submenu: RunScriptDropdownMenuId,
  isSplitButton: true,
  title: localize2("run", "Run"),
  icon: Codicon.play,
  group: "navigation",
  order: 8,
  when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated())
});
export {
  RunScriptContribution,
  RunScriptDropdownMenuId
};
//# sourceMappingURL=runScriptAction.js.map
