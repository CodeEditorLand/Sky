var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { NewLine } from "../../../linesCodec/tokens/newLine.js";
import { PartialFrontMatterValue } from "../frontMatterValue.js";
import { assertNever } from "../../../../../../../../../../base/common/assert.js";
import { assertDefined } from "../../../../../../../../../../base/common/types.js";
import { PartialFrontMatterSequence } from "../frontMatterSequence.js";
import { CarriageReturn } from "../../../linesCodec/tokens/carriageReturn.js";
import { Word, FormFeed, SpacingToken } from "../../../simpleCodec/tokens/tokens.js";
import { assertNotConsumed, ParserBase } from "../../../simpleCodec/parserBase.js";
import { FrontMatterValueToken, FrontMatterRecord } from "../../tokens/index.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PartialFrontMatterRecord extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecord");
  }
  constructor(factory, tokens) {
    super(tokens);
    this.factory = factory;
    this.recordNameToken = tokens[0];
    this.recordDelimiterToken = tokens[1];
  }
  accept(token) {
    if (this.valueParser !== void 0) {
      const acceptResult = this.valueParser.accept(token);
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
        delete this.valueParser;
        this.isConsumed = true;
        try {
          return {
            result: "success",
            nextParser: new FrontMatterRecord([
              this.recordNameToken,
              this.recordDelimiterToken,
              nextParser
            ]),
            wasTokenConsumed
          };
        } catch (_error) {
          return {
            result: "failure",
            wasTokenConsumed
          };
        }
      }
      this.valueParser = nextParser;
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed
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
    if (PartialFrontMatterValue.isValueStartToken(token)) {
      this.valueParser = this.factory.createValue(shouldEndTokenSequence);
      return this.accept(token);
    }
    this.valueParser = this.factory.createSequence(shouldEndTokenSequence);
    if (shouldEndTokenSequence(token)) {
      const spaceTokens = this.currentTokens.slice(this.startTokensCount);
      if (spaceTokens.length === 0) {
        spaceTokens.push(Word.newOnLine("", token.range.startLineNumber, token.range.startColumn));
      }
      this.valueParser.addTokens(spaceTokens);
      return {
        result: "success",
        nextParser: this.asRecordToken(),
        wasTokenConsumed: false
      };
    }
    return this.accept(token);
  }
  /**
   * Convert current parser into a {@link FrontMatterRecord} token.
   *
   * @throws if no current parser is present, or it is not of the {@link PartialFrontMatterValue}
   *         or {@link PartialFrontMatterSequence} types
   */
  asRecordToken() {
    assertDefined(this.valueParser, "Current value parser must be defined.");
    if (this.valueParser instanceof PartialFrontMatterValue || this.valueParser instanceof PartialFrontMatterSequence) {
      const valueToken = this.valueParser.asSequenceToken();
      this.currentTokens.push(valueToken);
      this.isConsumed = true;
      return new FrontMatterRecord([
        this.recordNameToken,
        this.recordDelimiterToken,
        valueToken
      ]);
    }
    assertNever(this.valueParser, `Unexpected value parser '${this.valueParser}'.`);
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterRecord.prototype, "accept", null);
function shouldEndTokenSequence(token) {
  return token instanceof NewLine || token instanceof CarriageReturn || token instanceof FormFeed;
}
__name(shouldEndTokenSequence, "shouldEndTokenSequence");
export {
  PartialFrontMatterRecord
};
//# sourceMappingURL=frontMatterRecord.js.map
