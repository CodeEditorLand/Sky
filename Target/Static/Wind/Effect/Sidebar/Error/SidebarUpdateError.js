var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SidebarUpdateError extends Error {
  static {
    __name(this, "SidebarUpdateError");
  }
  _tag = "SidebarUpdateError";
  cause;
  constructor(panelId, cause) {
    super(`Failed to update sidebar panel '${panelId}': ${String(cause)}`);
    this.cause = cause;
    Object.setPrototypeOf(this, SidebarUpdateError.prototype);
  }
  get name() {
    return "SidebarUpdateError";
  }
}
export {
  SidebarUpdateError as default
};
//# sourceMappingURL=SidebarUpdateError.js.map
