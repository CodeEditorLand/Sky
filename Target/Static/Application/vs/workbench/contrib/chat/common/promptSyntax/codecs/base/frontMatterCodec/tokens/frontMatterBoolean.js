var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Word } from "../../simpleCodec/tokens/tokens.js";
import { FrontMatterValueToken } from "./frontMatterToken.js";
import { assertDefined } from "../../../../../../../../../base/common/types.js";
class FrontMatterBoolean extends FrontMatterValueToken {
  static {
    __name(this, "FrontMatterBoolean");
  }
  /**
   * @throws if provided {@link Word} cannot be converted to a `boolean` value.
   */
  constructor(token) {
    const value = asBoolean(token);
    assertDefined(value, `Cannot convert '${token}' to a boolean value.`);
    super([token]);
    this.valueTypeName = "boolean";
    this.value = value;
  }
  /**
   * Try creating a {@link FrontMatterBoolean} out of provided token.
   * Unlike the constructor, this method does not throw, returning
   * a 'null' value on failure instead.
   */
  static tryFromToken(token) {
    if (token instanceof Word === false) {
      return null;
    }
    try {
      return new FrontMatterBoolean(token);
    } catch (_error) {
      return null;
    }
  }
  equals(other) {
    if (super.equals(other) === false) {
      return false;
    }
    return this.value === other.value;
  }
  toString() {
    return `front-matter-boolean(${this.shortText()})${this.range}`;
  }
}
function asBoolean(token) {
  if (token.text.toLowerCase() === "true") {
    return true;
  }
  if (token.text.toLowerCase() === "false") {
    return false;
  }
  return null;
}
__name(asBoolean, "asBoolean");
export {
  FrontMatterBoolean,
  asBoolean
};
//# sourceMappingURL=frontMatterBoolean.js.map
