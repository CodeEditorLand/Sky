var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class HierarchicalKind {
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "HierarchicalKind");
  }
  static sep = ".";
  static None = new HierarchicalKind("@@none@@");
  // Special kind that matches nothing
  static Empty = new HierarchicalKind("");
  equals(other) {
    return this.value === other.value;
  }
  contains(other) {
    return this.equals(other) || this.value === "" || other.value.startsWith(this.value + HierarchicalKind.sep);
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  append(...parts) {
    return new HierarchicalKind((this.value ? [this.value, ...parts] : parts).join(HierarchicalKind.sep));
  }
}
export {
  HierarchicalKind
};
//# sourceMappingURL=hierarchicalKind.js.map
