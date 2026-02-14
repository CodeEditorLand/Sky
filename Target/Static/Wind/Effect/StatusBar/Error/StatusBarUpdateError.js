var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class StatusBarUpdateError extends Error {
  static {
    __name(this, "StatusBarUpdateError");
  }
  _tag = "StatusBarUpdateError";
  cause;
  itemId;
  constructor(itemId, cause) {
    super(`Failed to update status bar item '${itemId}': ${String(cause)}`);
    this.itemId = itemId;
    this.cause = cause;
    Object.setPrototypeOf(this, StatusBarUpdateError.prototype);
  }
  get name() {
    return "StatusBarUpdateError";
  }
}
export {
  StatusBarUpdateError as default
};
//# sourceMappingURL=StatusBarUpdateError.js.map
