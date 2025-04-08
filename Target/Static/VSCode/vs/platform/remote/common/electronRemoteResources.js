var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { UriComponents } from "../../../base/common/uri.js";
import { Client, IClientRouter, IConnectionHub } from "../../../base/parts/ipc/common/ipc.js";
const NODE_REMOTE_RESOURCE_IPC_METHOD_NAME = "request";
const NODE_REMOTE_RESOURCE_CHANNEL_NAME = "remoteResourceHandler";
class NodeRemoteResourceRouter {
  static {
    __name(this, "NodeRemoteResourceRouter");
  }
  async routeCall(hub, command, arg) {
    if (command !== NODE_REMOTE_RESOURCE_IPC_METHOD_NAME) {
      throw new Error(`Call not found: ${command}`);
    }
    const uri = arg[0];
    if (uri?.authority) {
      const connection = hub.connections.find((c) => c.ctx === uri.authority);
      if (connection) {
        return connection;
      }
    }
    throw new Error(`Caller not found`);
  }
  routeEvent(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
}
export {
  NODE_REMOTE_RESOURCE_CHANNEL_NAME,
  NODE_REMOTE_RESOURCE_IPC_METHOD_NAME,
  NodeRemoteResourceRouter
};
//# sourceMappingURL=electronRemoteResources.js.map
