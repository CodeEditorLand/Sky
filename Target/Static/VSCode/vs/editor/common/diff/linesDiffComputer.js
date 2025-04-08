var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { DetailedLineRangeMapping, LineRangeMapping } from "./rangeMapping.js";
class LinesDiff {
  constructor(changes, moves, hitTimeout) {
    this.changes = changes;
    this.moves = moves;
    this.hitTimeout = hitTimeout;
  }
  static {
    __name(this, "LinesDiff");
  }
}
class MovedText {
  static {
    __name(this, "MovedText");
  }
  lineRangeMapping;
  /**
   * The diff from the original text to the moved text.
   * Must be contained in the original/modified line range.
   * Can be empty if the text didn't change (only moved).
   */
  changes;
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
