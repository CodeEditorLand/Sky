var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./scrollDecoration.css";
import { FastDomNode, createFastDomNode } from "../../../../base/browser/fastDomNode.js";
import { ViewPart } from "../../view/viewPart.js";
import { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
class ScrollDecorationViewPart extends ViewPart {
  static {
    __name(this, "ScrollDecorationViewPart");
  }
  _domNode;
  _scrollTop;
  _width;
  _shouldShow;
  _useShadows;
  constructor(context) {
    super(context);
    this._scrollTop = 0;
    this._width = 0;
    this._updateWidth();
    this._shouldShow = false;
    const options = this._context.configuration.options;
    const scrollbar = options.get(EditorOption.scrollbar);
    this._useShadows = scrollbar.useShadows;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
  }
  dispose() {
    super.dispose();
  }
  _updateShouldShow() {
    const newShouldShow = this._useShadows && this._scrollTop > 0;
    if (this._shouldShow !== newShouldShow) {
      this._shouldShow = newShouldShow;
      return true;
    }
    return false;
  }
  getDomNode() {
    return this._domNode;
  }
  _updateWidth() {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    if (layoutInfo.minimap.renderMinimap === 0 || layoutInfo.minimap.minimapWidth > 0 && layoutInfo.minimap.minimapLeft === 0) {
      this._width = layoutInfo.width;
    } else {
      this._width = layoutInfo.width - layoutInfo.verticalScrollbarWidth;
    }
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const scrollbar = options.get(EditorOption.scrollbar);
    this._useShadows = scrollbar.useShadows;
    this._updateWidth();
    this._updateShouldShow();
    return true;
  }
  onScrollChanged(e) {
    this._scrollTop = e.scrollTop;
    return this._updateShouldShow();
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
    this._domNode.setWidth(this._width);
    this._domNode.setClassName(this._shouldShow ? "scroll-decoration" : "");
  }
}
export {
  ScrollDecorationViewPart
};
//# sourceMappingURL=scrollDecoration.js.map
