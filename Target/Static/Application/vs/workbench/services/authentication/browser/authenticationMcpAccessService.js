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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
const IAuthenticationMcpAccessService = createDecorator("IAuthenticationMcpAccessService");
let AuthenticationMcpAccessService = class AuthenticationMcpAccessService2 extends Disposable {
  static {
    __name(this, "AuthenticationMcpAccessService");
  }
  constructor(_storageService, _productService) {
    super();
    this._storageService = _storageService;
    this._productService = _productService;
    this._onDidChangeMcpSessionAccess = this._register(new Emitter());
    this.onDidChangeMcpSessionAccess = this._onDidChangeMcpSessionAccess.event;
  }
  isAccessAllowed(providerId, accountName, mcpServerId) {
    const trustedMCPServerAuthAccess = this._productService.trustedMcpAuthAccess;
    if (Array.isArray(trustedMCPServerAuthAccess)) {
      if (trustedMCPServerAuthAccess.includes(mcpServerId)) {
        return true;
      }
    } else if (trustedMCPServerAuthAccess?.[providerId]?.includes(mcpServerId)) {
      return true;
    }
    const allowList = this.readAllowedMcpServers(providerId, accountName);
    const mcpServerData = allowList.find((mcpServer) => mcpServer.id === mcpServerId);
    if (!mcpServerData) {
      return void 0;
    }
    return mcpServerData.allowed !== void 0 ? mcpServerData.allowed : true;
  }
  readAllowedMcpServers(providerId, accountName) {
    let trustedMCPServers = [];
    try {
      const trustedMCPServerSrc = this._storageService.get(
        `mcpserver-${providerId}-${accountName}`,
        -1
        /* StorageScope.APPLICATION */
      );
      if (trustedMCPServerSrc) {
        trustedMCPServers = JSON.parse(trustedMCPServerSrc);
      }
    } catch (err) {
    }
    const trustedMcpServerAuthAccess = this._productService.trustedMcpAuthAccess;
    const trustedMcpServerIds = (
      // Case 1: trustedMcpServerAuthAccess is an array
      Array.isArray(trustedMcpServerAuthAccess) ? trustedMcpServerAuthAccess : typeof trustedMcpServerAuthAccess === "object" ? trustedMcpServerAuthAccess[providerId] ?? [] : []
    );
    for (const mcpServerId of trustedMcpServerIds) {
      const existingServer = trustedMCPServers.find((server) => server.id === mcpServerId);
      if (!existingServer) {
        trustedMCPServers.push({
          id: mcpServerId,
          name: mcpServerId,
          // Default to ID, caller can update with proper name
          allowed: true,
          trusted: true
        });
      } else {
        existingServer.allowed = true;
        existingServer.trusted = true;
      }
    }
    return trustedMCPServers;
  }
  updateAllowedMcpServers(providerId, accountName, mcpServers) {
    const allowList = this.readAllowedMcpServers(providerId, accountName);
    for (const mcpServer of mcpServers) {
      const index = allowList.findIndex((e) => e.id === mcpServer.id);
      if (index === -1) {
        allowList.push(mcpServer);
      } else {
        allowList[index].allowed = mcpServer.allowed;
        if (mcpServer.name && mcpServer.name !== mcpServer.id && allowList[index].name !== mcpServer.name) {
          allowList[index].name = mcpServer.name;
        }
      }
    }
    const userManagedServers = allowList.filter((server) => !server.trusted);
    this._storageService.store(
      `mcpserver-${providerId}-${accountName}`,
      JSON.stringify(userManagedServers),
      -1,
      0
      /* StorageTarget.USER */
    );
    this._onDidChangeMcpSessionAccess.fire({ providerId, accountName });
  }
  removeAllowedMcpServers(providerId, accountName) {
    this._storageService.remove(
      `mcpserver-${providerId}-${accountName}`,
      -1
      /* StorageScope.APPLICATION */
    );
    this._onDidChangeMcpSessionAccess.fire({ providerId, accountName });
  }
};
AuthenticationMcpAccessService = __decorate([
  __param(0, IStorageService),
  __param(1, IProductService)
], AuthenticationMcpAccessService);
registerSingleton(
  IAuthenticationMcpAccessService,
  AuthenticationMcpAccessService,
  1
  /* InstantiationType.Delayed */
);
export {
  AuthenticationMcpAccessService,
  IAuthenticationMcpAccessService
};
//# sourceMappingURL=authenticationMcpAccessService.js.map
