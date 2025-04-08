var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { homedir } from "os";
import { ExtHostVariableResolverProviderService } from "../common/extHostVariableResolverService.js";
class NodeExtHostVariableResolverProviderService extends ExtHostVariableResolverProviderService {
  static {
    __name(this, "NodeExtHostVariableResolverProviderService");
  }
  homeDir() {
    return homedir();
  }
}
export {
  NodeExtHostVariableResolverProviderService
};
//# sourceMappingURL=extHostVariableResolverService.js.map
