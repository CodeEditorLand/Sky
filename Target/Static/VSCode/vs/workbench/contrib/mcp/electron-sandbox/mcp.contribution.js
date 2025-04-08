import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { mcpDiscoveryRegistry } from "../common/discovery/mcpDiscovery.js";
import { NativeMcpDiscovery } from "./nativeMpcDiscovery.js";
mcpDiscoveryRegistry.register(new SyncDescriptor(NativeMcpDiscovery));
//# sourceMappingURL=mcp.contribution.js.map
