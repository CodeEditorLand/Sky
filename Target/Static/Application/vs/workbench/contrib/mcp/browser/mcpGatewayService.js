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
import { McpGatewayChannelName } from "../../../../platform/mcp/common/mcpGateway.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
let BrowserMcpGatewayService = class BrowserMcpGatewayService2 {
  static {
    __name(this, "BrowserMcpGatewayService");
  }
  constructor(_remoteAgentService) {
    this._remoteAgentService = _remoteAgentService;
  }
  async createGateway(inRemote) {
    if (!inRemote) {
      return void 0;
    }
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
BrowserMcpGatewayService = __decorate([
  __param(0, IRemoteAgentService)
], BrowserMcpGatewayService);
export {
  BrowserMcpGatewayService
};
//# sourceMappingURL=mcpGatewayService.js.map
