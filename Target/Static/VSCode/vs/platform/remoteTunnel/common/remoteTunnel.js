var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { Event } from "../../../base/common/event.js";
import { localize } from "../../../nls.js";
const IRemoteTunnelService = createDecorator("IRemoteTunnelService");
const INACTIVE_TUNNEL_MODE = { active: false };
var TunnelStates;
((TunnelStates2) => {
  TunnelStates2.disconnected = /* @__PURE__ */ __name((onTokenFailed) => ({ type: "disconnected", onTokenFailed }), "disconnected");
  TunnelStates2.connected = /* @__PURE__ */ __name((info, serviceInstallFailed) => ({ type: "connected", info, serviceInstallFailed }), "connected");
  TunnelStates2.connecting = /* @__PURE__ */ __name((progress) => ({ type: "connecting", progress }), "connecting");
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
