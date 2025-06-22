var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IURLService } from "../../../../platform/url/common/url.js";
import { URI } from "../../../../base/common/uri.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AbstractURLService } from "../../../../platform/url/common/urlService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { matchesScheme } from "../../../../base/common/network.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
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
class BrowserURLOpener {
  static {
    __name(this, "BrowserURLOpener");
  }
  constructor(urlService, productService) {
    this.urlService = urlService;
    this.productService = productService;
  }
  async open(resource, options) {
    if (options?.openExternal) {
      return false;
    }
    if (!matchesScheme(resource, this.productService.urlProtocol)) {
      return false;
    }
    if (typeof resource === "string") {
      resource = URI.parse(resource);
    }
    return this.urlService.open(resource, { trusted: true });
  }
}
let BrowserURLService = class BrowserURLService2 extends AbstractURLService {
  static {
    __name(this, "BrowserURLService");
  }
  constructor(environmentService, openerService, productService) {
    super();
    this.provider = environmentService.options?.urlCallbackProvider;
    if (this.provider) {
      this._register(this.provider.onCallback((uri) => this.open(uri, { trusted: true })));
    }
    this._register(openerService.registerOpener(new BrowserURLOpener(this, productService)));
  }
  create(options) {
    if (this.provider) {
      return this.provider.create(options);
    }
    return URI.parse("unsupported://");
  }
};
BrowserURLService = __decorate([
  __param(0, IBrowserWorkbenchEnvironmentService),
  __param(1, IOpenerService),
  __param(2, IProductService)
], BrowserURLService);
registerSingleton(
  IURLService,
  BrowserURLService,
  1
  /* InstantiationType.Delayed */
);
export {
  BrowserURLService
};
//# sourceMappingURL=urlService.js.map
