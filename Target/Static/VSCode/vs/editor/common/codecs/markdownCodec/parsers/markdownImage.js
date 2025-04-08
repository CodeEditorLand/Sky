var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
import { MarkdownLink } from "../tokens/markdownLink.js";
import { MarkdownImage } from "../tokens/markdownImage.js";
import { TSimpleToken } from "../../simpleCodec/simpleDecoder.js";
import { LeftBracket } from "../../simpleCodec/tokens/brackets.js";
import { ExclamationMark } from "../../simpleCodec/tokens/exclamationMark.js";
import { assertNotConsumed, ParserBase, TAcceptTokenResult } from "../../simpleCodec/parserBase.js";
import { MarkdownLinkCaption, PartialMarkdownLink, PartialMarkdownLinkCaption } from "./markdownLink.js";
class PartialMarkdownImage extends ParserBase {
  static {
    __name(this, "PartialMarkdownImage");
  }
  /**
   * Current active parser instance, if in the mode of actively parsing the markdown link sequence.
   */
  markdownLinkParser;
  constructor(token) {
    super([token]);
  }
  /**
   * Get all currently available tokens of the `markdown link` sequence.
   */
  get tokens() {
    const linkTokens = this.markdownLinkParser?.tokens ?? [];
    return [
      ...this.currentTokens,
      ...linkTokens
    ];
  }
  accept(token) {
    if (!this.markdownLinkParser) {
      if (token instanceof LeftBracket) {
        this.markdownLinkParser = new PartialMarkdownLinkCaption(token);
        return {
          result: "success",
          nextParser: this,
          wasTokenConsumed: true
        };
      }
      return {
        result: "failure",
        wasTokenConsumed: false
      };
    }
    const acceptResult = this.markdownLinkParser.accept(token);
    const { result, wasTokenConsumed } = acceptResult;
    if (result === "success") {
      const { nextParser } = acceptResult;
      if (nextParser instanceof MarkdownLink) {
        this.isConsumed = true;
        const firstToken = this.currentTokens[0];
        return {
          result,
          wasTokenConsumed,
          nextParser: new MarkdownImage(
            firstToken.range.startLineNumber,
            firstToken.range.startColumn,
            `${firstToken.text}${nextParser.caption}`,
            nextParser.reference
          )
        };
      }
      this.markdownLinkParser = nextParser;
      return {
        result,
        wasTokenConsumed,
        nextParser: this
      };
    }
    this.isConsumed = true;
    return acceptResult;
  }
}
__decorateClass([
  assertNotConsumed
], PartialMarkdownImage.prototype, "accept", 1);
export {
  PartialMarkdownImage
};
//# sourceMappingURL=markdownImage.js.map
