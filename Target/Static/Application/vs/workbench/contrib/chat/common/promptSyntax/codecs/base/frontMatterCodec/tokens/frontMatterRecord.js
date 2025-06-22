var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { FrontMatterSequence } from "./frontMatterSequence.js";
import { FrontMatterToken } from "./frontMatterToken.js";
class FrontMatterRecordName extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecordName");
  }
  toString() {
    return `front-matter-record-name(${this.shortText()})${this.range}`;
  }
}
class FrontMatterRecordDelimiter extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecordDelimiter");
  }
  toString() {
    return `front-matter-delimiter(${this.shortText()})${this.range}`;
  }
}
class FrontMatterRecord extends FrontMatterToken {
  static {
    __name(this, "FrontMatterRecord");
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
    return this.children[0];
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
    return this.children[2];
  }
  /**
   * Trim spacing tokens at the end of the record.
   */
  trimValueEnd() {
    const { valueToken } = this;
    if (valueToken instanceof FrontMatterSequence === false) {
      return [];
    }
    const trimmedTokens = valueToken.trimEnd();
    this.withRange(BaseToken.fullRange(this.children));
    return trimmedTokens;
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
