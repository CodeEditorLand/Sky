var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IColorTheme } from "../../platform/theme/common/themeService.js";
import { ColorIdentifier } from "../../platform/theme/common/colorRegistry.js";
import { Color } from "../../base/common/color.js";
import { ColorScheme } from "../../platform/theme/common/theme.js";
class EditorTheme {
  static {
    __name(this, "EditorTheme");
  }
  _theme;
  get type() {
    return this._theme.type;
  }
  get value() {
    return this._theme;
  }
  constructor(theme) {
    this._theme = theme;
  }
  update(theme) {
    this._theme = theme;
  }
  getColor(color) {
    return this._theme.getColor(color);
  }
}
export {
  EditorTheme
};
//# sourceMappingURL=editorTheme.js.map
