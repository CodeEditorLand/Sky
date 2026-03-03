var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../nls.js";
import { INativeHostService } from "../../../platform/native/common/native.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { Action2, MenuId } from "../../../platform/actions/common/actions.js";
import { Categories } from "../../../platform/action/common/actionCommonCategories.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { IsDevelopmentContext } from "../../../platform/contextkey/common/contextkeys.js";
import { INativeWorkbenchEnvironmentService } from "../../services/environment/electron-browser/environmentService.js";
import { URI } from "../../../base/common/uri.js";
import { getActiveWindow } from "../../../base/browser/dom.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import { INativeEnvironmentService } from "../../../platform/environment/common/environment.js";
import { IProgressService } from "../../../platform/progress/common/progress.js";
class ToggleDevToolsAction extends Action2 {
  static {
    __name(this, "ToggleDevToolsAction");
  }
  constructor() {
    super({
      id: "workbench.action.toggleDevTools",
      title: localize2("toggleDevTools", "Toggle Developer Tools"),
      category: Categories.Developer,
      f1: true,
      keybinding: {
        weight: 200 + 50,
        when: IsDevelopmentContext,
        primary: 2048 | 1024 | 39,
        mac: {
          primary: 2048 | 512 | 39
          /* KeyCode.KeyI */
        }
      },
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "5_tools",
        order: 1
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.toggleDevTools({ targetWindowId: getActiveWindow().vscodeWindowId });
  }
}
class ConfigureRuntimeArgumentsAction extends Action2 {
  static {
    __name(this, "ConfigureRuntimeArgumentsAction");
  }
  constructor() {
    super({
      id: "workbench.action.configureRuntimeArguments",
      title: localize2("configureRuntimeArguments", "Configure Runtime Arguments"),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    await editorService.openEditor({
      resource: environmentService.argvResource,
      options: { pinned: true }
    });
  }
}
class ReloadWindowWithExtensionsDisabledAction extends Action2 {
  static {
    __name(this, "ReloadWindowWithExtensionsDisabledAction");
  }
  constructor() {
    super({
      id: "workbench.action.reloadWindowWithExtensionsDisabled",
      title: localize2("reloadWindowWithExtensionsDisabled", "Reload with Extensions Disabled"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    return accessor.get(INativeHostService).reload({ disableExtensions: true });
  }
}
class OpenUserDataFolderAction extends Action2 {
  static {
    __name(this, "OpenUserDataFolderAction");
  }
  constructor() {
    super({
      id: "workbench.action.revealUserDataFolder",
      title: localize2("revealUserDataFolder", "Reveal User Data Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    return nativeHostService.showItemInFolder(URI.file(environmentService.userDataPath).fsPath);
  }
}
class ShowGPUInfoAction extends Action2 {
  static {
    __name(this, "ShowGPUInfoAction");
  }
  constructor() {
    super({
      id: "workbench.action.showGPUInfo",
      title: localize2("showGPUInfo", "Show GPU Info"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    nativeHostService.openGPUInfoWindow();
  }
}
class ShowContentTracingAction extends Action2 {
  static {
    __name(this, "ShowContentTracingAction");
  }
  constructor() {
    super({
      id: "workbench.action.showContentTracing",
      title: localize2("showContentTracing", "Show Content Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    nativeHostService.openContentTracingWindow();
  }
}
class StopTracing extends Action2 {
  static {
    __name(this, "StopTracing");
  }
  static {
    this.ID = "workbench.action.stopTracing";
  }
  constructor() {
    super({
      id: StopTracing.ID,
      title: localize2("stopTracing", "Stop Tracing"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const environmentService = accessor.get(INativeEnvironmentService);
    const dialogService = accessor.get(IDialogService);
    const nativeHostService = accessor.get(INativeHostService);
    const progressService = accessor.get(IProgressService);
    if (!environmentService.args.trace) {
      const { confirmed } = await dialogService.confirm({
        message: localize("stopTracing.message", "Tracing requires to launch with a '--trace' argument"),
        primaryButton: localize({ key: "stopTracing.button", comment: ["&& denotes a mnemonic"] }, "&&Relaunch and Enable Tracing")
      });
      if (confirmed) {
        return nativeHostService.relaunch({ addArgs: ["--trace"] });
      }
    }
    await progressService.withProgress({
      location: 20,
      title: localize("stopTracing.title", "Creating trace file..."),
      cancellable: false,
      detail: localize("stopTracing.detail", "This can take up to one minute to complete.")
    }, () => nativeHostService.stopTracing());
  }
}
export {
  ConfigureRuntimeArgumentsAction,
  OpenUserDataFolderAction,
  ReloadWindowWithExtensionsDisabledAction,
  ShowContentTracingAction,
  ShowGPUInfoAction,
  StopTracing,
  ToggleDevToolsAction
};
//# sourceMappingURL=developerActions.js.map
