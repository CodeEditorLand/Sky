var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { VALID_SPACE_TOKENS } from "../constants.js";
import { assert } from "../../../../../base/common/assert.js";
import { FrontMatterArray } from "../tokens/frontMatterArray.js";
import { assertDefined } from "../../../../../base/common/types.js";
import { FrontMatterValueToken } from "../tokens/frontMatterToken.js";
import { Comma, RightBracket } from "../../simpleCodec/tokens/index.js";
import { PartialFrontMatterValue, VALID_VALUE_START_TOKENS } from "./frontMatterValue.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
const VALID_DELIMITER_TOKENS = Object.freeze([
  ...VALID_SPACE_TOKENS,
  Comma
]);
class PartialFrontMatterArray extends ParserBase {
  static {
    __name(this, "PartialFrontMatterArray");
  }
  constructor(startToken) {
    for (const DelimiterToken of VALID_DELIMITER_TOKENS) {
      for (const ValueStartToken of VALID_VALUE_START_TOKENS) {
        assert(DelimiterToken !== ValueStartToken, `Delimiter tokens list must not contain value start token '${ValueStartToken}'.`);
      }
    }
    super([startToken]);
    this.startToken = startToken;
    this.arrayItemAllowed = true;
  }
  accept(token) {
    if (this.currentValueParser !== void 0) {
      const acceptResult = this.currentValueParser.accept(token);
      const { result, wasTokenConsumed } = acceptResult;
      if (result === "failure") {
        this.isConsumed = true;
        return {
          result: "failure",
          wasTokenConsumed
        };
      }
      const { nextParser } = acceptResult;
      if (nextParser instanceof FrontMatterValueToken) {
        this.currentTokens.push(nextParser);
        delete this.currentValueParser;
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed
        };
      }
      this.currentValueParser = nextParser;
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed
      };
    }
    if (token instanceof RightBracket) {
      assert(this.currentValueParser === void 0, `Unexpected end of array. Last value is not finished.`);
      this.currentTokens.push(token);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: this.asArrayToken(),
        wasTokenConsumed: true
      };
    }
    for (const ValidToken of VALID_DELIMITER_TOKENS) {
      if (token instanceof ValidToken) {
        this.currentTokens.push(token);
        if (this.arrayItemAllowed === false && token instanceof Comma) {
          this.arrayItemAllowed = true;
        }
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
    }
    if (this.arrayItemAllowed === true && PartialFrontMatterValue.isValueStartToken(token)) {
      this.currentValueParser = new PartialFrontMatterValue();
      this.arrayItemAllowed = false;
      return this.accept(token);
    }
    this.isConsumed = true;
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
  /**
   * Convert current parser into a {@link FrontMatterArray} token,
   * if possible.
   *
   * @throws if the last token in the accumulated token list
   * 		   is not a closing bracket ({@link RightBracket}).
   */
  asArrayToken() {
    this.isConsumed = true;
    const endToken = this.currentTokens[this.currentTokens.length - 1];
    assertDefined(endToken, `No tokens found.`);
    assert(endToken instanceof RightBracket, "Cannot find a closing bracket of the array.");
    const valueTokens = [];
    for (const currentToken of this.currentTokens) {
      if (currentToken instanceof FrontMatterValueToken) {
        valueTokens.push(currentToken);
      }
    }
    return new FrontMatterArray([
      this.startToken,
      ...valueTokens,
      endToken
    ]);
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterArray.prototype, "accept", null);
export {
  PartialFrontMatterArray
};
//# sourceMappingURL=frontMatterArray.js.map
