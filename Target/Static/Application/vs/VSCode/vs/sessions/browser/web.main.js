var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BrowserMain } from "../../workbench/browser/web.main.js";
import { Workbench as SessionsWorkbench } from "./workbench.js";
class SessionsBrowserMain extends BrowserMain {
  static {
    __name(this, "SessionsBrowserMain");
  }
  createWorkbench(domElement, serviceCollection, logService) {
    console.log("[Sessions Web] Creating Sessions workbench (not standard workbench)");
    return new SessionsWorkbench(domElement, void 0, serviceCollection, logService);
  }
}
export {
  SessionsBrowserMain
};
//# sourceMappingURL=web.main.js.map
