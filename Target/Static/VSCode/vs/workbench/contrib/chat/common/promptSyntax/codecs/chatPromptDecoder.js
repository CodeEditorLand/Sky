var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./tokens/promptToken.js";
import { VSBuffer } from "../../../../../../base/common/buffer.js";
import { assertNever } from "../../../../../../base/common/assert.js";
import { ReadableStream } from "../../../../../../base/common/stream.js";
import { BaseDecoder } from "../../../../../../base/common/codecs/baseDecoder.js";
import { PromptVariable, PromptVariableWithData } from "./tokens/promptVariable.js";
import { Hash } from "../../../../../../editor/common/codecs/simpleCodec/tokens/hash.js";
import { MarkdownLink } from "../../../../../../editor/common/codecs/markdownCodec/tokens/markdownLink.js";
import { PartialPromptVariableName, PartialPromptVariableWithData } from "./parsers/promptVariableParser.js";
import { MarkdownDecoder, TMarkdownToken } from "../../../../../../editor/common/codecs/markdownCodec/markdownDecoder.js";
class ChatPromptDecoder extends BaseDecoder {
  static {
    __name(this, "ChatPromptDecoder");
  }
  /**
   * Currently active parser object that is used to parse a well-known sequence of
   * tokens, for instance, a `#file:/path/to/file.md` link that consists of `hash`,
   * `word`, and `colon` tokens sequence plus the `file path` part that follows.
   */
  current;
  constructor(stream) {
    super(new MarkdownDecoder(stream));
  }
  onStreamData(token) {
    if (token instanceof Hash && !this.current) {
      this.current = new PartialPromptVariableName(token);
      return;
    }
    if (!this.current) {
      if (token instanceof MarkdownLink) {
        this._onData.fire(token);
      }
      return;
    }
    const parseResult = this.current.accept(token);
    switch (parseResult.result) {
      // in the case of success there might be 2 cases:
      //   1) parsing fully completed and an instance of `PromptToken` is returned back,
      //      in this case, emit the parsed token (e.g., a `link`) and reset the current
      //      parser object reference so a new parsing process can be initiated next
      //   2) parsing is still in progress and the next parser object is returned, hence
      //      we need to replace the current parser object with a new one and continue
      case "success": {
        const { nextParser } = parseResult;
        if (nextParser instanceof PromptToken) {
          this._onData.fire(nextParser);
          delete this.current;
        } else {
          this.current = nextParser;
        }
        break;
      }
      // in the case of failure, reset the current parser object
      case "failure": {
        delete this.current;
        break;
      }
    }
    if (!parseResult.wasTokenConsumed) {
      this.onStreamData(token);
    }
  }
  onStreamEnd() {
    try {
      if (!this.current) {
        return;
      }
      if (this.current instanceof PartialPromptVariableName) {
        return this._onData.fire(this.current.asPromptVariable());
      }
      if (this.current instanceof PartialPromptVariableWithData) {
        return this._onData.fire(this.current.asPromptVariableWithData());
      }
      assertNever(
        this.current,
        `Unknown parser object '${this.current}'`
      );
    } catch (error) {
    } finally {
      delete this.current;
      super.onStreamEnd();
    }
  }
}
export {
  ChatPromptDecoder
};
//# sourceMappingURL=chatPromptDecoder.js.map
