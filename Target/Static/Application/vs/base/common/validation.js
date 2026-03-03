var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mapFilter } from "./arrays.js";
class ValidatorBase {
  static {
    __name(this, "ValidatorBase");
  }
  validateOrThrow(content) {
    const result = this.validate(content);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.content;
  }
}
class TypeofValidator extends ValidatorBase {
  static {
    __name(this, "TypeofValidator");
  }
  constructor(type) {
    super();
    this.type = type;
  }
  validate(content) {
    if (typeof content !== this.type) {
      return { content: void 0, error: { message: `Expected ${this.type}, but got ${typeof content}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return { type: this.type };
  }
}
const vStringValidator = new TypeofValidator("string");
function vString() {
  return vStringValidator;
}
__name(vString, "vString");
const vNumberValidator = new TypeofValidator("number");
function vNumber() {
  return vNumberValidator;
}
__name(vNumber, "vNumber");
const vBooleanValidator = new TypeofValidator("boolean");
function vBoolean() {
  return vBooleanValidator;
}
__name(vBoolean, "vBoolean");
const vObjAnyValidator = new TypeofValidator("object");
function vObjAny() {
  return vObjAnyValidator;
}
__name(vObjAny, "vObjAny");
class UncheckedValidator extends ValidatorBase {
  static {
    __name(this, "UncheckedValidator");
  }
  validate(content) {
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {};
  }
}
function vUnchecked() {
  return new UncheckedValidator();
}
__name(vUnchecked, "vUnchecked");
class UndefinedValidator extends ValidatorBase {
  static {
    __name(this, "UndefinedValidator");
  }
  validate(content) {
    if (content !== void 0) {
      return { content: void 0, error: { message: `Expected undefined, but got ${typeof content}` } };
    }
    return { content: void 0, error: void 0 };
  }
  getJSONSchema() {
    return {};
  }
}
function vUndefined() {
  return new UndefinedValidator();
}
__name(vUndefined, "vUndefined");
function vUnknown() {
  return vUnchecked();
}
__name(vUnknown, "vUnknown");
class Optional {
  static {
    __name(this, "Optional");
  }
  constructor(validator) {
    this.validator = validator;
  }
}
function vOptionalProp(validator) {
  return new Optional(validator);
}
__name(vOptionalProp, "vOptionalProp");
class ObjValidator extends ValidatorBase {
  static {
    __name(this, "ObjValidator");
  }
  constructor(properties) {
    super();
    this.properties = properties;
  }
  validate(content) {
    if (typeof content !== "object" || content === null) {
      return { content: void 0, error: { message: "Expected object" } };
    }
    const result = {};
    for (const key in this.properties) {
      const prop = this.properties[key];
      const fieldValue = content[key];
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      if (isOptional && fieldValue === void 0) {
        continue;
      }
      const { content: value, error } = validator.validate(fieldValue);
      if (error) {
        return { content: void 0, error: { message: `Error in property '${key}': ${error.message}` } };
      }
      result[key] = value;
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    const requiredFields = [];
    const schemaProperties = {};
    for (const [key, prop] of Object.entries(this.properties)) {
      const isOptional = prop instanceof Optional;
      const validator = isOptional ? prop.validator : prop;
      schemaProperties[key] = validator.getJSONSchema();
      if (!isOptional) {
        requiredFields.push(key);
      }
    }
    const schema = {
      type: "object",
      properties: schemaProperties,
      ...requiredFields.length > 0 ? { required: requiredFields } : {}
    };
    return schema;
  }
}
function vObj(properties) {
  return new ObjValidator(properties);
}
__name(vObj, "vObj");
class ArrayValidator extends ValidatorBase {
  static {
    __name(this, "ArrayValidator");
  }
  constructor(validator) {
    super();
    this.validator = validator;
  }
  validate(content) {
    if (!Array.isArray(content)) {
      return { content: void 0, error: { message: "Expected array" } };
    }
    const result = [];
    for (let i = 0; i < content.length; i++) {
      const { content: value, error } = this.validator.validate(content[i]);
      if (error) {
        return { content: void 0, error: { message: `Error in element ${i}: ${error.message}` } };
      }
      result.push(value);
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    return {
      type: "array",
      items: this.validator.getJSONSchema()
    };
  }
}
function vArray(validator) {
  return new ArrayValidator(validator);
}
__name(vArray, "vArray");
class TupleValidator extends ValidatorBase {
  static {
    __name(this, "TupleValidator");
  }
  constructor(validators) {
    super();
    this.validators = validators;
  }
  validate(content) {
    if (!Array.isArray(content)) {
      return { content: void 0, error: { message: "Expected array" } };
    }
    if (content.length !== this.validators.length) {
      return { content: void 0, error: { message: `Expected tuple of length ${this.validators.length}, but got ${content.length}` } };
    }
    const result = [];
    for (let i = 0; i < this.validators.length; i++) {
      const validator = this.validators[i];
      const { content: value, error } = validator.validate(content[i]);
      if (error) {
        return { content: void 0, error: { message: `Error in element ${i}: ${error.message}` } };
      }
      result.push(value);
    }
    return { content: result, error: void 0 };
  }
  getJSONSchema() {
    return {
      type: "array",
      items: this.validators.map((validator) => validator.getJSONSchema())
    };
  }
}
function vTuple(...validators) {
  return new TupleValidator(validators);
}
__name(vTuple, "vTuple");
class UnionValidator extends ValidatorBase {
  static {
    __name(this, "UnionValidator");
  }
  constructor(validators) {
    super();
    this.validators = validators;
  }
  validate(content) {
    let lastError;
    for (const validator of this.validators) {
      const { content: value, error } = validator.validate(content);
      if (!error) {
        return { content: value, error: void 0 };
      }
      lastError = error;
    }
    return { content: void 0, error: lastError };
  }
  getJSONSchema() {
    return {
      oneOf: mapFilter(this.validators, (validator) => {
        if (validator instanceof UndefinedValidator) {
          return void 0;
        }
        return validator.getJSONSchema();
      })
    };
  }
}
function vUnion(...validators) {
  return new UnionValidator(validators);
}
__name(vUnion, "vUnion");
class EnumValidator extends ValidatorBase {
  static {
    __name(this, "EnumValidator");
  }
  constructor(values) {
    super();
    this.values = values;
  }
  validate(content) {
    if (this.values.indexOf(content) === -1) {
      return { content: void 0, error: { message: `Expected one of: ${this.values.join(", ")}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {
      enum: this.values
    };
  }
}
function vEnum(...values) {
  return new EnumValidator(values);
}
__name(vEnum, "vEnum");
class LiteralValidator extends ValidatorBase {
  static {
    __name(this, "LiteralValidator");
  }
  constructor(value) {
    super();
    this.value = value;
  }
  validate(content) {
    if (content !== this.value) {
      return { content: void 0, error: { message: `Expected: ${this.value}` } };
    }
    return { content, error: void 0 };
  }
  getJSONSchema() {
    return {
      const: this.value
    };
  }
}
function vLiteral(value) {
  return new LiteralValidator(value);
}
__name(vLiteral, "vLiteral");
class LazyValidator extends ValidatorBase {
  static {
    __name(this, "LazyValidator");
  }
  constructor(fn) {
    super();
    this.fn = fn;
  }
  validate(content) {
    return this.fn().validate(content);
  }
  getJSONSchema() {
    return this.fn().getJSONSchema();
  }
}
function vLazy(fn) {
  return new LazyValidator(fn);
}
__name(vLazy, "vLazy");
class UseRefSchemaValidator extends ValidatorBase {
  static {
    __name(this, "UseRefSchemaValidator");
  }
  constructor(_ref, _validator) {
    super();
    this._ref = _ref;
    this._validator = _validator;
  }
  validate(content) {
    return this._validator.validate(content);
  }
  getJSONSchema() {
    return { $ref: this._ref };
  }
}
function vWithJsonSchemaRef(ref, validator) {
  return new UseRefSchemaValidator(ref, validator);
}
__name(vWithJsonSchemaRef, "vWithJsonSchemaRef");
export {
  Optional,
  ValidatorBase,
  vArray,
  vBoolean,
  vEnum,
  vLazy,
  vLiteral,
  vNumber,
  vObj,
  vObjAny,
  vOptionalProp,
  vString,
  vTuple,
  vUnchecked,
  vUndefined,
  vUnion,
  vUnknown,
  vWithJsonSchemaRef
};
//# sourceMappingURL=validation.js.map
