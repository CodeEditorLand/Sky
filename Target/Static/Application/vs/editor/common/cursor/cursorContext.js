var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CursorContext {
  static {
    __name(this, "CursorContext");
  }
  constructor(model, viewModel, coordinatesConverter, cursorConfig) {
    this._cursorContextBrand = void 0;
    this.model = model;
    this.viewModel = viewModel;
    this.coordinatesConverter = coordinatesConverter;
    this.cursorConfig = cursorConfig;
  }
}
export {
  CursorContext
};
//# sourceMappingURL=cursorContext.js.map
