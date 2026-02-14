var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class HealthTag extends Context.Tag("Effect/HealthService")() {
  static {
    __name(this, "HealthTag");
  }
}
var HealthTag_default = HealthTag;
export {
  HealthTag,
  HealthTag_default as default
};
//# sourceMappingURL=HealthTag.js.map
