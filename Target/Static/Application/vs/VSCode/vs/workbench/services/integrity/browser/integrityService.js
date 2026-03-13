var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IIntegrityService } from "../common/integrity.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
class IntegrityService {
  static {
    __name(this, "IntegrityService");
  }
  async isPure() {
    return { isPure: true, proof: [] };
  }
}
registerSingleton(
  IIntegrityService,
  IntegrityService,
  1
  /* InstantiationType.Delayed */
);
export {
  IntegrityService
};
//# sourceMappingURL=integrityService.js.map
