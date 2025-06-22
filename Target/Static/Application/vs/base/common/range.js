var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var Range;
(function(Range2) {
  function intersect(one, other) {
    if (one.start >= other.end || other.start >= one.end) {
      return { start: 0, end: 0 };
    }
    const start = Math.max(one.start, other.start);
    const end = Math.min(one.end, other.end);
    if (end - start <= 0) {
      return { start: 0, end: 0 };
    }
    return { start, end };
  }
  __name(intersect, "intersect");
  Range2.intersect = intersect;
  function isEmpty(range) {
    return range.end - range.start <= 0;
  }
  __name(isEmpty, "isEmpty");
  Range2.isEmpty = isEmpty;
  function intersects(one, other) {
    return !isEmpty(intersect(one, other));
  }
  __name(intersects, "intersects");
  Range2.intersects = intersects;
  function relativeComplement(one, other) {
    const result = [];
    const first = { start: one.start, end: Math.min(other.start, one.end) };
    const second = { start: Math.max(other.end, one.start), end: one.end };
    if (!isEmpty(first)) {
      result.push(first);
    }
    if (!isEmpty(second)) {
      result.push(second);
    }
    return result;
  }
  __name(relativeComplement, "relativeComplement");
  Range2.relativeComplement = relativeComplement;
})(Range || (Range = {}));
export {
  Range
};
//# sourceMappingURL=range.js.map
