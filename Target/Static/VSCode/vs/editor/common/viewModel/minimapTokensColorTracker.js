var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, markAsSingleton } from "../../../base/common/lifecycle.js";
import { RGBA8 } from "../core/rgba.js";
import { TokenizationRegistry } from "../languages.js";
import { ColorId } from "../encodedTokenAttributes.js";
class MinimapTokensColorTracker extends Disposable {
  static {
    __name(this, "MinimapTokensColorTracker");
  }
  static _INSTANCE = null;
  static getInstance() {
    if (!this._INSTANCE) {
      this._INSTANCE = markAsSingleton(new MinimapTokensColorTracker());
    }
    return this._INSTANCE;
  }
  _colors;
  _backgroundIsLight;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  constructor() {
    super();
    this._updateColorMap();
    this._register(TokenizationRegistry.onDidChange((e) => {
      if (e.changedColorMap) {
        this._updateColorMap();
      }
    }));
  }
  _updateColorMap() {
    const colorMap = TokenizationRegistry.getColorMap();
    if (!colorMap) {
      this._colors = [RGBA8.Empty];
      this._backgroundIsLight = true;
      return;
    }
    this._colors = [RGBA8.Empty];
    for (let colorId = 1; colorId < colorMap.length; colorId++) {
      const source = colorMap[colorId].rgba;
      this._colors[colorId] = new RGBA8(source.r, source.g, source.b, Math.round(source.a * 255));
    }
    const backgroundLuminosity = colorMap[ColorId.DefaultBackground].getRelativeLuminance();
    this._backgroundIsLight = backgroundLuminosity >= 0.5;
    this._onDidChange.fire(void 0);
  }
  getColor(colorId) {
    if (colorId < 1 || colorId >= this._colors.length) {
      colorId = ColorId.DefaultBackground;
    }
    return this._colors[colorId];
  }
  backgroundIsLight() {
    return this._backgroundIsLight;
  }
}
export {
  MinimapTokensColorTracker
};
//# sourceMappingURL=minimapTokensColorTracker.js.map
