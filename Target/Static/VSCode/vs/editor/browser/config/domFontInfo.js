var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FastDomNode } from "../../../base/browser/fastDomNode.js";
import { BareFontInfo } from "../../common/config/fontInfo.js";
function applyFontInfo(domNode, fontInfo) {
  if (domNode instanceof FastDomNode) {
    domNode.setFontFamily(fontInfo.getMassagedFontFamily());
    domNode.setFontWeight(fontInfo.fontWeight);
    domNode.setFontSize(fontInfo.fontSize);
    domNode.setFontFeatureSettings(fontInfo.fontFeatureSettings);
    domNode.setFontVariationSettings(fontInfo.fontVariationSettings);
    domNode.setLineHeight(fontInfo.lineHeight);
    domNode.setLetterSpacing(fontInfo.letterSpacing);
  } else {
    domNode.style.fontFamily = fontInfo.getMassagedFontFamily();
    domNode.style.fontWeight = fontInfo.fontWeight;
    domNode.style.fontSize = fontInfo.fontSize + "px";
    domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
    domNode.style.fontVariationSettings = fontInfo.fontVariationSettings;
    domNode.style.lineHeight = fontInfo.lineHeight + "px";
    domNode.style.letterSpacing = fontInfo.letterSpacing + "px";
  }
}
__name(applyFontInfo, "applyFontInfo");
export {
  applyFontInfo
};
//# sourceMappingURL=domFontInfo.js.map
