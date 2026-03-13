var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../../nls.js";
import { isAgentSessionSection, isLocalAgentSessionItem, isMarshalledAgentSessionContext } from "./agentSessionsModel.js";
import { Action2, MenuId, MenuRegistry } from "../../../../../platform/actions/common/actions.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { AGENT_SESSION_DELETE_ACTION_ID, AGENT_SESSION_RENAME_ACTION_ID, AgentSessionProviders, AgentSessionsViewerOrientation } from "./agentSessions.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatContextKeys } from "../../common/actions/chatContextKeys.js";
import { ChatViewId, IChatWidgetService } from "../chat.js";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, SIDE_GROUP } from "../../../../services/editor/common/editorService.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { IWorkbenchLayoutService } from "../../../../services/layout/browser/layoutService.js";
import { IAgentSessionsService } from "./agentSessionsService.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ChatEditorInput, showClearEditingSessionConfirmation } from "../widgetHosts/editor/chatEditorInput.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ChatConfiguration } from "../../common/constants.js";
import { ACTION_ID_NEW_CHAT } from "../actions/chatActions.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { AgentSessionsPicker } from "./agentSessionsPicker.js";
import { ActiveEditorContext, IsSessionsWindowContext } from "../../../../common/contextkeys.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { coalesce } from "../../../../../base/common/arrays.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IPaneCompositePartService } from "../../../../services/panecomposite/browser/panecomposite.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
const AGENT_SESSIONS_CATEGORY = localize2("chatSessions", "Chat Agent Sessions");
class ToggleShowAgentSessionsAction extends Action2 {
  static {
    __name(this, "ToggleShowAgentSessionsAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.toggleShowAgentSessions",
      title: localize2("chat.showSessions", "Show Sessions"),
      toggled: ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsEnabled}`, true),
      menu: {
        id: MenuId.ChatWelcomeContext,
        group: "0_sessions",
        order: 2,
        when: ChatContextKeys.inChatEditor.negate()
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const currentValue = configurationService.getValue(ChatConfiguration.ChatViewSessionsEnabled);
    await configurationService.updateValue(ChatConfiguration.ChatViewSessionsEnabled, !currentValue);
  }
}
const agentSessionsOrientationSubmenu = new MenuId("chatAgentSessionsOrientationSubmenu");
MenuRegistry.appendMenuItem(MenuId.ChatWelcomeContext, {
  submenu: agentSessionsOrientationSubmenu,
  title: localize2("chat.sessionsOrientation", "Sessions Orientation"),
  group: "0_sessions",
  order: 1,
  when: ChatContextKeys.inChatEditor.negate()
});
class SetAgentSessionsOrientationStackedAction extends Action2 {
  static {
    __name(this, "SetAgentSessionsOrientationStackedAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.setAgentSessionsOrientationStacked",
      title: localize2("chat.sessionsOrientation.stacked", "Stacked"),
      toggled: ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsOrientation}`, "stacked"),
      precondition: ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsEnabled}`, true),
      menu: {
        id: agentSessionsOrientationSubmenu,
        group: "navigation",
        order: 2
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(HideAgentSessionsSidebar.ID);
  }
}
class SetAgentSessionsOrientationSideBySideAction extends Action2 {
  static {
    __name(this, "SetAgentSessionsOrientationSideBySideAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.setAgentSessionsOrientationSideBySide",
      title: localize2("chat.sessionsOrientation.sideBySide", "Side by Side"),
      toggled: ContextKeyExpr.notEquals(`config.${ChatConfiguration.ChatViewSessionsOrientation}`, "stacked"),
      precondition: ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsEnabled}`, true),
      menu: {
        id: agentSessionsOrientationSubmenu,
        group: "navigation",
        order: 1
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
  }
}
class PickAgentSessionAction extends Action2 {
  static {
    __name(this, "PickAgentSessionAction");
  }
  constructor() {
    super({
      id: `workbench.action.chat.history`,
      title: localize2("agentSessions.open", "Open Agent Session..."),
      menu: [
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(ContextKeyExpr.equals("view", ChatViewId), ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsEnabled}`, false)),
          group: "navigation",
          order: 2
        },
        {
          id: MenuId.EditorTitle,
          when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID)
        }
      ],
      category: AGENT_SESSIONS_CATEGORY,
      icon: Codicon.history,
      f1: true,
      precondition: ChatContextKeys.enabled
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const agentSessionsPicker = instantiationService.createInstance(AgentSessionsPicker, void 0, void 0);
    await agentSessionsPicker.pickAgentSession();
  }
}
class ArchiveAllAgentSessionsAction extends Action2 {
  static {
    __name(this, "ArchiveAllAgentSessionsAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.archiveAllAgentSessions",
      title: localize2("archiveAll.label", "Archive All Workspace Agent Sessions"),
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
  }
  async run(accessor) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const dialogService = accessor.get(IDialogService);
    const sessionsToArchive = agentSessionsService.model.sessions.filter((session) => !session.isArchived());
    if (sessionsToArchive.length === 0) {
      return;
    }
    const confirmed = await dialogService.confirm({
      message: sessionsToArchive.length === 1 ? localize("archiveAllSessions.confirmSingle", "Are you sure you want to archive 1 agent session?") : localize("archiveAllSessions.confirm", "Are you sure you want to archive {0} agent sessions?", sessionsToArchive.length),
      detail: localize("archiveAllSessions.detail", "You can unarchive sessions later if needed from the Chat view."),
      primaryButton: localize("archiveAllSessions.archive", "Archive")
    });
    if (!confirmed.confirmed) {
      return;
    }
    for (const session of sessionsToArchive) {
      session.setArchived(true);
    }
  }
}
class MarkAllAgentSessionsReadAction extends Action2 {
  static {
    __name(this, "MarkAllAgentSessionsReadAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.markAllAgentSessionsRead",
      title: localize2("markAllRead.label", "Mark All as Read"),
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true,
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession.negate()
        // no read state for archived sessions
      }
    });
  }
  async run(accessor) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const sessionsToMarkRead = agentSessionsService.model.sessions.filter((session) => !session.isArchived() && !session.isRead());
    if (sessionsToMarkRead.length === 0) {
      return;
    }
    for (const session of sessionsToMarkRead) {
      session.setRead(true);
    }
  }
}
const ConfirmArchiveStorageKey = "chat.sessions.confirmArchive";
class ArchiveAgentSessionSectionAction extends Action2 {
  static {
    __name(this, "ArchiveAgentSessionSectionAction");
  }
  constructor() {
    super({
      id: "agentSessionSection.archive",
      title: localize2("archiveSection", "Archive All"),
      icon: Codicon.archive,
      menu: [{
        id: MenuId.AgentSessionSectionToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.agentSessionSection.notEqualsTo(
          "archived"
          /* AgentSessionSection.Archived */
        )
      }, {
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.agentSessionSection.notEqualsTo(
          "archived"
          /* AgentSessionSection.Archived */
        )
      }]
    });
  }
  async run(accessor, context) {
    if (!context || !isAgentSessionSection(context)) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey, 0, false);
    if (!skipConfirmation) {
      const confirmed = await dialogService.confirm({
        message: context.sessions.length === 1 ? localize("archiveSectionSessions.confirmSingle", "Are you sure you want to archive 1 agent session from '{0}'?", context.label) : localize("archiveSectionSessions.confirm", "Are you sure you want to archive {0} agent sessions from '{1}'?", context.sessions.length, context.label),
        detail: localize("archiveSectionSessions.detail", "You can unarchive sessions later if needed from the sessions view."),
        primaryButton: localize("archiveSectionSessions.archive", "Archive All"),
        checkbox: {
          label: localize("doNotAskAgain", "Do not ask me again")
        }
      });
      if (!confirmed.confirmed) {
        return;
      }
      if (confirmed.checkboxChecked) {
        storageService.store(
          ConfirmArchiveStorageKey,
          true,
          0,
          0
          /* StorageTarget.USER */
        );
      }
    }
    for (const session of context.sessions) {
      session.setArchived(true);
    }
  }
}
class UnarchiveAgentSessionSectionAction extends Action2 {
  static {
    __name(this, "UnarchiveAgentSessionSectionAction");
  }
  constructor() {
    super({
      id: "agentSessionSection.unarchive",
      title: localize2("unarchiveSection", "Unarchive All"),
      icon: Codicon.unarchive,
      menu: [{
        id: MenuId.AgentSessionSectionToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.agentSessionSection.isEqualTo(
          "archived"
          /* AgentSessionSection.Archived */
        )
      }, {
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.agentSessionSection.isEqualTo(
          "archived"
          /* AgentSessionSection.Archived */
        )
      }]
    });
  }
  async run(accessor, context) {
    if (!context || !isAgentSessionSection(context)) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey, 0, false);
    if (!skipConfirmation) {
      const confirmed = await dialogService.confirm({
        message: context.sessions.length === 1 ? localize("unarchiveSectionSessions.confirmSingle", "Are you sure you want to unarchive 1 agent session?") : localize("unarchiveSectionSessions.confirm", "Are you sure you want to unarchive {0} agent sessions?", context.sessions.length),
        primaryButton: localize("unarchiveSectionSessions.unarchive", "Unarchive All"),
        checkbox: {
          label: localize("doNotAskAgain", "Do not ask me again")
        }
      });
      if (!confirmed.confirmed) {
        return;
      }
      if (confirmed.checkboxChecked) {
        storageService.store(
          ConfirmArchiveStorageKey,
          true,
          0,
          0
          /* StorageTarget.USER */
        );
      }
    }
    for (const session of context.sessions) {
      session.setArchived(false);
    }
  }
}
class MarkAgentSessionSectionReadAction extends Action2 {
  static {
    __name(this, "MarkAgentSessionSectionReadAction");
  }
  constructor() {
    super({
      id: "agentSessionSection.markRead",
      title: localize2("markSectionRead", "Mark All as Read"),
      menu: [{
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 1,
        when: ChatContextKeys.agentSessionSection.notEqualsTo(
          "archived"
          /* AgentSessionSection.Archived */
        )
      }]
    });
  }
  async run(accessor, context) {
    if (!context || !isAgentSessionSection(context)) {
      return;
    }
    for (const session of context.sessions) {
      session.setRead(true);
    }
  }
}
class BaseAgentSessionAction extends Action2 {
  static {
    __name(this, "BaseAgentSessionAction");
  }
  async run(accessor, context) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const viewsService = accessor.get(IViewsService);
    let sessions = [];
    if (isMarshalledAgentSessionContext(context)) {
      sessions = coalesce((context.sessions ?? [context.session]).map((session) => agentSessionsService.getSession(session.resource)));
    } else if (context) {
      sessions = [context];
    }
    if (sessions.length === 0) {
      const chatView = viewsService.getActiveViewWithId(ChatViewId);
      const focused = chatView?.getFocusedSessions().at(0);
      if (focused) {
        sessions = [focused];
      }
    }
    if (sessions.length > 0) {
      await this.runWithSessions(sessions, accessor);
    }
  }
}
class MarkAgentSessionUnreadAction extends BaseAgentSessionAction {
  static {
    __name(this, "MarkAgentSessionUnreadAction");
  }
  constructor() {
    super({
      id: "agentSession.markUnread",
      title: localize2("markUnread", "Mark as Unread"),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isReadAgentSession,
          ChatContextKeys.isArchivedAgentSession.negate()
          // no read state for archived sessions
        )
      }
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setRead(false);
    }
  }
}
class MarkAgentSessionReadAction extends BaseAgentSessionAction {
  static {
    __name(this, "MarkAgentSessionReadAction");
  }
  constructor() {
    super({
      id: "agentSession.markRead",
      title: localize2("markRead", "Mark as Read"),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isReadAgentSession.negate(),
          ChatContextKeys.isArchivedAgentSession.negate()
          // no read state for archived sessions
        )
      }
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setRead(true);
    }
  }
}
class ArchiveAgentSessionAction extends BaseAgentSessionAction {
  static {
    __name(this, "ArchiveAgentSessionAction");
  }
  constructor() {
    super({
      id: "agentSession.archive",
      title: localize2("archive", "Archive"),
      icon: Codicon.archive,
      keybinding: {
        primary: 20,
        mac: {
          primary: 2048 | 1
          /* KeyCode.Backspace */
        },
        weight: 200 + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, ChatContextKeys.isArchivedAgentSession.negate())
      },
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.isArchivedAgentSession.negate()
      }, {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession.negate()
      }]
    });
  }
  async runWithSessions(sessions, accessor) {
    const chatService = accessor.get(IChatService);
    const dialogService = accessor.get(IDialogService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    for (const session of sessions) {
      if (!environmentService.isSessionsWindow) {
        const chatModel = chatService.getSession(session.resource);
        if (chatModel && !await showClearEditingSessionConfirmation(chatModel, dialogService, {
          isArchiveAction: true,
          titleOverride: localize("archiveSession", "Archive chat with pending edits?"),
          messageOverride: localize("archiveSessionDescription", "You have pending changes in this chat session.")
        })) {
          return;
        }
      }
      session.setArchived(true);
    }
  }
}
class UnarchiveAgentSessionAction extends BaseAgentSessionAction {
  static {
    __name(this, "UnarchiveAgentSessionAction");
  }
  constructor() {
    super({
      id: "agentSession.unarchive",
      title: localize2("unarchive", "Unarchive"),
      icon: Codicon.unarchive,
      keybinding: {
        primary: 1024 | 20,
        mac: {
          primary: 2048 | 1024 | 1
        },
        weight: 200 + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, ChatContextKeys.isArchivedAgentSession)
      },
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.isArchivedAgentSession
      }, {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession
      }]
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setArchived(false);
    }
  }
}
class RenameAgentSessionAction extends BaseAgentSessionAction {
  static {
    __name(this, "RenameAgentSessionAction");
  }
  constructor() {
    super({
      id: AGENT_SESSION_RENAME_ACTION_ID,
      title: localize2("rename", "Rename..."),
      precondition: ChatContextKeys.hasMultipleAgentSessionsSelected.negate(),
      keybinding: {
        primary: 60,
        mac: {
          primary: 3
          /* KeyCode.Enter */
        },
        weight: 200 + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local))
      },
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 3,
        when: ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local)
      }
    });
  }
  async runWithSessions(sessions, accessor) {
    const session = sessions.at(0);
    if (!session) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const chatService = accessor.get(IChatService);
    const title = await quickInputService.input({ prompt: localize("newChatTitle", "New agent session title"), value: session.label });
    if (title) {
      chatService.setChatSessionTitle(session.resource, title);
    }
  }
}
class DeleteAgentSessionAction extends BaseAgentSessionAction {
  static {
    __name(this, "DeleteAgentSessionAction");
  }
  constructor() {
    super({
      id: AGENT_SESSION_DELETE_ACTION_ID,
      title: localize2("delete", "Delete..."),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 4,
        when: ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local)
      }
    });
  }
  async runWithSessions(sessions, accessor) {
    if (sessions.length === 0) {
      return;
    }
    const chatService = accessor.get(IChatService);
    const dialogService = accessor.get(IDialogService);
    const widgetService = accessor.get(IChatWidgetService);
    const confirmed = await dialogService.confirm({
      message: sessions.length === 1 ? localize("deleteSession.confirm", "Are you sure you want to delete this chat session?") : localize("deleteSessions.confirm", "Are you sure you want to delete {0} chat sessions?", sessions.length),
      detail: localize("deleteSession.detail", "This action cannot be undone."),
      primaryButton: localize("deleteSession.delete", "Delete")
    });
    if (!confirmed.confirmed) {
      return;
    }
    for (const session of sessions) {
      await widgetService.getWidgetBySessionResource(session.resource)?.clear();
      await chatService.removeHistoryEntry(session.resource);
    }
  }
}
class DeleteAllLocalSessionsAction extends Action2 {
  static {
    __name(this, "DeleteAllLocalSessionsAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.clearHistory",
      title: localize2("agentSessions.deleteAll", "Delete All Local Workspace Chat Sessions"),
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
  }
  async run(accessor, ...args) {
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const dialogService = accessor.get(IDialogService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const localSessionsCount = agentSessionsService.model.sessions.filter((session) => isLocalAgentSessionItem(session)).length;
    if (localSessionsCount === 0) {
      return;
    }
    const confirmed = await dialogService.confirm({
      message: localSessionsCount === 1 ? localize("deleteAllChats.confirmSingle", "Are you sure you want to delete 1 local workspace chat session?") : localize("deleteAllChats.confirm", "Are you sure you want to delete {0} local workspace chat sessions?", localSessionsCount),
      detail: localize("deleteAllChats.detail", "This action cannot be undone."),
      primaryButton: localize("deleteAllChats.button", "Delete All")
    });
    if (!confirmed.confirmed) {
      return;
    }
    await Promise.all(widgetService.getAllWidgets().map((widget) => widget.clear()));
    await chatService.clearAllHistoryEntries();
  }
}
class BaseOpenAgentSessionAction extends BaseAgentSessionAction {
  static {
    __name(this, "BaseOpenAgentSessionAction");
  }
  async runWithSessions(sessions, accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const targetGroup = this.getTargetGroup();
    for (const session of sessions) {
      const uri = session.resource;
      await chatWidgetService.openSession(uri, targetGroup, {
        ...this.getOptions(),
        pinned: true
      });
    }
  }
}
class OpenAgentSessionInEditorGroupAction extends BaseOpenAgentSessionAction {
  static {
    __name(this, "OpenAgentSessionInEditorGroupAction");
  }
  static {
    this.id = "workbench.action.chat.openSessionInEditorGroup";
  }
  constructor() {
    super({
      id: OpenAgentSessionInEditorGroupAction.id,
      title: localize2("chat.openSessionInEditorGroup.label", "Open as Editor"),
      keybinding: {
        primary: 2048 | 3,
        mac: {
          primary: 256 | 3
          /* KeyCode.Enter */
        },
        weight: 200 + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, IsSessionsWindowContext.negate())
      },
      menu: {
        id: MenuId.AgentSessionsContext,
        when: IsSessionsWindowContext.negate(),
        order: 1,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return ACTIVE_GROUP;
  }
  getOptions() {
    return {};
  }
}
class OpenAgentSessionInNewEditorGroupAction extends BaseOpenAgentSessionAction {
  static {
    __name(this, "OpenAgentSessionInNewEditorGroupAction");
  }
  static {
    this.id = "workbench.action.chat.openSessionInNewEditorGroup";
  }
  constructor() {
    super({
      id: OpenAgentSessionInNewEditorGroupAction.id,
      title: localize2("chat.openSessionInNewEditorGroup.label", "Open to the Side"),
      keybinding: {
        primary: 2048 | 512 | 3,
        mac: {
          primary: 256 | 512 | 3
          /* KeyCode.Enter */
        },
        weight: 200 + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, IsSessionsWindowContext.negate())
      },
      menu: {
        id: MenuId.AgentSessionsContext,
        when: IsSessionsWindowContext.negate(),
        order: 2,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return SIDE_GROUP;
  }
  getOptions() {
    return {};
  }
}
class OpenAgentSessionInNewWindowAction extends BaseOpenAgentSessionAction {
  static {
    __name(this, "OpenAgentSessionInNewWindowAction");
  }
  static {
    this.id = "workbench.action.chat.openSessionInNewWindow";
  }
  constructor() {
    super({
      id: OpenAgentSessionInNewWindowAction.id,
      title: localize2("chat.openSessionInNewWindow.label", "Open in New Window"),
      menu: {
        id: MenuId.AgentSessionsContext,
        order: 3,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return AUX_WINDOW_GROUP;
  }
  getOptions() {
    return {
      auxiliary: { compact: true, bounds: { width: 800, height: 640 } }
    };
  }
}
class RefreshAgentSessionsViewerAction extends Action2 {
  static {
    __name(this, "RefreshAgentSessionsViewerAction");
  }
  constructor() {
    super({
      id: "agentSessionsViewer.refresh",
      title: localize2("refresh", "Refresh Agent Sessions"),
      icon: Codicon.refresh,
      menu: {
        id: MenuId.AgentSessionsToolbar,
        group: "navigation",
        order: 1
      }
    });
  }
  run(accessor, agentSessionsControl) {
    agentSessionsControl.refresh();
  }
}
class FindAgentSessionInViewerAction extends Action2 {
  static {
    __name(this, "FindAgentSessionInViewerAction");
  }
  constructor() {
    super({
      id: "agentSessionsViewer.find",
      title: localize2("find", "Find Agent Session"),
      icon: Codicon.search,
      menu: {
        id: MenuId.AgentSessionsToolbar,
        group: "navigation",
        order: 2
      }
    });
  }
  run(accessor, agentSessionsControl) {
    return agentSessionsControl.openFind();
  }
}
class UpdateChatViewWidthAction extends Action2 {
  static {
    __name(this, "UpdateChatViewWidthAction");
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const configurationService = accessor.get(IConfigurationService);
    const viewsService = accessor.get(IViewsService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const chatLocation = viewDescriptorService.getViewLocationById(ChatViewId);
    if (typeof chatLocation !== "number") {
      return;
    }
    const panelPosition = layoutService.getPanelPosition();
    const canResizeView = chatLocation !== 1 || (panelPosition === 0 || panelPosition === 1);
    const chatViewSessionsEnabled = configurationService.getValue(ChatConfiguration.ChatViewSessionsEnabled);
    if (!chatViewSessionsEnabled) {
      await configurationService.updateValue(ChatConfiguration.ChatViewSessionsEnabled, true);
    }
    let chatView = viewsService.getActiveViewWithId(ChatViewId);
    if (!chatView) {
      chatView = await viewsService.openView(ChatViewId, false);
    }
    if (!chatView) {
      return;
    }
    const configuredOrientation = configurationService.getValue(ChatConfiguration.ChatViewSessionsOrientation);
    let validatedConfiguredOrientation;
    if (configuredOrientation === "stacked" || configuredOrientation === "sideBySide") {
      validatedConfiguredOrientation = configuredOrientation;
    } else {
      validatedConfiguredOrientation = "sideBySide";
    }
    const newOrientation = this.getOrientation();
    const lastWidthForOrientation = chatView?.getLastDimensions(newOrientation)?.width;
    if ((!canResizeView || validatedConfiguredOrientation === "sideBySide") && newOrientation === AgentSessionsViewerOrientation.Stacked) {
      chatView.updateConfiguredSessionsViewerOrientation("stacked");
    } else if ((!canResizeView || validatedConfiguredOrientation === "stacked") && newOrientation === AgentSessionsViewerOrientation.SideBySide) {
      chatView.updateConfiguredSessionsViewerOrientation("sideBySide");
    }
    if (!canResizeView) {
      return;
    }
    const part = paneCompositeService.getPartId(chatLocation);
    let currentSize = layoutService.getSize(part);
    const chatViewDefaultWidth = 300;
    const sessionsViewDefaultWidth = chatViewDefaultWidth;
    const sideBySideMinWidth = chatViewDefaultWidth + sessionsViewDefaultWidth + 1;
    if (newOrientation === AgentSessionsViewerOrientation.SideBySide && currentSize.width >= sideBySideMinWidth || // already wide enough to show side by side
    newOrientation === AgentSessionsViewerOrientation.Stacked && chatLocation === 2 && layoutService.isAuxiliaryBarMaximized()) {
      return;
    }
    if (chatLocation === 2) {
      layoutService.setAuxiliaryBarMaximized(false);
      currentSize = layoutService.getSize(part);
    }
    let newWidth;
    if (newOrientation === AgentSessionsViewerOrientation.SideBySide) {
      newWidth = Math.max(sideBySideMinWidth, lastWidthForOrientation || Math.round(layoutService.mainContainerDimension.width / 2));
    } else {
      newWidth = lastWidthForOrientation || Math.max(chatViewDefaultWidth, currentSize.width - sessionsViewDefaultWidth);
    }
    layoutService.setSize(part, { width: newWidth, height: currentSize.height });
    const actualSize = layoutService.getSize(part);
    if (chatLocation === 2 && // only applicable for auxiliary bar
    newOrientation === AgentSessionsViewerOrientation.SideBySide && // only applicable when going to side by side
    actualSize.width < sideBySideMinWidth) {
      layoutService.setAuxiliaryBarMaximized(true);
    }
  }
}
class ShowAgentSessionsSidebar extends UpdateChatViewWidthAction {
  static {
    __name(this, "ShowAgentSessionsSidebar");
  }
  static {
    this.ID = "agentSessions.showAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2("showAgentSessionsSidebar", "Show Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: ShowAgentSessionsSidebar.ID,
      title: ShowAgentSessionsSidebar.TITLE,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.Stacked)),
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  getOrientation() {
    return AgentSessionsViewerOrientation.SideBySide;
  }
}
class HideAgentSessionsSidebar extends UpdateChatViewWidthAction {
  static {
    __name(this, "HideAgentSessionsSidebar");
  }
  static {
    this.ID = "agentSessions.hideAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2("hideAgentSessionsSidebar", "Hide Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: HideAgentSessionsSidebar.ID,
      title: HideAgentSessionsSidebar.TITLE,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(AgentSessionsViewerOrientation.SideBySide)),
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  getOrientation() {
    return AgentSessionsViewerOrientation.Stacked;
  }
}
class ToggleAgentSessionsSidebar extends Action2 {
  static {
    __name(this, "ToggleAgentSessionsSidebar");
  }
  static {
    this.ID = "agentSessions.toggleAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2("toggleAgentSessionsSidebar", "Toggle Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: ToggleAgentSessionsSidebar.ID,
      title: ToggleAgentSessionsSidebar.TITLE,
      precondition: ChatContextKeys.enabled,
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const viewsService = accessor.get(IViewsService);
    const chatView = viewsService.getActiveViewWithId(ChatViewId);
    const currentOrientation = chatView?.getSessionsViewerOrientation();
    if (currentOrientation === AgentSessionsViewerOrientation.SideBySide) {
      await commandService.executeCommand(HideAgentSessionsSidebar.ID);
    } else {
      await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
    }
  }
}
class FocusAgentSessionsAction extends Action2 {
  static {
    __name(this, "FocusAgentSessionsAction");
  }
  static {
    this.id = "workbench.action.chat.focusAgentSessionsViewer";
  }
  constructor() {
    super({
      id: FocusAgentSessionsAction.id,
      title: localize2("chat.focusAgentSessionsViewer.label", "Focus Agent Sessions"),
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals(`config.${ChatConfiguration.ChatViewSessionsEnabled}`, true)),
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const configurationService = accessor.get(IConfigurationService);
    const commandService = accessor.get(ICommandService);
    const chatView = await viewsService.openView(ChatViewId, true);
    const focused = chatView?.focusSessions();
    if (focused) {
      return;
    }
    const configuredSessionsViewerOrientation = configurationService.getValue(ChatConfiguration.ChatViewSessionsOrientation);
    if (configuredSessionsViewerOrientation === "stacked") {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    } else {
      await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
    }
    chatView?.focusSessions();
  }
}
export {
  ArchiveAgentSessionAction,
  ArchiveAgentSessionSectionAction,
  ArchiveAllAgentSessionsAction,
  DeleteAgentSessionAction,
  DeleteAllLocalSessionsAction,
  FindAgentSessionInViewerAction,
  FocusAgentSessionsAction,
  HideAgentSessionsSidebar,
  MarkAgentSessionReadAction,
  MarkAgentSessionSectionReadAction,
  MarkAgentSessionUnreadAction,
  MarkAllAgentSessionsReadAction,
  OpenAgentSessionInEditorGroupAction,
  OpenAgentSessionInNewEditorGroupAction,
  OpenAgentSessionInNewWindowAction,
  PickAgentSessionAction,
  RefreshAgentSessionsViewerAction,
  RenameAgentSessionAction,
  SetAgentSessionsOrientationSideBySideAction,
  SetAgentSessionsOrientationStackedAction,
  ShowAgentSessionsSidebar,
  ToggleAgentSessionsSidebar,
  ToggleShowAgentSessionsAction,
  UnarchiveAgentSessionAction,
  UnarchiveAgentSessionSectionAction
};
//# sourceMappingURL=agentSessionsActions.js.map
