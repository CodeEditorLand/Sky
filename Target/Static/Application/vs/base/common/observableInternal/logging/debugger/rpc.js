var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SimpleTypedRpcConnection {
  static {
    __name(this, "SimpleTypedRpcConnection");
  }
  static createHost(channelFactory, getHandler) {
    return new SimpleTypedRpcConnection(channelFactory, getHandler);
  }
  static createClient(channelFactory, getHandler) {
    return new SimpleTypedRpcConnection(channelFactory, getHandler);
  }
  constructor(_channelFactory, _getHandler) {
    this._channelFactory = _channelFactory;
    this._getHandler = _getHandler;
    this._channel = this._channelFactory({
      handleNotification: /* @__PURE__ */ __name((notificationData) => {
        const m = notificationData;
        const fn = this._getHandler().notifications[m[0]];
        if (!fn) {
          throw new Error(`Unknown notification "${m[0]}"!`);
        }
        fn(...m[1]);
      }, "handleNotification"),
      handleRequest: /* @__PURE__ */ __name((requestData) => {
        const m = requestData;
        try {
          const result = this._getHandler().requests[m[0]](...m[1]);
          return { type: "result", value: result };
        } catch (e) {
          return { type: "error", value: e };
        }
      }, "handleRequest")
    });
    const requests = new Proxy({}, {
      get: /* @__PURE__ */ __name((target, key) => {
        return async (...args) => {
          const result = await this._channel.sendRequest([key, args]);
          if (result.type === "error") {
            throw result.value;
          } else {
            return result.value;
          }
        };
      }, "get")
    });
    const notifications = new Proxy({}, {
      get: /* @__PURE__ */ __name((target, key) => {
        return (...args) => {
          this._channel.sendNotification([key, args]);
        };
      }, "get")
    });
    this.api = { notifications, requests };
  }
}
export {
  SimpleTypedRpcConnection
};
//# sourceMappingURL=rpc.js.map
