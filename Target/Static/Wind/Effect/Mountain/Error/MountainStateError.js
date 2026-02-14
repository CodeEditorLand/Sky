var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect } from "effect";
class MountainStateError extends Error {
  static {
    __name(this, "MountainStateError");
  }
  _tag = "MountainStateError";
  expected;
  actual;
  constructor(expected, actual) {
    super(`Mountain state error: expected ${expected}, got ${actual}`);
    this.expected = expected;
    this.actual = actual;
  }
}
var MountainStateError_default = MountainStateError;
export {
  MountainStateError,
  MountainStateError_default as default
};
//# sourceMappingURL=MountainStateError.js.map
