var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LinesDiff {
  static {
    __name(this, "LinesDiff");
  }
  constructor(changes, moves, hitTimeout) {
    this.changes = changes;
    this.moves = moves;
    this.hitTimeout = hitTimeout;
  }
}
class MovedText {
  static {
    __name(this, "MovedText");
  }
  constructor(lineRangeMapping, changes) {
    this.lineRangeMapping = lineRangeMapping;
    this.changes = changes;
  }
  flip() {
    return new MovedText(this.lineRangeMapping.flip(), this.changes.map((c) => c.flip()));
  }
}
export {
  LinesDiff,
  MovedText
};
//# sourceMappingURL=linesDiffComputer.js.map
