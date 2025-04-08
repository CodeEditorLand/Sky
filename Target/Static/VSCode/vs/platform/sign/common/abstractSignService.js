var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IMessage, ISignService } from "./sign.js";
class AbstractSignService {
  static {
    __name(this, "AbstractSignService");
  }
  static _nextId = 1;
  validators = /* @__PURE__ */ new Map();
  async createNewMessage(value) {
    try {
      const validator = await this.getValidator();
      if (validator) {
        const id = String(AbstractSignService._nextId++);
        this.validators.set(id, validator);
        return {
          id,
          data: validator.createNewMessage(value)
        };
      }
    } catch (e) {
    }
    return { id: "", data: value };
  }
  async validate(message, value) {
    if (!message.id) {
      return true;
    }
    const validator = this.validators.get(message.id);
    if (!validator) {
      return false;
    }
    this.validators.delete(message.id);
    try {
      return validator.validate(value) === "ok";
    } catch (e) {
      return false;
    } finally {
      validator.dispose?.();
    }
  }
  async sign(value) {
    try {
      return await this.signValue(value);
    } catch (e) {
    }
    return value;
  }
}
export {
  AbstractSignService
};
//# sourceMappingURL=abstractSignService.js.map
