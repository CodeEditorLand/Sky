var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ConfigurationNotReadyError extends Error {
  static {
    __name(this, "ConfigurationNotReadyError");
  }
  _tag = "ConfigurationNotReadyError";
  constructor() {
    super("Configuration not yet resolved from preload");
  }
}
export {
  ConfigurationNotReadyError
};
//# sourceMappingURL=ConfigurationNotReadyError.js.map
