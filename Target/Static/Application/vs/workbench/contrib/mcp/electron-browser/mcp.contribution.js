import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { IWorkbenchMcpGatewayService } from "../common/mcpGatewayService.js";
import { IMcpDevModeDebugging } from "../common/mcpDevMode.js";
import { McpDevModeDebuggingNode } from "./mcpDevModeDebuggingNode.js";
import { NativeMcpDiscovery } from "./nativeMpcDiscovery.js";
import { WorkbenchMcpGatewayService } from "./mcpGatewayService.js";
import { McpGatewayToolBrokerContribution } from "./mcpGatewayToolBrokerContribution.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
mcpDiscoveryRegistry.register(new SyncDescriptor(NativeMcpDiscovery));
registerSingleton(
  IMcpDevModeDebugging,
  McpDevModeDebuggingNode,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IWorkbenchMcpGatewayService,
  WorkbenchMcpGatewayService,
  1
  /* InstantiationType.Delayed */
);
registerWorkbenchContribution2(
  "mcpGatewayToolBrokerLocal",
  McpGatewayToolBrokerContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=mcp.contribution.js.map
