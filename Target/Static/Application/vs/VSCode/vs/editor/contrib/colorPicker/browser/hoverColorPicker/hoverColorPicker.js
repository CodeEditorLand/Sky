var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ColorDecorationInjectedTextMarker } from "../colorDetector.js";
function isOnColorDecorator(mouseEvent) {
  const target = mouseEvent.target;
  return !!target && target.type === 6 && target.detail.injectedText?.options.attachedData === ColorDecorationInjectedTextMarker;
}
__name(isOnColorDecorator, "isOnColorDecorator");
export {
  isOnColorDecorator
};
//# sourceMappingURL=hoverColorPicker.js.map
