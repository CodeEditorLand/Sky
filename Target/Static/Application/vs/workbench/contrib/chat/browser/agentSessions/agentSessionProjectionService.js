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
import "./media/agentSessionProjection.css";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ChatViewPaneTarget, IChatWidgetService } from "../chat.js";
import { AgentSessionProviders } from "./agentSessions.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { ChatConfiguration } from "../../common/constants.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { ACTION_ID_NEW_CHAT } from "../actions/chatActions.js";
import { IChatEditingService } from "../../common/editing/chatEditingService.js";
import { IAgentStatusService } from "./agentStatusService.js";
const AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS = new Set(Object.values(AgentSessionProviders));
const IAgentSessionProjectionService = createDecorator("agentSessionProjectionService");
let AgentSessionProjectionService = class AgentSessionProjectionService2 extends Disposable {
  static {
    __name(this, "AgentSessionProjectionService");
  }
  get isActive() {
    return this._isActive;
  }
  get activeSession() {
    return this._activeSession;
  }
  constructor(contextKeyService, configurationService, editorGroupsService, editorService, logService, chatWidgetService, chatSessionsService, layoutService, commandService, chatEditingService, agentStatusService) {
    super();
    this.configurationService = configurationService;
    this.editorGroupsService = editorGroupsService;
    this.editorService = editorService;
    this.logService = logService;
    this.chatWidgetService = chatWidgetService;
    this.chatSessionsService = chatSessionsService;
    this.layoutService = layoutService;
    this.commandService = commandService;
    this.chatEditingService = chatEditingService;
    this.agentStatusService = agentStatusService;
    this._isActive = false;
    this._onDidChangeProjectionMode = this._register(new Emitter());
    this.onDidChangeProjectionMode = this._onDidChangeProjectionMode.event;
    this._onDidChangeActiveSession = this._register(new Emitter());
    this.onDidChangeActiveSession = this._onDidChangeActiveSession.event;
    this._sessionWorkingSets = /* @__PURE__ */ new Map();
    this._inProjectionModeContextKey = ChatContextKeys.inAgentSessionProjection.bindTo(contextKeyService);
    this._register(this.editorService.onDidCloseEditor(() => this._checkForEmptyEditors()));
  }
  _isEnabled() {
    return this.configurationService.getValue(ChatConfiguration.AgentSessionProjectionEnabled) === true;
  }
  _checkForEmptyEditors() {
    if (!this._isActive) {
      return;
    }
    const hasVisibleEditors = this.editorService.visibleEditors.length > 0;
    if (!hasVisibleEditors) {
      this.logService.trace("[AgentSessionProjection] All editors closed, exiting projection mode");
      this.exitProjection();
    }
  }
  /**
   * Open the session's files in a multi-diff editor.
   * @returns true if any files were opened, false if nothing to display
   */
  async _openSessionFiles(session) {
    await this.editorGroupsService.applyWorkingSet("empty", { preserveFocus: true });
    this.logService.trace(`[AgentSessionProjection] Opening files for session '${session.label}'`, {
      hasChanges: !!session.changes,
      isArray: Array.isArray(session.changes),
      changeCount: Array.isArray(session.changes) ? session.changes.length : 0
    });
    if (session.changes && Array.isArray(session.changes) && session.changes.length > 0) {
      const diffResources = session.changes.filter((change) => change.originalUri).map((change) => ({
        originalUri: change.originalUri,
        modifiedUri: change.modifiedUri
      }));
      this.logService.trace(`[AgentSessionProjection] Found ${diffResources.length} files with diffs to display`);
      if (diffResources.length > 0) {
        await this.commandService.executeCommand("_workbench.openMultiDiffEditor", {
          multiDiffSourceUri: session.resource.with({ scheme: session.resource.scheme + "-agent-session-projection" }),
          title: localize("agentSessionProjection.changes.title", "{0} - All Changes", session.label),
          resources: diffResources
        });
        this.logService.trace(`[AgentSessionProjection] Multi-diff editor opened successfully`);
        const sessionKey = session.resource.toString();
        const newWorkingSet = this.editorGroupsService.saveWorkingSet(`agent-session-projection-${sessionKey}`);
        this._sessionWorkingSets.set(sessionKey, newWorkingSet);
        return true;
      } else {
        this.logService.trace(`[AgentSessionProjection] No files with diffs to display (all changes missing originalUri)`);
        return false;
      }
    } else {
      this.logService.trace(`[AgentSessionProjection] Session has no changes to display`);
      return false;
    }
  }
  async enterProjection(session) {
    if (!this._isEnabled()) {
      this.logService.trace("[AgentSessionProjection] Agent Session Projection is disabled");
      return;
    }
    if (!AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS.has(session.providerType)) {
      this.logService.trace(`[AgentSessionProjection] Provider type '${session.providerType}' does not support agent session projection`);
      return;
    }
    let hasUndecidedChanges = true;
    if (session.providerType === AgentSessionProviders.Local) {
      const editingSession = this.chatEditingService.getEditingSession(session.resource);
      hasUndecidedChanges = editingSession?.entries.get().some(
        (e) => e.state.get() === 0
        /* ModifiedFileEntryState.Modified */
      ) ?? false;
      if (!hasUndecidedChanges) {
        this.logService.trace("[AgentSessionProjection] Local session has no undecided changes, opening chat without projection mode");
      }
    }
    if (hasUndecidedChanges) {
      if (!this._isActive) {
        this._preProjectionWorkingSet = this.editorGroupsService.saveWorkingSet("agent-session-projection-backup");
      } else if (this._activeSession) {
        const previousSessionKey = this._activeSession.resource.toString();
        const previousWorkingSet = this.editorGroupsService.saveWorkingSet(`agent-session-projection-${previousSessionKey}`);
        this._sessionWorkingSets.set(previousSessionKey, previousWorkingSet);
      }
      let filesOpened = false;
      if (session.providerType === AgentSessionProviders.Local) {
        await this.editorGroupsService.applyWorkingSet("empty", { preserveFocus: true });
        filesOpened = true;
      } else {
        filesOpened = await this._openSessionFiles(session);
      }
      if (!filesOpened) {
        this.logService.trace("[AgentSessionProjection] No files to display, opening chat without projection mode");
        if (!this._isActive && this._preProjectionWorkingSet) {
          await this.editorGroupsService.applyWorkingSet(this._preProjectionWorkingSet);
          this.editorGroupsService.deleteWorkingSet(this._preProjectionWorkingSet);
          this._preProjectionWorkingSet = void 0;
        }
      } else {
        const wasActive = this._isActive;
        this._isActive = true;
        this._activeSession = session;
        this._inProjectionModeContextKey.set(true);
        this.layoutService.mainContainer.classList.add("agent-session-projection-active");
        this.agentStatusService.enterSessionMode(session.resource.toString(), session.label);
        if (!wasActive) {
          this._onDidChangeProjectionMode.fire(true);
        }
        this._onDidChangeActiveSession.fire(session);
      }
    }
    session.setRead(true);
    await this.chatSessionsService.activateChatSessionItemProvider(session.providerType);
    await this.chatWidgetService.openSession(session.resource, ChatViewPaneTarget, {
      title: { preferred: session.label },
      revealIfOpened: true
    });
    if (session.providerType === AgentSessionProviders.Local && hasUndecidedChanges) {
      await this.commandService.executeCommand("chatEditing.viewChanges");
    }
  }
  async exitProjection() {
    if (!this._isActive) {
      return;
    }
    if (this._activeSession) {
      const sessionKey = this._activeSession.resource.toString();
      const workingSet = this.editorGroupsService.saveWorkingSet(`agent-session-projection-${sessionKey}`);
      this._sessionWorkingSets.set(sessionKey, workingSet);
    }
    if (this._preProjectionWorkingSet) {
      const existingWorkingSets = this.editorGroupsService.getWorkingSets();
      const exists = existingWorkingSets.some((ws) => ws.id === this._preProjectionWorkingSet.id);
      if (exists) {
        await this.editorGroupsService.applyWorkingSet(this._preProjectionWorkingSet);
        this.editorGroupsService.deleteWorkingSet(this._preProjectionWorkingSet);
      } else {
        await this.editorGroupsService.applyWorkingSet("empty", { preserveFocus: true });
      }
      this._preProjectionWorkingSet = void 0;
    }
    this._isActive = false;
    this._activeSession = void 0;
    this._inProjectionModeContextKey.set(false);
    this.layoutService.mainContainer.classList.remove("agent-session-projection-active");
    this.agentStatusService.exitSessionMode();
    this._onDidChangeProjectionMode.fire(false);
    this._onDidChangeActiveSession.fire(void 0);
    await this.commandService.executeCommand(ACTION_ID_NEW_CHAT);
  }
};
AgentSessionProjectionService = __decorate([
  __param(0, IContextKeyService),
  __param(1, IConfigurationService),
  __param(2, IEditorGroupsService),
  __param(3, IEditorService),
  __param(4, ILogService),
  __param(5, IChatWidgetService),
  __param(6, IChatSessionsService),
  __param(7, IWorkbenchLayoutService),
  __param(8, ICommandService),
  __param(9, IChatEditingService),
  __param(10, IAgentStatusService)
], AgentSessionProjectionService);
export {
  AgentSessionProjectionService,
  IAgentSessionProjectionService
};
//# sourceMappingURL=agentSessionProjectionService.js.map
