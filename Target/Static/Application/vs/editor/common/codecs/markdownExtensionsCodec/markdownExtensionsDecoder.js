var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseDecoder } from "../../../../base/common/codecs/baseDecoder.js";
import { MarkdownExtensionsToken } from "./tokens/markdownExtensionsToken.js";
import { SimpleDecoder } from "../simpleCodec/simpleDecoder.js";
import { PartialFrontMatterHeader, PartialFrontMatterStartMarker } from "./parsers/frontMatterHeader.js";
class MarkdownExtensionsDecoder extends BaseDecoder {
  static {
    __name(this, "MarkdownExtensionsDecoder");
  }
  constructor(stream) {
    super(new SimpleDecoder(stream));
  }
  onStreamData(token) {
    if (this.current === void 0 && PartialFrontMatterStartMarker.mayStartHeader(token)) {
      this.current = new PartialFrontMatterStartMarker(token);
      return;
    }
    if (this.current === void 0) {
      this._onData.fire(token);
      return;
    }
    const parseResult = this.current.accept(token);
    if (parseResult.result === "success") {
      const { nextParser } = parseResult;
      if (nextParser instanceof MarkdownExtensionsToken) {
        this._onData.fire(nextParser);
        delete this.current;
      } else {
        this.current = nextParser;
      }
    } else {
      this.reEmitCurrentTokens();
    }
    if (!parseResult.wasTokenConsumed) {
      this.onStreamData(token);
    }
  }
  onStreamEnd() {
    try {
      if (this.current === void 0) {
        return;
      }
      if (this.current instanceof PartialFrontMatterHeader) {
        this._onData.fire(this.current.asFrontMatterHeader());
        delete this.current;
        return;
      }
    } catch (_error) {
      this.reEmitCurrentTokens();
    } finally {
      delete this.current;
      super.onStreamEnd();
    }
  }
  /**
   * Re-emit tokens accumulated so far in the current parser object.
   */
  reEmitCurrentTokens() {
    if (this.current === void 0) {
      return;
    }
    for (const token of this.current.tokens) {
      this._onData.fire(token);
    }
    delete this.current;
  }
}
export {
  MarkdownExtensionsDecoder
};
//# sourceMappingURL=markdownExtensionsDecoder.js.map
