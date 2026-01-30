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
function shouldShowHover(hoverEnabled, multiCursorModifier, mouseEvent) {
  if (hoverEnabled === "on") {
    return true;
  }
  if (hoverEnabled === "off") {
    return false;
  }
  return isTriggerModifierPressed(multiCursorModifier, mouseEvent.event);
}
__name(shouldShowHover, "shouldShowHover");
function isTriggerModifierPressed(multiCursorModifier, event) {
  if (multiCursorModifier === "altKey") {
    return event.ctrlKey || event.metaKey;
  }
  return event.altKey;
}
__name(isTriggerModifierPressed, "isTriggerModifierPressed");
export {
  isMousePositionWithinElement,
  isTriggerModifierPressed,
  shouldShowHover
};
//# sourceMappingURL=hoverUtils.js.map
