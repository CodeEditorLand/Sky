var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { generateUuid } from "../../../../base/common/uuid.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IRandomService = createDecorator("randomService");
class RandomService {
  static {
    __name(this, "RandomService");
  }
  generateUuid() {
    return generateUuid();
  }
  /** Namespace should be 3 letter. */
  generatePrefixedUuid(namespace) {
    return `${namespace}-${this.generateUuid()}`;
  }
}
export {
  IRandomService,
  RandomService
};
//# sourceMappingURL=randomService.js.map
