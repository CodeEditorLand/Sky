var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, registerAction2, MenuId } from "../../../../platform/actions/common/actions.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { BrowserEditor, CONTEXT_BROWSER_CAN_GO_BACK, CONTEXT_BROWSER_CAN_GO_FORWARD, CONTEXT_BROWSER_DEVTOOLS_OPEN, CONTEXT_BROWSER_FOCUSED, CONTEXT_BROWSER_STORAGE_SCOPE, CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE, CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE } from "./browserEditor.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IBrowserViewWorkbenchService } from "../common/browserView.js";
import { BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { logBrowserOpen } from "./browserViewTelemetry.js";
const BROWSER_EDITOR_ACTIVE = ContextKeyExpr.equals("activeEditor", BrowserEditor.ID);
const BrowserCategory = localize2("browserCategory", "Browser");
const ActionGroupTabs = "1_tabs";
const ActionGroupPage = "2_page";
const ActionGroupSettings = "3_settings";
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
  async run(accessor, urlOrOptions) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const options = typeof urlOrOptions === "string" ? { url: urlOrOptions } : urlOrOptions ?? {};
    const resource = BrowserViewUri.forUrl(options.url);
    const group = options.openToSide ? SIDE_GROUP : ACTIVE_GROUP;
    logBrowserOpen(telemetryService, options.url ? "commandWithUrl" : "commandWithoutUrl");
    await editorService.openEditor({ resource }, group);
  }
}
class NewTabAction extends Action2 {
  static {
    __name(this, "NewTabAction");
  }
  constructor() {
    super({
      id: "workbench.action.browser.newTab",
      title: localize2("browser.newTabAction", "New Tab"),
      category: BrowserCategory,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupTabs,
        order: 1
      },
      // When already in a browser, Ctrl/Cmd + T opens a new tab
      keybinding: {
        weight: 200 + 50,
        // Priority over search actions
        primary: 2048 | 50
      }
    });
  }
  async run(accessor, _browserEditor = accessor.get(IEditorService).activeEditorPane) {
    const editorService = accessor.get(IEditorService);
    const telemetryService = accessor.get(ITelemetryService);
    const resource = BrowserViewUri.forUrl(void 0);
    logBrowserOpen(telemetryService, "newTabCommand");
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
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_BACK),
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 1
      },
      keybinding: {
        weight: 200 + 50,
        // Priority over editor navigation
        primary: 512 | 15,
        secondary: [
          122
          /* KeyCode.BrowserBack */
        ],
        mac: { primary: 2048 | 92, secondary: [
          122,
          2048 | 15
          /* KeyCode.LeftArrow */
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
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_FORWARD),
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 2,
        when: CONTEXT_BROWSER_CAN_GO_FORWARD
      },
      keybinding: {
        weight: 200 + 50,
        // Priority over editor navigation
        primary: 512 | 17,
        secondary: [
          123
          /* KeyCode.BrowserForward */
        ],
        mac: { primary: 2048 | 94, secondary: [
          123,
          2048 | 17
          /* KeyCode.RightArrow */
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
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserNavigationToolbar,
        group: "navigation",
        order: 3
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 75,
        // Priority over debug and reload workbench
        primary: 2048 | 48,
        secondary: [
          63
          /* KeyCode.F5 */
        ],
        mac: { primary: 2048 | 48, secondary: [] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.reload();
    }
  }
}
class FocusUrlInputAction extends Action2 {
  static {
    __name(this, "FocusUrlInputAction");
  }
  static {
    this.ID = "workbench.action.browser.focusUrlInput";
  }
  constructor() {
    super({
      id: FocusUrlInputAction.ID,
      title: localize2("browser.focusUrlInputAction", "Focus URL Input"),
      category: BrowserCategory,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: {
        weight: 200,
        primary: 2048 | 42
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.focusUrlInput();
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
    const enabled = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("config.chat.sendElementsToChat.enabled", true));
    super({
      id: AddElementToChatAction.ID,
      title: localize2("browser.addElementToChatAction", "Add Element to Chat"),
      category: BrowserCategory,
      icon: Codicon.inspect,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, enabled),
      toggled: CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "actions",
        order: 1,
        when: enabled
      },
      keybinding: [{
        weight: 200 + 50,
        // Priority over terminal
        primary: 2048 | 1024 | 33
      }, {
        when: CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE,
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
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      toggled: ContextKeyExpr.equals(CONTEXT_BROWSER_DEVTOOLS_OPEN.key, true),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupPage,
        order: 5
      },
      keybinding: {
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
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupPage,
        order: 10
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
        group: ActionGroupSettings,
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
        group: ActionGroupSettings,
        order: 1,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, BrowserViewStorageScope.Workspace)
      }
    });
  }
  async run(accessor) {
    const browserViewWorkbenchService = accessor.get(IBrowserViewWorkbenchService);
    await browserViewWorkbenchService.clearWorkspaceStorage();
  }
}
class ClearEphemeralBrowserStorageAction extends Action2 {
  static {
    __name(this, "ClearEphemeralBrowserStorageAction");
  }
  static {
    this.ID = "workbench.action.browser.clearEphemeralStorage";
  }
  constructor() {
    super({
      id: ClearEphemeralBrowserStorageAction.ID,
      title: localize2("browser.clearEphemeralStorageAction", "Clear Storage (Ephemeral)"),
      category: BrowserCategory,
      icon: Codicon.clearAll,
      f1: true,
      precondition: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, BrowserViewStorageScope.Ephemeral),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_settings",
        order: 1,
        when: ContextKeyExpr.equals(CONTEXT_BROWSER_STORAGE_SCOPE.key, BrowserViewStorageScope.Ephemeral)
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.clearStorage();
    }
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
        group: ActionGroupSettings,
        order: 2
      }
    });
  }
  async run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    await preferencesService.openSettings({ query: "@id:workbench.browser.*,chat.sendElementsToChat.*" });
  }
}
class ShowBrowserFindAction extends Action2 {
  static {
    __name(this, "ShowBrowserFindAction");
  }
  static {
    this.ID = "workbench.action.browser.showFind";
  }
  constructor() {
    super({
      id: ShowBrowserFindAction.ID,
      title: localize2("browser.showFindAction", "Find in Page"),
      category: BrowserCategory,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupPage,
        order: 1
      },
      keybinding: {
        weight: 100,
        primary: 2048 | 36
        /* KeyCode.KeyF */
      }
    });
  }
  run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.showFind();
    }
  }
}
class HideBrowserFindAction extends Action2 {
  static {
    __name(this, "HideBrowserFindAction");
  }
  static {
    this.ID = "workbench.action.browser.hideFind";
  }
  constructor() {
    super({
      id: HideBrowserFindAction.ID,
      title: localize2("browser.hideFindAction", "Close Find Widget"),
      category: BrowserCategory,
      f1: false,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE),
      keybinding: {
        weight: 100 + 5,
        primary: 9
        /* KeyCode.Escape */
      }
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.hideFind();
    }
  }
}
class BrowserFindNextAction extends Action2 {
  static {
    __name(this, "BrowserFindNextAction");
  }
  static {
    this.ID = "workbench.action.browser.findNext";
  }
  constructor() {
    super({
      id: BrowserFindNextAction.ID,
      title: localize2("browser.findNextAction", "Find Next"),
      category: BrowserCategory,
      f1: false,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: [{
        when: CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
        weight: 100,
        primary: 3
        /* KeyCode.Enter */
      }, {
        when: CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
        weight: 100,
        primary: 61,
        mac: {
          primary: 2048 | 37
          /* KeyCode.KeyG */
        }
      }]
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.findNext();
    }
  }
}
class BrowserFindPreviousAction extends Action2 {
  static {
    __name(this, "BrowserFindPreviousAction");
  }
  static {
    this.ID = "workbench.action.browser.findPrevious";
  }
  constructor() {
    super({
      id: BrowserFindPreviousAction.ID,
      title: localize2("browser.findPreviousAction", "Find Previous"),
      category: BrowserCategory,
      f1: false,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: [{
        when: CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
        weight: 100,
        primary: 1024 | 3
        /* KeyCode.Enter */
      }, {
        when: CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
        weight: 100,
        primary: 1024 | 61,
        mac: {
          primary: 2048 | 1024 | 37
          /* KeyCode.KeyG */
        }
      }]
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.findPrevious();
    }
  }
}
registerAction2(OpenIntegratedBrowserAction);
registerAction2(NewTabAction);
registerAction2(GoBackAction);
registerAction2(GoForwardAction);
registerAction2(ReloadAction);
registerAction2(FocusUrlInputAction);
registerAction2(AddElementToChatAction);
registerAction2(ToggleDevToolsAction);
registerAction2(OpenInExternalBrowserAction);
registerAction2(ClearGlobalBrowserStorageAction);
registerAction2(ClearWorkspaceBrowserStorageAction);
registerAction2(ClearEphemeralBrowserStorageAction);
registerAction2(OpenBrowserSettingsAction);
registerAction2(ShowBrowserFindAction);
registerAction2(HideBrowserFindAction);
registerAction2(BrowserFindNextAction);
registerAction2(BrowserFindPreviousAction);
//# sourceMappingURL=browserViewActions.js.map
