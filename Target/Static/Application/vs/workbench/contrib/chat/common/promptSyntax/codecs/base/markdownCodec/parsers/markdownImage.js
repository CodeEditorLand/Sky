var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownLink } from "../tokens/markdownLink.js";
import { MarkdownImage } from "../tokens/markdownImage.js";
import { LeftBracket } from "../../simpleCodec/tokens/brackets.js";
import { assertNotConsumed, ParserBase } from "../../simpleCodec/parserBase.js";
import { PartialMarkdownLinkCaption } from "./markdownLink.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PartialMarkdownImage extends ParserBase {
  static {
    __name(this, "PartialMarkdownImage");
  }
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
          nextParser: new MarkdownImage(firstToken.range.startLineNumber, firstToken.range.startColumn, `${firstToken.text}${nextParser.caption}`, nextParser.reference)
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
__decorate([
  assertNotConsumed
], PartialMarkdownImage.prototype, "accept", null);
export {
  PartialMarkdownImage
};
//# sourceMappingURL=markdownImage.js.map
