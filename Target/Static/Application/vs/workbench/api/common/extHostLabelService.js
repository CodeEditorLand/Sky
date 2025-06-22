var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { toDisposable } from "../../../base/common/lifecycle.js";
import { MainContext } from "./extHost.protocol.js";
class ExtHostLabelService {
  static {
    __name(this, "ExtHostLabelService");
  }
  constructor(mainContext) {
    this._handlePool = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadLabelService);
  }
  $registerResourceLabelFormatter(formatter) {
    const handle = this._handlePool++;
    this._proxy.$registerResourceLabelFormatter(handle, formatter);
    return toDisposable(() => {
      this._proxy.$unregisterResourceLabelFormatter(handle);
    });
  }
}
export {
  ExtHostLabelService
};
//# sourceMappingURL=extHostLabelService.js.map
