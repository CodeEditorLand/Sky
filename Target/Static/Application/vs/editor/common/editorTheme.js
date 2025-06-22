var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class EditorTheme {
  static {
    __name(this, "EditorTheme");
  }
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
