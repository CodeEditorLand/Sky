var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Word } from "../simpleCodec/tokens/tokens.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { VALID_INTER_RECORD_SPACING_TOKENS } from "./constants.js";
import { FrontMatterToken, FrontMatterRecord } from "./tokens/index.js";
import { BaseDecoder } from "../baseDecoder.js";
import { SimpleDecoder } from "../simpleCodec/simpleDecoder.js";
import { ObjectStream } from "../utils/objectStream.js";
import { PartialFrontMatterRecord } from "./parsers/frontMatterRecord/frontMatterRecord.js";
import { FrontMatterParserFactory } from "./parsers/frontMatterParserFactory.js";
class FrontMatterDecoder extends BaseDecoder {
  static {
    __name(this, "FrontMatterDecoder");
  }
  constructor(stream) {
    if (stream instanceof ObjectStream) {
      super(stream);
    } else {
      super(new SimpleDecoder(stream));
    }
    this.parserFactory = new FrontMatterParserFactory();
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
        const trimmedTokens = nextParser instanceof FrontMatterRecord ? nextParser.trimValueEnd() : [];
        this._onData.fire(nextParser);
        for (const trimmedToken of trimmedTokens) {
          this._onData.fire(trimmedToken);
        }
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
      this.current = this.parserFactory.createRecordName(token);
      return;
    }
    for (const ValidToken of VALID_INTER_RECORD_SPACING_TOKENS) {
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
      assert(this.current instanceof PartialFrontMatterRecord, "Only partial front matter records can be processed on stream end.");
      const record = this.current.asRecordToken();
      const trimmedTokens = record.trimValueEnd();
      this._onData.fire(record);
      for (const trimmedToken of trimmedTokens) {
        this._onData.fire(trimmedToken);
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
  FrontMatterDecoder
};
//# sourceMappingURL=frontMatterDecoder.js.map
