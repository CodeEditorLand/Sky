var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PartialFrontMatterArray } from "./frontMatterArray.js";
import { PartialFrontMatterString } from "./frontMatterString.js";
import { FrontMatterBoolean } from "../tokens/frontMatterBoolean.js";
import { FrontMatterValueToken } from "../tokens/frontMatterToken.js";
import { Word, Quote, DoubleQuote, LeftBracket } from "../../simpleCodec/tokens/index.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
const VALID_VALUE_START_TOKENS = Object.freeze([
  Word,
  Quote,
  DoubleQuote,
  LeftBracket
]);
class PartialFrontMatterValue extends ParserBase {
  static {
    __name(this, "PartialFrontMatterValue");
  }
  /**
   * Get the tokens that were accumulated so far.
   */
  get tokens() {
    if (this.currentValueParser === void 0) {
      return [];
    }
    return this.currentValueParser.tokens;
  }
  accept(token) {
    if (this.currentValueParser !== void 0) {
      const acceptResult = this.currentValueParser.accept(token);
      const { result, wasTokenConsumed } = acceptResult;
      this.isConsumed = this.currentValueParser.consumed;
      if (result === "success") {
        const { nextParser } = acceptResult;
        if (nextParser instanceof FrontMatterValueToken) {
          return {
            result: "success",
            nextParser,
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
      return {
        result: "failure",
        wasTokenConsumed
      };
    }
    if (token instanceof Quote || token instanceof DoubleQuote) {
      this.currentValueParser = new PartialFrontMatterString(token);
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed: true
      };
    }
    if (token instanceof LeftBracket) {
      this.currentValueParser = new PartialFrontMatterArray(token);
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed: true
      };
    }
    if (token instanceof Word) {
      this.isConsumed = true;
      try {
        return {
          result: "success",
          nextParser: FrontMatterBoolean.fromToken(token),
          wasTokenConsumed: true
        };
      } catch (_error) {
        return {
          result: "failure",
          wasTokenConsumed: false
        };
      }
    }
    this.isConsumed = true;
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
  /**
   * Check if provided token can be a start of a "value" sequence.
   * See {@link VALID_VALUE_START_TOKENS} for the list of valid tokens.
   */
  static isValueStartToken(token) {
    for (const ValidToken of VALID_VALUE_START_TOKENS) {
      if (token instanceof ValidToken) {
        return true;
      }
    }
    return false;
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterValue.prototype, "accept", null);
export {
  PartialFrontMatterValue,
  VALID_VALUE_START_TOKENS
};
//# sourceMappingURL=frontMatterValue.js.map
