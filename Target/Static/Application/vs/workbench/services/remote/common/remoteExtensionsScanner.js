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
import { IRemoteAgentService } from "./remoteAgentService.js";
import { IRemoteExtensionsScannerService, RemoteExtensionsScannerChannelName } from "../../../../platform/remote/common/remoteExtensionsScanner.js";
import * as platform from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IRemoteUserDataProfilesService } from "../../userDataProfile/common/remoteUserDataProfiles.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IActiveLanguagePackService } from "../../localization/common/locale.js";
import { IWorkbenchExtensionManagementService } from "../../extensionManagement/common/extensionManagement.js";
let RemoteExtensionsScannerService = class RemoteExtensionsScannerService2 {
  static {
    __name(this, "RemoteExtensionsScannerService");
  }
  constructor(remoteAgentService, environmentService, userDataProfileService, remoteUserDataProfilesService, activeLanguagePackService, extensionManagementService, logService) {
    this.remoteAgentService = remoteAgentService;
    this.environmentService = environmentService;
    this.userDataProfileService = userDataProfileService;
    this.remoteUserDataProfilesService = remoteUserDataProfilesService;
    this.activeLanguagePackService = activeLanguagePackService;
    this.extensionManagementService = extensionManagementService;
    this.logService = logService;
  }
  whenExtensionsReady() {
    return this.withChannel((channel) => channel.call("whenExtensionsReady"), { failed: [] });
  }
  async scanExtensions() {
    try {
      const languagePack = await this.activeLanguagePackService.getExtensionIdProvidingCurrentLocale();
      return await this.withChannel(async (channel) => {
        const profileLocation = this.userDataProfileService.currentProfile.isDefault ? void 0 : (await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile)).extensionsResource;
        const scannedExtensions = await channel.call("scanExtensions", [
          platform.language,
          profileLocation,
          this.extensionManagementService.getInstalledWorkspaceExtensionLocations(),
          this.environmentService.extensionDevelopmentLocationURI,
          languagePack
        ]);
        scannedExtensions.forEach((extension) => {
          extension.extensionLocation = URI.revive(extension.extensionLocation);
        });
        return scannedExtensions;
      }, []);
    } catch (error) {
      this.logService.error(error);
      return [];
    }
  }
  withChannel(callback, fallback) {
    const connection = this.remoteAgentService.getConnection();
    if (!connection) {
      return Promise.resolve(fallback);
    }
    return connection.withChannel(RemoteExtensionsScannerChannelName, (channel) => callback(channel));
  }
};
RemoteExtensionsScannerService = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IWorkbenchEnvironmentService),
  __param(2, IUserDataProfileService),
  __param(3, IRemoteUserDataProfilesService),
  __param(4, IActiveLanguagePackService),
  __param(5, IWorkbenchExtensionManagementService),
  __param(6, ILogService)
], RemoteExtensionsScannerService);
registerSingleton(
  IRemoteExtensionsScannerService,
  RemoteExtensionsScannerService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=remoteExtensionsScanner.js.map
