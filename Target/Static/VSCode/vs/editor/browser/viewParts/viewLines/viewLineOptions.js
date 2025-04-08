var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorOption } from "../../../common/config/editorOptions.js";
class ViewLineOptions {
  static {
    __name(this, "ViewLineOptions");
  }
  themeType;
  renderWhitespace;
  renderControlCharacters;
  spaceWidth;
  middotWidth;
  wsmiddotWidth;
  useMonospaceOptimizations;
  canUseHalfwidthRightwardsArrow;
  lineHeight;
  stopRenderingLineAfter;
  fontLigatures;
  useGpu;
  constructor(config, themeType) {
    this.themeType = themeType;
    const options = config.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    const experimentalWhitespaceRendering = options.get(EditorOption.experimentalWhitespaceRendering);
    if (experimentalWhitespaceRendering === "off") {
      this.renderWhitespace = options.get(EditorOption.renderWhitespace);
    } else {
      this.renderWhitespace = "none";
    }
    this.renderControlCharacters = options.get(EditorOption.renderControlCharacters);
    this.spaceWidth = fontInfo.spaceWidth;
    this.middotWidth = fontInfo.middotWidth;
    this.wsmiddotWidth = fontInfo.wsmiddotWidth;
    this.useMonospaceOptimizations = fontInfo.isMonospace && !options.get(EditorOption.disableMonospaceOptimizations);
    this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
    this.lineHeight = options.get(EditorOption.lineHeight);
    this.stopRenderingLineAfter = options.get(EditorOption.stopRenderingLineAfter);
    this.fontLigatures = options.get(EditorOption.fontLigatures);
    this.useGpu = options.get(EditorOption.experimentalGpuAcceleration) === "on";
  }
  equals(other) {
    return this.themeType === other.themeType && this.renderWhitespace === other.renderWhitespace && this.renderControlCharacters === other.renderControlCharacters && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.useMonospaceOptimizations === other.useMonospaceOptimizations && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineHeight === other.lineHeight && this.stopRenderingLineAfter === other.stopRenderingLineAfter && this.fontLigatures === other.fontLigatures && this.useGpu === other.useGpu;
  }
}
export {
  ViewLineOptions
};
//# sourceMappingURL=viewLineOptions.js.map
