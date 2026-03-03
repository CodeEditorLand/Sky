import * as nls from "../../../../nls.js";
import { registerSize, sizeForAllThemes } from "../sizeUtils.js";
const bodyFontSize = registerSize("bodyFontSize", sizeForAllThemes(13, "px"), nls.localize("bodyFontSize", "Base font size. This size is used if not overridden by a component."));
const bodyFontSizeSmall = registerSize("bodyFontSize.small", sizeForAllThemes(12, "px"), nls.localize("bodyFontSizeSmall", "Small font size for secondary content."));
const bodyFontSizeXSmall = registerSize("bodyFontSize.xSmall", sizeForAllThemes(11, "px"), nls.localize("bodyFontSizeXSmall", "Extra small font size for less prominent content."));
const codiconFontSize = registerSize("codiconFontSize", sizeForAllThemes(16, "px"), nls.localize("codiconFontSize", "Base font size for codicons."));
const cornerRadiusMedium = registerSize("cornerRadius.medium", sizeForAllThemes(6, "px"), nls.localize("cornerRadiusMedium", "Base corner radius for UI elements."));
const cornerRadiusXSmall = registerSize("cornerRadius.xSmall", sizeForAllThemes(2, "px"), nls.localize("cornerRadiusXSmall", "Extra small corner radius for very compact UI elements."));
const cornerRadiusSmall = registerSize("cornerRadius.small", sizeForAllThemes(4, "px"), nls.localize("cornerRadiusSmall", "Small corner radius for compact UI elements."));
const cornerRadiusLarge = registerSize("cornerRadius.large", sizeForAllThemes(8, "px"), nls.localize("cornerRadiusLarge", "Large corner radius for prominent UI elements."));
const cornerRadiusXLarge = registerSize("cornerRadius.xLarge", sizeForAllThemes(12, "px"), nls.localize("cornerRadiusXLarge", "Extra large corner radius for very prominent UI elements."));
const cornerRadiusCircle = registerSize("cornerRadius.circle", sizeForAllThemes(9999, "px"), nls.localize("cornerRadiusCircle", "Circular corner radius for fully rounded UI elements."));
const strokeThickness = registerSize("strokeThickness", sizeForAllThemes(1, "px"), nls.localize("strokeThickness", "Base stroke thickness for borders and outlines."));
export {
  bodyFontSize,
  bodyFontSizeSmall,
  bodyFontSizeXSmall,
  codiconFontSize,
  cornerRadiusCircle,
  cornerRadiusLarge,
  cornerRadiusMedium,
  cornerRadiusSmall,
  cornerRadiusXLarge,
  cornerRadiusXSmall,
  strokeThickness
};
//# sourceMappingURL=baseSizes.js.map
