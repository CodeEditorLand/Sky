var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FrontMatterRecordName } from "../../tokens/index.js";
import { Colon, Word, Dash, SpacingToken } from "../../../simpleCodec/tokens/tokens.js";
import { assertNotConsumed, ParserBase } from "../../../simpleCodec/parserBase.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const VALID_NAME_TOKENS = [Word, Dash];
class PartialFrontMatterRecordName extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecordName");
  }
  constructor(factory, startToken) {
    super([startToken]);
    this.factory = factory;
  }
  accept(token) {
    for (const ValidToken of VALID_NAME_TOKENS) {
      if (token instanceof ValidToken) {
        this.currentTokens.push(token);
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
    }
    if (token instanceof Colon || token instanceof SpacingToken) {
      const recordName = new FrontMatterRecordName(this.currentTokens);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: this.factory.createRecordNameWithDelimiter([recordName, token]),
        wasTokenConsumed: true
      };
    }
    this.isConsumed = true;
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterRecordName.prototype, "accept", null);
export {
  PartialFrontMatterRecordName
};
//# sourceMappingURL=frontMatterRecordName.js.map
