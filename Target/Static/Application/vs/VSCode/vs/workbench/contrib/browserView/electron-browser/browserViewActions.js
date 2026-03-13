var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { Action2, registerAction2, MenuId } from "../../../../platform/actions/common/actions.js";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { BrowserEditor, CONTEXT_BROWSER_CAN_GO_BACK, CONTEXT_BROWSER_CAN_GO_FORWARD, CONTEXT_BROWSER_CAN_ZOOM_IN, CONTEXT_BROWSER_CAN_ZOOM_OUT, CONTEXT_BROWSER_DEVTOOLS_OPEN, CONTEXT_BROWSER_FOCUSED, CONTEXT_BROWSER_HAS_ERROR, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_STORAGE_SCOPE, CONTEXT_BROWSER_ELEMENT_SELECTION_ACTIVE, CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE } from "./browserEditor.js";
import { BrowserViewUri } from "../../../../platform/browserView/common/browserViewUri.js";
import { IBrowserViewWorkbenchService } from "../common/browserView.js";
import { BrowserViewCommandId, BrowserViewStorageScope } from "../../../../platform/browserView/common/browserView.js";
import { ChatContextKeys } from "../../chat/common/actions/chatContextKeys.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { logBrowserOpen } from "../../../../platform/browserView/common/browserViewTelemetry.js";
const BROWSER_EDITOR_ACTIVE = ContextKeyExpr.equals("activeEditor", BrowserEditor.ID);
const BrowserCategory = localize2("browserCategory", "Browser");
const ActionGroupTabs = "1_tabs";
const ActionGroupZoom = "2_zoom";
const ActionGroupPage = "3_page";
const ActionGroupSettings = "4_settings";
class OpenIntegratedBrowserAction extends Action2 {
  static {
    __name(this, "OpenIntegratedBrowserAction");
  }
  constructor() {
    super({
      id: BrowserViewCommandId.Open,
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
    const editorPane = await editorService.openEditor({ resource }, group);
    if (options.openToSide && editorPane?.group) {
      editorPane.group.lock(true);
    }
  }
}
class NewTabAction extends Action2 {
  static {
    __name(this, "NewTabAction");
  }
  constructor() {
    super({
      id: BrowserViewCommandId.NewTab,
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
    this.ID = BrowserViewCommandId.GoBack;
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
    this.ID = BrowserViewCommandId.GoForward;
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
        order: 2
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
    this.ID = BrowserViewCommandId.Reload;
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
        order: 3,
        alt: {
          id: HardReloadAction.ID,
          title: localize2("browser.hardReloadAction", "Hard Reload"),
          icon: Codicon.refresh
        }
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
class HardReloadAction extends Action2 {
  static {
    __name(this, "HardReloadAction");
  }
  static {
    this.ID = BrowserViewCommandId.HardReload;
  }
  constructor() {
    super({
      id: HardReloadAction.ID,
      title: localize2("browser.hardReloadAction", "Hard Reload"),
      category: BrowserCategory,
      icon: Codicon.refresh,
      f1: true,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 75,
        // Priority over debug and reload workbench
        primary: 2048 | 1024 | 48,
        secondary: [
          2048 | 63
          /* KeyCode.F5 */
        ],
        mac: { primary: 2048 | 1024 | 48, secondary: [] }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.reload(true);
    }
  }
}
class FocusUrlInputAction extends Action2 {
  static {
    __name(this, "FocusUrlInputAction");
  }
  static {
    this.ID = BrowserViewCommandId.FocusUrlInput;
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
    this.ID = BrowserViewCommandId.AddElementToChat;
  }
  constructor() {
    const enabled = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("config.chat.sendElementsToChat.enabled", true));
    super({
      id: AddElementToChatAction.ID,
      title: localize2("browser.addElementToChatAction", "Add Element to Chat"),
      category: BrowserCategory,
      icon: Codicon.inspect,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), enabled),
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
class AddConsoleLogsToChatAction extends Action2 {
  static {
    __name(this, "AddConsoleLogsToChatAction");
  }
  static {
    this.ID = BrowserViewCommandId.AddConsoleLogsToChat;
  }
  constructor() {
    const enabled = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("config.chat.sendElementsToChat.enabled", true));
    super({
      id: AddConsoleLogsToChatAction.ID,
      title: localize2("browser.addConsoleLogsToChatAction", "Add Console Logs to Chat"),
      category: BrowserCategory,
      icon: Codicon.output,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), enabled),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "actions",
        order: 2,
        when: enabled
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.addConsoleLogsToChat();
    }
  }
}
class ToggleDevToolsAction extends Action2 {
  static {
    __name(this, "ToggleDevToolsAction");
  }
  static {
    this.ID = BrowserViewCommandId.ToggleDevTools;
  }
  constructor() {
    super({
      id: ToggleDevToolsAction.ID,
      title: localize2("browser.toggleDevToolsAction", "Toggle Developer Tools"),
      category: BrowserCategory,
      icon: Codicon.terminal,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      toggled: ContextKeyExpr.equals(CONTEXT_BROWSER_DEVTOOLS_OPEN.key, true),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "actions",
        order: 3
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
    this.ID = BrowserViewCommandId.OpenExternal;
  }
  constructor() {
    super({
      id: OpenInExternalBrowserAction.ID,
      title: localize2("browser.openExternalAction", "Open in External Browser"),
      category: BrowserCategory,
      icon: Codicon.linkExternal,
      f1: true,
      // Note: We do allow opening in an external browser even if there is an error page shown
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL),
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
        await openerService.open(url, {
          // ensures that VS Code itself doesn't try to open the URL, even for non-"http(s):" scheme URLs.
          openExternal: true,
          // ensures that the link isn't opened in Integrated Browser or other contributed external openers. False is the default, but just being explicit here.
          allowContributedOpeners: false
        });
      }
    }
  }
}
class ClearGlobalBrowserStorageAction extends Action2 {
  static {
    __name(this, "ClearGlobalBrowserStorageAction");
  }
  static {
    this.ID = BrowserViewCommandId.ClearGlobalStorage;
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
    this.ID = BrowserViewCommandId.ClearWorkspaceStorage;
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
    this.ID = BrowserViewCommandId.ClearEphemeralStorage;
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
        group: ActionGroupSettings,
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
    this.ID = BrowserViewCommandId.OpenSettings;
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
class ZoomInAction extends Action2 {
  static {
    __name(this, "ZoomInAction");
  }
  static {
    this.ID = "workbench.action.browser.zoomIn";
  }
  constructor() {
    super({
      id: ZoomInAction.ID,
      title: localize2("browser.zoomInAction", "Zoom In"),
      category: BrowserCategory,
      icon: Codicon.zoomIn,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupZoom,
        order: 1,
        when: CONTEXT_BROWSER_CAN_ZOOM_IN
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 75,
        // Same shortcuts as 'workbench.action.zoomIn'
        primary: 2048 | 86,
        secondary: [
          2048 | 1024 | 86,
          2048 | 109
          /* KeyCode.NumpadAdd */
        ]
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.zoomIn();
    }
  }
}
class ZoomOutAction extends Action2 {
  static {
    __name(this, "ZoomOutAction");
  }
  static {
    this.ID = "workbench.action.browser.zoomOut";
  }
  constructor() {
    super({
      id: ZoomOutAction.ID,
      title: localize2("browser.zoomOutAction", "Zoom Out"),
      category: BrowserCategory,
      icon: Codicon.zoomOut,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupZoom,
        order: 2,
        when: CONTEXT_BROWSER_CAN_ZOOM_OUT
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 75,
        // Same shortcuts as 'workbench.action.zoomOut'
        primary: 2048 | 88,
        secondary: [
          2048 | 1024 | 88,
          2048 | 111
          /* KeyCode.NumpadSubtract */
        ],
        linux: {
          primary: 2048 | 88,
          secondary: [
            2048 | 111
            /* KeyCode.NumpadSubtract */
          ]
        }
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.zoomOut();
    }
  }
}
class ResetZoomAction extends Action2 {
  static {
    __name(this, "ResetZoomAction");
  }
  static {
    this.ID = "workbench.action.browser.resetZoom";
  }
  constructor() {
    super({
      id: ResetZoomAction.ID,
      title: localize2("browser.resetZoomAction", "Reset Zoom"),
      category: BrowserCategory,
      icon: Codicon.screenNormal,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: ActionGroupZoom,
        order: 3
      },
      keybinding: {
        when: CONTEXT_BROWSER_FOCUSED,
        weight: 200 + 75,
        // Same shortcuts as 'workbench.action.zoomReset'
        // (note: both workbench and here use Numpad0 instead of Digit0 to avoid conflicts with keybinding to focus sidebar.)
        primary: 2048 | 98
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.resetZoom();
    }
  }
}
class ShowBrowserFindAction extends Action2 {
  static {
    __name(this, "ShowBrowserFindAction");
  }
  static {
    this.ID = BrowserViewCommandId.ShowFind;
  }
  constructor() {
    super({
      id: ShowBrowserFindAction.ID,
      title: localize2("browser.showFindAction", "Find in Page"),
      category: BrowserCategory,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
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
    this.ID = BrowserViewCommandId.HideFind;
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
    this.ID = BrowserViewCommandId.FindNext;
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
    this.ID = BrowserViewCommandId.FindPrevious;
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
registerAction2(HardReloadAction);
registerAction2(FocusUrlInputAction);
registerAction2(AddElementToChatAction);
registerAction2(AddConsoleLogsToChatAction);
registerAction2(ToggleDevToolsAction);
registerAction2(OpenInExternalBrowserAction);
registerAction2(ClearGlobalBrowserStorageAction);
registerAction2(ClearWorkspaceBrowserStorageAction);
registerAction2(ClearEphemeralBrowserStorageAction);
registerAction2(OpenBrowserSettingsAction);
registerAction2(ZoomInAction);
registerAction2(ZoomOutAction);
registerAction2(ResetZoomAction);
registerAction2(ShowBrowserFindAction);
registerAction2(HideBrowserFindAction);
registerAction2(BrowserFindNextAction);
registerAction2(BrowserFindPreviousAction);
//# sourceMappingURL=browserViewActions.js.map
