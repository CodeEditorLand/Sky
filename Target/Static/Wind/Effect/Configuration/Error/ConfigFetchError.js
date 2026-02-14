var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class ConfigFetchError extends Error {
  constructor(cause) {
    super(`Failed to fetch configuration: ${String(cause)}`);
    this.cause = cause;
  }
  static {
    __name(this, "ConfigFetchError");
  }
  _tag = "ConfigFetchError";
}
var ConfigFetchError_default = ConfigFetchError;
export {
  ConfigFetchError,
  ConfigFetchError_default as default
};
//# sourceMappingURL=ConfigFetchError.js.map
