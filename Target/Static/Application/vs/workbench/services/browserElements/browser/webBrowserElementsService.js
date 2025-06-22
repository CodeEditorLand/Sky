var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IBrowserElementsService } from "./browserElementsService.js";
class WebBrowserElementsService {
  static {
    __name(this, "WebBrowserElementsService");
  }
  constructor() {
  }
  async getElementData(rect, token) {
    throw new Error("Not implemented");
  }
  startDebugSession(token, browserType) {
    throw new Error("Not implemented");
  }
}
registerSingleton(
  IBrowserElementsService,
  WebBrowserElementsService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=webBrowserElementsService.js.map
