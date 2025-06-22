var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService } from "../../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { isChatViewTitleActionContext } from "../../common/chatActions.js";
import { ChatContextKeys } from "../../common/chatContextKeys.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ChatViewId, IChatWidgetService } from "../chat.js";
import { ChatEditor } from "../chatEditor.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { CHAT_CATEGORY } from "./chatActions.js";
var MoveToNewLocation;
(function(MoveToNewLocation2) {
  MoveToNewLocation2["Editor"] = "Editor";
  MoveToNewLocation2["Window"] = "Window";
})(MoveToNewLocation || (MoveToNewLocation = {}));
function registerMoveActions() {
  registerAction2(class GlobalMoveToEditorAction extends Action2 {
    static {
      __name(this, "GlobalMoveToEditorAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.openInEditor",
        title: localize2("chat.openInEditor.label", "Open Chat in Editor"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          order: 0,
          group: "1_open"
        }
      });
    }
    async run(accessor, ...args) {
      const context = args[0];
      executeMoveToAction(accessor, MoveToNewLocation.Editor, isChatViewTitleActionContext(context) ? context.sessionId : void 0);
    }
  });
  registerAction2(class GlobalMoveToNewWindowAction extends Action2 {
    static {
      __name(this, "GlobalMoveToNewWindowAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.openInNewWindow",
        title: localize2("chat.openInNewWindow.label", "Open Chat in New Window"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          order: 0,
          group: "1_open"
        }
      });
    }
    async run(accessor, ...args) {
      const context = args[0];
      executeMoveToAction(accessor, MoveToNewLocation.Window, isChatViewTitleActionContext(context) ? context.sessionId : void 0);
    }
  });
  registerAction2(class GlobalMoveToSidebarAction extends Action2 {
    static {
      __name(this, "GlobalMoveToSidebarAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.openInSidebar",
        title: localize2("interactiveSession.openInSidebar.label", "Open Chat in Side Bar"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true
      });
    }
    async run(accessor, ...args) {
      return moveToSidebar(accessor);
    }
  });
  function appendOpenChatInViewMenuItem(menuId, title, icon, locationContextKey) {
    MenuRegistry.appendMenuItem(menuId, {
      command: { id: "workbench.action.chat.openInSidebar", title, icon },
      when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID), locationContextKey),
      group: menuId === MenuId.CompactWindowEditorTitle ? "navigation" : void 0,
      order: 0
    });
  }
  __name(appendOpenChatInViewMenuItem, "appendOpenChatInViewMenuItem");
  [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].forEach((id) => {
    appendOpenChatInViewMenuItem(id, localize("interactiveSession.openInSecondarySidebar.label", "Open Chat in Secondary Side Bar"), Codicon.layoutSidebarRightDock, ChatContextKeys.panelLocation.isEqualTo(
      2
      /* ViewContainerLocation.AuxiliaryBar */
    ));
    appendOpenChatInViewMenuItem(id, localize("interactiveSession.openInPrimarySidebar.label", "Open Chat in Primary Side Bar"), Codicon.layoutSidebarLeftDock, ChatContextKeys.panelLocation.isEqualTo(
      0
      /* ViewContainerLocation.Sidebar */
    ));
    appendOpenChatInViewMenuItem(id, localize("interactiveSession.openInPanel.label", "Open Chat in Panel"), Codicon.layoutPanelDock, ChatContextKeys.panelLocation.isEqualTo(
      1
      /* ViewContainerLocation.Panel */
    ));
  });
}
__name(registerMoveActions, "registerMoveActions");
async function executeMoveToAction(accessor, moveTo, _sessionId) {
  const widgetService = accessor.get(IChatWidgetService);
  const editorService = accessor.get(IEditorService);
  const widget = (_sessionId ? widgetService.getWidgetBySessionId(_sessionId) : void 0) ?? widgetService.lastFocusedWidget;
  if (!widget || !widget.viewModel || widget.location !== ChatAgentLocation.Panel) {
    await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true, auxiliary: { compact: true, bounds: { width: 640, height: 640 } } } }, moveTo === MoveToNewLocation.Window ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
    return;
  }
  const sessionId = widget.viewModel.sessionId;
  const viewState = widget.getViewState();
  widget.clear();
  await widget.waitForReady();
  const options = { target: { sessionId }, pinned: true, viewState, auxiliary: { compact: true, bounds: { width: 640, height: 640 } } };
  await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, moveTo === MoveToNewLocation.Window ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
}
__name(executeMoveToAction, "executeMoveToAction");
async function moveToSidebar(accessor) {
  const viewsService = accessor.get(IViewsService);
  const editorService = accessor.get(IEditorService);
  const editorGroupService = accessor.get(IEditorGroupsService);
  const chatEditor = editorService.activeEditorPane;
  const chatEditorInput = chatEditor?.input;
  let view;
  if (chatEditor instanceof ChatEditor && chatEditorInput instanceof ChatEditorInput && chatEditorInput.sessionId) {
    await editorService.closeEditor({ editor: chatEditor.input, groupId: editorGroupService.activeGroup.id });
    view = await viewsService.openView(ChatViewId);
    await view.loadSession(chatEditorInput.sessionId, chatEditor.getViewState());
  } else {
    view = await viewsService.openView(ChatViewId);
  }
  view.focus();
}
__name(moveToSidebar, "moveToSidebar");
export {
  registerMoveActions
};
//# sourceMappingURL=chatMoveActions.js.map
