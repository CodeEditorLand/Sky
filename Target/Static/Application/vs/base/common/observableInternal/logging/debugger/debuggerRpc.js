var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleTypedRpcConnection } from "./rpc.js";
function registerDebugChannel(channelId, createClient) {
  const g = globalThis;
  let queuedNotifications = [];
  let curHost = void 0;
  const { channel, handler } = createChannelFactoryFromDebugChannel({
    sendNotification: /* @__PURE__ */ __name((data) => {
      if (curHost) {
        curHost.sendNotification(data);
      } else {
        queuedNotifications.push(data);
      }
    }, "sendNotification")
  });
  let curClient = void 0;
  (g.$$debugValueEditor_debugChannels ?? (g.$$debugValueEditor_debugChannels = {}))[channelId] = (host) => {
    curClient = createClient();
    curHost = host;
    for (const n of queuedNotifications) {
      host.sendNotification(n);
    }
    queuedNotifications = [];
    return handler;
  };
  return SimpleTypedRpcConnection.createClient(channel, () => {
    if (!curClient) {
      throw new Error("Not supported");
    }
    return curClient;
  });
}
__name(registerDebugChannel, "registerDebugChannel");
function createChannelFactoryFromDebugChannel(host) {
  let h;
  const channel = /* @__PURE__ */ __name((handler) => {
    h = handler;
    return {
      sendNotification: /* @__PURE__ */ __name((data) => {
        host.sendNotification(data);
      }, "sendNotification"),
      sendRequest: /* @__PURE__ */ __name((data) => {
        throw new Error("not supported");
      }, "sendRequest")
    };
  }, "channel");
  return {
    channel,
    handler: {
      handleRequest: /* @__PURE__ */ __name((data) => {
        if (data.type === "notification") {
          return h?.handleNotification(data.data);
        } else {
          return h?.handleRequest(data.data);
        }
      }, "handleRequest")
    }
  };
}
__name(createChannelFactoryFromDebugChannel, "createChannelFactoryFromDebugChannel");
export {
  registerDebugChannel
};
//# sourceMappingURL=debuggerRpc.js.map
