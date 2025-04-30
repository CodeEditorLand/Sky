var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { assert } from "../../../../../base/common/assert.js";
import { PartialFrontMatterValue } from "./frontMatterValue.js";
import { Colon, Word, Dash, Space, Tab } from "../../simpleCodec/tokens/index.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
import { FrontMatterValueToken, FrontMatterRecordName, FrontMatterRecordDelimiter, FrontMatterRecord } from "../tokens/index.js";
const VALID_NAME_TOKENS = [
  Word,
  Dash
];
const VALID_SPACE_TOKENS = [
  Space,
  Tab
];
const VALID_NAME_STOP_TOKENS = [
  ...VALID_SPACE_TOKENS,
  Colon
];
class PartialFrontMatterRecordName extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecordName");
  }
  constructor(startToken) {
    super([startToken]);
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
    for (const SpaceOrDelimiterToken of VALID_NAME_STOP_TOKENS) {
      if (token instanceof SpaceOrDelimiterToken) {
        const recordName = new FrontMatterRecordName(this.currentTokens);
        this.isConsumed = true;
        return {
          result: "success",
          nextParser: new PartialFrontMatterRecordNameWithDelimiter([recordName, token]),
          wasTokenConsumed: true
        };
      }
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
class PartialFrontMatterRecordNameWithDelimiter extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecordNameWithDelimiter");
  }
  constructor(tokens) {
    super([...tokens]);
  }
  accept(token) {
    const previousToken = this.currentTokens[this.currentTokens.length - 1];
    const isSpacingToken = token instanceof Space || token instanceof Tab;
    if (isSpacingToken === true && previousToken instanceof Colon) {
      const recordDelimiter = new FrontMatterRecordDelimiter([
        previousToken,
        token
      ]);
      const recordName = this.currentTokens[0];
      assert(recordName instanceof FrontMatterRecordName, `Expected a front matter record name, got '${recordName}'.`);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: new PartialFrontMatterRecord([recordName, recordDelimiter]),
        wasTokenConsumed: true
      };
    }
    for (const ValidToken of VALID_SPACE_TOKENS) {
      if (token instanceof ValidToken) {
        this.currentTokens.push(token);
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
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
class PartialFrontMatterRecord extends ParserBase {
  static {
    __name(this, "PartialFrontMatterRecord");
  }
  constructor(tokens) {
    super(tokens);
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
        this.isConsumed = true;
        try {
          return {
            result: "success",
            nextParser: FrontMatterRecord.fromTokens([
              this.currentTokens[0],
              this.currentTokens[1],
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
      this.currentValueParser = nextParser;
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed
      };
    }
    for (const ValidToken of VALID_SPACE_TOKENS) {
      if (token instanceof ValidToken) {
        this.currentTokens.push(token);
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
    }
    if (PartialFrontMatterValue.isValueStartToken(token)) {
      this.currentValueParser = new PartialFrontMatterValue();
      return this.accept(token);
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
], PartialFrontMatterRecord.prototype, "accept", null);
export {
  PartialFrontMatterRecord,
  PartialFrontMatterRecordName,
  PartialFrontMatterRecordNameWithDelimiter
};
//# sourceMappingURL=frontMatterRecord.js.map
