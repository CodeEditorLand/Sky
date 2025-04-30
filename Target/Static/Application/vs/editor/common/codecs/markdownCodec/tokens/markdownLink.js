var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownToken } from "./markdownToken.js";
import { Range } from "../../../core/range.js";
import { assert } from "../../../../../base/common/assert.js";
class MarkdownLink extends MarkdownToken {
  static {
    __name(this, "MarkdownLink");
  }
  constructor(lineNumber, columnNumber, caption, reference) {
    assert(!isNaN(lineNumber), `The line number must not be a NaN.`);
    assert(lineNumber > 0, `The line number must be >= 1, got "${lineNumber}".`);
    assert(columnNumber > 0, `The column number must be >= 1, got "${columnNumber}".`);
    assert(caption[0] === "[" && caption[caption.length - 1] === "]", `The caption must be enclosed in square brackets, got "${caption}".`);
    assert(reference[0] === "(" && reference[reference.length - 1] === ")", `The reference must be enclosed in parentheses, got "${reference}".`);
    super(new Range(lineNumber, columnNumber, lineNumber, columnNumber + caption.length + reference.length));
    this.caption = caption;
    this.reference = reference;
    try {
      new URL(this.path);
      this.isURL = true;
    } catch {
      this.isURL = false;
    }
  }
  get text() {
    return `${this.caption}${this.reference}`;
  }
  /**
   * Returns the `reference` part of the link without enclosing parentheses.
   */
  get path() {
    return this.reference.slice(1, this.reference.length - 1);
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.sameRange(other.range)) {
      return false;
    }
    if (!(other instanceof MarkdownLink)) {
      return false;
    }
    return this.text === other.text;
  }
  /**
   * Get the range of the `link part` of the token.
   */
  get linkRange() {
    if (this.path.length === 0) {
      return void 0;
    }
    const { range } = this;
    const startColumn = range.startColumn + this.caption.length + 1;
    const endColumn = startColumn + this.path.length;
    return new Range(range.startLineNumber, startColumn, range.endLineNumber, endColumn);
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `md-link("${this.shortText()}")${this.range}`;
  }
}
export {
  MarkdownLink
};
//# sourceMappingURL=markdownLink.js.map
