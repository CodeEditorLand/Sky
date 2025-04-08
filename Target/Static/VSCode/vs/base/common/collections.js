var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function groupBy(data, groupFn) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const element of data) {
    const key = groupFn(element);
    let target = result[key];
    if (!target) {
      target = result[key] = [];
    }
    target.push(element);
  }
  return result;
}
__name(groupBy, "groupBy");
function diffSets(before, after) {
  const removed = [];
  const added = [];
  for (const element of before) {
    if (!after.has(element)) {
      removed.push(element);
    }
  }
  for (const element of after) {
    if (!before.has(element)) {
      added.push(element);
    }
  }
  return { removed, added };
}
__name(diffSets, "diffSets");
function diffMaps(before, after) {
  const removed = [];
  const added = [];
  for (const [index, value] of before) {
    if (!after.has(index)) {
      removed.push(value);
    }
  }
  for (const [index, value] of after) {
    if (!before.has(index)) {
      added.push(value);
    }
  }
  return { removed, added };
}
__name(diffMaps, "diffMaps");
function intersection(setA, setB) {
  const result = /* @__PURE__ */ new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}
__name(intersection, "intersection");
class SetWithKey {
  constructor(values, toKey) {
    this.toKey = toKey;
    for (const value of values) {
      this.add(value);
    }
  }
  static {
    __name(this, "SetWithKey");
  }
  _map = /* @__PURE__ */ new Map();
  get size() {
    return this._map.size;
  }
  add(value) {
    const key = this.toKey(value);
    this._map.set(key, value);
    return this;
  }
  delete(value) {
    return this._map.delete(this.toKey(value));
  }
  has(value) {
    return this._map.has(this.toKey(value));
  }
  *entries() {
    for (const entry of this._map.values()) {
      yield [entry, entry];
    }
  }
  keys() {
    return this.values();
  }
  *values() {
    for (const entry of this._map.values()) {
      yield entry;
    }
  }
  clear() {
    this._map.clear();
  }
  forEach(callbackfn, thisArg) {
    this._map.forEach((entry) => callbackfn.call(thisArg, entry, entry, this));
  }
  [Symbol.iterator]() {
    return this.values();
  }
  [Symbol.toStringTag] = "SetWithKey";
}
export {
  SetWithKey,
  diffMaps,
  diffSets,
  groupBy,
  intersection
};
//# sourceMappingURL=collections.js.map
