var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownLink } from "../tokens/markdownLink.js";
import { NewLine } from "../../linesCodec/tokens/newLine.js";
import { assert } from "../../../../../base/common/assert.js";
import { FormFeed } from "../../simpleCodec/tokens/formFeed.js";
import { TSimpleToken } from "../../simpleCodec/simpleDecoder.js";
import { VerticalTab } from "../../simpleCodec/tokens/verticalTab.js";
import { CarriageReturn } from "../../linesCodec/tokens/carriageReturn.js";
import { LeftBracket, RightBracket } from "../../simpleCodec/tokens/brackets.js";
import { ParserBase, TAcceptTokenResult } from "../../simpleCodec/parserBase.js";
import { LeftParenthesis, RightParenthesis } from "../../simpleCodec/tokens/parentheses.js";
const MARKDOWN_LINK_STOP_CHARACTERS = [CarriageReturn, NewLine, VerticalTab, FormFeed].map((token) => {
  return token.symbol;
});
class PartialMarkdownLinkCaption extends ParserBase {
  static {
    __name(this, "PartialMarkdownLinkCaption");
  }
  constructor(token) {
    super([token]);
  }
  accept(token) {
    if (MARKDOWN_LINK_STOP_CHARACTERS.includes(token.text)) {
      return {
        result: "failure",
        wasTokenConsumed: false
      };
    }
    if (token instanceof RightBracket) {
      return {
        result: "success",
        nextParser: new MarkdownLinkCaption([...this.tokens, token]),
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
}
class MarkdownLinkCaption extends ParserBase {
  static {
    __name(this, "MarkdownLinkCaption");
  }
  accept(token) {
    if (token instanceof LeftParenthesis) {
      return {
        result: "success",
        wasTokenConsumed: true,
        nextParser: new PartialMarkdownLink([...this.tokens], token)
      };
    }
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
}
class PartialMarkdownLink extends ParserBase {
  constructor(captionTokens, token) {
    super([token]);
    this.captionTokens = captionTokens;
  }
  static {
    __name(this, "PartialMarkdownLink");
  }
  /**
   * Number of open parenthesis in the sequence.
   * See comment in the {@linkcode accept} method for more details.
   */
  openParensCount = 1;
  get tokens() {
    return [...this.captionTokens, ...this.currentTokens];
  }
  accept(token) {
    if (token instanceof LeftParenthesis) {
      this.openParensCount += 1;
    }
    if (token instanceof RightParenthesis) {
      this.openParensCount -= 1;
      assert(
        this.openParensCount >= 0,
        `Unexpected right parenthesis token encountered: '${token}'.`
      );
      if (this.openParensCount === 0) {
        const { startLineNumber, startColumn } = this.captionTokens[0].range;
        const caption = this.captionTokens.map((token2) => {
          return token2.text;
        }).join("");
        this.currentTokens.push(token);
        const reference = this.currentTokens.map((token2) => {
          return token2.text;
        }).join("");
        return {
          result: "success",
          wasTokenConsumed: true,
          nextParser: new MarkdownLink(
            startLineNumber,
            startColumn,
            caption,
            reference
          )
        };
      }
    }
    if (MARKDOWN_LINK_STOP_CHARACTERS.includes(token.text)) {
      return {
        result: "failure",
        wasTokenConsumed: false
      };
    }
    this.currentTokens.push(token);
    return {
      result: "success",
      nextParser: this,
      wasTokenConsumed: true
    };
  }
}
export {
  MarkdownLinkCaption,
  PartialMarkdownLink,
  PartialMarkdownLinkCaption
};
//# sourceMappingURL=markdownLink.js.map
