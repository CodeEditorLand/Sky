var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./media/actions.css";
import { URI } from "../../../base/common/uri.js";
import { localize, localize2 } from "../../../nls.js";
import { ApplyZoomTarget, MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL, applyZoom } from "../../../platform/window/electron-browser/window.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { getZoomLevel } from "../../../base/browser/browser.js";
import { FileKind } from "../../../platform/files/common/files.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IQuickInputService } from "../../../platform/quickinput/common/quickInput.js";
import { getIconClasses } from "../../../editor/common/services/getIconClasses.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { INativeHostService } from "../../../platform/native/common/native.js";
import { Codicon } from "../../../base/common/codicons.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "../../../platform/workspace/common/workspace.js";
import { Action2, MenuId } from "../../../platform/actions/common/actions.js";
import { Categories } from "../../../platform/action/common/actionCommonCategories.js";
import { isMacintosh } from "../../../base/common/platform.js";
import { getActiveWindow } from "../../../base/browser/dom.js";
import { isOpenedAuxiliaryWindow } from "../../../platform/window/common/window.js";
import { IsAuxiliaryWindowContext, IsAuxiliaryWindowFocusedContext, IsWindowAlwaysOnTopContext } from "../../common/contextkeys.js";
import { isAuxiliaryWindow } from "../../../base/browser/window.js";
import { ContextKeyExpr } from "../../../platform/contextkey/common/contextkey.js";
class CloseWindowAction extends Action2 {
  static {
    __name(this, "CloseWindowAction");
  }
  static {
    this.ID = "workbench.action.closeWindow";
  }
  constructor() {
    super({
      id: CloseWindowAction.ID,
      title: {
        ...localize2("closeWindow", "Close Window"),
        mnemonicTitle: localize({ key: "miCloseWindow", comment: ["&& denotes a mnemonic"] }, "Clos&&e Window")
      },
      f1: true,
      keybinding: {
        weight: 200,
        mac: {
          primary: 2048 | 1024 | 53
          /* KeyCode.KeyW */
        },
        linux: { primary: 512 | 62, secondary: [
          2048 | 1024 | 53
          /* KeyCode.KeyW */
        ] },
        win: { primary: 512 | 62, secondary: [
          2048 | 1024 | 53
          /* KeyCode.KeyW */
        ] }
      },
      menu: {
        id: MenuId.MenubarFileMenu,
        group: "6_close",
        order: 4
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.closeWindow({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
}
class CloseOtherWindowsAction extends Action2 {
  static {
    __name(this, "CloseOtherWindowsAction");
  }
  static {
    this.ID = "workbench.action.closeOtherWindows";
  }
  constructor() {
    super({
      id: CloseOtherWindowsAction.ID,
      title: localize2("closeOtherWindows", "Close Other Windows"),
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const currentWindowId = getActiveWindow().vscodeWindowId;
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    for (const window of windows) {
      if (window.id !== currentWindowId) {
        nativeHostService.closeWindow({ targetWindowId: window.id });
      }
    }
  }
}
class BaseZoomAction extends Action2 {
  static {
    __name(this, "BaseZoomAction");
  }
  static {
    this.ZOOM_LEVEL_SETTING_KEY = "window.zoomLevel";
  }
  static {
    this.ZOOM_PER_WINDOW_SETTING_KEY = "window.zoomPerWindow";
  }
  async setZoomLevel(accessor, levelOrReset) {
    const configurationService = accessor.get(IConfigurationService);
    let target;
    if (configurationService.getValue(BaseZoomAction.ZOOM_PER_WINDOW_SETTING_KEY) !== false) {
      target = ApplyZoomTarget.ACTIVE_WINDOW;
    } else {
      target = ApplyZoomTarget.ALL_WINDOWS;
    }
    let level;
    if (typeof levelOrReset === "number") {
      level = Math.round(levelOrReset);
    } else {
      if (target === ApplyZoomTarget.ALL_WINDOWS) {
        level = 0;
      } else {
        const defaultLevel = configurationService.getValue(BaseZoomAction.ZOOM_LEVEL_SETTING_KEY);
        if (typeof defaultLevel === "number") {
          level = defaultLevel;
        } else {
          level = 0;
        }
      }
    }
    if (level > MAX_ZOOM_LEVEL || level < MIN_ZOOM_LEVEL) {
      return;
    }
    if (target === ApplyZoomTarget.ALL_WINDOWS) {
      await configurationService.updateValue(BaseZoomAction.ZOOM_LEVEL_SETTING_KEY, level);
    }
    applyZoom(level, target);
  }
}
class ZoomInAction extends BaseZoomAction {
  static {
    __name(this, "ZoomInAction");
  }
  constructor() {
    super({
      id: "workbench.action.zoomIn",
      title: {
        ...localize2("zoomIn", "Zoom In"),
        mnemonicTitle: localize({ key: "miZoomIn", comment: ["&& denotes a mnemonic"] }, "&&Zoom In")
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200,
        primary: 2048 | 86,
        secondary: [
          2048 | 1024 | 86,
          2048 | 109
          /* KeyCode.NumpadAdd */
        ]
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 1
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, getZoomLevel(getActiveWindow()) + 1);
  }
}
class ZoomOutAction extends BaseZoomAction {
  static {
    __name(this, "ZoomOutAction");
  }
  constructor() {
    super({
      id: "workbench.action.zoomOut",
      title: {
        ...localize2("zoomOut", "Zoom Out"),
        mnemonicTitle: localize({ key: "miZoomOut", comment: ["&& denotes a mnemonic"] }, "&&Zoom Out")
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200,
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
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 2
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, getZoomLevel(getActiveWindow()) - 1);
  }
}
class ZoomResetAction extends BaseZoomAction {
  static {
    __name(this, "ZoomResetAction");
  }
  constructor() {
    super({
      id: "workbench.action.zoomReset",
      title: {
        ...localize2("zoomReset", "Reset Zoom"),
        mnemonicTitle: localize({ key: "miZoomReset", comment: ["&& denotes a mnemonic"] }, "&&Reset Zoom")
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200,
        primary: 2048 | 98
        /* KeyCode.Numpad0 */
      },
      menu: {
        id: MenuId.MenubarAppearanceMenu,
        group: "5_zoom",
        order: 3
      }
    });
  }
  run(accessor) {
    return super.setZoomLevel(accessor, true);
  }
}
class BaseSwitchWindow extends Action2 {
  static {
    __name(this, "BaseSwitchWindow");
  }
  constructor() {
    super(...arguments);
    this.closeWindowAction = {
      iconClass: ThemeIcon.asClassName(Codicon.removeClose),
      tooltip: localize("close", "Close Window")
    };
    this.closeDirtyWindowAction = {
      iconClass: "dirty-window " + ThemeIcon.asClassName(Codicon.closeDirty),
      tooltip: localize("close", "Close Window"),
      alwaysVisible: true
    };
    this.closeActiveWindowAction = {
      iconClass: "active-window " + ThemeIcon.asClassName(Codicon.windowActive),
      tooltip: localize("closeActive", "Close Active Window"),
      alwaysVisible: true
    };
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const keybindingService = accessor.get(IKeybindingService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const nativeHostService = accessor.get(INativeHostService);
    const currentWindowId = getActiveWindow().vscodeWindowId;
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: true });
    const mainWindows = /* @__PURE__ */ new Set();
    const mapMainWindowToAuxiliaryWindows = /* @__PURE__ */ new Map();
    for (const window of windows) {
      if (isOpenedAuxiliaryWindow(window)) {
        let auxiliaryWindows = mapMainWindowToAuxiliaryWindows.get(window.parentId);
        if (!auxiliaryWindows) {
          auxiliaryWindows = /* @__PURE__ */ new Set();
          mapMainWindowToAuxiliaryWindows.set(window.parentId, auxiliaryWindows);
        }
        auxiliaryWindows.add(window);
      } else {
        mainWindows.add(window);
      }
    }
    function isWindowPickItem(candidate) {
      const windowPickItem = candidate;
      return typeof windowPickItem?.windowId === "number";
    }
    __name(isWindowPickItem, "isWindowPickItem");
    const picks = [];
    for (const window of mainWindows) {
      const auxiliaryWindows = mapMainWindowToAuxiliaryWindows.get(window.id);
      if (mapMainWindowToAuxiliaryWindows.size > 0) {
        picks.push({ type: "separator", label: auxiliaryWindows ? localize("windowGroup", "window group") : void 0 });
      }
      const resource = window.filename ? URI.file(window.filename) : isSingleFolderWorkspaceIdentifier(window.workspace) ? window.workspace.uri : isWorkspaceIdentifier(window.workspace) ? window.workspace.configPath : void 0;
      const fileKind = window.filename ? FileKind.FILE : isSingleFolderWorkspaceIdentifier(window.workspace) ? FileKind.FOLDER : isWorkspaceIdentifier(window.workspace) ? FileKind.ROOT_FOLDER : FileKind.FILE;
      const pick2 = {
        windowId: window.id,
        label: window.title,
        ariaLabel: window.dirty ? localize("windowDirtyAriaLabel", "{0}, window with unsaved changes", window.title) : window.title,
        iconClasses: getIconClasses(modelService, languageService, resource, fileKind),
        description: currentWindowId === window.id ? localize("current", "Current Window") : void 0,
        buttons: window.dirty ? [this.closeDirtyWindowAction] : currentWindowId === window.id ? [this.closeActiveWindowAction] : [this.closeWindowAction]
      };
      picks.push(pick2);
      if (auxiliaryWindows) {
        for (const auxiliaryWindow of auxiliaryWindows) {
          const pick3 = {
            windowId: auxiliaryWindow.id,
            label: auxiliaryWindow.title,
            iconClasses: getIconClasses(modelService, languageService, auxiliaryWindow.filename ? URI.file(auxiliaryWindow.filename) : void 0, FileKind.FILE),
            description: currentWindowId === auxiliaryWindow.id ? localize("current", "Current Window") : void 0,
            buttons: currentWindowId === auxiliaryWindow.id ? [this.closeActiveWindowAction] : [this.closeWindowAction]
          };
          picks.push(pick3);
        }
      }
    }
    const pick = await quickInputService.pick(picks, {
      contextKey: "inWindowsPicker",
      activeItem: (() => {
        for (let i = 0; i < picks.length; i++) {
          const pick2 = picks[i];
          if (isWindowPickItem(pick2) && pick2.windowId === currentWindowId) {
            let nextPick = picks[i + 1];
            if (isWindowPickItem(nextPick)) {
              return nextPick;
            }
            nextPick = picks[i + 2];
            if (isWindowPickItem(nextPick)) {
              return nextPick;
            }
          }
        }
        return void 0;
      })(),
      placeHolder: localize("switchWindowPlaceHolder", "Select a window to switch to"),
      quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : void 0,
      hideInput: this.isQuickNavigate(),
      onDidTriggerItemButton: /* @__PURE__ */ __name(async (context) => {
        await nativeHostService.closeWindow({ targetWindowId: context.item.windowId });
        context.removeItem();
      }, "onDidTriggerItemButton")
    });
    if (pick) {
      nativeHostService.focusWindow({ targetWindowId: pick.windowId });
    }
  }
}
class SwitchWindowAction extends BaseSwitchWindow {
  static {
    __name(this, "SwitchWindowAction");
  }
  constructor() {
    super({
      id: "workbench.action.switchWindow",
      title: localize2("switchWindow", "Switch Window..."),
      f1: true,
      keybinding: {
        weight: 200,
        primary: 0,
        mac: {
          primary: 256 | 53
          /* KeyCode.KeyW */
        }
      }
    });
  }
  isQuickNavigate() {
    return false;
  }
}
class QuickSwitchWindowAction extends BaseSwitchWindow {
  static {
    __name(this, "QuickSwitchWindowAction");
  }
  constructor() {
    super({
      id: "workbench.action.quickSwitchWindow",
      title: localize2("quickSwitchWindow", "Quick Switch Window..."),
      f1: false
      // hide quick pickers from command palette to not confuse with the other entry that shows a input field
    });
  }
  isQuickNavigate() {
    return true;
  }
}
function canRunNativeTabsHandler(accessor) {
  if (!isMacintosh) {
    return false;
  }
  const configurationService = accessor.get(IConfigurationService);
  return configurationService.getValue("window.nativeTabs") === true;
}
__name(canRunNativeTabsHandler, "canRunNativeTabsHandler");
const NewWindowTabHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).newWindowTab();
}, "NewWindowTabHandler");
const ShowPreviousWindowTabHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).showPreviousWindowTab();
}, "ShowPreviousWindowTabHandler");
const ShowNextWindowTabHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).showNextWindowTab();
}, "ShowNextWindowTabHandler");
const MoveWindowTabToNewWindowHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).moveWindowTabToNewWindow();
}, "MoveWindowTabToNewWindowHandler");
const MergeWindowTabsHandlerHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).mergeAllWindowTabs();
}, "MergeWindowTabsHandlerHandler");
const ToggleWindowTabsBarHandler = /* @__PURE__ */ __name(function(accessor) {
  if (!canRunNativeTabsHandler(accessor)) {
    return;
  }
  return accessor.get(INativeHostService).toggleWindowTabsBar();
}, "ToggleWindowTabsBarHandler");
class ToggleWindowAlwaysOnTopAction extends Action2 {
  static {
    __name(this, "ToggleWindowAlwaysOnTopAction");
  }
  static {
    this.ID = "workbench.action.toggleWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: ToggleWindowAlwaysOnTopAction.ID,
      title: localize2("toggleWindowAlwaysOnTop", "Toggle Window Always on Top"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.toggleWindowAlwaysOnTop({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
}
class EnableWindowAlwaysOnTopAction extends Action2 {
  static {
    __name(this, "EnableWindowAlwaysOnTopAction");
  }
  static {
    this.ID = "workbench.action.enableWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: EnableWindowAlwaysOnTopAction.ID,
      title: localize("enableWindowAlwaysOnTop", "Turn On Always on Top"),
      icon: Codicon.pin,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsWindowAlwaysOnTopContext.toNegated(), IsAuxiliaryWindowContext),
        order: 1
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.setWindowAlwaysOnTop(true, { targetWindowId: targetWindow.vscodeWindowId });
  }
}
class DisableWindowAlwaysOnTopAction extends Action2 {
  static {
    __name(this, "DisableWindowAlwaysOnTopAction");
  }
  static {
    this.ID = "workbench.action.disableWindowAlwaysOnTop";
  }
  constructor() {
    super({
      id: DisableWindowAlwaysOnTopAction.ID,
      title: localize("disableWindowAlwaysOnTop", "Turn Off Always on Top"),
      icon: Codicon.pinned,
      menu: {
        id: MenuId.LayoutControlMenu,
        when: ContextKeyExpr.and(IsWindowAlwaysOnTopContext, IsAuxiliaryWindowContext),
        order: 1
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const targetWindow = getActiveWindow();
    if (!isAuxiliaryWindow(targetWindow.window)) {
      return;
    }
    return nativeHostService.setWindowAlwaysOnTop(false, { targetWindowId: targetWindow.vscodeWindowId });
  }
}
export {
  CloseOtherWindowsAction,
  CloseWindowAction,
  DisableWindowAlwaysOnTopAction,
  EnableWindowAlwaysOnTopAction,
  MergeWindowTabsHandlerHandler,
  MoveWindowTabToNewWindowHandler,
  NewWindowTabHandler,
  QuickSwitchWindowAction,
  ShowNextWindowTabHandler,
  ShowPreviousWindowTabHandler,
  SwitchWindowAction,
  ToggleWindowAlwaysOnTopAction,
  ToggleWindowTabsBarHandler,
  ZoomInAction,
  ZoomOutAction,
  ZoomResetAction
};
//# sourceMappingURL=windowActions.js.map
