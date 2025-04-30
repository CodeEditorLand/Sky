var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class HierarchicalKind {
  static {
    __name(this, "HierarchicalKind");
  }
  static {
    this.sep = ".";
  }
  static {
    this.None = new HierarchicalKind("@@none@@");
  }
  static {
    this.Empty = new HierarchicalKind("");
  }
  constructor(value) {
    this.value = value;
  }
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
