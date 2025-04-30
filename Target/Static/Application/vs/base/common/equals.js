var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "./arrays.js";
const strictEquals = /* @__PURE__ */ __name((a, b) => a === b, "strictEquals");
function itemsEquals(itemEquals2 = strictEquals) {
  return (a, b) => arrays.equals(a, b, itemEquals2);
}
__name(itemsEquals, "itemsEquals");
function jsonStringifyEquals() {
  return (a, b) => JSON.stringify(a) === JSON.stringify(b);
}
__name(jsonStringifyEquals, "jsonStringifyEquals");
function itemEquals() {
  return (a, b) => a.equals(b);
}
__name(itemEquals, "itemEquals");
function equalsIfDefined(equalsOrV1, v2, equals) {
  if (equals !== void 0) {
    const v1 = equalsOrV1;
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals(v1, v2);
  } else {
    const equals2 = equalsOrV1;
    return (v1, v22) => {
      if (v1 === void 0 || v1 === null || v22 === void 0 || v22 === null) {
        return v22 === v1;
      }
      return equals2(v1, v22);
    };
  }
}
__name(equalsIfDefined, "equalsIfDefined");
function structuralEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!structuralEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (a && typeof a === "object" && b && typeof b === "object") {
    if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
      const aObj = a;
      const bObj = b;
      const keysA = Object.keys(aObj);
      const keysB = Object.keys(bObj);
      const keysBSet = new Set(keysB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      for (const key of keysA) {
        if (!keysBSet.has(key)) {
          return false;
        }
        if (!structuralEquals(aObj[key], bObj[key])) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}
__name(structuralEquals, "structuralEquals");
function getStructuralKey(t) {
  return JSON.stringify(toNormalizedJsonStructure(t));
}
__name(getStructuralKey, "getStructuralKey");
let objectId = 0;
const objIds = /* @__PURE__ */ new WeakMap();
function toNormalizedJsonStructure(t) {
  if (Array.isArray(t)) {
    return t.map(toNormalizedJsonStructure);
  }
  if (t && typeof t === "object") {
    if (Object.getPrototypeOf(t) === Object.prototype) {
      const tObj = t;
      const res = /* @__PURE__ */ Object.create(null);
      for (const key of Object.keys(tObj).sort()) {
        res[key] = toNormalizedJsonStructure(tObj[key]);
      }
      return res;
    } else {
      let objId = objIds.get(t);
      if (objId === void 0) {
        objId = objectId++;
        objIds.set(t, objId);
      }
      return objId + "----2b76a038c20c4bcc";
    }
  }
  return t;
}
__name(toNormalizedJsonStructure, "toNormalizedJsonStructure");
export {
  equalsIfDefined,
  getStructuralKey,
  itemEquals,
  itemsEquals,
  jsonStringifyEquals,
  strictEquals,
  structuralEquals
};
//# sourceMappingURL=equals.js.map
