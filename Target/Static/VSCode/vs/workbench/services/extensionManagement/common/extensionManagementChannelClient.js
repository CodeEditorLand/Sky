var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILocalExtension, IGalleryExtension, InstallOptions, UninstallOptions, Metadata, InstallExtensionResult, InstallExtensionInfo, IProductVersion, UninstallExtensionInfo, DidUninstallExtensionEvent, DidUpdateExtensionMetadata, InstallExtensionEvent, UninstallExtensionEvent, IAllowedExtensionsService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { URI } from "../../../../base/common/uri.js";
import { ExtensionIdentifier, ExtensionType, IExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { ExtensionManagementChannelClient as BaseExtensionManagementChannelClient } from "../../../../platform/extensionManagement/common/extensionManagementIpc.js";
import { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { DidChangeUserDataProfileEvent, IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { Emitter } from "../../../../base/common/event.js";
import { delta } from "../../../../base/common/arrays.js";
import { compare } from "../../../../base/common/strings.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from "./extensionManagement.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
class ProfileAwareExtensionManagementChannelClient extends BaseExtensionManagementChannelClient {
  constructor(channel, productService, allowedExtensionsService, userDataProfileService, uriIdentityService) {
    super(channel, productService, allowedExtensionsService);
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this._register(userDataProfileService.onDidChangeCurrentProfile((e) => {
      if (!this.uriIdentityService.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
        e.join(this.whenProfileChanged(e));
      }
    }));
  }
  static {
    __name(this, "ProfileAwareExtensionManagementChannelClient");
  }
  _onDidChangeProfile = this._register(new Emitter());
  onDidChangeProfile = this._onDidChangeProfile.event;
  _onDidProfileAwareInstallExtensions = this._register(new Emitter());
  get onProfileAwareDidInstallExtensions() {
    return this._onDidProfileAwareInstallExtensions.event;
  }
  _onDidProfileAwareUninstallExtension = this._register(new Emitter());
  get onProfileAwareDidUninstallExtension() {
    return this._onDidProfileAwareUninstallExtension.event;
  }
  _onDidProfileAwareUpdateExtensionMetadata = this._register(new Emitter());
  get onProfileAwareDidUpdateExtensionMetadata() {
    return this._onDidProfileAwareUpdateExtensionMetadata.event;
  }
  async onInstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onInstallExtension.fire(data);
    }
  }
  async onDidInstallExtensionsEvent(results) {
    const filtered = [];
    for (const e of results) {
      const result = this.filterEvent(e.profileLocation, e.applicationScoped ?? e.local?.isApplicationScoped ?? false);
      if (result instanceof Promise ? await result : result) {
        filtered.push(e);
      }
    }
    if (filtered.length) {
      this._onDidInstallExtensions.fire(filtered);
    }
    this._onDidProfileAwareInstallExtensions.fire(results);
  }
  async onUninstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onUninstallExtension.fire(data);
    }
  }
  async onDidUninstallExtensionEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onDidUninstallExtension.fire(data);
    }
    this._onDidProfileAwareUninstallExtension.fire(data);
  }
  async onDidUpdateExtensionMetadataEvent(data) {
    const result = this.filterEvent(data.profileLocation, data.local?.isApplicationScoped ?? false);
    if (result instanceof Promise ? await result : result) {
      this._onDidUpdateExtensionMetadata.fire(data);
    }
    this._onDidProfileAwareUpdateExtensionMetadata.fire(data);
  }
  async install(vsix, installOptions) {
    installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
    return super.install(vsix, installOptions);
  }
  async installFromLocation(location, profileLocation) {
    return super.installFromLocation(location, await this.getProfileLocation(profileLocation));
  }
  async installFromGallery(extension, installOptions) {
    installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
    return super.installFromGallery(extension, installOptions);
  }
  async installGalleryExtensions(extensions) {
    const infos = [];
    for (const extension of extensions) {
      infos.push({ ...extension, options: { ...extension.options, profileLocation: await this.getProfileLocation(extension.options?.profileLocation) } });
    }
    return super.installGalleryExtensions(infos);
  }
  async uninstall(extension, options) {
    options = { ...options, profileLocation: await this.getProfileLocation(options?.profileLocation) };
    return super.uninstall(extension, options);
  }
  async uninstallExtensions(extensions) {
    const infos = [];
    for (const { extension, options } of extensions) {
      infos.push({ extension, options: { ...options, profileLocation: await this.getProfileLocation(options?.profileLocation) } });
    }
    return super.uninstallExtensions(infos);
  }
  async getInstalled(type = null, extensionsProfileResource, productVersion) {
    return super.getInstalled(type, await this.getProfileLocation(extensionsProfileResource), productVersion);
  }
  async updateMetadata(local, metadata, extensionsProfileResource) {
    return super.updateMetadata(local, metadata, await this.getProfileLocation(extensionsProfileResource));
  }
  async toggleAppliationScope(local, fromProfileLocation) {
    return super.toggleAppliationScope(local, await this.getProfileLocation(fromProfileLocation));
  }
  async copyExtensions(fromProfileLocation, toProfileLocation) {
    return super.copyExtensions(await this.getProfileLocation(fromProfileLocation), await this.getProfileLocation(toProfileLocation));
  }
  async whenProfileChanged(e) {
    const previousProfileLocation = await this.getProfileLocation(e.previous.extensionsResource);
    const currentProfileLocation = await this.getProfileLocation(e.profile.extensionsResource);
    if (this.uriIdentityService.extUri.isEqual(previousProfileLocation, currentProfileLocation)) {
      return;
    }
    const eventData = await this.switchExtensionsProfile(previousProfileLocation, currentProfileLocation);
    this._onDidChangeProfile.fire(eventData);
  }
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    const oldExtensions = await this.getInstalled(ExtensionType.User, previousProfileLocation);
    const newExtensions = await this.getInstalled(ExtensionType.User, currentProfileLocation);
    if (preserveExtensions?.length) {
      const extensionsToInstall = [];
      for (const extension of oldExtensions) {
        if (preserveExtensions.some((id) => ExtensionIdentifier.equals(extension.identifier.id, id)) && !newExtensions.some((e) => ExtensionIdentifier.equals(e.identifier.id, extension.identifier.id))) {
          extensionsToInstall.push(extension.identifier);
        }
      }
      if (extensionsToInstall.length) {
        await this.installExtensionsFromProfile(extensionsToInstall, previousProfileLocation, currentProfileLocation);
      }
    }
    return delta(oldExtensions, newExtensions, (a, b) => compare(`${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
  }
  async getProfileLocation(profileLocation) {
    return profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
  }
}
export {
  ProfileAwareExtensionManagementChannelClient
};
//# sourceMappingURL=extensionManagementChannelClient.js.map
