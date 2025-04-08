var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../common/lifecycle.js";
import { Client as MessagePortClient } from "../common/ipc.mp.js";
class Client extends MessagePortClient {
  static {
    __name(this, "Client");
  }
  /**
   * @param clientId a way to uniquely identify this client among
   * other clients. this is important for routing because every
   * client can also be a server
   */
  constructor(port, clientId) {
    super(port, clientId);
  }
}
export {
  Client
};
//# sourceMappingURL=ipc.mp.js.map
