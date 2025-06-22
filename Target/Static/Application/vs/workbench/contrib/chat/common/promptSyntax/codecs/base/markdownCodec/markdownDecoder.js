var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownToken } from "./tokens/markdownToken.js";
import { LeftBracket } from "../simpleCodec/tokens/brackets.js";
import { PartialMarkdownImage } from "./parsers/markdownImage.js";
import { LeftAngleBracket } from "../simpleCodec/tokens/angleBrackets.js";
import { ExclamationMark } from "../simpleCodec/tokens/exclamationMark.js";
import { BaseDecoder } from "../baseDecoder.js";
import { MarkdownCommentStart, PartialMarkdownCommentStart } from "./parsers/markdownComment.js";
import { MarkdownExtensionsDecoder } from "../markdownExtensionsCodec/markdownExtensionsDecoder.js";
import { PartialMarkdownLinkCaption } from "./parsers/markdownLink.js";
class MarkdownDecoder extends BaseDecoder {
  static {
    __name(this, "MarkdownDecoder");
  }
  constructor(stream) {
    super(new MarkdownExtensionsDecoder(stream));
  }
  onStreamData(token) {
    if (token instanceof LeftBracket && !this.current) {
      this.current = new PartialMarkdownLinkCaption(token);
      return;
    }
    if (token instanceof LeftAngleBracket && !this.current) {
      this.current = new PartialMarkdownCommentStart(token);
      return;
    }
    if (token instanceof ExclamationMark && !this.current) {
      this.current = new PartialMarkdownImage(token);
      return;
    }
    if (!this.current) {
      this._onData.fire(token);
      return;
    }
    const parseResult = this.current.accept(token);
    if (parseResult.result === "success") {
      const { nextParser } = parseResult;
      if (nextParser instanceof MarkdownToken) {
        this._onData.fire(nextParser);
        delete this.current;
      } else {
        this.current = nextParser;
      }
    } else {
      for (const currentToken of this.current.tokens) {
        this._onData.fire(currentToken);
      }
      delete this.current;
    }
    if (!parseResult.wasTokenConsumed) {
      this.onStreamData(token);
    }
  }
  onStreamEnd() {
    if (this.current) {
      if (this.current instanceof MarkdownCommentStart) {
        this._onData.fire(this.current.asMarkdownComment());
        delete this.current;
        this.onStreamEnd();
        return;
      }
      const { tokens } = this.current;
      for (const token of [...tokens]) {
        this._onData.fire(token);
      }
      delete this.current;
    }
    super.onStreamEnd();
  }
}
export {
  MarkdownDecoder
};
//# sourceMappingURL=markdownDecoder.js.map
