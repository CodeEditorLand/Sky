var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./rulers.css";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { ViewPart } from "../../view/viewPart.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { EditorOption, IRulerOption } from "../../../common/config/editorOptions.js";
class Rulers extends ViewPart {
  static {
    __name(this, "Rulers");
  }
  domNode;
  _renderedRulers;
  _rulers;
  _typicalHalfwidthCharacterWidth;
  constructor(context) {
    super(context);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setClassName("view-rulers");
    this._renderedRulers = [];
    const options = this._context.configuration.options;
    this._rulers = options.get(EditorOption.rulers);
    this._typicalHalfwidthCharacterWidth = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
  }
  dispose() {
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    this._rulers = options.get(EditorOption.rulers);
    this._typicalHalfwidthCharacterWidth = options.get(EditorOption.fontInfo).typicalHalfwidthCharacterWidth;
    return true;
  }
  onScrollChanged(e) {
    return e.scrollHeightChanged;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  _ensureRulersCount() {
    const currentCount = this._renderedRulers.length;
    const desiredCount = this._rulers.length;
    if (currentCount === desiredCount) {
      return;
    }
    if (currentCount < desiredCount) {
      const { tabSize } = this._context.viewModel.model.getOptions();
      const rulerWidth = tabSize;
      let addCount = desiredCount - currentCount;
      while (addCount > 0) {
        const node = createFastDomNode(document.createElement("div"));
        node.setClassName("view-ruler");
        node.setWidth(rulerWidth);
        this.domNode.appendChild(node);
        this._renderedRulers.push(node);
        addCount--;
      }
      return;
    }
    let removeCount = currentCount - desiredCount;
    while (removeCount > 0) {
      const node = this._renderedRulers.pop();
      this.domNode.removeChild(node);
      removeCount--;
    }
  }
  render(ctx) {
    this._ensureRulersCount();
    for (let i = 0, len = this._rulers.length; i < len; i++) {
      const node = this._renderedRulers[i];
      const ruler = this._rulers[i];
      node.setBoxShadow(ruler.color ? `1px 0 0 0 ${ruler.color} inset` : ``);
      node.setHeight(Math.min(ctx.scrollHeight, 1e6));
      node.setLeft(ruler.column * this._typicalHalfwidthCharacterWidth);
    }
  }
}
export {
  Rulers
};
//# sourceMappingURL=rulers.js.map
