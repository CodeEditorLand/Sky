var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
class BrowserElevatedFileService {
  static {
    __name(this, "BrowserElevatedFileService");
  }
  isSupported(resource) {
    return false;
  }
  async writeFileElevated(resource, value, options) {
    throw new Error("Unsupported");
  }
}
registerSingleton(
  IElevatedFileService,
  BrowserElevatedFileService,
  1
  /* InstantiationType.Delayed */
);
export {
  BrowserElevatedFileService
};
//# sourceMappingURL=elevatedFileService.js.map
