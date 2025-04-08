var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "./uri.js";
import { assert } from "./assert.js";
function isString(str) {
  return typeof str === "string";
}
__name(isString, "isString");
function isStringArray(value) {
  return Array.isArray(value) && value.every((elem) => isString(elem));
}
__name(isStringArray, "isStringArray");
function isObject(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
}
__name(isObject, "isObject");
function isTypedArray(obj) {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return typeof obj === "object" && obj instanceof TypedArray;
}
__name(isTypedArray, "isTypedArray");
function isNumber(obj) {
  return typeof obj === "number" && !isNaN(obj);
}
__name(isNumber, "isNumber");
function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}
__name(isIterable, "isIterable");
function isBoolean(obj) {
  return obj === true || obj === false;
}
__name(isBoolean, "isBoolean");
function isUndefined(obj) {
  return typeof obj === "undefined";
}
__name(isUndefined, "isUndefined");
function isDefined(arg) {
  return !isUndefinedOrNull(arg);
}
__name(isDefined, "isDefined");
function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}
__name(isUndefinedOrNull, "isUndefinedOrNull");
function assertType(condition, type) {
  if (!condition) {
    throw new Error(type ? `Unexpected type, expected '${type}'` : "Unexpected type");
  }
}
__name(assertType, "assertType");
function assertIsDefined(arg) {
  assert(
    arg !== null && arg !== void 0,
    "Argument is `undefined` or `null`."
  );
  return arg;
}
__name(assertIsDefined, "assertIsDefined");
function assertDefined(value, error) {
  if (value === null || value === void 0) {
    const errorToThrow = typeof error === "string" ? new Error(error) : error;
    throw errorToThrow;
  }
}
__name(assertDefined, "assertDefined");
function assertAllDefined(...args) {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isUndefinedOrNull(arg)) {
      throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
    }
    result.push(arg);
  }
  return result;
}
__name(assertAllDefined, "assertAllDefined");
function assertOneOf(item, list, errorPrefix) {
  assert(
    list.includes(item),
    `${errorPrefix}: Expected '${item}' to be one of [${list.join(", ")}].`
  );
}
__name(assertOneOf, "assertOneOf");
function typeCheck(_thing) {
}
__name(typeCheck, "typeCheck");
const hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}
__name(isEmptyObject, "isEmptyObject");
function isFunction(obj) {
  return typeof obj === "function";
}
__name(isFunction, "isFunction");
function areFunctions(...objects) {
  return objects.length > 0 && objects.every(isFunction);
}
__name(areFunctions, "areFunctions");
function validateConstraints(args, constraints) {
  const len = Math.min(args.length, constraints.length);
  for (let i = 0; i < len; i++) {
    validateConstraint(args[i], constraints[i]);
  }
}
__name(validateConstraints, "validateConstraints");
function validateConstraint(arg, constraint) {
  if (isString(constraint)) {
    if (typeof arg !== constraint) {
      throw new Error(`argument does not match constraint: typeof ${constraint}`);
    }
  } else if (isFunction(constraint)) {
    try {
      if (arg instanceof constraint) {
        return;
      }
    } catch {
    }
    if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
      return;
    }
    if (constraint.length === 1 && constraint.call(void 0, arg) === true) {
      return;
    }
    throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
  }
}
__name(validateConstraint, "validateConstraint");
function upcast(x) {
  return x;
}
__name(upcast, "upcast");
export {
  areFunctions,
  assertAllDefined,
  assertDefined,
  assertIsDefined,
  assertOneOf,
  assertType,
  isBoolean,
  isDefined,
  isEmptyObject,
  isFunction,
  isIterable,
  isNumber,
  isObject,
  isString,
  isStringArray,
  isTypedArray,
  isUndefined,
  isUndefinedOrNull,
  typeCheck,
  upcast,
  validateConstraint,
  validateConstraints
};
//# sourceMappingURL=types.js.map
