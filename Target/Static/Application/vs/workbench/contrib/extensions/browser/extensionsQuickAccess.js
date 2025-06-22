var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { localize } from "../../../../nls.js";
import { IExtensionGalleryService, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
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
var InstallExtensionQuickAccessProvider_1;
var ManageExtensionsQuickAccessProvider_1;
let InstallExtensionQuickAccessProvider = class InstallExtensionQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "InstallExtensionQuickAccessProvider");
  }
  static {
    InstallExtensionQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "ext install ";
  }
  constructor(extensionsWorkbenchService, galleryService, extensionsService, notificationService, logService) {
    super(InstallExtensionQuickAccessProvider_1.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.galleryService = galleryService;
    this.extensionsService = extensionsService;
    this.notificationService = notificationService;
    this.logService = logService;
  }
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
InstallExtensionQuickAccessProvider = InstallExtensionQuickAccessProvider_1 = __decorate([
  __param(0, IExtensionsWorkbenchService),
  __param(1, IExtensionGalleryService),
  __param(2, IExtensionManagementService),
  __param(3, INotificationService),
  __param(4, ILogService)
], InstallExtensionQuickAccessProvider);
let ManageExtensionsQuickAccessProvider = class ManageExtensionsQuickAccessProvider2 extends PickerQuickAccessProvider {
  static {
    __name(this, "ManageExtensionsQuickAccessProvider");
  }
  static {
    ManageExtensionsQuickAccessProvider_1 = this;
  }
  static {
    this.PREFIX = "ext ";
  }
  constructor(extensionsWorkbenchService) {
    super(ManageExtensionsQuickAccessProvider_1.PREFIX);
    this.extensionsWorkbenchService = extensionsWorkbenchService;
  }
  _getPicks() {
    return [{
      label: localize("manage", "Press Enter to manage your extensions."),
      accept: /* @__PURE__ */ __name(() => this.extensionsWorkbenchService.openSearch(""), "accept")
    }];
  }
};
ManageExtensionsQuickAccessProvider = ManageExtensionsQuickAccessProvider_1 = __decorate([
  __param(0, IExtensionsWorkbenchService)
], ManageExtensionsQuickAccessProvider);
export {
  InstallExtensionQuickAccessProvider,
  ManageExtensionsQuickAccessProvider
};
//# sourceMappingURL=extensionsQuickAccess.js.map
