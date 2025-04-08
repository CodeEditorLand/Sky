import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IAddress } from "./remoteAgentConnection.js";
const ISharedProcessTunnelService = createDecorator("sharedProcessTunnelService");
const ipcSharedProcessTunnelChannelName = "sharedProcessTunnel";
export {
  ISharedProcessTunnelService,
  ipcSharedProcessTunnelChannelName
};
//# sourceMappingURL=sharedProcessTunnelService.js.map
