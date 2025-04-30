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
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { localize2 } from "../../../../nls.js";
const VIEWLET_ID = "workbench.view.extensions";
const EXTENSIONS_CATEGORY = localize2("extensions", "Extensions");
var ExtensionState;
(function(ExtensionState2) {
  ExtensionState2[ExtensionState2["Installing"] = 0] = "Installing";
  ExtensionState2[ExtensionState2["Installed"] = 1] = "Installed";
  ExtensionState2[ExtensionState2["Uninstalling"] = 2] = "Uninstalling";
  ExtensionState2[ExtensionState2["Uninstalled"] = 3] = "Uninstalled";
})(ExtensionState || (ExtensionState = {}));
var ExtensionRuntimeActionType;
(function(ExtensionRuntimeActionType2) {
  ExtensionRuntimeActionType2["ReloadWindow"] = "reloadWindow";
  ExtensionRuntimeActionType2["RestartExtensions"] = "restartExtensions";
  ExtensionRuntimeActionType2["DownloadUpdate"] = "downloadUpdate";
  ExtensionRuntimeActionType2["ApplyUpdate"] = "applyUpdate";
  ExtensionRuntimeActionType2["QuitAndInstall"] = "quitAndInstall";
})(ExtensionRuntimeActionType || (ExtensionRuntimeActionType = {}));
const IExtensionsWorkbenchService = createDecorator("extensionsWorkbenchService");
var ExtensionEditorTab;
(function(ExtensionEditorTab2) {
  ExtensionEditorTab2["Readme"] = "readme";
  ExtensionEditorTab2["Features"] = "features";
  ExtensionEditorTab2["Changelog"] = "changelog";
  ExtensionEditorTab2["Dependencies"] = "dependencies";
  ExtensionEditorTab2["ExtensionPack"] = "extensionPack";
})(ExtensionEditorTab || (ExtensionEditorTab = {}));
const ConfigurationKey = "extensions";
const AutoUpdateConfigurationKey = "extensions.autoUpdate";
const AutoCheckUpdatesConfigurationKey = "extensions.autoCheckUpdates";
const CloseExtensionDetailsOnViewChangeKey = "extensions.closeExtensionDetailsOnViewChange";
const AutoRestartConfigurationKey = "extensions.autoRestart";
let ExtensionContainers = class ExtensionContainers2 extends Disposable {
  static {
    __name(this, "ExtensionContainers");
  }
  constructor(containers, extensionsWorkbenchService) {
    super();
    this.containers = containers;
    this._register(extensionsWorkbenchService.onChange(this.update, this));
  }
  set extension(extension) {
    this.containers.forEach((c) => c.extension = extension);
  }
  update(extension) {
    for (const container of this.containers) {
      if (extension && container.extension) {
        if (areSameExtensions(container.extension.identifier, extension.identifier)) {
          if (container.extension.server && extension.server && container.extension.server !== extension.server) {
            if (container.updateWhenCounterExtensionChanges) {
              container.update();
            }
          } else {
            container.extension = extension;
          }
        }
      } else {
        container.update();
      }
    }
  }
};
ExtensionContainers = __decorate([
  __param(1, IExtensionsWorkbenchService)
], ExtensionContainers);
const WORKSPACE_RECOMMENDATIONS_VIEW_ID = "workbench.views.extensions.workspaceRecommendations";
const OUTDATED_EXTENSIONS_VIEW_ID = "workbench.views.extensions.searchOutdated";
const TOGGLE_IGNORE_EXTENSION_ACTION_ID = "workbench.extensions.action.toggleIgnoreExtension";
const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = "workbench.extensions.action.installVSIX";
const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = "workbench.extensions.command.installFromVSIX";
const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = "workbench.extensions.action.listWorkspaceUnsupportedExtensions";
const HasOutdatedExtensionsContext = new RawContextKey("hasOutdatedExtensions", false);
const CONTEXT_HAS_GALLERY = new RawContextKey("hasGallery", false);
const ExtensionResultsListFocused = new RawContextKey("extensionResultListFocused ", true);
const THEME_ACTIONS_GROUP = "_theme_";
const INSTALL_ACTIONS_GROUP = "0_install";
const UPDATE_ACTIONS_GROUP = "0_update";
const extensionsSearchActionsMenu = new MenuId("extensionsSearchActionsMenu");
export {
  AutoCheckUpdatesConfigurationKey,
  AutoRestartConfigurationKey,
  AutoUpdateConfigurationKey,
  CONTEXT_HAS_GALLERY,
  CloseExtensionDetailsOnViewChangeKey,
  ConfigurationKey,
  EXTENSIONS_CATEGORY,
  ExtensionContainers,
  ExtensionEditorTab,
  ExtensionResultsListFocused,
  ExtensionRuntimeActionType,
  ExtensionState,
  HasOutdatedExtensionsContext,
  IExtensionsWorkbenchService,
  INSTALL_ACTIONS_GROUP,
  INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
  LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
  OUTDATED_EXTENSIONS_VIEW_ID,
  SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
  THEME_ACTIONS_GROUP,
  TOGGLE_IGNORE_EXTENSION_ACTION_ID,
  UPDATE_ACTIONS_GROUP,
  VIEWLET_ID,
  WORKSPACE_RECOMMENDATIONS_VIEW_ID,
  extensionsSearchActionsMenu
};
//# sourceMappingURL=extensions.js.map
