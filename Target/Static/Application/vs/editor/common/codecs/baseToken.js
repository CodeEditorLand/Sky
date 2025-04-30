var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { pick } from "../../../base/common/arrays.js";
import { assert } from "../../../base/common/assert.js";
import { Range } from "../../../editor/common/core/range.js";
class BaseToken {
  static {
    __name(this, "BaseToken");
  }
  constructor(_range) {
    this._range = _range;
  }
  get range() {
    return this._range;
  }
  /**
   * Check if this token has the same range as another one.
   */
  sameRange(other) {
    return this.range.equalsRange(other);
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!(other instanceof this.constructor)) {
      return false;
    }
    return this.sameRange(other.range);
  }
  /**
   * Change `range` of the token with provided range components.
   */
  withRange(components) {
    this._range = new Range(components.startLineNumber ?? this.range.startLineNumber, components.startColumn ?? this.range.startColumn, components.endLineNumber ?? this.range.endLineNumber, components.endColumn ?? this.range.endColumn);
    return this;
  }
  /**
   * Render a list of tokens into a string.
   */
  static render(tokens) {
    return tokens.map(pick("text")).join("");
  }
  /**
   * Returns the full range of a list of tokens in which the first token is
   * used as the start of a tokens sequence and the last token reflects the end.
   *
   * @throws if:
   * 	- provided {@link tokens} list is empty
   *  - the first token start number is greater than the start line of the last token
   *  - if the first and last token are on the same line, the first token start column must
   * 	  be smaller than the start column of the last token
   */
  static fullRange(tokens) {
    assert(tokens.length > 0, "Cannot get full range for an empty list of tokens.");
    const firstToken = tokens[0];
    const lastToken = tokens[tokens.length - 1];
    assert(firstToken.range.startLineNumber <= lastToken.range.startLineNumber, "First token must start on previous or the same line as the last token.");
    if (firstToken !== lastToken && firstToken.range.startLineNumber === lastToken.range.startLineNumber) {
      assert(firstToken.range.endColumn <= lastToken.range.startColumn, [
        "First token must end at least on previous or the same column as the last token.",
        `First token: ${firstToken}; Last token: ${lastToken}.`
      ].join("\n"));
    }
    return new Range(firstToken.range.startLineNumber, firstToken.range.startColumn, lastToken.range.endLineNumber, lastToken.range.endColumn);
  }
  /**
   * Shorten version of the {@link text} property.
   */
  shortText(maxLength = 32) {
    if (this.text.length <= maxLength) {
      return this.text;
    }
    return `${this.text.slice(0, maxLength - 1)}...`;
  }
}
class Text extends BaseToken {
  static {
    __name(this, "Text");
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  constructor(range, tokens) {
    super(range);
    this.tokens = tokens;
  }
  /**
   * Create new instance of the token from a provided list of tokens.
   *
   * @throws if the provided tokens list is empty because this function
   *         automatically infers the range of the resulting token based
   *         on the first and last token in the list.
   */
  static fromTokens(tokens) {
    assert(tokens.length > 0, "Cannot infer range from an empty list of tokens.");
    const range = BaseToken.fullRange(tokens);
    return new Text(range, tokens);
  }
  toString() {
    return `text(${this.shortText()})${this.range}`;
  }
}
export {
  BaseToken,
  Text
};
//# sourceMappingURL=baseToken.js.map
