var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CombinedSpliceable {
  static {
    __name(this, "CombinedSpliceable");
  }
  constructor(spliceables) {
    this.spliceables = spliceables;
  }
  splice(start, deleteCount, elements) {
    this.spliceables.forEach((s) => s.splice(start, deleteCount, elements));
  }
}
export {
  CombinedSpliceable
};
//# sourceMappingURL=splice.js.map
