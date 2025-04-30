var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BaseToken } from "../../baseToken.js";
import { Dash } from "../../simpleCodec/tokens/dash.js";
import { MarkdownExtensionsToken } from "./markdownExtensionsToken.js";
class FrontMatterMarker extends MarkdownExtensionsToken {
  static {
    __name(this, "FrontMatterMarker");
  }
  /**
   * Returns complete text representation of the token.
   */
  get text() {
    return BaseToken.render(this.tokens);
  }
  /**
   * List of {@link Dash} tokens in the marker.
   */
  get dashTokens() {
    return this.tokens.filter((token) => {
      return token instanceof Dash;
    });
  }
  constructor(range, tokens) {
    super(range);
    this.tokens = tokens;
  }
  /**
   * Create new instance of the token from a provided
   * list of tokens.
   */
  static fromTokens(tokens) {
    const range = BaseToken.fullRange(tokens);
    return new FrontMatterMarker(range, tokens);
  }
  toString() {
    return `frontmatter-marker(${this.dashTokens.length}:${this.range})`;
  }
}
export {
  FrontMatterMarker
};
//# sourceMappingURL=frontMatterMarker.js.map
