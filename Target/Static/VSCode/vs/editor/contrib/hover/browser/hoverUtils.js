var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
function isMousePositionWithinElement(element, posx, posy) {
  const elementRect = dom.getDomNodePagePosition(element);
  if (posx < elementRect.left || posx > elementRect.left + elementRect.width || posy < elementRect.top || posy > elementRect.top + elementRect.height) {
    return false;
  }
  return true;
}
__name(isMousePositionWithinElement, "isMousePositionWithinElement");
export {
  isMousePositionWithinElement
};
//# sourceMappingURL=hoverUtils.js.map
