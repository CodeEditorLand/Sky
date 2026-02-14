var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class ActivityBarItemNotFoundError extends Error {
  static {
    __name(this, "ActivityBarItemNotFoundError");
  }
  _tag = "ActivityBarItemNotFoundError";
  constructor(itemId) {
    super(`Activity bar item '${itemId}' not found`);
    Object.setPrototypeOf(this, ActivityBarItemNotFoundError.prototype);
  }
  get name() {
    return "ActivityBarItemNotFoundError";
  }
}
var ActivityBarItemNotFoundError_default = ActivityBarItemNotFoundError;
export {
  ActivityBarItemNotFoundError,
  ActivityBarItemNotFoundError_default as default
};
//# sourceMappingURL=ActivityBarItemNotFoundError.js.map
