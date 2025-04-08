var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownToken } from "./tokens/markdownToken.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { LeftBracket } from "../simpleCodec/tokens/brackets.js";
import { PartialMarkdownImage } from "./parsers/markdownImage.js";
import { ReadableStream } from "../../../../base/common/stream.js";
import { LeftAngleBracket } from "../simpleCodec/tokens/angleBrackets.js";
import { ExclamationMark } from "../simpleCodec/tokens/exclamationMark.js";
import { BaseDecoder } from "../../../../base/common/codecs/baseDecoder.js";
import { SimpleDecoder, TSimpleToken } from "../simpleCodec/simpleDecoder.js";
import { MarkdownCommentStart, PartialMarkdownCommentStart } from "./parsers/markdownComment.js";
import { MarkdownLinkCaption, PartialMarkdownLink, PartialMarkdownLinkCaption } from "./parsers/markdownLink.js";
class MarkdownDecoder extends BaseDecoder {
  static {
    __name(this, "MarkdownDecoder");
  }
  /**
   * Current parser object that is responsible for parsing a sequence of tokens into
   * some markdown entity. Set to `undefined` when no parsing is in progress at the moment.
   */
  current;
  constructor(stream) {
    super(new SimpleDecoder(stream));
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
      for (const token2 of this.current.tokens) {
        this._onData.fire(token2);
        delete this.current;
      }
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
        return this.onStreamEnd();
      }
      const { tokens } = this.current;
      delete this.current;
      for (const token of [...tokens]) {
        this._onData.fire(token);
      }
    }
    super.onStreamEnd();
  }
}
export {
  MarkdownDecoder
};
//# sourceMappingURL=markdownDecoder.js.map
