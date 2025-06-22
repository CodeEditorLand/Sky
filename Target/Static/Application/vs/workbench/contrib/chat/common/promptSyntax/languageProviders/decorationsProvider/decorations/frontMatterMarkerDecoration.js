var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CssClassModifiers } from "../types.js";
import { ReactiveDecorationBase } from "./utils/reactiveDecorationBase.js";
var CssClassNames;
(function(CssClassNames2) {
  CssClassNames2["Main"] = ".prompt-front-matter-decoration-marker";
  CssClassNames2["Inline"] = ".prompt-front-matter-decoration-marker-inline";
  CssClassNames2["MainInactive"] = ".prompt-front-matter-decoration-marker.prompt-decoration-inactive";
  CssClassNames2["InlineInactive"] = ".prompt-front-matter-decoration-marker-inline.prompt-decoration-inactive";
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
      [CssClassNames.Inline]: [
        "color: var(--vscode-disabledForeground);"
      ],
      [CssClassNames.InlineInactive]: [
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
