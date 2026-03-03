var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../../platform/instantiation/common/instantiation.js";
const ICodeMapperService = createDecorator("codeMapperService");
class CodeMapperService {
  static {
    __name(this, "CodeMapperService");
  }
  constructor() {
    this.providers = [];
  }
  registerCodeMapperProvider(handle, provider) {
    this.providers.push(provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const index = this.providers.indexOf(provider);
        if (index >= 0) {
          this.providers.splice(index, 1);
        }
      }, "dispose")
    };
  }
  async mapCode(request, response, token) {
    for (const provider of this.providers) {
      const result = await provider.mapCode(request, response, token);
      if (token.isCancellationRequested) {
        return void 0;
      }
      return result;
    }
    return void 0;
  }
}
export {
  CodeMapperService,
  ICodeMapperService
};
//# sourceMappingURL=chatCodeMapperService.js.map
