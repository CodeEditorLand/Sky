var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../../../../../../../editor/common/core/range.js";
import { BaseToken } from "../../baseToken.js";
import { Dash } from "../../simpleCodec/tokens/dash.js";
import { assert } from "../../../../../../../../../base/common/assert.js";
import { MarkdownComment } from "../tokens/markdownComment.js";
import { ExclamationMark } from "../../simpleCodec/tokens/exclamationMark.js";
import { LeftAngleBracket, RightAngleBracket } from "../../simpleCodec/tokens/angleBrackets.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PartialMarkdownCommentStart extends ParserBase {
  static {
    __name(this, "PartialMarkdownCommentStart");
  }
  constructor(token) {
    super([token]);
  }
  accept(token) {
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    if (token instanceof ExclamationMark && lastToken instanceof LeftAngleBracket) {
      this.currentTokens.push(token);
      return {
        result: "success",
        nextParser: this,
        wasTokenConsumed: true
      };
    }
    if (token instanceof Dash) {
      this.currentTokens.push(token);
      if (lastToken instanceof ExclamationMark) {
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
      if (lastToken instanceof Dash) {
        const token1 = this.currentTokens[0];
        const token2 = this.currentTokens[1];
        const token3 = this.currentTokens[2];
        const token4 = this.currentTokens[3];
        assert(token1 instanceof LeftAngleBracket, `The first token must be a '<', got '${token1}'.`);
        assert(token2 instanceof ExclamationMark, `The second token must be a '!', got '${token2}'.`);
        assert(token3 instanceof Dash, `The third token must be a '-', got '${token3}'.`);
        assert(token4 instanceof Dash, `The fourth token must be a '-', got '${token4}'.`);
        this.isConsumed = true;
        return {
          result: "success",
          nextParser: new MarkdownCommentStart([token1, token2, token3, token4]),
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
], PartialMarkdownCommentStart.prototype, "accept", null);
class MarkdownCommentStart extends ParserBase {
  static {
    __name(this, "MarkdownCommentStart");
  }
  constructor(tokens) {
    super(tokens);
  }
  accept(token) {
    if (token instanceof RightAngleBracket && this.endsWithDashes) {
      this.currentTokens.push(token);
      return {
        result: "success",
        nextParser: this.asMarkdownComment(),
        wasTokenConsumed: true
      };
    }
    this.currentTokens.push(token);
    return {
      result: "success",
      nextParser: this,
      wasTokenConsumed: true
    };
  }
  /**
   * Convert the current token sequence into a {@link MarkdownComment} token.
   *
   * Note! that this method marks the current parser object as "consumed"
   *       hence it should not be used after this method is called.
   */
  asMarkdownComment() {
    this.isConsumed = true;
    return new MarkdownComment(this.range, BaseToken.render(this.currentTokens));
  }
  /**
   * Get range of current token sequence.
   */
  get range() {
    const firstToken = this.currentTokens[0];
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    const range = new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn);
    return range;
  }
  /**
   * Whether the current token sequence ends with two dashes.
   */
  get endsWithDashes() {
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    if (!(lastToken instanceof Dash)) {
      return false;
    }
    const secondLastToken = this.currentTokens[this.currentTokens.length - 2];
    if (!(secondLastToken instanceof Dash)) {
      return false;
    }
    return true;
  }
}
__decorate([
  assertNotConsumed
], MarkdownCommentStart.prototype, "accept", null);
export {
  MarkdownCommentStart,
  PartialMarkdownCommentStart
};
//# sourceMappingURL=markdownComment.js.map
