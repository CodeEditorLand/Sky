var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { cloneAndChange } from "../../../base/common/objects.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { DefaultURITransformer, IURITransformer, transformAndReviveIncomingURIs } from "../../../base/common/uriIpc.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import {
  IExtensionIdentifier,
  IExtensionTipsService,
  IGalleryExtension,
  ILocalExtension,
  IExtensionsControlManifest,
  InstallOptions,
  UninstallOptions,
  Metadata,
  IExtensionManagementService,
  DidUninstallExtensionEvent,
  InstallExtensionEvent,
  InstallExtensionResult,
  UninstallExtensionEvent,
  InstallOperation,
  InstallExtensionInfo,
  IProductVersion,
  DidUpdateExtensionMetadata,
  UninstallExtensionInfo,
  IAllowedExtensionsService
} from "./extensionManagement.js";
import { ExtensionType, IExtensionManifest, TargetPlatform } from "../../extensions/common/extensions.js";
import { IProductService } from "../../product/common/productService.js";
import { CommontExtensionManagementService } from "./abstractExtensionManagementService.js";
function transformIncomingURI(uri, transformer) {
  return uri ? URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : void 0;
}
__name(transformIncomingURI, "transformIncomingURI");
function transformOutgoingURI(uri, transformer) {
  return transformer ? transformer.transformOutgoingURI(uri) : uri;
}
__name(transformOutgoingURI, "transformOutgoingURI");
function transformIncomingExtension(extension, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = extension.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...extension, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}
__name(transformIncomingExtension, "transformIncomingExtension");
function transformIncomingOptions(options, transformer) {
  return options?.profileLocation ? transformAndReviveIncomingURIs(options, transformer ?? DefaultURITransformer) : options;
}
__name(transformIncomingOptions, "transformIncomingOptions");
function transformOutgoingExtension(extension, transformer) {
  return transformer ? cloneAndChange(extension, (value) => value instanceof URI ? transformer.transformOutgoingURI(value) : void 0) : extension;
}
__name(transformOutgoingExtension, "transformOutgoingExtension");
class ExtensionManagementChannel {
  constructor(service, getUriTransformer) {
    this.service = service;
    this.getUriTransformer = getUriTransformer;
    this.onInstallExtension = Event.buffer(service.onInstallExtension, true);
    this.onDidInstallExtensions = Event.buffer(service.onDidInstallExtensions, true);
    this.onUninstallExtension = Event.buffer(service.onUninstallExtension, true);
    this.onDidUninstallExtension = Event.buffer(service.onDidUninstallExtension, true);
    this.onDidUpdateExtensionMetadata = Event.buffer(service.onDidUpdateExtensionMetadata, true);
  }
  static {
    __name(this, "ExtensionManagementChannel");
  }
  onInstallExtension;
  onDidInstallExtensions;
  onUninstallExtension;
  onDidUninstallExtension;
  onDidUpdateExtensionMetadata;
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onInstallExtension": {
        return Event.map(this.onInstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidInstallExtensions": {
        return Event.map(this.onDidInstallExtensions, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
          profileLocation: i.profileLocation ? transformOutgoingURI(i.profileLocation, uriTransformer) : i.profileLocation
        })));
      }
      case "onUninstallExtension": {
        return Event.map(this.onUninstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidUninstallExtension": {
        return Event.map(this.onDidUninstallExtension, (e) => {
          return {
            ...e,
            profileLocation: e.profileLocation ? transformOutgoingURI(e.profileLocation, uriTransformer) : e.profileLocation
          };
        });
      }
      case "onDidUpdateExtensionMetadata": {
        return Event.map(this.onDidUpdateExtensionMetadata, (e) => {
          return {
            local: transformOutgoingExtension(e.local, uriTransformer),
            profileLocation: transformOutgoingURI(e.profileLocation, uriTransformer)
          };
        });
      }
    }
    throw new Error("Invalid listen");
  }
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer(context);
    switch (command) {
      case "zip": {
        const extension = transformIncomingExtension(args[0], uriTransformer);
        const uri = await this.service.zip(extension);
        return transformOutgoingURI(uri, uriTransformer);
      }
      case "install": {
        return this.service.install(transformIncomingURI(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
      }
      case "installFromLocation": {
        return this.service.installFromLocation(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
      }
      case "installExtensionsFromProfile": {
        return this.service.installExtensionsFromProfile(args[0], transformIncomingURI(args[1], uriTransformer), transformIncomingURI(args[2], uriTransformer));
      }
      case "getManifest": {
        return this.service.getManifest(transformIncomingURI(args[0], uriTransformer));
      }
      case "getTargetPlatform": {
        return this.service.getTargetPlatform();
      }
      case "installFromGallery": {
        return this.service.installFromGallery(args[0], transformIncomingOptions(args[1], uriTransformer));
      }
      case "installGalleryExtensions": {
        const arg = args[0];
        return this.service.installGalleryExtensions(arg.map(({ extension, options }) => ({ extension, options: transformIncomingOptions(options, uriTransformer) ?? {} })));
      }
      case "uninstall": {
        return this.service.uninstall(transformIncomingExtension(args[0], uriTransformer), transformIncomingOptions(args[1], uriTransformer));
      }
      case "uninstallExtensions": {
        const arg = args[0];
        return this.service.uninstallExtensions(arg.map(({ extension, options }) => ({ extension: transformIncomingExtension(extension, uriTransformer), options: transformIncomingOptions(options, uriTransformer) })));
      }
      case "getInstalled": {
        const extensions = await this.service.getInstalled(args[0], transformIncomingURI(args[1], uriTransformer), args[2]);
        return extensions.map((e) => transformOutgoingExtension(e, uriTransformer));
      }
      case "toggleAppliationScope": {
        const extension = await this.service.toggleAppliationScope(transformIncomingExtension(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
        return transformOutgoingExtension(extension, uriTransformer);
      }
      case "copyExtensions": {
        return this.service.copyExtensions(transformIncomingURI(args[0], uriTransformer), transformIncomingURI(args[1], uriTransformer));
      }
      case "updateMetadata": {
        const e = await this.service.updateMetadata(transformIncomingExtension(args[0], uriTransformer), args[1], transformIncomingURI(args[2], uriTransformer));
        return transformOutgoingExtension(e, uriTransformer);
      }
      case "resetPinnedStateForAllUserExtensions": {
        return this.service.resetPinnedStateForAllUserExtensions(args[0]);
      }
      case "getExtensionsControlManifest": {
        return this.service.getExtensionsControlManifest();
      }
      case "download": {
        return this.service.download(args[0], args[1], args[2]);
      }
      case "cleanUp": {
        return this.service.cleanUp();
      }
    }
    throw new Error("Invalid call");
  }
}
class ExtensionManagementChannelClient extends CommontExtensionManagementService {
  constructor(channel, productService, allowedExtensionsService) {
    super(productService, allowedExtensionsService);
    this.channel = channel;
    this._register(this.channel.listen("onInstallExtension")((e) => this.onInstallExtensionEvent({ ...e, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidInstallExtensions")((results) => this.onDidInstallExtensionsEvent(results.map((e) => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) })))));
    this._register(this.channel.listen("onUninstallExtension")((e) => this.onUninstallExtensionEvent({ ...e, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidUninstallExtension")((e) => this.onDidUninstallExtensionEvent({ ...e, profileLocation: URI.revive(e.profileLocation) })));
    this._register(this.channel.listen("onDidUpdateExtensionMetadata")((e) => this.onDidUpdateExtensionMetadataEvent({ profileLocation: URI.revive(e.profileLocation), local: transformIncomingExtension(e.local, null) })));
  }
  static {
    __name(this, "ExtensionManagementChannelClient");
  }
  _onInstallExtension = this._register(new Emitter());
  get onInstallExtension() {
    return this._onInstallExtension.event;
  }
  _onDidInstallExtensions = this._register(new Emitter());
  get onDidInstallExtensions() {
    return this._onDidInstallExtensions.event;
  }
  _onUninstallExtension = this._register(new Emitter());
  get onUninstallExtension() {
    return this._onUninstallExtension.event;
  }
  _onDidUninstallExtension = this._register(new Emitter());
  get onDidUninstallExtension() {
    return this._onDidUninstallExtension.event;
  }
  _onDidUpdateExtensionMetadata = this._register(new Emitter());
  get onDidUpdateExtensionMetadata() {
    return this._onDidUpdateExtensionMetadata.event;
  }
  onInstallExtensionEvent(event) {
    this._onInstallExtension.fire(event);
  }
  onDidInstallExtensionsEvent(results) {
    this._onDidInstallExtensions.fire(results);
  }
  onUninstallExtensionEvent(event) {
    this._onUninstallExtension.fire(event);
  }
  onDidUninstallExtensionEvent(event) {
    this._onDidUninstallExtension.fire(event);
  }
  onDidUpdateExtensionMetadataEvent(event) {
    this._onDidUpdateExtensionMetadata.fire(event);
  }
  isUriComponents(thing) {
    if (!thing) {
      return false;
    }
    return typeof thing.path === "string" && typeof thing.scheme === "string";
  }
  _targetPlatformPromise;
  getTargetPlatform() {
    if (!this._targetPlatformPromise) {
      this._targetPlatformPromise = this.channel.call("getTargetPlatform");
    }
    return this._targetPlatformPromise;
  }
  zip(extension) {
    return Promise.resolve(this.channel.call("zip", [extension]).then((result) => URI.revive(result)));
  }
  install(vsix, options) {
    return Promise.resolve(this.channel.call("install", [vsix, options])).then((local) => transformIncomingExtension(local, null));
  }
  installFromLocation(location, profileLocation) {
    return Promise.resolve(this.channel.call("installFromLocation", [location, profileLocation])).then((local) => transformIncomingExtension(local, null));
  }
  async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
    const result = await this.channel.call("installExtensionsFromProfile", [extensions, fromProfileLocation, toProfileLocation]);
    return result.map((local) => transformIncomingExtension(local, null));
  }
  getManifest(vsix) {
    return Promise.resolve(this.channel.call("getManifest", [vsix]));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingExtension(local, null));
  }
  async installGalleryExtensions(extensions) {
    const results = await this.channel.call("installGalleryExtensions", [extensions]);
    return results.map((e) => ({ ...e, local: e.local ? transformIncomingExtension(e.local, null) : e.local, source: this.isUriComponents(e.source) ? URI.revive(e.source) : e.source, profileLocation: URI.revive(e.profileLocation) }));
  }
  uninstall(extension, options) {
    if (extension.isWorkspaceScoped) {
      throw new Error("Cannot uninstall a workspace extension");
    }
    return Promise.resolve(this.channel.call("uninstall", [extension, options]));
  }
  uninstallExtensions(extensions) {
    if (extensions.some((e) => e.extension.isWorkspaceScoped)) {
      throw new Error("Cannot uninstall a workspace extension");
    }
    return Promise.resolve(this.channel.call("uninstallExtensions", [extensions]));
  }
  getInstalled(type = null, extensionsProfileResource, productVersion) {
    return Promise.resolve(this.channel.call("getInstalled", [type, extensionsProfileResource, productVersion])).then((extensions) => extensions.map((extension) => transformIncomingExtension(extension, null)));
  }
  updateMetadata(local, metadata, extensionsProfileResource) {
    return Promise.resolve(this.channel.call("updateMetadata", [local, metadata, extensionsProfileResource])).then((extension) => transformIncomingExtension(extension, null));
  }
  resetPinnedStateForAllUserExtensions(pinned) {
    return this.channel.call("resetPinnedStateForAllUserExtensions", [pinned]);
  }
  toggleAppliationScope(local, fromProfileLocation) {
    return this.channel.call("toggleAppliationScope", [local, fromProfileLocation]).then((extension) => transformIncomingExtension(extension, null));
  }
  copyExtensions(fromProfileLocation, toProfileLocation) {
    return this.channel.call("copyExtensions", [fromProfileLocation, toProfileLocation]);
  }
  getExtensionsControlManifest() {
    return Promise.resolve(this.channel.call("getExtensionsControlManifest"));
  }
  async download(extension, operation, donotVerifySignature) {
    const result = await this.channel.call("download", [extension, operation, donotVerifySignature]);
    return URI.revive(result);
  }
  async cleanUp() {
    return this.channel.call("cleanUp");
  }
  registerParticipant() {
    throw new Error("Not Supported");
  }
}
class ExtensionTipsChannel {
  constructor(service) {
    this.service = service;
  }
  static {
    __name(this, "ExtensionTipsChannel");
  }
  listen(context, event) {
    throw new Error("Invalid listen");
  }
  call(context, command, args) {
    switch (command) {
      case "getConfigBasedTips":
        return this.service.getConfigBasedTips(URI.revive(args[0]));
      case "getImportantExecutableBasedTips":
        return this.service.getImportantExecutableBasedTips();
      case "getOtherExecutableBasedTips":
        return this.service.getOtherExecutableBasedTips();
    }
    throw new Error("Invalid call");
  }
}
export {
  ExtensionManagementChannel,
  ExtensionManagementChannelClient,
  ExtensionTipsChannel
};
//# sourceMappingURL=extensionManagementIpc.js.map
