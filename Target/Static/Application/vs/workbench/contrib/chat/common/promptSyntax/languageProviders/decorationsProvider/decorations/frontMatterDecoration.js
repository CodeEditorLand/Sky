var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../nls.js";
import { contrastBorder, editorBackground } from "../../../../../../../../platform/theme/common/colorRegistry.js";
import { asCssVariable, darken, registerColor } from "../../../../../../../../platform/theme/common/colorUtils.js";
import { FrontMatterHeader } from "../../../codecs/base/markdownExtensionsCodec/tokens/frontMatterHeader.js";
import { CssClassModifiers } from "../types.js";
import { FrontMatterMarkerDecoration } from "./frontMatterMarkerDecoration.js";
import { ReactiveDecorationBase } from "./utils/reactiveDecorationBase.js";
var CssClassNames;
(function(CssClassNames2) {
  CssClassNames2["Main"] = ".prompt-front-matter-decoration";
  CssClassNames2["Inline"] = ".prompt-front-matter-decoration-inline";
  CssClassNames2["MainInactive"] = ".prompt-front-matter-decoration.prompt-decoration-inactive";
  CssClassNames2["InlineInactive"] = ".prompt-front-matter-decoration-inline.prompt-decoration-inactive";
})(CssClassNames || (CssClassNames = {}));
const BACKGROUND_COLOR = registerColor("prompt.frontMatter.background", { dark: darken(editorBackground, 0.2), light: darken(editorBackground, 0.05), hcDark: contrastBorder, hcLight: contrastBorder }, localize("chat.prompt.frontMatter.background.description", "Background color of a Front Matter header block."));
const INACTIVE_BACKGROUND_COLOR = registerColor("prompt.frontMatter.inactiveBackground", { dark: darken(editorBackground, 0.1), light: darken(editorBackground, 0.025), hcDark: contrastBorder, hcLight: contrastBorder }, localize("chat.prompt.frontMatter.inactiveBackground.description", "Background color of an inactive Front Matter header block."));
const CSS_STYLES = {
  [CssClassNames.Main]: [
    `background-color: ${asCssVariable(BACKGROUND_COLOR)};`,
    "z-index: -1;"
    // this is required to allow for selections to appear above the decoration background
  ],
  [CssClassNames.MainInactive]: [
    `background-color: ${asCssVariable(INACTIVE_BACKGROUND_COLOR)};`
  ],
  [CssClassNames.InlineInactive]: [
    "color: var(--vscode-disabledForeground);"
  ],
  ...FrontMatterMarkerDecoration.cssStyles
};
class FrontMatterDecoration extends ReactiveDecorationBase {
  static {
    __name(this, "FrontMatterDecoration");
  }
  constructor(accessor, token) {
    super(accessor, token);
    this.childDecorators.push(new FrontMatterMarkerDecoration(accessor, token.startMarker), new FrontMatterMarkerDecoration(accessor, token.endMarker));
  }
  setCursorPosition(position) {
    const result = super.setCursorPosition(position);
    for (const marker of this.childDecorators) {
      if (marker instanceof FrontMatterMarkerDecoration === false) {
        continue;
      }
      marker.activate(this.active);
    }
    return result;
  }
  get classNames() {
    return CssClassNames;
  }
  get isWholeLine() {
    return true;
  }
  get description() {
    return "Front Matter header decoration.";
  }
  static get cssStyles() {
    return CSS_STYLES;
  }
  /**
   * Whether current decoration class can decorate provided token.
   */
  static handles(token) {
    return token instanceof FrontMatterHeader;
  }
}
export {
  BACKGROUND_COLOR,
  CSS_STYLES,
  CssClassNames,
  FrontMatterDecoration,
  INACTIVE_BACKGROUND_COLOR
};
//# sourceMappingURL=frontMatterDecoration.js.map
