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
import { Emitter, Event } from "../../../base/common/event.js";
import { cloneAndChange } from "../../../base/common/objects.js";
import { URI } from "../../../base/common/uri.js";
import { DefaultURITransformer, transformAndReviveIncomingURIs } from "../../../base/common/uriIpc.js";
import { ILogService } from "../../log/common/log.js";
import { IAllowedMcpServersService } from "./mcpManagement.js";
import { AbstractMcpManagementService } from "./mcpManagementService.js";
function transformIncomingURI(uri, transformer) {
  return uri ? URI.revive(transformer ? transformer.transformIncoming(uri) : uri) : void 0;
}
__name(transformIncomingURI, "transformIncomingURI");
function transformIncomingServer(mcpServer, transformer) {
  transformer = transformer ? transformer : DefaultURITransformer;
  const manifest = mcpServer.manifest;
  const transformed = transformAndReviveIncomingURIs({ ...mcpServer, ...{ manifest: void 0 } }, transformer);
  return { ...transformed, ...{ manifest } };
}
__name(transformIncomingServer, "transformIncomingServer");
function transformIncomingOptions(options, transformer) {
  return options?.mcpResource ? transformAndReviveIncomingURIs(options, transformer ?? DefaultURITransformer) : options;
}
__name(transformIncomingOptions, "transformIncomingOptions");
function transformOutgoingExtension(extension, transformer) {
  return transformer ? cloneAndChange(extension, (value) => value instanceof URI ? transformer.transformOutgoingURI(value) : void 0) : extension;
}
__name(transformOutgoingExtension, "transformOutgoingExtension");
function transformOutgoingURI(uri, transformer) {
  return transformer ? transformer.transformOutgoingURI(uri) : uri;
}
__name(transformOutgoingURI, "transformOutgoingURI");
class McpManagementChannel {
  static {
    __name(this, "McpManagementChannel");
  }
  constructor(service, getUriTransformer) {
    this.service = service;
    this.getUriTransformer = getUriTransformer;
    this.onInstallMcpServer = Event.buffer(service.onInstallMcpServer, true);
    this.onDidInstallMcpServers = Event.buffer(service.onDidInstallMcpServers, true);
    this.onDidUpdateMcpServers = Event.buffer(service.onDidUpdateMcpServers, true);
    this.onUninstallMcpServer = Event.buffer(service.onUninstallMcpServer, true);
    this.onDidUninstallMcpServer = Event.buffer(service.onDidUninstallMcpServer, true);
  }
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onInstallMcpServer": {
        return Event.map(this.onInstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI(event2.mcpResource, uriTransformer) };
        });
      }
      case "onDidInstallMcpServers": {
        return Event.map(this.onDidInstallMcpServers, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
          mcpResource: transformOutgoingURI(i.mcpResource, uriTransformer)
        })));
      }
      case "onDidUpdateMcpServers": {
        return Event.map(this.onDidUpdateMcpServers, (results) => results.map((i) => ({
          ...i,
          local: i.local ? transformOutgoingExtension(i.local, uriTransformer) : i.local,
          mcpResource: transformOutgoingURI(i.mcpResource, uriTransformer)
        })));
      }
      case "onUninstallMcpServer": {
        return Event.map(this.onUninstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI(event2.mcpResource, uriTransformer) };
        });
      }
      case "onDidUninstallMcpServer": {
        return Event.map(this.onDidUninstallMcpServer, (event2) => {
          return { ...event2, mcpResource: transformOutgoingURI(event2.mcpResource, uriTransformer) };
        });
      }
    }
    throw new Error("Invalid listen");
  }
  async call(context, command, args) {
    const uriTransformer = this.getUriTransformer(context);
    const argsArray = Array.isArray(args) ? args : [];
    switch (command) {
      case "getInstalled": {
        const mcpServers = await this.service.getInstalled(transformIncomingURI(argsArray[0], uriTransformer));
        return mcpServers.map((e) => transformOutgoingExtension(e, uriTransformer));
      }
      case "install": {
        return this.service.install(argsArray[0], transformIncomingOptions(argsArray[1], uriTransformer));
      }
      case "installFromGallery": {
        return this.service.installFromGallery(argsArray[0], transformIncomingOptions(argsArray[1], uriTransformer));
      }
      case "uninstall": {
        return this.service.uninstall(transformIncomingServer(argsArray[0], uriTransformer), transformIncomingOptions(argsArray[1], uriTransformer));
      }
      case "updateMetadata": {
        return this.service.updateMetadata(transformIncomingServer(argsArray[0], uriTransformer), argsArray[1], transformIncomingURI(argsArray[2], uriTransformer));
      }
    }
    throw new Error("Invalid call");
  }
}
let McpManagementChannelClient = class McpManagementChannelClient2 extends AbstractMcpManagementService {
  static {
    __name(this, "McpManagementChannelClient");
  }
  get onInstallMcpServer() {
    return this._onInstallMcpServer.event;
  }
  get onDidInstallMcpServers() {
    return this._onDidInstallMcpServers.event;
  }
  get onUninstallMcpServer() {
    return this._onUninstallMcpServer.event;
  }
  get onDidUninstallMcpServer() {
    return this._onDidUninstallMcpServer.event;
  }
  get onDidUpdateMcpServers() {
    return this._onDidUpdateMcpServers.event;
  }
  constructor(channel, allowedMcpServersService, logService) {
    super(allowedMcpServersService, logService);
    this.channel = channel;
    this._onInstallMcpServer = this._register(new Emitter());
    this._onDidInstallMcpServers = this._register(new Emitter());
    this._onUninstallMcpServer = this._register(new Emitter());
    this._onDidUninstallMcpServer = this._register(new Emitter());
    this._onDidUpdateMcpServers = this._register(new Emitter());
    this._register(this.channel.listen("onInstallMcpServer")((e) => this._onInstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidInstallMcpServers")((results) => this._onDidInstallMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI(e.mcpResource, null) })))));
    this._register(this.channel.listen("onDidUpdateMcpServers")((results) => this._onDidUpdateMcpServers.fire(results.map((e) => ({ ...e, local: e.local ? transformIncomingServer(e.local, null) : e.local, mcpResource: transformIncomingURI(e.mcpResource, null) })))));
    this._register(this.channel.listen("onUninstallMcpServer")((e) => this._onUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
    this._register(this.channel.listen("onDidUninstallMcpServer")((e) => this._onDidUninstallMcpServer.fire({ ...e, mcpResource: transformIncomingURI(e.mcpResource, null) })));
  }
  install(server, options) {
    return Promise.resolve(this.channel.call("install", [server, options])).then((local) => transformIncomingServer(local, null));
  }
  installFromGallery(extension, installOptions) {
    return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then((local) => transformIncomingServer(local, null));
  }
  uninstall(extension, options) {
    return Promise.resolve(this.channel.call("uninstall", [extension, options]));
  }
  getInstalled(mcpResource) {
    return Promise.resolve(this.channel.call("getInstalled", [mcpResource])).then((servers) => servers.map((server) => transformIncomingServer(server, null)));
  }
  updateMetadata(local, gallery, mcpResource) {
    return Promise.resolve(this.channel.call("updateMetadata", [local, gallery, mcpResource])).then((local2) => transformIncomingServer(local2, null));
  }
};
McpManagementChannelClient = __decorate([
  __param(1, IAllowedMcpServersService),
  __param(2, ILogService)
], McpManagementChannelClient);
export {
  McpManagementChannel,
  McpManagementChannelClient
};
//# sourceMappingURL=mcpManagementIpc.js.map
