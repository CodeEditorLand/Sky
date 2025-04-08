var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { localize } from "../../../../nls.js";
import { IExtensionGalleryService, IExtensionManagementService, IGalleryExtension } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
let InstallExtensionQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(extensionsWorkbenchService, galleryService, extensionsService, notificationService, logService) {
    super(InstallExtensionQuickAccessProvider.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.galleryService = galleryService;
    this.extensionsService = extensionsService;
    this.notificationService = notificationService;
    this.logService = logService;
  }
  static {
    __name(this, "InstallExtensionQuickAccessProvider");
  }
  static PREFIX = "ext install ";
  _getPicks(filter, disposables, token) {
    if (!filter) {
      return [{
        label: localize("type", "Type an extension name to install or search.")
      }];
    }
    const genericSearchPickItem = {
      label: localize("searchFor", "Press Enter to search for extension '{0}'.", filter),
      accept: /* @__PURE__ */ __name(() => this.extensionsWorkbenchService.openSearch(filter), "accept")
    };
    if (/\./.test(filter)) {
      return this.getPicksForExtensionId(filter, genericSearchPickItem, token);
    }
    return [genericSearchPickItem];
  }
  async getPicksForExtensionId(filter, fallback, token) {
    try {
      const [galleryExtension] = await this.galleryService.getExtensions([{ id: filter }], token);
      if (token.isCancellationRequested) {
        return [];
      }
      if (!galleryExtension) {
        return [fallback];
      }
      return [{
        label: localize("install", "Press Enter to install extension '{0}'.", filter),
        accept: /* @__PURE__ */ __name(() => this.installExtension(galleryExtension, filter), "accept")
      }];
    } catch (error) {
      if (token.isCancellationRequested) {
        return [];
      }
      this.logService.error(error);
      return [fallback];
    }
  }
  async installExtension(extension, name) {
    try {
      await this.extensionsWorkbenchService.openSearch(`@id:${name}`);
      await this.extensionsService.installFromGallery(extension);
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};
InstallExtensionQuickAccessProvider = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ILogService)
], InstallExtensionQuickAccessProvider);
let ManageExtensionsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(extensionsWorkbenchService) {
    super(ManageExtensionsQuickAccessProvider.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  static {
    __name(this, "ManageExtensionsQuickAccessProvider");
  }
  static PREFIX = "ext ";
  _getPicks() {
    return [{
      label: localize("manage", "Press Enter to manage your extensions."),
      accept: /* @__PURE__ */ __name(() => this.extensionsWorkbenchService.openSearch(""), "accept")
    }];
  }
};
ManageExtensionsQuickAccessProvider = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService)
], ManageExtensionsQuickAccessProvider);
export {
  InstallExtensionQuickAccessProvider,
  ManageExtensionsQuickAccessProvider
};
//# sourceMappingURL=extensionsQuickAccess.js.map
