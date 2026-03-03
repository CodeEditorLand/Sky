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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT, IExtensionGalleryService, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS } from "../../../../platform/remote/common/remote.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteExtensionsScannerService } from "../../../../platform/remote/common/remoteExtensionsScanner.js";
import { IStorageService, IS_NEW_KEY } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { AbstractExtensionsInitializer } from "../../../../platform/userDataSync/common/extensionsSync.js";
import { IIgnoredExtensionsManagementService } from "../../../../platform/userDataSync/common/ignoredExtensions.js";
import { IUserDataSyncEnablementService, IUserDataSyncStoreManagementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { UserDataSyncStoreClient } from "../../../../platform/userDataSync/common/userDataSyncStoreService.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionManifestPropertiesService } from "../../../services/extensions/common/extensionManifestPropertiesService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
let InstallRemoteExtensionsContribution = class InstallRemoteExtensionsContribution2 {
  static {
    __name(this, "InstallRemoteExtensionsContribution");
  }
  constructor(remoteAgentService, remoteExtensionsScannerService, extensionGalleryService, extensionManagementServerService, extensionsWorkbenchService, logService, configurationService) {
    this.remoteAgentService = remoteAgentService;
    this.remoteExtensionsScannerService = remoteExtensionsScannerService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.installExtensionsIfInstalledLocallyInRemote();
    this.installFailedRemoteExtensions();
  }
  async installExtensionsIfInstalledLocallyInRemote() {
    if (!this.remoteAgentService.getConnection()) {
      return;
    }
    if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
      this.logService.error("No remote extension management server available");
      return;
    }
    if (!this.extensionManagementServerService.localExtensionManagementServer) {
      this.logService.error("No local extension management server available");
      return;
    }
    const settingValue = this.configurationService.getValue(REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS);
    if (!settingValue?.length) {
      return;
    }
    const alreadyInstalledLocally = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.localExtensionManagementServer);
    const alreadyInstalledRemotely = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.remoteExtensionManagementServer);
    const extensionsToInstall = alreadyInstalledLocally.filter((ext) => settingValue.some((id) => areSameExtensions(ext.identifier, { id }))).filter((ext) => !alreadyInstalledRemotely.some((e) => areSameExtensions(e.identifier, ext.identifier)));
    if (!extensionsToInstall.length) {
      return;
    }
    await Promise.allSettled(extensionsToInstall.map((ext) => {
      this.extensionsWorkbenchService.installInServer(ext, this.extensionManagementServerService.remoteExtensionManagementServer, { donotIncludePackAndDependencies: true });
    }));
  }
  async installFailedRemoteExtensions() {
    if (!this.remoteAgentService.getConnection()) {
      return;
    }
    const { failed } = await this.remoteExtensionsScannerService.whenExtensionsReady();
    if (failed.length === 0) {
      this.logService.trace("No extensions relayed from server");
      return;
    }
    if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
      this.logService.error("No remote extension management server available");
      return;
    }
    this.logService.info(`Installing '${failed.length}' extensions relayed from server`);
    const galleryExtensions = await this.extensionGalleryService.getExtensions(failed.map(({ id }) => ({ id })), CancellationToken.None);
    const installExtensionInfo = [];
    for (const { id, installOptions } of failed) {
      const extension = galleryExtensions.find((e) => areSameExtensions(e.identifier, { id }));
      if (extension) {
        installExtensionInfo.push({
          extension,
          options: {
            ...installOptions,
            downloadExtensionsLocally: true
          }
        });
      } else {
        this.logService.warn(`Relayed failed extension '${id}' from server is not found in the gallery`);
      }
    }
    if (installExtensionInfo.length) {
      await Promise.allSettled(installExtensionInfo.map((e) => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(e.extension, e.options)));
    }
  }
};
InstallRemoteExtensionsContribution = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IRemoteExtensionsScannerService),
  __param(2, IExtensionGalleryService),
  __param(3, IExtensionManagementServerService),
  __param(4, IExtensionsWorkbenchService),
  __param(5, ILogService),
  __param(6, IConfigurationService)
], InstallRemoteExtensionsContribution);
let RemoteExtensionsInitializerContribution = class RemoteExtensionsInitializerContribution2 {
  static {
    __name(this, "RemoteExtensionsInitializerContribution");
  }
  constructor(extensionManagementServerService, storageService, remoteAgentService, userDataSyncStoreManagementService, instantiationService, logService, authenticationService, remoteAuthorityResolverService, userDataSyncEnablementService) {
    this.extensionManagementServerService = extensionManagementServerService;
    this.storageService = storageService;
    this.remoteAgentService = remoteAgentService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.authenticationService = authenticationService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.initializeRemoteExtensions();
  }
  async initializeRemoteExtensions() {
    const connection = this.remoteAgentService.getConnection();
    const localExtensionManagementServer = this.extensionManagementServerService.localExtensionManagementServer;
    const remoteExtensionManagementServer = this.extensionManagementServerService.remoteExtensionManagementServer;
    if (!connection || !remoteExtensionManagementServer) {
      return;
    }
    if (!localExtensionManagementServer) {
      return;
    }
    if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
      return;
    }
    const newRemoteConnectionKey = `${IS_NEW_KEY}.${connection.remoteAuthority}`;
    if (!this.storageService.getBoolean(newRemoteConnectionKey, -1, true)) {
      this.logService.trace(`Skipping initializing remote extensions because the window with this remote authority was opened before.`);
      return;
    }
    this.storageService.store(
      newRemoteConnectionKey,
      false,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
    if (!this.storageService.isNew(
      1
      /* StorageScope.WORKSPACE */
    )) {
      this.logService.trace(`Skipping initializing remote extensions because this workspace was opened before.`);
      return;
    }
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    const resolvedAuthority = await this.remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
    if (!resolvedAuthority.options?.authenticationSession) {
      return;
    }
    const sessions = await this.authenticationService.getSessions(resolvedAuthority.options?.authenticationSession.providerId);
    const session = sessions.find((s) => s.id === resolvedAuthority.options?.authenticationSession?.id);
    if (!session) {
      this.logService.info("Skipping initializing remote extensions because the account with given session id is not found", resolvedAuthority.options.authenticationSession.id);
      return;
    }
    const userDataSyncStoreClient = this.instantiationService.createInstance(UserDataSyncStoreClient, this.userDataSyncStoreManagementService.userDataSyncStore.url);
    userDataSyncStoreClient.setAuthToken(session.accessToken, resolvedAuthority.options.authenticationSession.providerId);
    const userData = await userDataSyncStoreClient.readResource("extensions", null);
    const serviceCollection = new ServiceCollection();
    serviceCollection.set(IExtensionManagementService, remoteExtensionManagementServer.extensionManagementService);
    const instantiationService = this.instantiationService.createChild(serviceCollection);
    const extensionsToInstallInitializer = instantiationService.createInstance(RemoteExtensionsInitializer);
    await extensionsToInstallInitializer.initialize(userData);
  }
};
RemoteExtensionsInitializerContribution = __decorate([
  __param(0, IExtensionManagementServerService),
  __param(1, IStorageService),
  __param(2, IRemoteAgentService),
  __param(3, IUserDataSyncStoreManagementService),
  __param(4, IInstantiationService),
  __param(5, ILogService),
  __param(6, IAuthenticationService),
  __param(7, IRemoteAuthorityResolverService),
  __param(8, IUserDataSyncEnablementService)
], RemoteExtensionsInitializerContribution);
let RemoteExtensionsInitializer = class RemoteExtensionsInitializer2 extends AbstractExtensionsInitializer {
  static {
    __name(this, "RemoteExtensionsInitializer");
  }
  constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService, extensionGalleryService, storageService, extensionManifestPropertiesService) {
    super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
    this.extensionGalleryService = extensionGalleryService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
  }
  async doInitialize(remoteUserData) {
    const remoteExtensions = await this.parseExtensions(remoteUserData);
    if (!remoteExtensions) {
      this.logService.info("No synced extensions exist while initializing remote extensions.");
      return;
    }
    const installedExtensions = await this.extensionManagementService.getInstalled();
    const { newExtensions } = this.generatePreview(remoteExtensions, installedExtensions);
    if (!newExtensions.length) {
      this.logService.trace("No new remote extensions to install.");
      return;
    }
    const targetPlatform = await this.extensionManagementService.getTargetPlatform();
    const extensionsToInstall = await this.extensionGalleryService.getExtensions(newExtensions, { targetPlatform, compatible: true }, CancellationToken.None);
    if (extensionsToInstall.length) {
      await Promise.allSettled(extensionsToInstall.map(async (e) => {
        const manifest = await this.extensionGalleryService.getManifest(e, CancellationToken.None);
        if (manifest && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
          const syncedExtension = remoteExtensions.find((e2) => areSameExtensions(e2.identifier, e2.identifier));
          await this.extensionManagementService.installFromGallery(e, { installPreReleaseVersion: syncedExtension?.preRelease, donotIncludePackAndDependencies: true, context: { [EXTENSION_INSTALL_SKIP_PUBLISHER_TRUST_CONTEXT]: true } });
        }
      }));
    }
  }
};
RemoteExtensionsInitializer = __decorate([
  __param(0, IExtensionManagementService),
  __param(1, IIgnoredExtensionsManagementService),
  __param(2, IFileService),
  __param(3, IUserDataProfilesService),
  __param(4, IEnvironmentService),
  __param(5, ILogService),
  __param(6, IUriIdentityService),
  __param(7, IExtensionGalleryService),
  __param(8, IStorageService),
  __param(9, IExtensionManifestPropertiesService)
], RemoteExtensionsInitializer);
export {
  InstallRemoteExtensionsContribution,
  RemoteExtensionsInitializerContribution
};
//# sourceMappingURL=remoteExtensionsInit.js.map
