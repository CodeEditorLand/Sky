var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "./baseToken.js";
class CompositeToken extends BaseToken {
  static {
    __name(this, "CompositeToken");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.childTokens = [...tokens];
  }
  get text() {
    return BaseToken.render(this.childTokens);
  }
  /**
   * Tokens that this composite token consists of.
   */
  get children() {
    return this.childTokens;
  }
  /**
   * Check if this token is equal to another one,
   * including all of its child tokens.
   */
  equals(other) {
    if (super.equals(other) === false) {
      return false;
    }
    if (this.children.length !== other.children.length) {
      return false;
    }
    for (let i = 0; i < this.children.length; i++) {
      const childToken = this.children[i];
      const otherChildToken = other.children[i];
      if (childToken.equals(otherChildToken) === false) {
        return false;
      }
    }
    return true;
  }
}
export {
  CompositeToken
};
//# sourceMappingURL=compositeToken.js.map
