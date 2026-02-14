var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context } from "effect";
class StatusBarTag extends Context.Tag("StatusBar")() {
  static {
    __name(this, "StatusBarTag");
  }
}
const StatusBar = StatusBarTag;
export {
  StatusBar,
  StatusBarTag as default
};
//# sourceMappingURL=StatusBarTag.js.map
