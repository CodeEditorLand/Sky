var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class ActivityBarUpdateError extends Error {
  static {
    __name(this, "ActivityBarUpdateError");
  }
  _tag = "ActivityBarUpdateError";
  constructor(itemId, cause) {
    super(`Failed to update activity bar item '${itemId}': ${String(cause)}`);
    this.cause = cause;
    Object.setPrototypeOf(this, ActivityBarUpdateError.prototype);
  }
  get name() {
    return "ActivityBarUpdateError";
  }
}
var ActivityBarUpdateError_default = ActivityBarUpdateError;
export {
  ActivityBarUpdateError,
  ActivityBarUpdateError_default as default
};
//# sourceMappingURL=ActivityBarUpdateError.js.map
