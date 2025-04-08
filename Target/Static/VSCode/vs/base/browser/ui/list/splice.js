var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ISpliceable } from "../../../common/sequence.js";
class CombinedSpliceable {
  constructor(spliceables) {
    this.spliceables = spliceables;
  }
  static {
    __name(this, "CombinedSpliceable");
  }
  splice(start, deleteCount, elements) {
    this.spliceables.forEach((s) => s.splice(start, deleteCount, elements));
  }
}
export {
  CombinedSpliceable
};
//# sourceMappingURL=splice.js.map
