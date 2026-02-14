var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class StatusBarItemNotFoundError extends Error {
  constructor(itemId) {
    super(`Status bar item '${itemId}' not found`);
    this.itemId = itemId;
    Object.setPrototypeOf(this, StatusBarItemNotFoundError.prototype);
  }
  static {
    __name(this, "StatusBarItemNotFoundError");
  }
  _tag = "StatusBarItemNotFoundError";
  get name() {
    return "StatusBarItemNotFoundError";
  }
}
export {
  StatusBarItemNotFoundError as default
};
//# sourceMappingURL=StatusBarItemNotFoundError.js.map
