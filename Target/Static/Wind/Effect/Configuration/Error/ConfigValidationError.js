var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class ConfigValidationError extends Error {
  constructor(issues) {
    super(`Configuration validation failed: ${issues.join(", ")}`);
    this.issues = issues;
  }
  static {
    __name(this, "ConfigValidationError");
  }
  _tag = "ConfigValidationError";
}
var ConfigValidationError_default = ConfigValidationError;
export {
  ConfigValidationError,
  ConfigValidationError_default as default
};
//# sourceMappingURL=ConfigValidationError.js.map
