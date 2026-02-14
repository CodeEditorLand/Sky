var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class MountainConnectionError extends Error {
  static {
    __name(this, "MountainConnectionError");
  }
  _tag = "MountainConnectionError";
  cause;
  constructor(cause) {
    super(`Failed to connect to Mountain backend: ${String(cause)}`);
  }
}
var MountainConnectionError_default = MountainConnectionError;
export {
  MountainConnectionError,
  MountainConnectionError_default as default
};
//# sourceMappingURL=MountainConnectionError.js.map
