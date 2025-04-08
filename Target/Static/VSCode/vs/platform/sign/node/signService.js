var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AbstractSignService, IVsdaValidator } from "../common/abstractSignService.js";
import { ISignService } from "../common/sign.js";
class SignService extends AbstractSignService {
  static {
    __name(this, "SignService");
  }
  getValidator() {
    return this.vsda().then((vsda) => new vsda.validator());
  }
  signValue(arg) {
    return this.vsda().then((vsda) => new vsda.signer().sign(arg));
  }
  async vsda() {
    const mod = "vsda";
    const { default: vsda } = await import(mod);
    return vsda;
  }
}
export {
  SignService
};
//# sourceMappingURL=signService.js.map
