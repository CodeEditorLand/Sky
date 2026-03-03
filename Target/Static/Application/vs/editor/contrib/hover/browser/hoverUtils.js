var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
var PADDING;
(function(PADDING2) {
  PADDING2[PADDING2["VALUE"] = 3] = "VALUE";
})(PADDING || (PADDING = {}));
function isMousePositionWithinElement(element, posx, posy) {
  const elementRect = dom.getDomNodePagePosition(element);
  if (posx < elementRect.left + 3 || posx > elementRect.left + elementRect.width - 3 || posy < elementRect.top + 3 || posy > elementRect.top + elementRect.height - 3) {
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
