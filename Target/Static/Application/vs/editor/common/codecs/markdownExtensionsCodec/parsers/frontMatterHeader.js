var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Dash } from "../../simpleCodec/tokens/dash.js";
import { NewLine } from "../../linesCodec/tokens/newLine.js";
import { FrontMatterHeader } from "../tokens/frontMatterHeader.js";
import { assertDefined } from "../../../../../base/common/types.js";
import { assert, assertNever } from "../../../../../base/common/assert.js";
import { CarriageReturn } from "../../linesCodec/tokens/carriageReturn.js";
import { FrontMatterMarker } from "../tokens/frontMatterMarker.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
class PartialFrontMatterStartMarker extends ParserBase {
  static {
    __name(this, "PartialFrontMatterStartMarker");
  }
  constructor(token) {
    const { range } = token;
    assert(range.startLineNumber === 1, `Front Matter header must start at the first line, but it starts at line #${range.startLineNumber}.`);
    assert(range.startColumn === 1, `Front Matter header must start at the beginning of the line, but it starts at ${range.startColumn}.`);
    super([token]);
  }
  accept(token) {
    const previousToken = this.currentTokens[this.currentTokens.length - 1];
    if (token instanceof Dash || token instanceof CarriageReturn) {
      if (previousToken instanceof Dash === false) {
        this.isConsumed = true;
        return {
          result: "failure",
          wasTokenConsumed: false
        };
      }
      this.currentTokens.push(token);
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: this
      };
    }
    if (token instanceof NewLine) {
      this.isConsumed = true;
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: new PartialFrontMatterHeader(FrontMatterMarker.fromTokens([
          ...this.currentTokens,
          token
        ]))
      };
    }
    this.isConsumed = true;
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
  /**
   * Check if provided dash token can be a start of a Front Matter header.
   */
  static mayStartHeader(token) {
    return token instanceof Dash && token.range.startLineNumber === 1 && token.range.startColumn === 1;
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterStartMarker.prototype, "accept", null);
class PartialFrontMatterHeader extends ParserBase {
  static {
    __name(this, "PartialFrontMatterHeader");
  }
  constructor(startMarker) {
    super([]);
    this.startMarker = startMarker;
  }
  get tokens() {
    const endMarkerTokens = this.maybeEndMarker !== void 0 ? this.maybeEndMarker.tokens : [];
    return [
      ...this.startMarker.tokens,
      ...this.currentTokens,
      ...endMarkerTokens
    ];
  }
  /**
   * Convert the current token sequence into a {@link FrontMatterHeader} token.
   *
   * Note! that this method marks the current parser object as "consumed"
   *       hence it should not be used after this method is called.
   */
  asFrontMatterHeader() {
    assertDefined(this.maybeEndMarker, "Cannot convert to Front Matter header token without an end marker.");
    assert(this.maybeEndMarker.dashCount === this.startMarker.dashTokens.length, [
      "Start and end markers must have the same number of dashes",
      `, got ${this.startMarker.dashTokens.length} / ${this.maybeEndMarker.dashCount}.`
    ].join(""));
    this.isConsumed = true;
    return FrontMatterHeader.fromTokens(this.startMarker.tokens, this.currentTokens, this.maybeEndMarker.tokens);
  }
  accept(token) {
    if (this.maybeEndMarker !== void 0) {
      return this.acceptEndMarkerToken(token);
    }
    if (token instanceof Dash === false || token.range.startColumn !== 1) {
      this.currentTokens.push(token);
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: this
      };
    }
    assert(this.maybeEndMarker === void 0, `End marker parser must not be present.`);
    this.maybeEndMarker = new PartialFrontMatterEndMarker(token);
    return {
      result: "success",
      wasTokenConsumed: true,
      nextParser: this
    };
  }
  /**
   * When a end marker parser is present, we pass all tokens to it
   * until it is completes the parsing process(either success or failure).
   */
  acceptEndMarkerToken(token) {
    assertDefined(this.maybeEndMarker, `Partial end marker parser must be initialized.`);
    const acceptResult = this.maybeEndMarker.accept(token);
    const { result, wasTokenConsumed } = acceptResult;
    if (result === "success") {
      const { nextParser } = acceptResult;
      const endMarkerParsingComplete = nextParser instanceof FrontMatterMarker;
      if (endMarkerParsingComplete === false) {
        return {
          result: "success",
          wasTokenConsumed,
          nextParser: this
        };
      }
      const endMarker = nextParser;
      if (endMarker.dashTokens.length !== this.startMarker.dashTokens.length) {
        return this.handleEndMarkerParsingFailure(endMarker.tokens, wasTokenConsumed);
      }
      this.isConsumed = true;
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: FrontMatterHeader.fromTokens(this.startMarker.tokens, this.currentTokens, this.maybeEndMarker.tokens)
      };
    }
    if (result === "failure") {
      return this.handleEndMarkerParsingFailure(this.maybeEndMarker.tokens, wasTokenConsumed);
    }
    assertNever(result, `Unexpected result '${result}' while parsing the end marker.`);
  }
  /**
   * On failure to parse the end marker, we need to continue parsing
   * the header because there might be another valid end marker in
   * the stream of tokens. Therefore we copy over the end marker tokens
   * into the list of "content" tokens and reset the end marker parser.
   */
  handleEndMarkerParsingFailure(tokens, wasTokenConsumed) {
    this.currentTokens.push(...tokens);
    delete this.maybeEndMarker;
    return {
      result: "success",
      wasTokenConsumed,
      nextParser: this
    };
  }
}
__decorate([
  assertNotConsumed
], PartialFrontMatterHeader.prototype, "accept", null);
class PartialFrontMatterEndMarker extends ParserBase {
  static {
    __name(this, "PartialFrontMatterEndMarker");
  }
  constructor(token) {
    const { range } = token;
    assert(range.startColumn === 1, `Front Matter header must start at the beginning of the line, but it starts at ${range.startColumn}.`);
    super([token]);
  }
  /**
   * Number of dashes in the marker.
   */
  get dashCount() {
    return this.tokens.filter((token) => {
      return token instanceof Dash;
    }).length;
  }
  accept(token) {
    const previousToken = this.currentTokens[this.currentTokens.length - 1];
    if (token instanceof Dash || token instanceof CarriageReturn) {
      if (previousToken instanceof Dash === false) {
        this.isConsumed = true;
        return {
          result: "failure",
          wasTokenConsumed: false
        };
      }
      this.currentTokens.push(token);
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: this
      };
    }
    if (token instanceof NewLine) {
      this.isConsumed = true;
      this.currentTokens.push(token);
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: FrontMatterMarker.fromTokens([
          ...this.currentTokens
        ])
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
], PartialFrontMatterEndMarker.prototype, "accept", null);
export {
  PartialFrontMatterHeader,
  PartialFrontMatterStartMarker
};
//# sourceMappingURL=frontMatterHeader.js.map
