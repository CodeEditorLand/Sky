var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findFirstIdxMonotonousOrArrLen } from "./arraysFind.js";
import { CancellationError } from "./errors.js";
function tail(arr) {
  if (arr.length === 0) {
    throw new Error("Invalid tail call");
  }
  return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}
__name(tail, "tail");
function equals(one, other, itemEquals = (a, b) => a === b) {
  if (one === other) {
    return true;
  }
  if (!one || !other) {
    return false;
  }
  if (one.length !== other.length) {
    return false;
  }
  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }
  return true;
}
__name(equals, "equals");
function removeFastWithoutKeepingOrder(array, index2) {
  const last = array.length - 1;
  if (index2 < last) {
    array[index2] = array[last];
  }
  array.pop();
}
__name(removeFastWithoutKeepingOrder, "removeFastWithoutKeepingOrder");
function binarySearch(array, key, comparator) {
  return binarySearch2(array.length, (i) => comparator(array[i], key));
}
__name(binarySearch, "binarySearch");
function binarySearch2(length, compareToKey) {
  let low = 0, high = length - 1;
  while (low <= high) {
    const mid = (low + high) / 2 | 0;
    const comp = compareToKey(mid);
    if (comp < 0) {
      low = mid + 1;
    } else if (comp > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -(low + 1);
}
__name(binarySearch2, "binarySearch2");
function quickSelect(nth, data, compare) {
  nth = nth | 0;
  if (nth >= data.length) {
    throw new TypeError("invalid index");
  }
  const pivotValue = data[Math.floor(data.length * Math.random())];
  const lower = [];
  const higher = [];
  const pivots = [];
  for (const value of data) {
    const val = compare(value, pivotValue);
    if (val < 0) {
      lower.push(value);
    } else if (val > 0) {
      higher.push(value);
    } else {
      pivots.push(value);
    }
  }
  if (nth < lower.length) {
    return quickSelect(nth, lower, compare);
  } else if (nth < lower.length + pivots.length) {
    return pivots[0];
  } else {
    return quickSelect(nth - (lower.length + pivots.length), higher, compare);
  }
}
__name(quickSelect, "quickSelect");
function groupBy(data, compare) {
  const result = [];
  let currentGroup = void 0;
  for (const element of data.slice(0).sort(compare)) {
    if (!currentGroup || compare(currentGroup[0], element) !== 0) {
      currentGroup = [element];
      result.push(currentGroup);
    } else {
      currentGroup.push(element);
    }
  }
  return result;
}
__name(groupBy, "groupBy");
function* groupAdjacentBy(items, shouldBeGrouped) {
  let currentGroup;
  let last;
  for (const item of items) {
    if (last !== void 0 && shouldBeGrouped(last, item)) {
      currentGroup.push(item);
    } else {
      if (currentGroup) {
        yield currentGroup;
      }
      currentGroup = [item];
    }
    last = item;
  }
  if (currentGroup) {
    yield currentGroup;
  }
}
__name(groupAdjacentBy, "groupAdjacentBy");
function forEachAdjacent(arr, f) {
  for (let i = 0; i <= arr.length; i++) {
    f(i === 0 ? void 0 : arr[i - 1], i === arr.length ? void 0 : arr[i]);
  }
}
__name(forEachAdjacent, "forEachAdjacent");
function forEachWithNeighbors(arr, f) {
  for (let i = 0; i < arr.length; i++) {
    f(i === 0 ? void 0 : arr[i - 1], arr[i], i + 1 === arr.length ? void 0 : arr[i + 1]);
  }
}
__name(forEachWithNeighbors, "forEachWithNeighbors");
function concatArrays(...arrays) {
  return [].concat(...arrays);
}
__name(concatArrays, "concatArrays");
function sortedDiff(before, after, compare) {
  const result = [];
  function pushSplice(start, deleteCount, toInsert) {
    if (deleteCount === 0 && toInsert.length === 0) {
      return;
    }
    const latest = result[result.length - 1];
    if (latest && latest.start + latest.deleteCount === start) {
      latest.deleteCount += deleteCount;
      latest.toInsert.push(...toInsert);
    } else {
      result.push({ start, deleteCount, toInsert });
    }
  }
  __name(pushSplice, "pushSplice");
  let beforeIdx = 0;
  let afterIdx = 0;
  while (true) {
    if (beforeIdx === before.length) {
      pushSplice(beforeIdx, 0, after.slice(afterIdx));
      break;
    }
    if (afterIdx === after.length) {
      pushSplice(beforeIdx, before.length - beforeIdx, []);
      break;
    }
    const beforeElement = before[beforeIdx];
    const afterElement = after[afterIdx];
    const n = compare(beforeElement, afterElement);
    if (n === 0) {
      beforeIdx += 1;
      afterIdx += 1;
    } else if (n < 0) {
      pushSplice(beforeIdx, 1, []);
      beforeIdx += 1;
    } else if (n > 0) {
      pushSplice(beforeIdx, 0, [afterElement]);
      afterIdx += 1;
    }
  }
  return result;
}
__name(sortedDiff, "sortedDiff");
function delta(before, after, compare) {
  const splices = sortedDiff(before, after, compare);
  const removed = [];
  const added = [];
  for (const splice2 of splices) {
    removed.push(...before.slice(splice2.start, splice2.start + splice2.deleteCount));
    added.push(...splice2.toInsert);
  }
  return { removed, added };
}
__name(delta, "delta");
function top(array, compare, n) {
  if (n === 0) {
    return [];
  }
  const result = array.slice(0, n).sort(compare);
  topStep(array, compare, result, n, array.length);
  return result;
}
__name(top, "top");
function topAsync(array, compare, n, batch, token) {
  if (n === 0) {
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    (async () => {
      const o = array.length;
      const result = array.slice(0, n).sort(compare);
      for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
        if (i > n) {
          await new Promise((resolve2) => setTimeout(resolve2));
        }
        if (token && token.isCancellationRequested) {
          throw new CancellationError();
        }
        topStep(array, compare, result, i, m);
      }
      return result;
    })().then(resolve, reject);
  });
}
__name(topAsync, "topAsync");
function topStep(array, compare, result, i, m) {
  for (const n = result.length; i < m; i++) {
    const element = array[i];
    if (compare(element, result[n - 1]) < 0) {
      result.pop();
      const j = findFirstIdxMonotonousOrArrLen(result, (e) => compare(element, e) < 0);
      result.splice(j, 0, element);
    }
  }
}
__name(topStep, "topStep");
function coalesce(array) {
  return array.filter((e) => !!e);
}
__name(coalesce, "coalesce");
function coalesceInPlace(array) {
  let to = 0;
  for (let i = 0; i < array.length; i++) {
    if (!!array[i]) {
      array[to] = array[i];
      to += 1;
    }
  }
  array.length = to;
}
__name(coalesceInPlace, "coalesceInPlace");
function move(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
}
__name(move, "move");
function isFalsyOrEmpty(obj) {
  return !Array.isArray(obj) || obj.length === 0;
}
__name(isFalsyOrEmpty, "isFalsyOrEmpty");
function isNonEmptyArray(obj) {
  return Array.isArray(obj) && obj.length > 0;
}
__name(isNonEmptyArray, "isNonEmptyArray");
function distinct(array, keyFn = (value) => value) {
  const seen = /* @__PURE__ */ new Set();
  return array.filter((element) => {
    const key = keyFn(element);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
__name(distinct, "distinct");
function uniqueFilter(keyFn) {
  const seen = /* @__PURE__ */ new Set();
  return (element) => {
    const key = keyFn(element);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  };
}
__name(uniqueFilter, "uniqueFilter");
function commonPrefixLength(one, other, equals2 = (a, b) => a === b) {
  let result = 0;
  for (let i = 0, len = Math.min(one.length, other.length); i < len && equals2(one[i], other[i]); i++) {
    result++;
  }
  return result;
}
__name(commonPrefixLength, "commonPrefixLength");
function range(arg, to) {
  let from = typeof to === "number" ? arg : 0;
  if (typeof to === "number") {
    from = arg;
  } else {
    from = 0;
    to = arg;
  }
  const result = [];
  if (from <= to) {
    for (let i = from; i < to; i++) {
      result.push(i);
    }
  } else {
    for (let i = from; i > to; i--) {
      result.push(i);
    }
  }
  return result;
}
__name(range, "range");
function index(array, indexer, mapper) {
  return array.reduce((r, t) => {
    r[indexer(t)] = mapper ? mapper(t) : t;
    return r;
  }, /* @__PURE__ */ Object.create(null));
}
__name(index, "index");
function insert(array, element) {
  array.push(element);
  return () => remove(array, element);
}
__name(insert, "insert");
function remove(array, element) {
  const index2 = array.indexOf(element);
  if (index2 > -1) {
    array.splice(index2, 1);
    return element;
  }
  return void 0;
}
__name(remove, "remove");
function arrayInsert(target, insertIndex, insertArr) {
  const before = target.slice(0, insertIndex);
  const after = target.slice(insertIndex);
  return before.concat(insertArr, after);
}
__name(arrayInsert, "arrayInsert");
function shuffle(array, _seed) {
  let rand;
  if (typeof _seed === "number") {
    let seed = _seed;
    rand = /* @__PURE__ */ __name(() => {
      const x = Math.sin(seed++) * 179426549;
      return x - Math.floor(x);
    }, "rand");
  } else {
    rand = Math.random;
  }
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
__name(shuffle, "shuffle");
function pushToStart(arr, value) {
  const index2 = arr.indexOf(value);
  if (index2 > -1) {
    arr.splice(index2, 1);
    arr.unshift(value);
  }
}
__name(pushToStart, "pushToStart");
function pushToEnd(arr, value) {
  const index2 = arr.indexOf(value);
  if (index2 > -1) {
    arr.splice(index2, 1);
    arr.push(value);
  }
}
__name(pushToEnd, "pushToEnd");
function pushMany(arr, items) {
  for (const item of items) {
    arr.push(item);
  }
}
__name(pushMany, "pushMany");
function mapArrayOrNot(items, fn) {
  return Array.isArray(items) ? items.map(fn) : fn(items);
}
__name(mapArrayOrNot, "mapArrayOrNot");
function asArray(x) {
  return Array.isArray(x) ? x : [x];
}
__name(asArray, "asArray");
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
__name(getRandomElement, "getRandomElement");
function insertInto(array, start, newItems) {
  const startIdx = getActualStartIndex(array, start);
  const originalLength = array.length;
  const newItemsLength = newItems.length;
  array.length = originalLength + newItemsLength;
  for (let i = originalLength - 1; i >= startIdx; i--) {
    array[i + newItemsLength] = array[i];
  }
  for (let i = 0; i < newItemsLength; i++) {
    array[i + startIdx] = newItems[i];
  }
}
__name(insertInto, "insertInto");
function splice(array, start, deleteCount, newItems) {
  const index2 = getActualStartIndex(array, start);
  let result = array.splice(index2, deleteCount);
  if (result === void 0) {
    result = [];
  }
  insertInto(array, index2, newItems);
  return result;
}
__name(splice, "splice");
function getActualStartIndex(array, start) {
  return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
}
__name(getActualStartIndex, "getActualStartIndex");
const pick = /* @__PURE__ */ __name((key) => {
  return (obj) => {
    return obj[key];
  };
}, "pick");
var CompareResult;
(function(CompareResult2) {
  function isLessThan(result) {
    return result < 0;
  }
  __name(isLessThan, "isLessThan");
  CompareResult2.isLessThan = isLessThan;
  function isLessThanOrEqual(result) {
    return result <= 0;
  }
  __name(isLessThanOrEqual, "isLessThanOrEqual");
  CompareResult2.isLessThanOrEqual = isLessThanOrEqual;
  function isGreaterThan(result) {
    return result > 0;
  }
  __name(isGreaterThan, "isGreaterThan");
  CompareResult2.isGreaterThan = isGreaterThan;
  function isNeitherLessOrGreaterThan(result) {
    return result === 0;
  }
  __name(isNeitherLessOrGreaterThan, "isNeitherLessOrGreaterThan");
  CompareResult2.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
  CompareResult2.greaterThan = 1;
  CompareResult2.lessThan = -1;
  CompareResult2.neitherLessOrGreaterThan = 0;
})(CompareResult || (CompareResult = {}));
function compareBy(selector, comparator) {
  return (a, b) => comparator(selector(a), selector(b));
}
__name(compareBy, "compareBy");
function tieBreakComparators(...comparators) {
  return (item1, item2) => {
    for (const comparator of comparators) {
      const result = comparator(item1, item2);
      if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
        return result;
      }
    }
    return CompareResult.neitherLessOrGreaterThan;
  };
}
__name(tieBreakComparators, "tieBreakComparators");
const numberComparator = /* @__PURE__ */ __name((a, b) => a - b, "numberComparator");
const booleanComparator = /* @__PURE__ */ __name((a, b) => numberComparator(a ? 1 : 0, b ? 1 : 0), "booleanComparator");
function reverseOrder(comparator) {
  return (a, b) => -comparator(a, b);
}
__name(reverseOrder, "reverseOrder");
function compareUndefinedSmallest(comparator) {
  return (a, b) => {
    if (a === void 0) {
      return b === void 0 ? CompareResult.neitherLessOrGreaterThan : CompareResult.lessThan;
    } else if (b === void 0) {
      return CompareResult.greaterThan;
    }
    return comparator(a, b);
  };
}
__name(compareUndefinedSmallest, "compareUndefinedSmallest");
class ArrayQueue {
  static {
    __name(this, "ArrayQueue");
  }
  /**
   * Constructs a queue that is backed by the given array. Runtime is O(1).
  */
  constructor(items) {
    this.firstIdx = 0;
    this.items = items;
    this.lastIdx = this.items.length - 1;
  }
  get length() {
    return this.lastIdx - this.firstIdx + 1;
  }
  /**
   * Consumes elements from the beginning of the queue as long as the predicate returns true.
   * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
  */
  takeWhile(predicate) {
    let startIdx = this.firstIdx;
    while (startIdx < this.items.length && predicate(this.items[startIdx])) {
      startIdx++;
    }
    const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
    this.firstIdx = startIdx;
    return result;
  }
  /**
   * Consumes elements from the end of the queue as long as the predicate returns true.
   * If no elements were consumed, `null` is returned.
   * The result has the same order as the underlying array!
  */
  takeFromEndWhile(predicate) {
    let endIdx = this.lastIdx;
    while (endIdx >= 0 && predicate(this.items[endIdx])) {
      endIdx--;
    }
    const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
    this.lastIdx = endIdx;
    return result;
  }
  peek() {
    if (this.length === 0) {
      return void 0;
    }
    return this.items[this.firstIdx];
  }
  peekLast() {
    if (this.length === 0) {
      return void 0;
    }
    return this.items[this.lastIdx];
  }
  dequeue() {
    const result = this.items[this.firstIdx];
    this.firstIdx++;
    return result;
  }
  removeLast() {
    const result = this.items[this.lastIdx];
    this.lastIdx--;
    return result;
  }
  takeCount(count) {
    const result = this.items.slice(this.firstIdx, this.firstIdx + count);
    this.firstIdx += count;
    return result;
  }
}
class CallbackIterable {
  static {
    __name(this, "CallbackIterable");
  }
  static {
    this.empty = new CallbackIterable((_callback) => {
    });
  }
  constructor(iterate) {
    this.iterate = iterate;
  }
  forEach(handler) {
    this.iterate((item) => {
      handler(item);
      return true;
    });
  }
  toArray() {
    const result = [];
    this.iterate((item) => {
      result.push(item);
      return true;
    });
    return result;
  }
  filter(predicate) {
    return new CallbackIterable((cb) => this.iterate((item) => predicate(item) ? cb(item) : true));
  }
  map(mapFn) {
    return new CallbackIterable((cb) => this.iterate((item) => cb(mapFn(item))));
  }
  some(predicate) {
    let result = false;
    this.iterate((item) => {
      result = predicate(item);
      return !result;
    });
    return result;
  }
  findFirst(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
        return false;
      }
      return true;
    });
    return result;
  }
  findLast(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
      }
      return true;
    });
    return result;
  }
  findLastMaxBy(comparator) {
    let result;
    let first = true;
    this.iterate((item) => {
      if (first || CompareResult.isGreaterThan(comparator(item, result))) {
        first = false;
        result = item;
      }
      return true;
    });
    return result;
  }
}
class Permutation {
  static {
    __name(this, "Permutation");
  }
  constructor(_indexMap) {
    this._indexMap = _indexMap;
  }
  /**
   * Returns a permutation that sorts the given array according to the given compare function.
   */
  static createSortPermutation(arr, compareFn) {
    const sortIndices = Array.from(arr.keys()).sort((index1, index2) => compareFn(arr[index1], arr[index2]));
    return new Permutation(sortIndices);
  }
  /**
   * Returns a new array with the elements of the given array re-arranged according to this permutation.
   */
  apply(arr) {
    return arr.map((_, index2) => arr[this._indexMap[index2]]);
  }
  /**
   * Returns a new permutation that undoes the re-arrangement of this permutation.
  */
  inverse() {
    const inverseIndexMap = this._indexMap.slice();
    for (let i = 0; i < this._indexMap.length; i++) {
      inverseIndexMap[this._indexMap[i]] = i;
    }
    return new Permutation(inverseIndexMap);
  }
}
async function findAsync(array, predicate) {
  const results = await Promise.all(array.map(async (element, index2) => ({ element, ok: await predicate(element, index2) })));
  return results.find((r) => r.ok)?.element;
}
__name(findAsync, "findAsync");
export {
  ArrayQueue,
  CallbackIterable,
  CompareResult,
  Permutation,
  arrayInsert,
  asArray,
  binarySearch,
  binarySearch2,
  booleanComparator,
  coalesce,
  coalesceInPlace,
  commonPrefixLength,
  compareBy,
  compareUndefinedSmallest,
  concatArrays,
  delta,
  distinct,
  equals,
  findAsync,
  forEachAdjacent,
  forEachWithNeighbors,
  getRandomElement,
  groupAdjacentBy,
  groupBy,
  index,
  insert,
  insertInto,
  isFalsyOrEmpty,
  isNonEmptyArray,
  mapArrayOrNot,
  move,
  numberComparator,
  pick,
  pushMany,
  pushToEnd,
  pushToStart,
  quickSelect,
  range,
  remove,
  removeFastWithoutKeepingOrder,
  reverseOrder,
  shuffle,
  sortedDiff,
  splice,
  tail,
  tieBreakComparators,
  top,
  topAsync,
  uniqueFilter
};
//# sourceMappingURL=arrays.js.map
