var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./tokens/promptToken.js";
import { PartialPromptAtMention } from "./parsers/promptAtMentionParser.js";
import { assert, assertNever } from "../../../../../../base/common/assert.js";
import { PartialPromptSlashCommand } from "./parsers/promptSlashCommandParser.js";
import { BaseDecoder } from "./base/baseDecoder.js";
import { At } from "./base/simpleCodec/tokens/at.js";
import { Hash } from "./base/simpleCodec/tokens/hash.js";
import { Slash } from "./base/simpleCodec/tokens/slash.js";
import { DollarSign } from "./base/simpleCodec/tokens/dollarSign.js";
import { PartialPromptVariableName, PartialPromptVariableWithData } from "./parsers/promptVariableParser.js";
import { MarkdownDecoder } from "./base/markdownCodec/markdownDecoder.js";
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
        this._onData.fire(this.current.asPromptVariable());
        return;
      }
      if (this.current instanceof PartialPromptVariableWithData) {
        this._onData.fire(this.current.asPromptVariableWithData());
        return;
      }
      if (this.current instanceof PartialPromptAtMention) {
        this._onData.fire(this.current.asPromptAtMention());
        return;
      }
      if (this.current instanceof PartialPromptSlashCommand) {
        this._onData.fire(this.current.asPromptSlashCommand());
        return;
      }
      assert(this.current instanceof PartialPromptTemplateVariableStart === false, "Incomplete template variable token.");
      if (this.current instanceof PartialPromptTemplateVariable) {
        this._onData.fire(this.current.asPromptTemplateVariable());
        return;
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
