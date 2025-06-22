var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Data } from "../../../effect";
class Problem extends Data.TaggedError(
  "ApplicationConfigurationProblem"
) {
  static {
    __name(this, "Problem");
  }
}
export {
  Problem
};
//# sourceMappingURL=Problem.js.map
