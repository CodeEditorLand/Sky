var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { VALID_SPACE_TOKENS } from "./constants.js";
import { Word } from "../simpleCodec/tokens/index.js";
import { TokenStream } from "../utils/tokenStream.js";
import { FrontMatterToken } from "./tokens/index.js";
import { BaseDecoder } from "../../../../base/common/codecs/baseDecoder.js";
import { SimpleDecoder } from "../simpleCodec/simpleDecoder.js";
import { PartialFrontMatterRecordName } from "./parsers/frontMatterRecord.js";
class FrontMatterDecoder extends BaseDecoder {
  static {
    __name(this, "FrontMatterDecoder");
  }
  constructor(stream) {
    if (stream instanceof TokenStream) {
      super(stream);
      return;
    }
    super(new SimpleDecoder(stream));
  }
  onStreamData(token) {
    if (this.current !== void 0) {
      const acceptResult = this.current.accept(token);
      const { result, wasTokenConsumed } = acceptResult;
      if (result === "failure") {
        this.reEmitCurrentTokens();
        if (wasTokenConsumed === false) {
          this._onData.fire(token);
        }
        delete this.current;
        return;
      }
      const { nextParser } = acceptResult;
      if (nextParser instanceof FrontMatterToken) {
        this._onData.fire(nextParser);
        if (wasTokenConsumed === false) {
          this._onData.fire(token);
        }
        delete this.current;
        return;
      }
      this.current = nextParser;
      if (wasTokenConsumed === false) {
        this._onData.fire(token);
      }
      return;
    }
    if (token instanceof Word) {
      this.current = new PartialFrontMatterRecordName(token);
      return;
    }
    for (const ValidToken of VALID_SPACE_TOKENS) {
      if (token instanceof ValidToken) {
        this._onData.fire(token);
        return;
      }
    }
    this.reEmitCurrentTokens();
  }
  onStreamEnd() {
    try {
      if (this.current === void 0) {
        return;
      }
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
  FrontMatterDecoder
};
//# sourceMappingURL=frontMatterDecoder.js.map
