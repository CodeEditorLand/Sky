var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class ConfigApplyError extends Error {
  constructor(key, cause) {
    super(`Failed to apply configuration for '${key}': ${String(cause)}`);
    this.key = key;
    this.cause = cause;
  }
  static {
    __name(this, "ConfigApplyError");
  }
  _tag = "ConfigApplyError";
}
var ConfigApplyError_default = ConfigApplyError;
export {
  ConfigApplyError,
  ConfigApplyError_default as default
};
//# sourceMappingURL=ConfigApplyError.js.map
