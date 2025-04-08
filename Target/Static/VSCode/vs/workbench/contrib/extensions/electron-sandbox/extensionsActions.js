var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../nls.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { URI } from "../../../../base/common/uri.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Schemas } from "../../../../base/common/network.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ExtensionsLocalizedLabel, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
class OpenExtensionsFolderAction extends Action2 {
  static {
    __name(this, "OpenExtensionsFolderAction");
  }
  constructor() {
    super({
      id: "workbench.extensions.action.openExtensionsFolder",
      title: localize2("openExtensionsFolder", "Open Extensions Folder"),
      category: ExtensionsLocalizedLabel,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const fileService = accessor.get(IFileService);
    const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
    const extensionsHome = URI.file(environmentService.extensionsPath);
    const file = await fileService.resolve(extensionsHome);
    let itemToShow;
    if (file.children && file.children.length > 0) {
      itemToShow = file.children[0].resource;
    } else {
      itemToShow = extensionsHome;
    }
    if (itemToShow.scheme === Schemas.file) {
      return nativeHostService.showItemInFolder(itemToShow.fsPath);
    }
  }
}
class CleanUpExtensionsFolderAction extends Action2 {
  static {
    __name(this, "CleanUpExtensionsFolderAction");
  }
  constructor() {
    super({
      id: "_workbench.extensions.action.cleanUpExtensionsFolder",
      title: localize2("cleanUpExtensionsFolder", "Cleanup Extensions Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const extensionManagementService = accessor.get(IExtensionManagementService);
    return extensionManagementService.cleanUp();
  }
}
export {
  CleanUpExtensionsFolderAction,
  OpenExtensionsFolderAction
};
//# sourceMappingURL=extensionsActions.js.map
