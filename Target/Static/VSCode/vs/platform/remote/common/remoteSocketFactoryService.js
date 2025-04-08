var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { ISocket } from "../../../base/parts/ipc/common/ipc.net.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { RemoteConnectionOfType, RemoteConnectionType, RemoteConnection } from "./remoteAuthorityResolver.js";
const IRemoteSocketFactoryService = createDecorator("remoteSocketFactoryService");
class RemoteSocketFactoryService {
  static {
    __name(this, "RemoteSocketFactoryService");
  }
  factories = {};
  register(type, factory) {
    this.factories[type] ??= [];
    this.factories[type].push(factory);
    return toDisposable(() => {
      const idx = this.factories[type]?.indexOf(factory);
      if (typeof idx === "number" && idx >= 0) {
        this.factories[type]?.splice(idx, 1);
      }
    });
  }
  getSocketFactory(messagePassing) {
    const factories = this.factories[messagePassing.type] || [];
    return factories.find((factory) => factory.supports(messagePassing));
  }
  connect(connectTo, path, query, debugLabel) {
    const socketFactory = this.getSocketFactory(connectTo);
    if (!socketFactory) {
      throw new Error(`No socket factory found for ${connectTo}`);
    }
    return socketFactory.connect(connectTo, path, query, debugLabel);
  }
}
export {
  IRemoteSocketFactoryService,
  RemoteSocketFactoryService
};
//# sourceMappingURL=remoteSocketFactoryService.js.map
