var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ProxyIdentifier, IRPCProtocol, Proxied } from "../../services/extensions/common/proxyIdentifier.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const IExtHostRpcService = createDecorator("IExtHostRpcService");
class ExtHostRpcService {
  static {
    __name(this, "ExtHostRpcService");
  }
  _serviceBrand;
  getProxy;
  set;
  dispose;
  assertRegistered;
  drain;
  constructor(rpcProtocol) {
    this.getProxy = rpcProtocol.getProxy.bind(rpcProtocol);
    this.set = rpcProtocol.set.bind(rpcProtocol);
    this.dispose = rpcProtocol.dispose.bind(rpcProtocol);
    this.assertRegistered = rpcProtocol.assertRegistered.bind(rpcProtocol);
    this.drain = rpcProtocol.drain.bind(rpcProtocol);
  }
}
export {
  ExtHostRpcService,
  IExtHostRpcService
};
//# sourceMappingURL=extHostRpcService.js.map
