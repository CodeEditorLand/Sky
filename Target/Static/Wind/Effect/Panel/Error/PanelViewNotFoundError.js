var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class PanelViewNotFoundError extends Error {
  static {
    __name(this, "PanelViewNotFoundError");
  }
  _tag = "PanelViewNotFoundError";
  constructor(viewId) {
    super(`Panel view '${viewId}' not found`);
    Object.setPrototypeOf(this, PanelViewNotFoundError.prototype);
  }
  get name() {
    return "PanelViewNotFoundError";
  }
}
export {
  PanelViewNotFoundError as default
};
//# sourceMappingURL=PanelViewNotFoundError.js.map
