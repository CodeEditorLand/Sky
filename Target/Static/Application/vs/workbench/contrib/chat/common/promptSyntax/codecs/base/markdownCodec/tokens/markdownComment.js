var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownToken } from "./markdownToken.js";
import { assert } from "../../../../../../../../../base/common/assert.js";
class MarkdownComment extends MarkdownToken {
  static {
    __name(this, "MarkdownComment");
  }
  constructor(range, text) {
    assert(text.startsWith("<!--"), `The comment must start with '<!--', got '${text.substring(0, 10)}'.`);
    super(range);
    this.text = text;
  }
  /**
   * Whether the comment has an end comment marker `-->`.
   */
  get hasEndMarker() {
    return this.text.endsWith("-->");
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `md-comment("${this.shortText()}")${this.range}`;
  }
}
export {
  MarkdownComment
};
//# sourceMappingURL=markdownComment.js.map
