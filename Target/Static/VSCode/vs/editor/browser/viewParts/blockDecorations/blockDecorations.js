var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createFastDomNode, FastDomNode } from "../../../../base/browser/fastDomNode.js";
import "./blockDecorations.css";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
class BlockDecorations extends ViewPart {
  static {
    __name(this, "BlockDecorations");
  }
  domNode;
  blocks = [];
  contentWidth = -1;
  contentLeft = 0;
  constructor(context) {
    super(context);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setClassName("blockDecorations-container");
    this.update();
  }
  update() {
    let didChange = false;
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    const newContentWidth = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth;
    if (this.contentWidth !== newContentWidth) {
      this.contentWidth = newContentWidth;
      didChange = true;
    }
    const newContentLeft = layoutInfo.contentLeft;
    if (this.contentLeft !== newContentLeft) {
      this.contentLeft = newContentLeft;
      didChange = true;
    }
    return didChange;
  }
  dispose() {
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    return this.update();
  }
  onScrollChanged(e) {
    return e.scrollTopChanged || e.scrollLeftChanged;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    let count = 0;
    const decorations = ctx.getDecorationsInViewport();
    for (const decoration of decorations) {
      if (!decoration.options.blockClassName) {
        continue;
      }
      let block = this.blocks[count];
      if (!block) {
        block = this.blocks[count] = createFastDomNode(document.createElement("div"));
        this.domNode.appendChild(block);
      }
      let top;
      let bottom;
      if (decoration.options.blockIsAfterEnd) {
        top = ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, false);
        bottom = ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, true);
      } else {
        top = ctx.getVerticalOffsetForLineNumber(decoration.range.startLineNumber, true);
        bottom = decoration.range.isEmpty() && !decoration.options.blockDoesNotCollapse ? ctx.getVerticalOffsetForLineNumber(decoration.range.startLineNumber, false) : ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, true);
      }
      const [paddingTop, paddingRight, paddingBottom, paddingLeft] = decoration.options.blockPadding ?? [0, 0, 0, 0];
      block.setClassName("blockDecorations-block " + decoration.options.blockClassName);
      block.setLeft(this.contentLeft - paddingLeft);
      block.setWidth(this.contentWidth + paddingLeft + paddingRight);
      block.setTop(top - ctx.scrollTop - paddingTop);
      block.setHeight(bottom - top + paddingTop + paddingBottom);
      count++;
    }
    for (let i = count; i < this.blocks.length; i++) {
      this.blocks[i].domNode.remove();
    }
    this.blocks.length = count;
  }
}
export {
  BlockDecorations
};
//# sourceMappingURL=blockDecorations.js.map
