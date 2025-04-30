var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function findLast(array, predicate, fromIndex = array.length - 1) {
  const idx = findLastIdx(array, predicate, fromIndex);
  if (idx === -1) {
    return void 0;
  }
  return array[idx];
}
__name(findLast, "findLast");
function findLastIdx(array, predicate, fromIndex = array.length - 1) {
  for (let i = fromIndex; i >= 0; i--) {
    const element = array[i];
    if (predicate(element)) {
      return i;
    }
  }
  return -1;
}
__name(findLastIdx, "findLastIdx");
function findLastMonotonous(array, predicate) {
  const idx = findLastIdxMonotonous(array, predicate);
  return idx === -1 ? void 0 : array[idx];
}
__name(findLastMonotonous, "findLastMonotonous");
function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
  let i = startIdx;
  let j = endIdxEx;
  while (i < j) {
    const k = Math.floor((i + j) / 2);
    if (predicate(array[k])) {
      i = k + 1;
    } else {
      j = k;
    }
  }
  return i - 1;
}
__name(findLastIdxMonotonous, "findLastIdxMonotonous");
function findFirstMonotonous(array, predicate) {
  const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
  return idx === array.length ? void 0 : array[idx];
}
__name(findFirstMonotonous, "findFirstMonotonous");
function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
  let i = startIdx;
  let j = endIdxEx;
  while (i < j) {
    const k = Math.floor((i + j) / 2);
    if (predicate(array[k])) {
      j = k;
    } else {
      i = k + 1;
    }
  }
  return i;
}
__name(findFirstIdxMonotonousOrArrLen, "findFirstIdxMonotonousOrArrLen");
function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
  const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
  return idx === array.length ? -1 : idx;
}
__name(findFirstIdxMonotonous, "findFirstIdxMonotonous");
class MonotonousArray {
  static {
    __name(this, "MonotonousArray");
  }
  static {
    this.assertInvariants = false;
  }
  constructor(_array) {
    this._array = _array;
    this._findLastMonotonousLastIdx = 0;
  }
  /**
   * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
   * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
   */
  findLastMonotonous(predicate) {
    if (MonotonousArray.assertInvariants) {
      if (this._prevFindLastPredicate) {
        for (const item of this._array) {
          if (this._prevFindLastPredicate(item) && !predicate(item)) {
            throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.");
          }
        }
      }
      this._prevFindLastPredicate = predicate;
    }
    const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
    this._findLastMonotonousLastIdx = idx + 1;
    return idx === -1 ? void 0 : this._array[idx];
  }
}
function findFirstMax(array, comparator) {
  if (array.length === 0) {
    return void 0;
  }
  let max = array[0];
  for (let i = 1; i < array.length; i++) {
    const item = array[i];
    if (comparator(item, max) > 0) {
      max = item;
    }
  }
  return max;
}
__name(findFirstMax, "findFirstMax");
function findLastMax(array, comparator) {
  if (array.length === 0) {
    return void 0;
  }
  let max = array[0];
  for (let i = 1; i < array.length; i++) {
    const item = array[i];
    if (comparator(item, max) >= 0) {
      max = item;
    }
  }
  return max;
}
__name(findLastMax, "findLastMax");
function findFirstMin(array, comparator) {
  return findFirstMax(array, (a, b) => -comparator(a, b));
}
__name(findFirstMin, "findFirstMin");
function findMaxIdx(array, comparator) {
  if (array.length === 0) {
    return -1;
  }
  let maxIdx = 0;
  for (let i = 1; i < array.length; i++) {
    const item = array[i];
    if (comparator(item, array[maxIdx]) > 0) {
      maxIdx = i;
    }
  }
  return maxIdx;
}
__name(findMaxIdx, "findMaxIdx");
function mapFindFirst(items, mapFn) {
  for (const value of items) {
    const mapped = mapFn(value);
    if (mapped !== void 0) {
      return mapped;
    }
  }
  return void 0;
}
__name(mapFindFirst, "mapFindFirst");
export {
  MonotonousArray,
  findFirstIdxMonotonous,
  findFirstIdxMonotonousOrArrLen,
  findFirstMax,
  findFirstMin,
  findFirstMonotonous,
  findLast,
  findLastIdx,
  findLastIdxMonotonous,
  findLastMax,
  findLastMonotonous,
  findMaxIdx,
  mapFindFirst
};
//# sourceMappingURL=arraysFind.js.map
