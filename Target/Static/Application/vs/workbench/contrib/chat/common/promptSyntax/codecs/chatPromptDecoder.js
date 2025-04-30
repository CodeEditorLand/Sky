var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./tokens/promptToken.js";
import { assertNever } from "../../../../../../base/common/assert.js";
import { PartialPromptAtMention } from "./parsers/promptAtMentionParser.js";
import { PartialPromptSlashCommand } from "./parsers/promptSlashCommandParser.js";
import { BaseDecoder } from "../../../../../../base/common/codecs/baseDecoder.js";
import { At } from "../../../../../../editor/common/codecs/simpleCodec/tokens/at.js";
import { Hash } from "../../../../../../editor/common/codecs/simpleCodec/tokens/hash.js";
import { Slash } from "../../../../../../editor/common/codecs/simpleCodec/tokens/slash.js";
import { DollarSign } from "../../../../../../editor/common/codecs/simpleCodec/tokens/dollarSign.js";
import { PartialPromptVariableName, PartialPromptVariableWithData } from "./parsers/promptVariableParser.js";
import { MarkdownDecoder } from "../../../../../../editor/common/codecs/markdownCodec/markdownDecoder.js";
import { PartialPromptTemplateVariable, PartialPromptTemplateVariableStart } from "./parsers/promptTemplateVariableParser.js";
class ChatPromptDecoder extends BaseDecoder {
  static {
    __name(this, "ChatPromptDecoder");
  }
  constructor(stream) {
    super(new MarkdownDecoder(stream));
  }
  onStreamData(token) {
    if (token instanceof Hash && !this.current) {
      this.current = new PartialPromptVariableName(token);
      return;
    }
    if (token instanceof At && !this.current) {
      this.current = new PartialPromptAtMention(token);
      return;
    }
    if (token instanceof Slash && !this.current) {
      this.current = new PartialPromptSlashCommand(token);
      return;
    }
    if (token instanceof DollarSign && !this.current) {
      this.current = new PartialPromptTemplateVariableStart(token);
      return;
    }
    if (!this.current) {
      this._onData.fire(token);
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
        this.reEmitCurrentTokens();
        break;
      }
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
      if (this.current instanceof PartialPromptVariableName) {
        return this._onData.fire(this.current.asPromptVariable());
      }
      if (this.current instanceof PartialPromptVariableWithData) {
        return this._onData.fire(this.current.asPromptVariableWithData());
      }
      if (this.current instanceof PartialPromptAtMention) {
        return this._onData.fire(this.current.asPromptAtMention());
      }
      if (this.current instanceof PartialPromptSlashCommand) {
        return this._onData.fire(this.current.asPromptSlashCommand());
      }
      if (this.current instanceof PartialPromptTemplateVariableStart) {
        throw new Error("Incomplete template variable token.");
      }
      if (this.current instanceof PartialPromptTemplateVariable) {
        return this._onData.fire(this.current.asPromptTemplateVariable());
      }
      assertNever(this.current, `Unknown parser object '${this.current}'`);
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
  ChatPromptDecoder
};
//# sourceMappingURL=chatPromptDecoder.js.map
