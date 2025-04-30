var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CssClassModifiers } from "../types.js";
import { ReactiveDecorationBase } from "./utils/index.js";
var CssClassNames;
(function(CssClassNames2) {
  CssClassNames2["main"] = ".prompt-front-matter-decoration-marker";
  CssClassNames2["inline"] = ".prompt-front-matter-decoration-marker-inline";
  CssClassNames2["mainInactive"] = ".prompt-front-matter-decoration-marker.prompt-decoration-inactive";
  CssClassNames2["inlineInactive"] = ".prompt-front-matter-decoration-marker-inline.prompt-decoration-inactive";
})(CssClassNames || (CssClassNames = {}));
class FrontMatterMarkerDecoration extends ReactiveDecorationBase {
  static {
    __name(this, "FrontMatterMarkerDecoration");
  }
  /**
   * Activate/deactivate the decoration.
   */
  activate(state) {
    const position = state === true ? this.token.range.getStartPosition() : null;
    this.setCursorPosition(position);
    return this;
  }
  get classNames() {
    return CssClassNames;
  }
  get description() {
    return "Marker decoration of a Front Matter header.";
  }
  static get cssStyles() {
    return {
      [CssClassNames.inline]: [
        "color: var(--vscode-disabledForeground);"
      ],
      [CssClassNames.inlineInactive]: [
        "opacity: 0.25;"
      ]
    };
  }
}
export {
  CssClassNames,
  FrontMatterMarkerDecoration
};
//# sourceMappingURL=frontMatterMarkerDecoration.js.map
