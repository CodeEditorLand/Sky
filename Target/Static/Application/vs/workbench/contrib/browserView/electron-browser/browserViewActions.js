var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, registerAction2, MenuId } from "../../../../platform/actions/common/actions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { BrowserEditor, CONTEXT_BROWSER_CAN_GO_BACK, CONTEXT_BROWSER_CAN_GO_FORWARD, CONTEXT_BROWSER_DEVTOOLS_OPEN, CONTEXT_BROWSER_FOCUSED, CONTEXT_BROWSER_STORAGE_SCOPE, CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE } from "./browserEditor.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IBrowserViewWorkbenchService } from "../common/browserView.js";
import { BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
const BROWSER_EDITOR_ACTIVE = ContextKeyExpr.equals("activeEditor", BrowserEditor.ID);
const BrowserCategory = localize2("browserCategory", "Browser");
class OpenIntegratedBrowserAction extends Action2 {
  static {
    __name(this, "OpenIntegratedBrowserAction");
  }
  constructor() {
    super({
      id: "workbench.action.browser.open",
      title: localize2("browser.openAction", "Open Integrated Browser"),
      category: BrowserCategory,
      f1: true
    });
  }
  async run(accessor, url) {
    const editorService = accessor.get(IEditorService);
    const resource = BrowserViewUri.forUrl(url);
    await editorService.openEditor({ resource });
  }
}
class GoBackAction extends Action2 {
  static {
    __name(this, "GoBackAction");
  }
  static {
    this.ID = "workbench.action.browser.goBack";
  }
  constructor() {
    super({
      id: GoBackAction.ID,
      title: localize2("browser.goBackAction", "Go Back"),
      category: BrowserCategory,
      icon: Codicon.arrowLeft,
      f1: false,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 1
      },
      precondition: CONTEXT_BROWSER_CAN_GO_BACK,
      keybinding: {
        when: BROWSER_EDITOR_ACTIVE,
        weight: 200,
        primary: 512 | 15,
        secondary: [
          122
          /* KeyCode.BrowserBack */
        ],
        mac: { primary: 2048 | 15, secondary: [
          122
          /* KeyCode.BrowserBack */
        ] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.goBack();
    }
  }
}
class GoForwardAction extends Action2 {
  static {
    __name(this, "GoForwardAction");
  }
  static {
    this.ID = "workbench.action.browser.goForward";
  }
  constructor() {
    super({
      id: GoForwardAction.ID,
      title: localize2("browser.goForwardAction", "Go Forward"),
      category: BrowserCategory,
      icon: Codicon.arrowRight,
      f1: false,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 2,
        when: CONTEXT_BROWSER_CAN_GO_FORWARD
      },
      precondition: CONTEXT_BROWSER_CAN_GO_FORWARD,
      keybinding: {
        when: BROWSER_EDITOR_ACTIVE,
        weight: 200,
        primary: 512 | 17,
        secondary: [
          123
          /* KeyCode.BrowserForward */
        ],
        mac: { primary: 2048 | 17, secondary: [
          123
          /* KeyCode.BrowserForward */
        ] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.goForward();
    }
  }
}
class ReloadAction extends Action2 {
  static {
    __name(this, "ReloadAction");
  }
  static {
    this.ID = "workbench.action.browser.reload";
  }
  constructor() {
    super({
      id: ReloadAction.ID,
      title: localize2("browser.reloadAction", "Reload"),
      category: BrowserCategory,
      icon: Codicon.refresh,
      f1: false,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 3
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 50,
        // Priority over debug
        primary: 63,
        secondary: [
          2048 | 48
          /* KeyCode.KeyR */
        ],
        mac: { primary: 63, secondary: [
          2048 | 48
          /* KeyCode.KeyR */
        ] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.reload();
    }
  }
}
class AddElementToChatAction extends Action2 {
  static {
    __name(this, "AddElementToChatAction");
  }
  static {
    this.ID = "workbench.action.browser.addElementToChat";
  }
  constructor() {
    super({
      id: AddElementToChatAction.ID,
      title: localize2("browser.addElementToChatAction", "Add Element to Chat"),
      icon: Codicon.inspect,
      f1: true,
      precondition: ChatContextKeys.enabled,
      toggled: CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "actions",
        order: 1,
        when: ChatContextKeys.enabled
      },
      keybinding: [{
        when: BROWSER_EDITOR_ACTIVE,
        weight: 200 + 50,
        // Priority over terminal
        primary: 2048 | 1024 | 33
      }, {
        when: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE),
        weight: 200,
        primary: 9
        /* KeyCode.Escape */
      }]
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.addElementToChat();
    }
  }
}
class ToggleDevToolsAction extends Action2 {
  static {
    __name(this, "ToggleDevToolsAction");
  }
  static {
    this.ID = "workbench.action.browser.toggleDevTools";
  }
  constructor() {
    super({
      id: ToggleDevToolsAction.ID,
      title: localize2("browser.toggleDevToolsAction", "Toggle Developer Tools"),
      category: BrowserCategory,
      icon: Codicon.console,
      f1: false,
      toggled: ContextKeyExpr.equals(CONTEXT_BROWSER_DEVTOOLS_OPEN.key, true),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "1_developer",
        order: 1
      },
      keybinding: {
        when: BROWSER_EDITOR_ACTIVE,
        weight: 200,
        primary: 70
        /* KeyCode.F12 */
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.toggleDevTools();
    }
  }
}
class OpenInExternalBrowserAction extends Action2 {
  static {
    __name(this, "OpenInExternalBrowserAction");
  }
  static {
    this.ID = "workbench.action.browser.openExternal";
  }
  constructor() {
    super({
      id: OpenInExternalBrowserAction.ID,
      title: localize2("browser.openExternalAction", "Open in External Browser"),
      category: BrowserCategory,
      icon: Codicon.linkExternal,
      f1: false,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "2_export",
        order: 1
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      const url = browserEditor.getUrl();
      if (url) {
        const openerService = accessor.get(IOpenerService);
        await openerService.open(url, { openExternal: true });
      }
    }
  }
}
class ClearGlobalBrowserStorageAction extends Action2 {
  static {
    __name(this, "ClearGlobalBrowserStorageAction");
  }
  static {
    this.ID = "workbench.action.browser.clearGlobalStorage";
  }
  constructor() {
    super({
      id: ClearGlobalBrowserStorageAction.ID,
      title: localize2("browser.clearGlobalStorageAction", "Clear Storage (Global)"),
      category: BrowserCategory,
      icon: Codicon.clearAll,
      f1: true,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_settings",
        order: 1,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, BrowserViewStorageScope.Global)
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    await browserViewWorkbenchService.clearGlobalStorage();
  }
}
class ClearWorkspaceBrowserStorageAction extends Action2 {
  static {
    __name(this, "ClearWorkspaceBrowserStorageAction");
  }
  static {
    this.ID = "workbench.action.browser.clearWorkspaceStorage";
  }
  constructor() {
    super({
      id: ClearWorkspaceBrowserStorageAction.ID,
      title: localize2("browser.clearWorkspaceStorageAction", "Clear Storage (Workspace)"),
      category: BrowserCategory,
      icon: Codicon.clearAll,
      f1: true,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_settings",
        order: 2,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, BrowserViewStorageScope.Workspace)
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    await browserViewWorkbenchService.clearWorkspaceStorage();
  }
}
class OpenBrowserSettingsAction extends Action2 {
  static {
    __name(this, "OpenBrowserSettingsAction");
  }
  static {
    this.ID = "workbench.action.browser.openSettings";
  }
  constructor() {
    super({
      id: OpenBrowserSettingsAction.ID,
      title: localize2("browser.openSettingsAction", "Open Browser Settings"),
      category: BrowserCategory,
      icon: Codicon.settingsGear,
      f1: false,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_settings",
        order: 3
      }
    });
  }
  async run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    await preferencesService.openSettings({ query: "@id:workbench.browser.*,chat.sendElementsToChat.*" });
  }
}
registerAction2(OpenIntegratedBrowserAction);
registerAction2(GoBackAction);
registerAction2(GoForwardAction);
registerAction2(ReloadAction);
registerAction2(AddElementToChatAction);
registerAction2(ToggleDevToolsAction);
registerAction2(OpenInExternalBrowserAction);
registerAction2(ClearGlobalBrowserStorageAction);
registerAction2(ClearWorkspaceBrowserStorageAction);
registerAction2(OpenBrowserSettingsAction);
//# sourceMappingURL=browserViewActions.js.map
