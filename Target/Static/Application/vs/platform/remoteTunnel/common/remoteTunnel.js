import { createDecorator } from "../../instantiation/common/instantiation.js";
import { localize } from "../../../nls.js";
const IRemoteTunnelService = createDecorator("IRemoteTunnelService");
const INACTIVE_TUNNEL_MODE = { active: false };
var TunnelStates;
(function(TunnelStates2) {
  TunnelStates2.disconnected = (onTokenFailed) => ({ type: "disconnected", onTokenFailed });
  TunnelStates2.connected = (info, serviceInstallFailed) => ({ type: "connected", info, serviceInstallFailed });
  TunnelStates2.connecting = (progress) => ({ type: "connecting", progress });
  TunnelStates2.uninitialized = { type: "uninitialized" };
})(TunnelStates || (TunnelStates = {}));
const CONFIGURATION_KEY_PREFIX = "remote.tunnels.access";
const CONFIGURATION_KEY_HOST_NAME = CONFIGURATION_KEY_PREFIX + ".hostNameOverride";
const CONFIGURATION_KEY_PREVENT_SLEEP = CONFIGURATION_KEY_PREFIX + ".preventSleep";
const LOG_ID = "remoteTunnelService";
const LOGGER_NAME = localize("remoteTunnelLog", "Remote Tunnel Service");
export {
  CONFIGURATION_KEY_HOST_NAME,
  CONFIGURATION_KEY_PREFIX,
  CONFIGURATION_KEY_PREVENT_SLEEP,
  INACTIVE_TUNNEL_MODE,
  IRemoteTunnelService,
  LOGGER_NAME,
  LOG_ID,
  TunnelStates
};
//# sourceMappingURL=remoteTunnel.js.map
