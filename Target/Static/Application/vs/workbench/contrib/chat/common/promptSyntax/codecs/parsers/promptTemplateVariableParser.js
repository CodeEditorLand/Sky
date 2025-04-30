var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { assert } from "../../../../../../../base/common/assert.js";
import { PromptTemplateVariable } from "../tokens/promptTemplateVariable.js";
import { BaseToken } from "../../../../../../../editor/common/codecs/baseToken.js";
import { DollarSign, LeftCurlyBrace, RightCurlyBrace } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/index.js";
import { assertNotConsumed, ParserBase } from "../../../../../../../editor/common/codecs/simpleCodec/parserBase.js";
class PartialPromptTemplateVariableStart extends ParserBase {
  static {
    __name(this, "PartialPromptTemplateVariableStart");
  }
  constructor(token) {
    super([token]);
  }
  accept(token) {
    if (token instanceof LeftCurlyBrace) {
      this.currentTokens.push(token);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: new PartialPromptTemplateVariable(this.currentTokens),
        wasTokenConsumed: true
      };
    }
    return {
      result: "failure",
      wasTokenConsumed: false
    };
  }
}
__decorate([
  assertNotConsumed
], PartialPromptTemplateVariableStart.prototype, "accept", null);
class PartialPromptTemplateVariable extends ParserBase {
  static {
    __name(this, "PartialPromptTemplateVariable");
  }
  constructor(tokens) {
    super(tokens);
  }
  accept(token) {
    if (token instanceof RightCurlyBrace) {
      this.currentTokens.push(token);
      this.isConsumed = true;
      return {
        result: "success",
        nextParser: this.asPromptTemplateVariable(),
        wasTokenConsumed: true
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
   * Returns a string representation of the prompt template variable
   * contents, if any is present.
   */
  get contents() {
    const contentTokens = [];
    if (this.currentTokens.length < 3) {
      return "";
    }
    for (let i = 2; i < this.currentTokens.length; i++) {
      const token = this.currentTokens[i];
      const isLastToken = i === this.currentTokens.length - 1;
      if (token instanceof RightCurlyBrace && isLastToken === true) {
        break;
      }
      contentTokens.push(token);
    }
    return BaseToken.render(contentTokens);
  }
  /**
   * Try to convert current parser instance into a {@link PromptTemplateVariable} token.
   *
   * @throws if:
   * 	- current tokens sequence cannot be converted to a valid template variable token
   */
  asPromptTemplateVariable() {
    const firstToken = this.currentTokens[0];
    const secondToken = this.currentTokens[1];
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    assert(this.currentTokens.length >= 3, "Prompt template variable should have at least 3 tokens.");
    assert(lastToken instanceof RightCurlyBrace, 'Last token is not a "}".');
    assert(firstToken instanceof DollarSign, 'First token must be a "$".');
    assert(secondToken instanceof LeftCurlyBrace, 'Second token must be a "{".');
    return new PromptTemplateVariable(BaseToken.fullRange(this.currentTokens), this.contents);
  }
}
__decorate([
  assertNotConsumed
], PartialPromptTemplateVariable.prototype, "accept", null);
export {
  PartialPromptTemplateVariable,
  PartialPromptTemplateVariableStart
};
//# sourceMappingURL=promptTemplateVariableParser.js.map
