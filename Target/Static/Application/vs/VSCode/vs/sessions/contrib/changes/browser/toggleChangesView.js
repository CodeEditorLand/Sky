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
import { autorun, derivedOpts } from "../../../../base/common/observable.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { isEqual } from "../../../../base/common/resources.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { IAgentSessionsService } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessionsService.js";
import { IChatService } from "../../../../workbench/contrib/chat/common/chatService/chatService.js";
import { IChatEditingService } from "../../../../workbench/contrib/chat/common/editing/chatEditingService.js";
import { getChatSessionType } from "../../../../workbench/contrib/chat/common/model/chatUri.js";
import { IWorkbenchLayoutService } from "../../../../workbench/services/layout/browser/layoutService.js";
import { ISessionsManagementService } from "../../sessions/browser/sessionsManagementService.js";
import { IViewsService } from "../../../../workbench/services/views/common/viewsService.js";
import { CHANGES_VIEW_ID } from "./changesView.js";
let ToggleChangesViewContribution = class ToggleChangesViewContribution2 extends Disposable {
  static {
    __name(this, "ToggleChangesViewContribution");
  }
  static {
    this.ID = "workbench.contrib.toggleChangesView";
  }
  constructor(layoutService, sessionManagementService, chatEditingService, agentSessionsService, chatService, viewsService) {
    super();
    this.layoutService = layoutService;
    this.sessionManagementService = sessionManagementService;
    this.chatEditingService = chatEditingService;
    this.agentSessionsService = agentSessionsService;
    this.chatService = chatService;
    this.viewsService = viewsService;
    this.pendingTurnStateByResource = new ResourceMap();
    const activeSessionResourceObs = derivedOpts({
      equalsFn: isEqual
    }, (reader) => {
      return this.sessionManagementService.activeSession.map((activeSession) => activeSession?.resource).read(reader);
    }).recomputeInitiallyAndOnChange(this._store);
    this._register(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      this.pendingTurnStateByResource.set(chatSessionResource, {
        hadChangesBeforeSend: this.hasSessionChanges(chatSessionResource),
        submittedAt: Date.now()
      });
    }));
    this._register(autorun((reader) => {
      const activeSessionResource = activeSessionResourceObs.read(reader);
      if (!activeSessionResource) {
        return;
      }
      const pendingTurnState = this.pendingTurnStateByResource.get(activeSessionResource);
      if (!pendingTurnState) {
        return;
      }
      const activeSession = this.agentSessionsService.getSession(activeSessionResource);
      const turnCompleted = !!activeSession?.timing.lastRequestEnded && activeSession.timing.lastRequestEnded >= pendingTurnState.submittedAt;
      if (!turnCompleted) {
        return;
      }
      const hasChangesAfterTurn = this.hasSessionChanges(activeSessionResource, reader);
      if (!pendingTurnState.hadChangesBeforeSend && hasChangesAfterTurn) {
        this.layoutService.setPartHidden(
          false,
          "workbench.parts.auxiliarybar"
          /* Parts.AUXILIARYBAR_PART */
        );
      }
      this.pendingTurnStateByResource.delete(activeSessionResource);
    }));
    this._register(autorun((reader) => {
      const sessionResource = activeSessionResourceObs.read(reader);
      if (!sessionResource) {
        this.syncAuxiliaryBarVisibility(false);
        return;
      }
      const hasChanges = this.hasSessionChanges(sessionResource, reader);
      this.syncAuxiliaryBarVisibility(hasChanges);
    }));
  }
  hasSessionChanges(sessionResource, reader) {
    const isBackgroundSession = getChatSessionType(sessionResource) === AgentSessionProviders.Background;
    let editingSessionCount = 0;
    if (!isBackgroundSession) {
      const sessions = this.chatEditingService.editingSessionsObs.read(reader);
      const editingSession = sessions.find((candidate) => isEqual(candidate.chatSessionResource, sessionResource));
      editingSessionCount = editingSession ? editingSession.entries.read(reader).length : 0;
    }
    const session = this.agentSessionsService.getSession(sessionResource);
    const sessionFilesCount = session?.changes instanceof Array ? session.changes.length : 0;
    return editingSessionCount + sessionFilesCount > 0;
  }
  syncAuxiliaryBarVisibility(hasChanges) {
    if (hasChanges) {
      this.viewsService.openView(CHANGES_VIEW_ID, false);
    } else {
      this.layoutService.setPartHidden(
        true,
        "workbench.parts.auxiliarybar"
        /* Parts.AUXILIARYBAR_PART */
      );
    }
  }
};
ToggleChangesViewContribution = __decorate([
  __param(0, IWorkbenchLayoutService),
  __param(1, ISessionsManagementService),
  __param(2, IChatEditingService),
  __param(3, IAgentSessionsService),
  __param(4, IChatService),
  __param(5, IViewsService)
], ToggleChangesViewContribution);
export {
  ToggleChangesViewContribution
};
//# sourceMappingURL=toggleChangesView.js.map
