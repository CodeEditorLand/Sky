var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class MountainRPCError extends Error {
  static {
    __name(this, "MountainRPCError");
  }
  _tag = "MountainRPCError";
  method;
  cause;
  constructor(method, cause) {
    super(`Mountain RPC '${method}' failed: ${String(cause)}`);
    this.method = method;
  }
}
var MountainRPCError_default = MountainRPCError;
export {
  MountainRPCError,
  MountainRPCError_default as default
};
//# sourceMappingURL=MountainRPCError.js.map
