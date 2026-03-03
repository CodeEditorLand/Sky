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
import { URI } from "../../../../base/common/uri.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { McpGatewayChannelName } from "../../../../platform/mcp/common/mcpGateway.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
let WorkbenchMcpGatewayService = class WorkbenchMcpGatewayService2 {
  static {
    __name(this, "WorkbenchMcpGatewayService");
  }
  constructor(mainProcessService, _remoteAgentService) {
    this._remoteAgentService = _remoteAgentService;
    this._localPlatformService = ProxyChannel.toService(mainProcessService.getChannel(McpGatewayChannelName));
  }
  async createGateway(inRemote) {
    if (inRemote) {
      return this._createRemoteGateway();
    } else {
      return this._createLocalGateway();
    }
  }
  async _createLocalGateway() {
    const info = await this._localPlatformService.createGateway(void 0);
    return {
      address: URI.revive(info.address),
      dispose: /* @__PURE__ */ __name(() => {
        this._localPlatformService.disposeGateway(info.gatewayId);
      }, "dispose")
    };
  }
  async _createRemoteGateway() {
    const connection = this._remoteAgentService.getConnection();
    if (!connection) {
      return void 0;
    }
    return connection.withChannel(McpGatewayChannelName, async (channel) => {
      const service = ProxyChannel.toService(channel);
      const info = await service.createGateway(void 0);
      return {
        address: URI.revive(info.address),
        dispose: /* @__PURE__ */ __name(() => {
          service.disposeGateway(info.gatewayId);
        }, "dispose")
      };
    });
  }
};
WorkbenchMcpGatewayService = __decorate([
  __param(0, IMainProcessService),
  __param(1, IRemoteAgentService)
], WorkbenchMcpGatewayService);
export {
  WorkbenchMcpGatewayService
};
//# sourceMappingURL=mcpGatewayService.js.map
