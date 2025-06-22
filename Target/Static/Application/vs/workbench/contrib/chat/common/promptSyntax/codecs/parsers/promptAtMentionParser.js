var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptAtMention } from "../tokens/promptAtMention.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { Range } from "../../../../../../../editor/common/core/range.js";
import { BaseToken } from "../base/baseToken.js";
import { At } from "../base/simpleCodec/tokens/at.js";
import { Tab } from "../base/simpleCodec/tokens/tab.js";
import { Hash } from "../base/simpleCodec/tokens/hash.js";
import { Space } from "../base/simpleCodec/tokens/space.js";
import { Colon } from "../base/simpleCodec/tokens/colon.js";
import { NewLine } from "../base/linesCodec/tokens/newLine.js";
import { FormFeed } from "../base/simpleCodec/tokens/formFeed.js";
import { VerticalTab } from "../base/simpleCodec/tokens/verticalTab.js";
import { CarriageReturn } from "../base/linesCodec/tokens/carriageReturn.js";
import { ExclamationMark } from "../base/simpleCodec/tokens/exclamationMark.js";
import { LeftBracket, RightBracket } from "../base/simpleCodec/tokens/brackets.js";
import { LeftAngleBracket, RightAngleBracket } from "../base/simpleCodec/tokens/angleBrackets.js";
import { assertNotConsumed, ParserBase } from "../base/simpleCodec/parserBase.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const STOP_CHARACTERS = [Space, Tab, NewLine, CarriageReturn, VerticalTab, FormFeed, At, Colon, Hash].map((token) => {
  return token.symbol;
});
const INVALID_NAME_CHARACTERS = [ExclamationMark, LeftAngleBracket, RightAngleBracket, LeftBracket, RightBracket].map((token) => {
  return token.symbol;
});
class PartialPromptAtMention extends ParserBase {
  static {
    __name(this, "PartialPromptAtMention");
  }
  constructor(token) {
    super([token]);
  }
  accept(token) {
    if (STOP_CHARACTERS.includes(token.text)) {
      try {
        return {
          result: "success",
          nextParser: this.asPromptAtMention(),
          wasTokenConsumed: false
        };
      } catch (error) {
        return {
          result: "failure",
          wasTokenConsumed: false
        };
      } finally {
        this.isConsumed = true;
      }
    }
    if (INVALID_NAME_CHARACTERS.includes(token.text)) {
      this.isConsumed = true;
      return {
        result: "failure",
        wasTokenConsumed: false
      };
    }
    this.currentTokens.push(token);
    return {
      result: "success",
      nextParser: this,
      wasTokenConsumed: true
    };
  }
  /**
   * Try to convert current parser instance into a fully-parsed {@link PromptAtMention} token.
   *
   * @throws if sequence of tokens received so far do not constitute a valid prompt variable,
   *        for instance, if there is only `1` starting `@` token is available.
   */
  asPromptAtMention() {
    assert(this.currentTokens.length > 1, "Cannot create a prompt @mention out of incomplete token sequence.");
    const firstToken = this.currentTokens[0];
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    const nameTokens = this.currentTokens.slice(1);
    const atMentionName = BaseToken.render(nameTokens);
    return new PromptAtMention(new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn), atMentionName);
  }
}
__decorate([
  assertNotConsumed
], PartialPromptAtMention.prototype, "accept", null);
export {
  INVALID_NAME_CHARACTERS,
  PartialPromptAtMention,
  STOP_CHARACTERS
};
//# sourceMappingURL=promptAtMentionParser.js.map
