var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ResourceLabelFormatter } from "../../../platform/label/common/label.js";
import { IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import { MainThreadLabelServiceShape, ExtHostLabelServiceShape, MainContext, IMainContext } from "./extHost.protocol.js";
class ExtHostLabelService {
  static {
    __name(this, "ExtHostLabelService");
  }
  _proxy;
  _handlePool = 0;
  constructor(mainContext) {
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
