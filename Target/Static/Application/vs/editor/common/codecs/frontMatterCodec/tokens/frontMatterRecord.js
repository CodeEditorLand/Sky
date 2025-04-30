var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { assert } from "../../../../../base/common/assert.js";
import { FrontMatterToken, FrontMatterValueToken } from "../tokens/frontMatterToken.js";
class FrontMatterRecordName extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecordName");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.tokens = tokens;
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  toString() {
    return `front-matter-record-name(${this.shortText()})${this.range}`;
  }
}
class FrontMatterRecordDelimiter extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecordDelimiter");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.tokens = tokens;
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  toString() {
    return `front-matter-delimiter(${this.shortText()})${this.range}`;
  }
}
class FrontMatterRecord extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecord");
  }
  constructor(tokens) {
    super(BaseToken.fullRange(tokens));
    this.tokens = tokens;
  }
  /**
   * Token that represent `name` of the record.
   *
   * E.g., `tools` in the example below:
   *
   * ```
   * ---
   * tools: ['value']
   * ---
   * ```
   */
  get nameToken() {
    return this.tokens[0];
  }
  /**
   * Token that represent `value` of the record.
   *
   * E.g., `['value']` in the example below:
   *
   * ```
   * ---
   * tools: ['value']
   * ---
   * ```
   */
  get valueToken() {
    return this.tokens[2];
  }
  /**
   * Create new instance from a list of tokens.
   *
   * @throws if:
   *  - the list of tokens is not exactly 3 tokens long
   * 	- the first token in the list is not a `FrontMatterRecordName`
   * 	- the second token in the list is not a `FrontMatterRecordDelimiter`
   * 	- the third token in the list is not a `FrontMatterValueToken`
   *
   */
  static fromTokens(tokens) {
    assert(tokens.length === 3, `A front matter record must consist of exactly 3 tokens, got '${tokens.length}'.`);
    const token1 = tokens[0];
    const token2 = tokens[1];
    const token3 = tokens[2];
    assert(token1 instanceof FrontMatterRecordName, `Token #1 must be a front matter record name, got '${token1}'.`);
    assert(token2 instanceof FrontMatterRecordDelimiter, `Token #2 must be a front matter record delimiter, got '${token2}'.`);
    assert(token3 instanceof FrontMatterValueToken, `Token #3 must be a front matter value, got '${token3}'.`);
    return new FrontMatterRecord([
      token1,
      token2,
      token3
    ]);
  }
  get text() {
    return BaseToken.render(this.tokens);
  }
  toString() {
    return `front-matter-record(${this.shortText()})${this.range}`;
  }
}
export {
  FrontMatterRecord,
  FrontMatterRecordDelimiter,
  FrontMatterRecordName
};
//# sourceMappingURL=frontMatterRecord.js.map
