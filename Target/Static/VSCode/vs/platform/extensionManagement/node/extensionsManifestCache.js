var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { DidUninstallExtensionEvent, IExtensionManagementService, InstallExtensionResult } from "../common/extensionManagement.js";
import { USER_MANIFEST_CACHE_FILE } from "../../extensions/common/extensions.js";
import { FileOperationResult, IFileService, toFileOperationResult } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfile, IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
class ExtensionsManifestCache extends Disposable {
  constructor(userDataProfilesService, fileService, uriIdentityService, extensionsManagementService, logService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._register(extensionsManagementService.onDidInstallExtensions((e) => this.onDidInstallExtensions(e)));
    this._register(extensionsManagementService.onDidUninstallExtension((e) => this.onDidUnInstallExtension(e)));
  }
  static {
    __name(this, "ExtensionsManifestCache");
  }
  onDidInstallExtensions(results) {
    for (const r of results) {
      if (r.local) {
        this.invalidate(r.profileLocation);
      }
    }
  }
  onDidUnInstallExtension(e) {
    if (!e.error) {
      this.invalidate(e.profileLocation);
    }
  }
  async invalidate(extensionsManifestLocation) {
    if (extensionsManifestLocation) {
      for (const profile of this.userDataProfilesService.profiles) {
        if (this.uriIdentityService.extUri.isEqual(profile.extensionsResource, extensionsManifestLocation)) {
          await this.deleteUserCacheFile(profile);
        }
      }
    } else {
      await this.deleteUserCacheFile(this.userDataProfilesService.defaultProfile);
    }
  }
  async deleteUserCacheFile(profile) {
    try {
      await this.fileService.del(this.uriIdentityService.extUri.joinPath(profile.cacheHome, USER_MANIFEST_CACHE_FILE));
    } catch (error) {
      if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
        this.logService.error(error);
      }
    }
  }
}
export {
  ExtensionsManifestCache
};
//# sourceMappingURL=extensionsManifestCache.js.map
