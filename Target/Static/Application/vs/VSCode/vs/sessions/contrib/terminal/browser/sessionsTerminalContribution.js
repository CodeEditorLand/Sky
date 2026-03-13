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
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ITerminalService } from "../../../../workbench/contrib/terminal/browser/terminal.js";
import { IPathService } from "../../../../workbench/services/path/common/pathService.js";
import { Menus } from "../../../browser/menus.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { TERMINAL_VIEW_ID } from "../../../../workbench/contrib/terminal/common/terminal.js";
function getSessionCwd(session) {
  if (session?.providerType !== AgentSessionProviders.Background) {
    return void 0;
  }
  return session.worktree ?? session.repository;
}
__name(getSessionCwd, "getSessionCwd");
let SessionsTerminalContribution = class SessionsTerminalContribution2 extends Disposable {
  static {
    __name(this, "SessionsTerminalContribution");
  }
  static {
    this.ID = "workbench.contrib.sessionsTerminal";
  }
  constructor(_sessionsManagementService, _terminalService, _agentSessionsService, _logService, _pathService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._terminalService = _terminalService;
    this._agentSessionsService = _agentSessionsService;
    this._logService = _logService;
    this._pathService = _pathService;
    this._register(autorun((reader) => {
      const session = this._sessionsManagementService.activeSession.read(reader);
      this._onActiveSessionChanged(session);
    }));
    this._register(this._terminalService.onDidCreateInstance((instance) => {
      if (instance.shellLaunchConfig.attachPersistentProcess && this._activeKey) {
        instance.getInitialCwd().then((cwd) => {
          if (cwd.toLowerCase() !== this._activeKey) {
            this._terminalService.moveToBackground(instance);
            this._logService.trace(`[SessionsTerminal] Hid restored terminal ${instance.instanceId} (cwd: ${cwd})`);
          }
        });
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessionArchivedState((session) => {
      if (session.isArchived()) {
        const worktreePath = session.metadata?.worktreePath;
        if (worktreePath) {
          this._closeTerminalsForPath(URI.file(worktreePath).fsPath);
        }
      }
    }));
  }
  /**
   * Ensures a terminal exists for the given cwd by scanning all terminal
   * instances for a matching initial cwd. If none is found, creates a new
   * one. Sets it as active and optionally focuses it.
   */
  async ensureTerminal(cwd, focus) {
    const key = cwd.fsPath.toLowerCase();
    let existing = await this._findTerminalsForKey(key);
    if (existing.length === 0) {
      existing = [await this._terminalService.createTerminal({ config: { cwd } })];
      this._terminalService.setActiveInstance(existing[0]);
      this._logService.trace(`[SessionsTerminal] Created terminal ${existing[0].instanceId} for ${cwd.fsPath}`);
    }
    if (focus) {
      await this._terminalService.focusActiveInstance();
    }
    return existing;
  }
  async _onActiveSessionChanged(session) {
    if (!session) {
      return;
    }
    const sessionCwd = getSessionCwd(session);
    const targetPath = sessionCwd ?? await this._pathService.userHome();
    const targetKey = targetPath.fsPath.toLowerCase();
    if (this._activeKey === targetKey) {
      return;
    }
    this._activeKey = targetKey;
    const instances = await this.ensureTerminal(targetPath, false);
    if (this._activeKey !== targetKey) {
      return;
    }
    await this._updateTerminalVisibility(targetKey, instances.map((instance) => instance.instanceId));
  }
  /**
   * Finds the first terminal instance whose initial cwd (lower-cased) matches
   * the given key.
   */
  async _findTerminalsForKey(key) {
    const result = [];
    for (const instance of this._terminalService.instances) {
      try {
        const cwd = await instance.getInitialCwd();
        if (cwd.toLowerCase() === key) {
          result.push(instance);
        }
      } catch {
      }
    }
    return result;
  }
  /**
   * Shows background terminals whose initial cwd matches the active key and
   * hides foreground terminals whose initial cwd does not match.
   */
  async _updateTerminalVisibility(activeKey, forceForegroundTerminalIds) {
    const toShow = [];
    const toHide = [];
    for (const instance of [...this._terminalService.instances]) {
      let cwd;
      try {
        cwd = (await instance.getInitialCwd()).toLowerCase();
      } catch {
        continue;
      }
      const isForeground = this._terminalService.foregroundInstances.includes(instance);
      const isForceVisible = forceForegroundTerminalIds.includes(instance.instanceId);
      const belongsToActiveSession = cwd === activeKey;
      if ((belongsToActiveSession || isForceVisible) && !isForeground) {
        toShow.push(instance);
      } else if (!belongsToActiveSession && !isForceVisible && isForeground) {
        toHide.push(instance);
      }
    }
    for (const instance of toShow) {
      await this._terminalService.showBackgroundTerminal(instance, true);
    }
    for (const instance of toHide) {
      this._terminalService.moveToBackground(instance);
    }
    const foreground = this._terminalService.foregroundInstances;
    let mostRecent;
    let mostRecentTimestamp = -1;
    for (const instance of foreground) {
      const cmdDetection = instance.capabilities.get(
        2
        /* TerminalCapability.CommandDetection */
      );
      const lastCmd = cmdDetection?.commands.at(-1);
      if (lastCmd && lastCmd.timestamp > mostRecentTimestamp) {
        mostRecentTimestamp = lastCmd.timestamp;
        mostRecent = instance;
      }
    }
    if (mostRecent) {
      this._terminalService.setActiveInstance(mostRecent);
    }
  }
  async _closeTerminalsForPath(fsPath) {
    const key = fsPath.toLowerCase();
    for (const instance of [...this._terminalService.instances]) {
      try {
        const cwd = (await instance.getInitialCwd()).toLowerCase();
        if (cwd === key) {
          this._terminalService.safeDisposeTerminal(instance);
          this._logService.trace(`[SessionsTerminal] Closed archived terminal ${instance.instanceId}`);
        }
      } catch {
      }
    }
  }
  async dumpTracking() {
    console.log(`[SessionsTerminal] Active key: ${this._activeKey ?? "<none>"}`);
    console.log("[SessionsTerminal] === All Terminals ===");
    for (const instance of this._terminalService.instances) {
      let cwd = "<unknown>";
      try {
        cwd = await instance.getInitialCwd();
      } catch {
      }
      const isForeground = this._terminalService.foregroundInstances.includes(instance);
      console.log(`  ${instance.instanceId} - ${cwd} - ${isForeground ? "foreground" : "background"}`);
    }
  }
  async showAllTerminals() {
    for (const instance of this._terminalService.instances) {
      if (!this._terminalService.foregroundInstances.includes(instance)) {
        await this._terminalService.showBackgroundTerminal(instance, true);
        this._logService.trace(`[SessionsTerminal] Moved terminal ${instance.instanceId} to foreground`);
      }
    }
  }
};
SessionsTerminalContribution = __decorate([
  __param(0, ISessionsManagementService),
  __param(1, ITerminalService),
  __param(2, IAgentSessionsService),
  __param(3, ILogService),
  __param(4, IPathService)
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
        id: Menus.TitleBarSessionMenu,
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
    const viewsService = _accessor.get(IViewsService);
    const activeSession = sessionsManagementService.activeSession.get();
    const cwd = getSessionCwd(activeSession) ?? await pathService.userHome();
    await contribution.ensureTerminal(cwd, true);
    viewsService.openView(TERMINAL_VIEW_ID);
  }
}
registerAction2(OpenSessionInTerminalAction);
class DumpTerminalTrackingAction extends Action2 {
  static {
    __name(this, "DumpTerminalTrackingAction");
  }
  constructor() {
    super({
      id: "agentSession.dumpTerminalTracking",
      title: localize2("dumpTerminalTracking", "Dump Terminal Tracking"),
      f1: true
    });
  }
  async run() {
    const contribution = getWorkbenchContribution(SessionsTerminalContribution.ID);
    await contribution.dumpTracking();
  }
}
registerAction2(DumpTerminalTrackingAction);
class ShowAllTerminalsAction extends Action2 {
  static {
    __name(this, "ShowAllTerminalsAction");
  }
  constructor() {
    super({
      id: "agentSession.showAllTerminals",
      title: localize2("showAllTerminals", "Show All Terminals"),
      f1: true
    });
  }
  async run() {
    const contribution = getWorkbenchContribution(SessionsTerminalContribution.ID);
    await contribution.showAllTerminals();
  }
}
registerAction2(ShowAllTerminalsAction);
export {
  SessionsTerminalContribution
};
//# sourceMappingURL=sessionsTerminalContribution.js.map
