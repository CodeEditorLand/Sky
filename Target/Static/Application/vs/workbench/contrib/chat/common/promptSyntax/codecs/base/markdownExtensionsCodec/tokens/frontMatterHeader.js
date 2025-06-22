var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Text } from "../../textToken.js";
import { BaseToken } from "../../baseToken.js";
import { MarkdownExtensionsToken } from "./markdownExtensionsToken.js";
import { FrontMatterMarker } from "./frontMatterMarker.js";
class FrontMatterHeader extends MarkdownExtensionsToken {
  static {
    __name(this, "FrontMatterHeader");
  }
  constructor(range, startMarker, content, endMarker) {
    super(range);
    this.startMarker = startMarker;
    this.content = content;
    this.endMarker = endMarker;
  }
  /**
   * Return complete text representation of the token.
   */
  get text() {
    const text = [
      this.startMarker.text,
      this.content.text,
      this.endMarker.text
    ];
    return text.join("");
  }
  /**
   * Range of the content of the Front Matter header.
   */
  get contentRange() {
    return this.content.range;
  }
  /**
   * Content token of the Front Matter header.
   */
  get contentToken() {
    return this.content;
  }
  /**
   * Create new instance of the token from the given tokens.
   */
  static fromTokens(startMarkerTokens, contentTokens, endMarkerTokens) {
    const range = BaseToken.fullRange([...startMarkerTokens, ...endMarkerTokens]);
    return new FrontMatterHeader(range, FrontMatterMarker.fromTokens(startMarkerTokens), new Text(contentTokens), FrontMatterMarker.fromTokens(endMarkerTokens));
  }
  /**
   * Returns a string representation of the token.
   */
  toString() {
    return `frontmatter("${this.shortText()}")${this.range}`;
  }
}
export {
  FrontMatterHeader
};
//# sourceMappingURL=frontMatterHeader.js.map
