var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function isICellRange(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  return typeof candidate.start === "number" && typeof candidate.end === "number";
}
__name(isICellRange, "isICellRange");
function cellIndexesToRanges(indexes) {
  indexes.sort((a, b) => a - b);
  const first = indexes.shift();
  if (first === void 0) {
    return [];
  }
  return indexes.reduce(function(ranges, num) {
    if (num <= ranges[0][1]) {
      ranges[0][1] = num + 1;
    } else {
      ranges.unshift([num, num + 1]);
    }
    return ranges;
  }, [[first, first + 1]]).reverse().map((val) => ({ start: val[0], end: val[1] }));
}
__name(cellIndexesToRanges, "cellIndexesToRanges");
function cellRangesToIndexes(ranges) {
  const indexes = ranges.reduce((a, b) => {
    for (let i = b.start; i < b.end; i++) {
      a.push(i);
    }
    return a;
  }, []);
  return indexes;
}
__name(cellRangesToIndexes, "cellRangesToIndexes");
function reduceCellRanges(ranges) {
  const sorted = ranges.sort((a, b) => a.start - b.start);
  const first = sorted[0];
  if (!first) {
    return [];
  }
  const reduced = sorted.reduce((prev, curr) => {
    const last = prev[prev.length - 1];
    if (last.end >= curr.start) {
      last.end = Math.max(last.end, curr.end);
    } else {
      prev.push(curr);
    }
    return prev;
  }, [first]);
  if (reduced.length > 1) {
    return reduced.filter((range) => !(range.start === range.end && range.start === 0));
  }
  return reduced;
}
__name(reduceCellRanges, "reduceCellRanges");
function cellRangesEqual(a, b) {
  a = reduceCellRanges(a);
  b = reduceCellRanges(b);
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
      return false;
    }
  }
  return true;
}
__name(cellRangesEqual, "cellRangesEqual");
function cellRangeContains(range, other) {
  return other.start >= range.start && other.end <= range.end;
}
__name(cellRangeContains, "cellRangeContains");
export {
  cellIndexesToRanges,
  cellRangeContains,
  cellRangesEqual,
  cellRangesToIndexes,
  isICellRange,
  reduceCellRanges
};
//# sourceMappingURL=notebookRange.js.map
