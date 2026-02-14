var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SidebarPanelNotFoundError extends Error {
  static {
    __name(this, "SidebarPanelNotFoundError");
  }
  _tag = "SidebarPanelNotFoundError";
  constructor(panelId) {
    super(`Sidebar panel '${panelId}' not found`);
    Object.setPrototypeOf(this, SidebarPanelNotFoundError.prototype);
  }
  get name() {
    return "SidebarPanelNotFoundError";
  }
}
export {
  SidebarPanelNotFoundError as default
};
//# sourceMappingURL=SidebarPanelNotFoundError.js.map
