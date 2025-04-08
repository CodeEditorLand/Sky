var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { asArray } from "../../../../base/common/arrays.js";
import { IMarkdownString, isEmptyMarkdownString } from "../../../../base/common/htmlContent.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IHoverComputer } from "./hoverOperation.js";
import { GlyphMarginLane } from "../../../common/model.js";
class GlyphHoverComputer {
  constructor(_editor) {
    this._editor = _editor;
  }
  static {
    __name(this, "GlyphHoverComputer");
  }
  computeSync(opts) {
    const toHoverMessage = /* @__PURE__ */ __name((contents) => {
      return {
        value: contents
      };
    }, "toHoverMessage");
    const lineDecorations = this._editor.getLineDecorations(opts.lineNumber);
    const result = [];
    const isLineHover = opts.laneOrLine === "lineNo";
    if (!lineDecorations) {
      return result;
    }
    for (const d of lineDecorations) {
      const lane = d.options.glyphMargin?.position ?? GlyphMarginLane.Center;
      if (!isLineHover && lane !== opts.laneOrLine) {
        continue;
      }
      const hoverMessage = isLineHover ? d.options.lineNumberHoverMessage : d.options.glyphMarginHoverMessage;
      if (!hoverMessage || isEmptyMarkdownString(hoverMessage)) {
        continue;
      }
      result.push(...asArray(hoverMessage).map(toHoverMessage));
    }
    return result;
  }
}
export {
  GlyphHoverComputer
};
//# sourceMappingURL=glyphHoverComputer.js.map
