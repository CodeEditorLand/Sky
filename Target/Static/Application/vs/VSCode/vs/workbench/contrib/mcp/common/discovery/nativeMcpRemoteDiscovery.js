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
import { ProxyChannel } from "../../../../../base/parts/ipc/common/ipc.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { NativeMcpDiscoveryHelperChannelName } from "../../../../../platform/mcp/common/nativeMcpDiscoveryHelper.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
import { IMcpRegistry } from "../mcpRegistryTypes.js";
import { NativeFilesystemMcpDiscovery } from "./nativeMcpDiscoveryAbstract.js";
let RemoteNativeMpcDiscovery = class RemoteNativeMpcDiscovery2 extends NativeFilesystemMcpDiscovery {
  static {
    __name(this, "RemoteNativeMpcDiscovery");
  }
  constructor(remoteAgent, logService, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(remoteAgent.getConnection()?.remoteAuthority || null, labelService, fileService, instantiationService, mcpRegistry, configurationService);
    this.remoteAgent = remoteAgent;
    this.logService = logService;
  }
  async start() {
    const connection = this.remoteAgent.getConnection();
    if (!connection) {
      return this.setDetails(void 0);
    }
    await connection.withChannel(NativeMcpDiscoveryHelperChannelName, async (channel) => {
      const service = ProxyChannel.toService(channel);
      service.load().then((data) => this.setDetails(data), (err) => {
        this.logService.warn("Error getting remote process MCP environment", err);
        this.setDetails(void 0);
      });
    });
  }
};
RemoteNativeMpcDiscovery = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, ILogService),
  __param(2, ILabelService),
  __param(3, IFileService),
  __param(4, IInstantiationService),
  __param(5, IMcpRegistry),
  __param(6, IConfigurationService)
], RemoteNativeMpcDiscovery);
export {
  RemoteNativeMpcDiscovery
};
//# sourceMappingURL=nativeMcpRemoteDiscovery.js.map
