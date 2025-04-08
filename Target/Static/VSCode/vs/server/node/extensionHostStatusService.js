var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../platform/instantiation/common/instantiation.js";
import { IExtensionHostExitInfo } from "../../workbench/services/remote/common/remoteAgentService.js";
const IExtensionHostStatusService = createDecorator("extensionHostStatusService");
class ExtensionHostStatusService {
  static {
    __name(this, "ExtensionHostStatusService");
  }
  _serviceBrand;
  _exitInfo = /* @__PURE__ */ new Map();
  setExitInfo(reconnectionToken, info) {
    this._exitInfo.set(reconnectionToken, info);
  }
  getExitInfo(reconnectionToken) {
    return this._exitInfo.get(reconnectionToken) || null;
  }
}
export {
  ExtensionHostStatusService,
  IExtensionHostStatusService
};
//# sourceMappingURL=extensionHostStatusService.js.map
