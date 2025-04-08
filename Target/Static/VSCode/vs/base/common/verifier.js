var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isObject } from "./types.js";
class Verifier {
  constructor(defaultValue) {
    this.defaultValue = defaultValue;
  }
  static {
    __name(this, "Verifier");
  }
  verify(value) {
    if (!this.isType(value)) {
      return this.defaultValue;
    }
    return value;
  }
}
class BooleanVerifier extends Verifier {
  static {
    __name(this, "BooleanVerifier");
  }
  isType(value) {
    return typeof value === "boolean";
  }
}
class NumberVerifier extends Verifier {
  static {
    __name(this, "NumberVerifier");
  }
  isType(value) {
    return typeof value === "number";
  }
}
class SetVerifier extends Verifier {
  static {
    __name(this, "SetVerifier");
  }
  isType(value) {
    return value instanceof Set;
  }
}
class EnumVerifier extends Verifier {
  static {
    __name(this, "EnumVerifier");
  }
  allowedValues;
  constructor(defaultValue, allowedValues) {
    super(defaultValue);
    this.allowedValues = allowedValues;
  }
  isType(value) {
    return this.allowedValues.includes(value);
  }
}
class ObjectVerifier extends Verifier {
  constructor(defaultValue, verifier) {
    super(defaultValue);
    this.verifier = verifier;
  }
  static {
    __name(this, "ObjectVerifier");
  }
  verify(value) {
    if (!this.isType(value)) {
      return this.defaultValue;
    }
    return verifyObject(this.verifier, value);
  }
  isType(value) {
    return isObject(value);
  }
}
function verifyObject(verifiers, value) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const key in verifiers) {
    if (Object.hasOwnProperty.call(verifiers, key)) {
      const verifier = verifiers[key];
      result[key] = verifier.verify(value[key]);
    }
  }
  return result;
}
__name(verifyObject, "verifyObject");
export {
  BooleanVerifier,
  EnumVerifier,
  NumberVerifier,
  ObjectVerifier,
  SetVerifier,
  verifyObject
};
//# sourceMappingURL=verifier.js.map
