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
import { ILogService } from "../../../../platform/log/common/log.js";
import { McpGatewayToolBrokerChannelName } from "../../../../platform/mcp/common/mcpGateway.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IMcpService } from "../common/mcpTypes.js";
import { McpGatewayToolBrokerChannel } from "../common/mcpGatewayToolBrokerChannel.js";
let McpGatewayToolBrokerContribution = class McpGatewayToolBrokerContribution2 {
  static {
    __name(this, "McpGatewayToolBrokerContribution");
  }
  constructor(remoteAgentService, mcpService, logService) {
    remoteAgentService.getConnection()?.registerChannel(McpGatewayToolBrokerChannelName, new McpGatewayToolBrokerChannel(mcpService, logService));
  }
};
McpGatewayToolBrokerContribution = __decorate([
  __param(0, IRemoteAgentService),
  __param(1, IMcpService),
  __param(2, ILogService)
], McpGatewayToolBrokerContribution);
export {
  McpGatewayToolBrokerContribution
};
//# sourceMappingURL=mcpGatewayToolBrokerContribution.js.map
