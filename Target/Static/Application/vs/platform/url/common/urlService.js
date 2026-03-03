var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { first } from "../../../base/common/async.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IProductService } from "../../product/common/productService.js";
class AbstractURLService extends Disposable {
  static {
    __name(this, "AbstractURLService");
  }
  constructor() {
    super(...arguments);
    this.handlers = /* @__PURE__ */ new Set();
  }
  open(uri, options) {
    const handlers = [...this.handlers.values()];
    return first(handlers.map((h) => () => h.handleURL(uri, options)), void 0, false).then((val) => val || false);
  }
  registerHandler(handler) {
    this.handlers.add(handler);
    return toDisposable(() => this.handlers.delete(handler));
  }
}
let NativeURLService = class NativeURLService2 extends AbstractURLService {
  static {
    __name(this, "NativeURLService");
  }
  constructor(productService) {
    super();
    this.productService = productService;
  }
  create(options) {
    let { authority, path, query, fragment } = options ? options : { authority: void 0, path: void 0, query: void 0, fragment: void 0 };
    if (authority && path && path.indexOf("/") !== 0) {
      path = `/${path}`;
    }
    return URI.from({ scheme: this.productService.urlProtocol, authority, path, query, fragment });
  }
};
NativeURLService = __decorate([
  __param(0, IProductService)
], NativeURLService);
export {
  AbstractURLService,
  NativeURLService
};
//# sourceMappingURL=urlService.js.map
