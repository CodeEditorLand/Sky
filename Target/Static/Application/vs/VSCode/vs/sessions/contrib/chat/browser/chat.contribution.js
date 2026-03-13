var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { Extensions as ViewExtensions } from "../../../../workbench/common/views.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { IsActiveSessionBackgroundProviderContext, ISessionsManagementService, IsNewChatSessionContext } from "../../sessions/browser/sessionsManagementService.js";
import { Menus } from "../../../browser/menus.js";
import { BranchChatSessionAction } from "./branchChatSessionAction.js";
import { RunScriptContribution } from "./runScriptAction.js";
import "./nullInlineChatSessionService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AgenticPromptsService } from "./promptsService.js";
import { IPromptsService } from "../../../../workbench/contrib/chat/common/promptSyntax/service/promptsService.js";
import { ISessionsConfigurationService, SessionsConfigurationService } from "./sessionsConfigurationService.js";
import { IAICustomizationWorkspaceService } from "../../../../workbench/contrib/chat/common/aiCustomizationWorkspaceService.js";
import { SessionsAICustomizationWorkspaceService } from "./aiCustomizationWorkspaceService.js";
import { ChatViewContainerId, ChatViewId } from "../../../../workbench/contrib/chat/browser/chat.js";
import { CHAT_CATEGORY } from "../../../../workbench/contrib/chat/browser/actions/chatActions.js";
import { NewChatViewPane, SessionsViewId } from "./newChatViewPane.js";
import { ViewPaneContainer } from "../../../../workbench/browser/parts/views/viewPaneContainer.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { ChatViewPane } from "../../../../workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewPane.js";
import { IsAuxiliaryWindowContext } from "../../../../workbench/common/contextkeys.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SessionsWelcomeVisibleContext } from "../../../common/contextkeys.js";
class OpenSessionWorktreeInVSCodeAction extends Action2 {
  static {
    __name(this, "OpenSessionWorktreeInVSCodeAction");
  }
  static {
    this.ID = "chat.openSessionWorktreeInVSCode";
  }
  constructor() {
    super({
      id: OpenSessionWorktreeInVSCodeAction.ID,
      title: localize2("openInVSCode", "Open in VS Code"),
      icon: Codicon.vscodeInsiders,
      precondition: IsActiveSessionBackgroundProviderContext,
      menu: [{
        id: Menus.TitleBarSessionMenu,
        group: "navigation",
        order: 10,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), IsActiveSessionBackgroundProviderContext)
      }]
    });
  }
  async run(accessor) {
    const openerService = accessor.get(IOpenerService);
    const productService = accessor.get(IProductService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const activeSession = sessionsManagementService.activeSession.get();
    if (!activeSession) {
      return;
    }
    const folderUri = activeSession.providerType === AgentSessionProviders.Background ? activeSession?.worktree ?? activeSession?.repository : void 0;
    if (!folderUri) {
      return;
    }
    const scheme = productService.quality === "stable" ? "vscode" : productService.quality === "exploration" ? "vscode-exploration" : "vscode-insiders";
    const params = new URLSearchParams();
    params.set("windowId", "_blank");
    params.set("session", activeSession.resource.toString());
    await openerService.open(URI.from({
      scheme,
      authority: Schemas.file,
      path: folderUri.path,
      query: params.toString()
    }), { openExternal: true });
  }
}
registerAction2(OpenSessionWorktreeInVSCodeAction);
class NewChatInSessionsWindowAction extends Action2 {
  static {
    __name(this, "NewChatInSessionsWindowAction");
  }
  constructor() {
    super({
      id: "workbench.action.sessions.newChat",
      title: localize2("chat.newEdits.label", "New Chat"),
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200 + 2,
        primary: 2048 | 44,
        secondary: [
          2048 | 42
          /* KeyCode.KeyL */
        ],
        mac: {
          primary: 2048 | 44,
          secondary: [
            256 | 42
            /* KeyCode.KeyL */
          ]
        }
      }
    });
  }
  run(accessor) {
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    sessionsManagementService.openNewSessionView();
  }
}
registerAction2(NewChatInSessionsWindowAction);
const chatViewIcon = registerIcon("chat-view-icon", Codicon.chatSparkle, localize("chatViewIcon", "View icon of the chat view."));
class RegisterChatViewContainerContribution {
  static {
    __name(this, "RegisterChatViewContainerContribution");
  }
  static {
    this.ID = "sessions.registerChatViewContainer";
  }
  constructor() {
    const viewContainerRegistry = Registry.as(ViewExtensions.ViewContainersRegistry);
    const viewsRegistry = Registry.as(ViewExtensions.ViewsRegistry);
    let chatViewContainer = viewContainerRegistry.get(ChatViewContainerId);
    if (chatViewContainer) {
      const view = viewsRegistry.getView(ChatViewId);
      if (view) {
        viewsRegistry.deregisterViews([view], chatViewContainer);
      }
      viewContainerRegistry.deregisterViewContainer(chatViewContainer);
    }
    chatViewContainer = viewContainerRegistry.registerViewContainer({
      id: ChatViewContainerId,
      title: localize2("chat.viewContainer.label", "Chat"),
      icon: chatViewIcon,
      ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [ChatViewContainerId, { mergeViewWithContainerWhenSingleView: true }]),
      storageId: ChatViewContainerId,
      hideIfEmpty: true,
      order: 1,
      windowVisibility: 2
    }, 3, { isDefault: true, doNotRegisterOpenCommand: true });
    viewsRegistry.registerViews([{
      id: ChatViewId,
      containerIcon: chatViewContainer.icon,
      containerTitle: chatViewContainer.title.value,
      singleViewPaneContainerTitle: chatViewContainer.title.value,
      name: localize2("chat.viewContainer.label", "Chat"),
      canToggleVisibility: false,
      canMoveView: false,
      ctorDescriptor: new SyncDescriptor(ChatViewPane),
      when: IsNewChatSessionContext.negate(),
      windowVisibility: 2
      /* WindowVisibility.Sessions */
    }, {
      id: SessionsViewId,
      containerIcon: chatViewContainer.icon,
      containerTitle: chatViewContainer.title.value,
      singleViewPaneContainerTitle: chatViewContainer.title.value,
      name: localize2("sessions.newChat.view", "New Session"),
      canToggleVisibility: false,
      canMoveView: false,
      ctorDescriptor: new SyncDescriptor(NewChatViewPane),
      when: IsNewChatSessionContext,
      windowVisibility: 2
    }], chatViewContainer);
  }
}
registerAction2(BranchChatSessionAction);
registerWorkbenchContribution2(
  RegisterChatViewContainerContribution.ID,
  RegisterChatViewContainerContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
registerWorkbenchContribution2(
  RunScriptContribution.ID,
  RunScriptContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
registerSingleton(
  IPromptsService,
  AgenticPromptsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ISessionsConfigurationService,
  SessionsConfigurationService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IAICustomizationWorkspaceService,
  SessionsAICustomizationWorkspaceService,
  1
  /* InstantiationType.Delayed */
);
export {
  OpenSessionWorktreeInVSCodeAction
};
//# sourceMappingURL=chat.contribution.js.map
