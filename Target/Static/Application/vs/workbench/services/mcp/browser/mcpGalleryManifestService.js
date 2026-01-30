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
import { McpGalleryManifestService } from "../../../../platform/mcp/common/mcpGalleryManifestService.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { IRequestService } from "../../../../platform/request/common/request.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Emitter } from "../../../../base/common/event.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { mcpGalleryServiceUrlConfig } from "../../../../platform/mcp/common/mcpManagement.js";
let WorkbenchMcpGalleryManifestService = class WorkbenchMcpGalleryManifestService2 extends McpGalleryManifestService {
  static {
    __name(this, "WorkbenchMcpGalleryManifestService");
  }
  get mcpGalleryManifestStatus() {
    return this.currentStatus;
  }
  constructor(productService, remoteAgentService, requestService, logService, configurationService) {
    super(productService, requestService, logService);
    this.configurationService = configurationService;
    this.mcpGalleryManifest = null;
    this._onDidChangeMcpGalleryManifest = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifest = this._onDidChangeMcpGalleryManifest.event;
    this.currentStatus = "unavailable";
    this._onDidChangeMcpGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifestStatus = this._onDidChangeMcpGalleryManifestStatus.event;
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      const channel = remoteConnection.getChannel("mcpGalleryManifest");
      this.getMcpGalleryManifest().then((manifest) => {
        channel.call("setMcpGalleryManifest", [manifest]);
        this._register(this.onDidChangeMcpGalleryManifest((manifest2) => channel.call("setMcpGalleryManifest", [manifest2])));
      });
    }
  }
  async getMcpGalleryManifest() {
    if (!this.initPromise) {
      this.initPromise = this.doGetMcpGalleryManifest();
    }
    await this.initPromise;
    return this.mcpGalleryManifest;
  }
  async doGetMcpGalleryManifest() {
    await this.getAndUpdateMcpGalleryManifest();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpGalleryServiceUrlConfig) || e.affectsConfiguration("chat.mcp.gallery.version")) {
        this.getAndUpdateMcpGalleryManifest();
      }
    }));
  }
  async getAndUpdateMcpGalleryManifest() {
    const mcpGalleryConfig = this.configurationService.getValue("chat.mcp.gallery");
    if (mcpGalleryConfig?.serviceUrl) {
      this.update(await this.createMcpGalleryManifest(mcpGalleryConfig.serviceUrl, mcpGalleryConfig.version));
    } else {
      this.update(await super.getMcpGalleryManifest());
    }
  }
  update(manifest) {
    if (this.mcpGalleryManifest?.url === manifest?.url && this.mcpGalleryManifest?.version === manifest?.version) {
      return;
    }
    this.mcpGalleryManifest = manifest;
    if (this.mcpGalleryManifest) {
      this.logService.info("MCP Registry configured:", this.mcpGalleryManifest.url);
    } else {
      this.logService.info("No MCP Registry configured");
    }
    this.currentStatus = this.mcpGalleryManifest ? "available" : "unavailable";
    this._onDidChangeMcpGalleryManifest.fire(this.mcpGalleryManifest);
    this._onDidChangeMcpGalleryManifestStatus.fire(this.currentStatus);
  }
};
WorkbenchMcpGalleryManifestService = __decorate([
  __param(0, IProductService),
  __param(1, IRemoteAgentService),
  __param(2, IRequestService),
  __param(3, ILogService),
  __param(4, IConfigurationService)
], WorkbenchMcpGalleryManifestService);
export {
  WorkbenchMcpGalleryManifestService
};
//# sourceMappingURL=mcpGalleryManifestService.js.map
