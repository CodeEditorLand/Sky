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
import { renderAsPlaintext } from "../../../../../base/browser/markdownRenderer.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { openSession } from "./agentSessionsOpener.js";
import { isLocalAgentSessionItem } from "./agentSessionsModel.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { AgentSessionsSorter, groupAgentSessionsByDate, sessionDateFromNow } from "./agentSessionsViewer.js";
import { AGENT_SESSION_DELETE_ACTION_ID, AGENT_SESSION_RENAME_ACTION_ID, getAgentSessionTime } from "./agentSessions.js";
import { AgentSessionsFilter } from "./agentSessionsFilter.js";
const archiveButton = {
  iconClass: ThemeIcon.asClassName(Codicon.archive),
  tooltip: localize("archiveSession", "Archive")
};
const unarchiveButton = {
  iconClass: ThemeIcon.asClassName(Codicon.inbox),
  tooltip: localize("unarchiveSession", "Unarchive")
};
const renameButton = {
  iconClass: ThemeIcon.asClassName(Codicon.edit),
  tooltip: localize("renameSession", "Rename")
};
const deleteButton = {
  iconClass: ThemeIcon.asClassName(Codicon.trash),
  tooltip: localize("deleteSession", "Delete")
};
function getSessionDescription(session) {
  const descriptionText = typeof session.description === "string" ? session.description : session.description ? renderAsPlaintext(session.description) : void 0;
  const timeAgo = sessionDateFromNow(getAgentSessionTime(session.timing));
  const descriptionParts = [descriptionText, session.providerLabel, timeAgo].filter((part) => !!part);
  return descriptionParts.join(" \u2022 ");
}
__name(getSessionDescription, "getSessionDescription");
function getSessionButtons(session) {
  const buttons = [];
  if (isLocalAgentSessionItem(session)) {
    buttons.push(renameButton);
    buttons.push(deleteButton);
  }
  buttons.push(session.isArchived() ? unarchiveButton : archiveButton);
  return buttons;
}
__name(getSessionButtons, "getSessionButtons");
let AgentSessionsPicker = class AgentSessionsPicker2 {
  static {
    __name(this, "AgentSessionsPicker");
  }
  constructor(agentSessionsService, quickInputService, instantiationService, commandService) {
    this.agentSessionsService = agentSessionsService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.sorter = new AgentSessionsSorter();
  }
  async pickAgentSession() {
    const disposables = new DisposableStore();
    const picker = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    const filter = disposables.add(this.instantiationService.createInstance(AgentSessionsFilter, {}));
    picker.items = this.createPickerItems(filter);
    picker.canAcceptInBackground = true;
    picker.placeholder = localize("chatAgentPickerPlaceholder", "Search agent sessions by name");
    disposables.add(picker.onDidAccept((e) => {
      const pick = picker.selectedItems[0];
      if (pick) {
        this.instantiationService.invokeFunction(openSession, pick.session, {
          sideBySide: e.inBackground,
          editorOptions: {
            preserveFocus: e.inBackground,
            pinned: e.inBackground
          }
        });
      }
      if (!e.inBackground) {
        picker.hide();
      }
    }));
    disposables.add(picker.onDidTriggerItemButton(async (e) => {
      const session = e.item.session;
      let reopenResolved = false;
      if (e.button === renameButton) {
        reopenResolved = true;
        await this.commandService.executeCommand(AGENT_SESSION_RENAME_ACTION_ID, session);
      } else if (e.button === deleteButton) {
        reopenResolved = true;
        await this.commandService.executeCommand(AGENT_SESSION_DELETE_ACTION_ID, session);
      } else {
        const newArchivedState = !session.isArchived();
        session.setArchived(newArchivedState);
      }
      if (reopenResolved) {
        await this.agentSessionsService.model.resolve(session.providerType);
        this.pickAgentSession();
      } else {
        picker.items = this.createPickerItems(filter);
      }
    }));
    disposables.add(picker.onDidHide(() => disposables.dispose()));
    picker.show();
  }
  createPickerItems(filter) {
    const sessions = this.agentSessionsService.model.sessions.filter((session) => !filter.exclude(session)).sort(this.sorter.compare.bind(this.sorter));
    const items = [];
    const groupedSessions = groupAgentSessionsByDate(sessions);
    for (const group of groupedSessions.values()) {
      if (group.sessions.length > 0) {
        items.push({ type: "separator", label: group.label });
        items.push(...group.sessions.map((session) => this.toPickItem(session)));
      }
    }
    return items;
  }
  toPickItem(session) {
    const description = getSessionDescription(session);
    const buttons = getSessionButtons(session);
    return {
      id: session.resource.toString(),
      label: session.label,
      tooltip: session.tooltip,
      description,
      iconClass: ThemeIcon.asClassName(session.icon),
      buttons,
      session
    };
  }
};
AgentSessionsPicker = __decorate([
  __param(0, IAgentSessionsService),
  __param(1, IQuickInputService),
  __param(2, IInstantiationService),
  __param(3, ICommandService)
], AgentSessionsPicker);
export {
  AgentSessionsPicker,
  archiveButton,
  deleteButton,
  getSessionButtons,
  getSessionDescription,
  renameButton,
  unarchiveButton
};
//# sourceMappingURL=agentSessionsPicker.js.map
