var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class EnvironmentTag extends Context.Tag(
  "Effect/EnvironmentService"
)() {
  static {
    __name(this, "EnvironmentTag");
  }
}
var EnvironmentTag_default = EnvironmentTag;
export {
  EnvironmentTag,
  EnvironmentTag_default as default
};
//# sourceMappingURL=EnvironmentTag.js.map
