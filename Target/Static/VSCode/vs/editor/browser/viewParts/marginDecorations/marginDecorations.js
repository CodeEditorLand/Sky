var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./marginDecorations.css";
import { DecorationToRender, DedupOverlay } from "../glyphMargin/glyphMargin.js";
import { RenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
class MarginViewLineDecorationsOverlay extends DedupOverlay {
  static {
    __name(this, "MarginViewLineDecorationsOverlay");
  }
  _context;
  _renderResult;
  constructor(context) {
    super();
    this._context = context;
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  _getDecorations(ctx) {
    const decorations = ctx.getDecorationsInViewport();
    const r = [];
    let rLen = 0;
    for (let i = 0, len = decorations.length; i < len; i++) {
      const d = decorations[i];
      const marginClassName = d.options.marginClassName;
      const zIndex = d.options.zIndex;
      if (marginClassName) {
        r[rLen++] = new DecorationToRender(d.range.startLineNumber, d.range.endLineNumber, marginClassName, null, zIndex);
      }
    }
    return r;
  }
  prepareRender(ctx) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const toRender = this._render(visibleStartLineNumber, visibleEndLineNumber, this._getDecorations(ctx));
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const decorations = toRender[lineIndex].getDecorations();
      let lineOutput = "";
      for (const decoration of decorations) {
        lineOutput += '<div class="cmdr ' + decoration.className + '" style=""></div>';
      }
      output[lineIndex] = lineOutput;
    }
    this._renderResult = output;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    return this._renderResult[lineNumber - startLineNumber];
  }
}
export {
  MarginViewLineDecorationsOverlay
};
//# sourceMappingURL=marginDecorations.js.map
