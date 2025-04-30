var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ViewLineOptions {
  static {
    __name(this, "ViewLineOptions");
  }
  constructor(config, themeType) {
    this.themeType = themeType;
    const options = config.options;
    const fontInfo = options.get(
      52
      /* EditorOption.fontInfo */
    );
    const experimentalWhitespaceRendering = options.get(
      40
      /* EditorOption.experimentalWhitespaceRendering */
    );
    if (experimentalWhitespaceRendering === "off") {
      this.renderWhitespace = options.get(
        104
        /* EditorOption.renderWhitespace */
      );
    } else {
      this.renderWhitespace = "none";
    }
    this.renderControlCharacters = options.get(
      99
      /* EditorOption.renderControlCharacters */
    );
    this.spaceWidth = fontInfo.spaceWidth;
    this.middotWidth = fontInfo.middotWidth;
    this.wsmiddotWidth = fontInfo.wsmiddotWidth;
    this.useMonospaceOptimizations = fontInfo.isMonospace && !options.get(
      33
      /* EditorOption.disableMonospaceOptimizations */
    );
    this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
    this.lineHeight = options.get(
      68
      /* EditorOption.lineHeight */
    );
    this.stopRenderingLineAfter = options.get(
      122
      /* EditorOption.stopRenderingLineAfter */
    );
    this.fontLigatures = options.get(
      53
      /* EditorOption.fontLigatures */
    );
    this.useGpu = options.get(
      39
      /* EditorOption.experimentalGpuAcceleration */
    ) === "on";
  }
  equals(other) {
    return this.themeType === other.themeType && this.renderWhitespace === other.renderWhitespace && this.renderControlCharacters === other.renderControlCharacters && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.useMonospaceOptimizations === other.useMonospaceOptimizations && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineHeight === other.lineHeight && this.stopRenderingLineAfter === other.stopRenderingLineAfter && this.fontLigatures === other.fontLigatures && this.useGpu === other.useGpu;
  }
}
export {
  ViewLineOptions
};
//# sourceMappingURL=viewLineOptions.js.map
