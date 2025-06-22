var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../../../../../base/common/assert.js";
import { Colon, SpacingToken } from "../../../simpleCodec/tokens/tokens.js";
import { FrontMatterRecordName, FrontMatterRecordDelimiter } from "../../tokens/index.js";
import { assertNotConsumed, ParserBase } from "../../../simpleCodec/parserBase.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PartialFrontMatterRecordNameWithDelimiter extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecordNameWithDelimiter");
  }
  constructor(factory, tokens) {
    super([...tokens]);
    this.factory = factory;
  }
  accept(token) {
    const previousToken = this.currentTokens[this.currentTokens.length - 1];
    const isSpacingToken = token instanceof SpacingToken;
    if (isSpacingToken && previousToken instanceof Colon) {
      const recordDelimiter = new FrontMatterRecordDelimiter([
        previousToken,
        token
      ]);
      const recordName = this.currentTokens[0];
      assert(recordName instanceof FrontMatterRecordName, `Expected a front matter record name, got '${recordName}'.`);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: this.factory.createRecord([recordName, recordDelimiter]),
        wasTokenConsumed: true
      };
    }
    if (token instanceof SpacingToken) {
      this.currentTokens.push(token);
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed: true
      };
    }
    if (token instanceof Colon) {
      this.currentTokens.push(token);
      return {
        result: "success",
        nextParser: this,
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
], PartialFrontMatterRecordNameWithDelimiter.prototype, "accept", null);
export {
  PartialFrontMatterRecordNameWithDelimiter
};
//# sourceMappingURL=frontMatterRecordNameWithDelimiter.js.map
