var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class PanelTag extends Context.Tag("Panel")() {
  static {
    __name(this, "PanelTag");
  }
}
const Panel = PanelTag;
export {
  Panel,
  PanelTag as default
};
//# sourceMappingURL=PanelTag.js.map
