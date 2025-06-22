var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../base/common/network.js";
import { ExtUri } from "../../../base/common/resources.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
class ExtHostFileSystemInfo {
  static {
    __name(this, "ExtHostFileSystemInfo");
  }
  constructor() {
    this._systemSchemes = new Set(Object.keys(Schemas));
    this._providerInfo = /* @__PURE__ */ new Map();
    this.extUri = new ExtUri((uri) => {
      const capabilities = this._providerInfo.get(uri.scheme);
      if (capabilities === void 0) {
        return false;
      }
      if (capabilities & 1024) {
        return false;
      }
      return true;
    });
  }
  $acceptProviderInfos(uri, capabilities) {
    if (capabilities === null) {
      this._providerInfo.delete(uri.scheme);
    } else {
      this._providerInfo.set(uri.scheme, capabilities);
    }
  }
  isFreeScheme(scheme) {
    return !this._providerInfo.has(scheme) && !this._systemSchemes.has(scheme);
  }
  getCapabilities(scheme) {
    return this._providerInfo.get(scheme);
  }
}
const IExtHostFileSystemInfo = createDecorator("IExtHostFileSystemInfo");
export {
  ExtHostFileSystemInfo,
  IExtHostFileSystemInfo
};
//# sourceMappingURL=extHostFileSystemInfo.js.map
