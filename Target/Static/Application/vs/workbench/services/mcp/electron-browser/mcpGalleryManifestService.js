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
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-browser/services.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IRequestService } from "../../../../platform/request/common/request.js";
import { IMcpGalleryManifestService } from "../../../../platform/mcp/common/mcpGalleryManifest.js";
import { WorkbenchMcpGalleryManifestService } from "../browser/mcpGalleryManifestService.js";
let McpGalleryManifestService = class McpGalleryManifestService2 extends WorkbenchMcpGalleryManifestService {
  static {
    __name(this, "McpGalleryManifestService");
  }
  constructor(productService, remoteAgentService, requestService, logService, sharedProcessService, configurationService) {
    super(productService, remoteAgentService, requestService, logService, configurationService);
    const channel = sharedProcessService.getChannel("mcpGalleryManifest");
    this.getMcpGalleryManifest().then((manifest) => {
      channel.call("setMcpGalleryManifest", [manifest]);
      this._register(this.onDidChangeMcpGalleryManifest((manifest2) => channel.call("setMcpGalleryManifest", [manifest2])));
    });
  }
};
McpGalleryManifestService = __decorate([
  __param(0, IProductService),
  __param(1, IRemoteAgentService),
  __param(2, IRequestService),
  __param(3, ILogService),
  __param(4, ISharedProcessService),
  __param(5, IConfigurationService)
], McpGalleryManifestService);
registerSingleton(
  IMcpGalleryManifestService,
  McpGalleryManifestService,
  0
  /* InstantiationType.Eager */
);
export {
  McpGalleryManifestService
};
//# sourceMappingURL=mcpGalleryManifestService.js.map
