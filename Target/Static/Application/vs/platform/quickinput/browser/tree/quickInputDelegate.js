var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { QuickInputTreeRenderer } from "./quickInputTreeRenderer.js";
class QuickInputTreeDelegate {
  static {
    __name(this, "QuickInputTreeDelegate");
  }
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return QuickInputTreeRenderer.ID;
  }
}
export {
  QuickInputTreeDelegate
};
//# sourceMappingURL=quickInputDelegate.js.map
