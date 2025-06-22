var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CompositeToken } from "./compositeToken.js";
class Text extends CompositeToken {
  static {
    __name(this, "Text");
  }
  toString() {
    return `text(${this.shortText()})${this.range}`;
  }
}
export {
  Text
};
//# sourceMappingURL=textToken.js.map
