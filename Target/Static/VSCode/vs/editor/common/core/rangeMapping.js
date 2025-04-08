var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLastMonotonous } from "../../../base/common/arraysFind.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
import { TextLength } from "./textLength.js";
class RangeMapping {
  constructor(mappings) {
    this.mappings = mappings;
  }
  static {
    __name(this, "RangeMapping");
  }
  mapPosition(position) {
    const mapping = findLastMonotonous(this.mappings, (m) => m.original.getStartPosition().isBeforeOrEqual(position));
    if (!mapping) {
      return PositionOrRange.position(position);
    }
    if (mapping.original.containsPosition(position)) {
      return PositionOrRange.range(mapping.modified);
    }
    const l = TextLength.betweenPositions(mapping.original.getEndPosition(), position);
    return PositionOrRange.position(l.addToPosition(mapping.modified.getEndPosition()));
  }
  mapRange(range) {
    const start = this.mapPosition(range.getStartPosition());
    const end = this.mapPosition(range.getEndPosition());
    return Range.fromPositions(
      start.range?.getStartPosition() ?? start.position,
      end.range?.getEndPosition() ?? end.position
    );
  }
  reverse() {
    return new RangeMapping(this.mappings.map((mapping) => mapping.reverse()));
  }
}
class SingleRangeMapping {
  constructor(original, modified) {
    this.original = original;
    this.modified = modified;
  }
  static {
    __name(this, "SingleRangeMapping");
  }
  reverse() {
    return new SingleRangeMapping(this.modified, this.original);
  }
  toString() {
    return `${this.original.toString()} -> ${this.modified.toString()}`;
  }
}
class PositionOrRange {
  constructor(position, range) {
    this.position = position;
    this.range = range;
  }
  static {
    __name(this, "PositionOrRange");
  }
  static position(position) {
    return new PositionOrRange(position, void 0);
  }
  static range(range) {
    return new PositionOrRange(void 0, range);
  }
}
export {
  PositionOrRange,
  RangeMapping,
  SingleRangeMapping
};
//# sourceMappingURL=rangeMapping.js.map
