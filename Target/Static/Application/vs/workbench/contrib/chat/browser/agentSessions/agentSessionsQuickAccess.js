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
import { PickerQuickAccessProvider, TriggerAction } from "../../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { matchesFuzzy } from "../../../../../base/common/filters.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { AgentSessionsSorter, groupAgentSessionsByDate } from "./agentSessionsViewer.js";
import { openSession } from "./agentSessionsOpener.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { AGENT_SESSION_DELETE_ACTION_ID, AGENT_SESSION_RENAME_ACTION_ID } from "./agentSessions.js";
import { archiveButton, deleteButton, getSessionButtons, getSessionDescription, renameButton, unarchiveButton } from "./agentSessionsPicker.js";
import { AgentSessionsFilter } from "./agentSessionsFilter.js";
const AGENT_SESSIONS_QUICK_ACCESS_PREFIX = "agent ";
let AgentSessionsQuickAccessProvider = class AgentSessionsQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "AgentSessionsQuickAccessProvider");
  }
  constructor(agentSessionsService, instantiationService, commandService) {
    super(AGENT_SESSIONS_QUICK_ACCESS_PREFIX, {
      canAcceptInBackground: true,
      noResultsPick: {
        label: localize("noAgentSessionResults", "No matching agent sessions")
      }
    });
    this.agentSessionsService = agentSessionsService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.sorter = new AgentSessionsSorter();
    this.filter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {}));
  }
  async _getPicks(filter) {
    const picks = [];
    const sessions = this.agentSessionsService.model.sessions.filter((session) => !this.filter.exclude(session)).sort(this.sorter.compare.bind(this.sorter));
    const groupedSessions = groupAgentSessionsByDate(sessions);
    for (const group of groupedSessions.values()) {
      if (group.sessions.length > 0) {
        picks.push({ type: "separator", label: group.label });
        for (const session of group.sessions) {
          const highlights = matchesFuzzy(filter, session.label, true);
          if (highlights) {
            picks.push(this.toPickItem(session, highlights));
          }
        }
      }
    }
    return picks;
  }
  toPickItem(session, highlights) {
    const description = getSessionDescription(session);
    const buttons = getSessionButtons(session);
    return {
      label: session.label,
      description,
      highlights: { label: highlights },
      iconClass: ThemeIcon.asClassName(session.icon),
      buttons,
      trigger: /* @__PURE__ */ __name(async (buttonIndex) => {
        const button = buttons[buttonIndex];
        switch (button) {
          case renameButton:
            await this.commandService.executeCommand(AGENT_SESSION_RENAME_ACTION_ID, session);
            return TriggerAction.REFRESH_PICKER;
          case deleteButton:
            await this.commandService.executeCommand(AGENT_SESSION_DELETE_ACTION_ID, session);
            return TriggerAction.REFRESH_PICKER;
          case archiveButton:
          case unarchiveButton: {
            const newArchivedState = !session.isArchived();
            session.setArchived(newArchivedState);
            return TriggerAction.REFRESH_PICKER;
          }
          default:
            return TriggerAction.NO_ACTION;
        }
      }, "trigger"),
      accept: /* @__PURE__ */ __name((keyMods, event) => {
        this.instantiationService.invokeFunction(openSession, session, {
          sideBySide: event.inBackground,
          editorOptions: {
            preserveFocus: event.inBackground,
            pinned: event.inBackground
          }
        });
      }, "accept")
    };
  }
};
AgentSessionsQuickAccessProvider = __decorate([
  __param(0, IAgentSessionsService),
  __param(1, IInstantiationService),
  __param(2, ICommandService)
], AgentSessionsQuickAccessProvider);
export {
  AGENT_SESSIONS_QUICK_ACCESS_PREFIX,
  AgentSessionsQuickAccessProvider
};
//# sourceMappingURL=agentSessionsQuickAccess.js.map
