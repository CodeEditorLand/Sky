var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as arrays from "./arrays.js";
function strictEquals(a, b) {
  return a === b;
}
__name(strictEquals, "strictEquals");
function strictEqualsC() {
  return (a, b) => a === b;
}
__name(strictEqualsC, "strictEqualsC");
function arrayEquals(a, b, itemEquals) {
  return arrays.equals(a, b, itemEquals ?? strictEquals);
}
__name(arrayEquals, "arrayEquals");
function arrayEqualsC(itemEquals) {
  return (a, b) => arrays.equals(a, b, itemEquals ?? strictEquals);
}
__name(arrayEqualsC, "arrayEqualsC");
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
function structuralEqualsC() {
  return (a, b) => structuralEquals(a, b);
}
__name(structuralEqualsC, "structuralEqualsC");
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
function jsonStringifyEquals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
__name(jsonStringifyEquals, "jsonStringifyEquals");
function jsonStringifyEqualsC() {
  return (a, b) => JSON.stringify(a) === JSON.stringify(b);
}
__name(jsonStringifyEqualsC, "jsonStringifyEqualsC");
function thisEqualsC() {
  return (a, b) => a.equals(b);
}
__name(thisEqualsC, "thisEqualsC");
function equalsIfDefined(v1, v2, equals2) {
  if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
    return v2 === v1;
  }
  return equals2(v1, v2);
}
__name(equalsIfDefined, "equalsIfDefined");
function equalsIfDefinedC(equals2) {
  return (v1, v2) => {
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals2(v1, v2);
  };
}
__name(equalsIfDefinedC, "equalsIfDefinedC");
var equals;
(function(equals2) {
  equals2.strict = strictEquals;
  equals2.strictC = strictEqualsC;
  equals2.array = arrayEquals;
  equals2.arrayC = arrayEqualsC;
  equals2.structural = structuralEquals;
  equals2.structuralC = structuralEqualsC;
  equals2.jsonStringify = jsonStringifyEquals;
  equals2.jsonStringifyC = jsonStringifyEqualsC;
  equals2.thisC = thisEqualsC;
  equals2.ifDefined = equalsIfDefined;
  equals2.ifDefinedC = equalsIfDefinedC;
})(equals || (equals = {}));
export {
  arrayEquals,
  arrayEqualsC,
  equals,
  equalsIfDefined,
  equalsIfDefinedC,
  getStructuralKey,
  jsonStringifyEquals,
  jsonStringifyEqualsC,
  strictEquals,
  strictEqualsC,
  structuralEquals,
  structuralEqualsC,
  thisEqualsC
};
//# sourceMappingURL=equals.js.map
