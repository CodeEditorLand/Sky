import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { IMcpDevModeDebugging } from "../common/mcpDevMode.js";
import { McpDevModeDebuggingNode } from "./mcpDevModeDebuggingNode.js";
import { NativeMcpDiscovery } from "./nativeMpcDiscovery.js";
mcpDiscoveryRegistry.register(new SyncDescriptor(NativeMcpDiscovery));
registerSingleton(
  IMcpDevModeDebugging,
  McpDevModeDebuggingNode,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=mcp.contribution.js.map
