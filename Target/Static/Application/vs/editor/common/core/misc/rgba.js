var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class RGBA8 {
  static {
    __name(this, "RGBA8");
  }
  static {
    this.Empty = new RGBA8(0, 0, 0, 0);
  }
  constructor(r, g, b, a) {
    this._rgba8Brand = void 0;
    this.r = RGBA8._clamp(r);
    this.g = RGBA8._clamp(g);
    this.b = RGBA8._clamp(b);
    this.a = RGBA8._clamp(a);
  }
  equals(other) {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }
  static _clamp(c) {
    if (c < 0) {
      return 0;
    }
    if (c > 255) {
      return 255;
    }
    return c | 0;
  }
}
export {
  RGBA8
};
//# sourceMappingURL=rgba.js.map
