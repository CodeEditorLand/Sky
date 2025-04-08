var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Range } from "../../../core/range.js";
import { MarkdownToken } from "./markdownToken.js";
import { assert } from "../../../../../base/common/assert.js";
class MarkdownComment extends MarkdownToken {
  constructor(range, text) {
    assert(
      text.startsWith("<!--"),
      `The comment must start with '<!--', got '${text.substring(0, 10)}'.`
    );
    super(range);
    this.text = text;
  }
  static {
    __name(this, "MarkdownComment");
  }
  /**
   * Whether the comment has an end comment marker `-->`.
   */
  get hasEndMarker() {
    return this.text.endsWith("-->");
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.sameRange(other.range)) {
      return false;
    }
    if (!(other instanceof MarkdownComment)) {
      return false;
    }
    return this.text === other.text;
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `md-comment("${this.text}")${this.range}`;
  }
}
export {
  MarkdownComment
};
//# sourceMappingURL=markdownComment.js.map
