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
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { getWorkbenchContribution, registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { ITerminalService } from "../../../../workbench/contrib/terminal/browser/terminal.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
import { Menus } from "../../../browser/menus.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
function getSessionCwd(session) {
  return session?.worktree ?? session?.repository;
}
__name(getSessionCwd, "getSessionCwd");
let SessionsTerminalContribution = class SessionsTerminalContribution2 extends Disposable {
  static {
    __name(this, "SessionsTerminalContribution");
  }
  static {
    this.ID = "workbench.contrib.sessionsTerminal";
  }
  constructor(_sessionsManagementService, _terminalService, _agentSessionsService, _logService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._terminalService = _terminalService;
    this._agentSessionsService = _agentSessionsService;
    this._logService = _logService;
    this._pathToInstanceId = /* @__PURE__ */ new Map();
    this._register(autorun((reader) => {
      const session = this._sessionsManagementService.activeSession.read(reader);
      const targetPath = getSessionCwd(session);
      this._onActivePathChanged(targetPath);
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessionArchivedState((session) => {
      if (session.isArchived()) {
        const worktreePath = session.metadata?.worktreePath;
        if (worktreePath) {
          this._closeTerminalsForPath(URI.file(worktreePath).fsPath);
        }
      }
    }));
    this._register(this._terminalService.onDidDisposeInstance((instance) => {
      for (const [path, id] of this._pathToInstanceId) {
        if (id === instance.instanceId) {
          this._pathToInstanceId.delete(path);
          break;
        }
      }
    }));
  }
  /**
   * Ensures a terminal exists for the given cwd, reusing an existing one
   * from the mapping or creating a new one. Sets it as active and optionally
   * focuses it.
   */
  async ensureTerminal(cwd, focus) {
    const key = cwd.fsPath.toLowerCase();
    const existingId = this._pathToInstanceId.get(key);
    const existing = existingId !== void 0 ? this._terminalService.getInstanceFromId(existingId) : void 0;
    if (existing) {
      this._terminalService.setActiveInstance(existing);
    } else {
      const instance = await this._terminalService.createTerminal({ config: { cwd } });
      this._pathToInstanceId.set(key, instance.instanceId);
      this._terminalService.setActiveInstance(instance);
      this._logService.trace(`[SessionsTerminal] Created terminal ${instance.instanceId} for ${cwd.fsPath}`);
    }
    if (focus) {
      await this._terminalService.focusActiveInstance();
    }
  }
  async _onActivePathChanged(targetPath) {
    if (!targetPath) {
      return;
    }
    const targetFsPath = targetPath.fsPath;
    if (this._lastTargetFsPath?.toLowerCase() === targetFsPath.toLowerCase()) {
      return;
    }
    this._lastTargetFsPath = targetFsPath;
    await this.ensureTerminal(targetPath, false);
  }
  _closeTerminalsForPath(fsPath) {
    const key = fsPath.toLowerCase();
    const instanceId = this._pathToInstanceId.get(key);
    if (instanceId !== void 0) {
      const instance = this._terminalService.getInstanceFromId(instanceId);
      if (instance) {
        this._terminalService.safeDisposeTerminal(instance);
        this._logService.trace(`[SessionsTerminal] Closed archived terminal ${instanceId}`);
      }
      this._pathToInstanceId.delete(key);
    }
  }
};
SessionsTerminalContribution = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, ITerminalService),
  __param(2, IAgentSessionsService),
  __param(3, ILogService)
], SessionsTerminalContribution);
registerWorkbenchContribution2(
  SessionsTerminalContribution.ID,
  SessionsTerminalContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
class OpenSessionInTerminalAction extends Action2 {
  static {
    __name(this, "OpenSessionInTerminalAction");
  }
  constructor() {
    super({
      id: "agentSession.openInTerminal",
      title: localize2("openInTerminal", "Open Terminal"),
      icon: Codicon.terminal,
      menu: [{
        id: Menus.TitleBarRight,
        group: "navigation",
        order: 9,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated())
      }]
    });
  }
  async run(_accessor) {
    const contribution = getWorkbenchContribution(SessionsTerminalContribution.ID);
    const sessionsManagementService = _accessor.get(ISessionsManagementService);
    const pathService = _accessor.get(IPathService);
    const activeSession = sessionsManagementService.activeSession.get();
    const cwd = getSessionCwd(activeSession) ?? await pathService.userHome();
    await contribution.ensureTerminal(cwd, true);
  }
}
registerAction2(OpenSessionInTerminalAction);
export {
  SessionsTerminalContribution
};
//# sourceMappingURL=sessionsTerminalContribution.js.map
