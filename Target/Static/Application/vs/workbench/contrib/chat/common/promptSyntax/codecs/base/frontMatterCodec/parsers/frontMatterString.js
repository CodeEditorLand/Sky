var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../../../../base/common/assert.js";
import { SimpleToken } from "../../simpleCodec/tokens/tokens.js";
import { assertDefined } from "../../../../../../../../../base/common/types.js";
import { FrontMatterString } from "../tokens/frontMatterString.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PartialFrontMatterString extends ParserBase {
  static {
    __name(this, "PartialFrontMatterString");
  }
  constructor(startToken) {
    super([startToken]);
    this.startToken = startToken;
  }
  accept(token) {
    this.currentTokens.push(token);
    if (token instanceof SimpleToken && this.startToken.sameType(token)) {
      return {
        result: "success",
        nextParser: this.asStringToken(),
        wasTokenConsumed: true
      };
    }
    return {
      result: "success",
      nextParser: this,
      wasTokenConsumed: true
    };
  }
  /**
   * Convert the current parser into a {@link FrontMatterString} token,
   * if possible.
   *
   * @throws if the first and last tokens are not quote tokens of the same type.
   */
  asStringToken() {
    const endToken = this.currentTokens[this.currentTokens.length - 1];
    assertDefined(endToken, `No matching end token found.`);
    assert(this.startToken.sameType(endToken), `String starts with \`${this.startToken.text}\`, but ends with \`${endToken.text}\`.`);
    return new FrontMatterString([
      this.startToken,
      ...this.currentTokens.slice(1, this.currentTokens.length - 1),
      endToken
    ]);
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterString.prototype, "accept", null);
export {
  PartialFrontMatterString
};
//# sourceMappingURL=frontMatterString.js.map
