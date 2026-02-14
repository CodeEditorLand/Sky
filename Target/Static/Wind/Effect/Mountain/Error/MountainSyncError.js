var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class MountainSyncError extends Error {
  static {
    __name(this, "MountainSyncError");
  }
  _tag = "MountainSyncError";
  resource;
  cause;
  constructor(resource, cause) {
    super(`Mountain sync for '${resource}' failed: ${String(cause)}`);
    this.resource = resource;
  }
}
var MountainSyncError_default = MountainSyncError;
export {
  MountainSyncError,
  MountainSyncError_default as default
};
//# sourceMappingURL=MountainSyncError.js.map
