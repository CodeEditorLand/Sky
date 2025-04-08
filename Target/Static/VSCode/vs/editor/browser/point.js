var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static {
    __name(this, "Point");
  }
  static equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  add(other) {
    return new Point(this.x + other.x, this.y + other.y);
  }
  deltaX(delta) {
    return new Point(this.x + delta, this.y);
  }
  deltaY(delta) {
    return new Point(this.x, this.y + delta);
  }
  toString() {
    return `(${this.x},${this.y})`;
  }
}
export {
  Point
};
//# sourceMappingURL=point.js.map
