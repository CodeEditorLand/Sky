var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PanelUpdateError extends Error {
  static {
    __name(this, "PanelUpdateError");
  }
  _tag = "PanelUpdateError";
  cause;
  constructor(viewId, cause) {
    super(`Failed to update panel view '${viewId}': ${String(cause)}`);
    this.cause = cause;
    Object.setPrototypeOf(this, PanelUpdateError.prototype);
  }
  get name() {
    return "PanelUpdateError";
  }
}
export {
  PanelUpdateError as default
};
//# sourceMappingURL=PanelUpdateError.js.map
