var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FrontMatterValueToken } from "./frontMatterToken.js";
import { assertDefined } from "../../../../../base/common/types.js";
class FrontMatterBoolean extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterBoolean");
  }
  constructor(range, value) {
    super(range);
    this.value = value;
    this.valueTypeName = "boolean";
  }
  static fromToken(token) {
    const value = asBoolean(token);
    assertDefined(value, `Cannot convert '${token}' to a boolean value.`);
    return new FrontMatterBoolean(token.range, value);
  }
  get text() {
    return `${this.value}`;
  }
  toString() {
    return `front-matter-boolean(${this.shortText()})${this.range}`;
  }
}
const asBoolean = /* @__PURE__ */ __name((token) => {
  if (token.text.toLowerCase() === "true") {
    return true;
  }
  if (token.text.toLowerCase() === "false") {
    return false;
  }
  return null;
}, "asBoolean");
export {
  FrontMatterBoolean
};
//# sourceMappingURL=frontMatterBoolean.js.map
