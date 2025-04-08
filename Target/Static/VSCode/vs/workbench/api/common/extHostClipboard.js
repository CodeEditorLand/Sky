var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IMainContext, MainContext } from "./extHost.protocol.js";
class ExtHostClipboard {
  static {
    __name(this, "ExtHostClipboard");
  }
  value;
  constructor(mainContext) {
    const proxy = mainContext.getProxy(MainContext.MainThreadClipboard);
    this.value = Object.freeze({
      readText() {
        return proxy.$readText();
      },
      writeText(value) {
        return proxy.$writeText(value);
      }
    });
  }
}
export {
  ExtHostClipboard
};
//# sourceMappingURL=extHostClipboard.js.map
