var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class KeyboardLayoutContribution {
  static {
    __name(this, "KeyboardLayoutContribution");
  }
  static {
    this.INSTANCE = new KeyboardLayoutContribution();
  }
  get layoutInfos() {
    return this._layoutInfos;
  }
  constructor() {
    this._layoutInfos = [];
  }
  registerKeyboardLayout(layout) {
    this._layoutInfos.push(layout);
  }
}
export {
  KeyboardLayoutContribution
};
//# sourceMappingURL=_.contribution.js.map
