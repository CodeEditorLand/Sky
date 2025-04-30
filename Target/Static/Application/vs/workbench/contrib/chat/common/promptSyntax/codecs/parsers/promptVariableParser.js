var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { assert } from "../../../../../../../base/common/assert.js";
import { Range } from "../../../../../../../editor/common/core/range.js";
import { BaseToken } from "../../../../../../../editor/common/codecs/baseToken.js";
import { PromptVariable, PromptVariableWithData } from "../tokens/promptVariable.js";
import { At } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/at.js";
import { Tab } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/tab.js";
import { Hash } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/hash.js";
import { Space } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/space.js";
import { Colon } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/colon.js";
import { NewLine } from "../../../../../../../editor/common/codecs/linesCodec/tokens/newLine.js";
import { FormFeed } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/formFeed.js";
import { VerticalTab } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/verticalTab.js";
import { CarriageReturn } from "../../../../../../../editor/common/codecs/linesCodec/tokens/carriageReturn.js";
import { ExclamationMark } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/exclamationMark.js";
import { LeftBracket, RightBracket } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/brackets.js";
import { LeftAngleBracket, RightAngleBracket } from "../../../../../../../editor/common/codecs/simpleCodec/tokens/angleBrackets.js";
import { assertNotConsumed, ParserBase } from "../../../../../../../editor/common/codecs/simpleCodec/parserBase.js";
const STOP_CHARACTERS = [Space, Tab, NewLine, CarriageReturn, VerticalTab, FormFeed, Hash, At].map((token) => {
  return token.symbol;
});
const INVALID_NAME_CHARACTERS = [Hash, Colon, ExclamationMark, LeftAngleBracket, RightAngleBracket, LeftBracket, RightBracket].map((token) => {
  return token.symbol;
});
class PartialPromptVariableName extends ParserBase {
  static {
    __name(this, "PartialPromptVariableName");
  }
  constructor(token) {
    super([token]);
  }
  accept(token) {
    if (STOP_CHARACTERS.includes(token.text)) {
      try {
        return {
          result: "success",
          nextParser: this.asPromptVariable(),
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
    if (token instanceof Colon) {
      this.isConsumed = true;
      if (this.currentTokens.length <= 1) {
        return {
          result: "failure",
          wasTokenConsumed: false
        };
      }
      return {
        result: "success",
        nextParser: new PartialPromptVariableWithData([...this.currentTokens, token]),
        wasTokenConsumed: true
      };
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
   * Try to convert current parser instance into a fully-parsed {@link PromptVariable} token.
   *
   * @throws if sequence of tokens received so far do not constitute a valid prompt variable,
   *        for instance, if there is only `1` starting `#` token is available.
   */
  asPromptVariable() {
    assert(this.currentTokens.length > 1, "Cannot create a prompt variable out of incomplete token sequence.");
    const firstToken = this.currentTokens[0];
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    const variableNameTokens = this.currentTokens.slice(1);
    const variableName = BaseToken.render(variableNameTokens);
    return new PromptVariable(new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn), variableName);
  }
}
__decorate([
  assertNotConsumed
], PartialPromptVariableName.prototype, "accept", null);
class PartialPromptVariableWithData extends ParserBase {
  static {
    __name(this, "PartialPromptVariableWithData");
  }
  constructor(tokens) {
    const firstToken = tokens[0];
    const lastToken = tokens[tokens.length - 1];
    assert(tokens.length > 2, `Tokens list must contain at least 3 items, got '${tokens.length}'.`);
    assert(firstToken instanceof Hash, `The first token must be a '#', got '${firstToken} '.`);
    assert(lastToken instanceof Colon, `The last token must be a ':', got '${lastToken} '.`);
    super([...tokens]);
  }
  accept(token) {
    if (STOP_CHARACTERS.includes(token.text)) {
      this.isConsumed = true;
      const firstToken = this.currentTokens[0];
      const lastToken = this.currentTokens[this.currentTokens.length - 1];
      const variableNameTokens = this.currentTokens.slice(1, this.startTokensCount - 1);
      const variableDataTokens = this.currentTokens.slice(this.startTokensCount);
      const fullRange = new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn);
      const variableName = BaseToken.render(variableNameTokens);
      const variableData = BaseToken.render(variableDataTokens);
      return {
        result: "success",
        nextParser: new PromptVariableWithData(fullRange, variableName, variableData),
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
   * Try to convert current parser instance into a fully-parsed {@link asPromptVariableWithData} token.
   */
  asPromptVariableWithData() {
    const variableNameTokens = this.currentTokens.slice(1, this.startTokensCount - 1);
    const variableDataTokens = this.currentTokens.slice(this.startTokensCount);
    const variableName = BaseToken.render(variableNameTokens);
    const variableData = BaseToken.render(variableDataTokens);
    const firstToken = this.currentTokens[0];
    const lastToken = this.currentTokens[this.currentTokens.length - 1];
    return new PromptVariableWithData(new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn), variableName, variableData);
  }
}
__decorate([
  assertNotConsumed
], PartialPromptVariableWithData.prototype, "accept", null);
export {
  INVALID_NAME_CHARACTERS,
  PartialPromptVariableName,
  PartialPromptVariableWithData,
  STOP_CHARACTERS
};
//# sourceMappingURL=promptVariableParser.js.map
