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
import { IURLService } from "../../../../platform/url/common/url.js";
import { URI } from "../../../../base/common/uri.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { URLHandlerChannel } from "../../../../platform/url/common/urlIpc.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { matchesScheme } from "../../../../base/common/network.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { NativeURLService } from "../../../../platform/url/common/urlService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let RelayURLService = class RelayURLService2 extends NativeURLService {
  static {
    __name(this, "RelayURLService");
  }
  constructor(mainProcessService, openerService, nativeHostService, productService, logService) {
    super(productService);
    this.nativeHostService = nativeHostService;
    this.logService = logService;
    this.urlService = ProxyChannel.toService(mainProcessService.getChannel("url"));
    mainProcessService.registerChannel("urlHandler", new URLHandlerChannel(this));
    openerService.registerOpener(this);
  }
  create(options) {
    const uri = super.create(options);
    let query = uri.query;
    if (!query) {
      query = `windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
    } else {
      query += `&windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
    }
    return uri.with({ query });
  }
  async open(resource, options) {
    if (!matchesScheme(resource, this.productService.urlProtocol)) {
      return false;
    }
    if (typeof resource === "string") {
      resource = URI.parse(resource);
    }
    return await this.urlService.open(resource, options);
  }
  async handleURL(uri, options) {
    const result = await super.open(uri, options);
    if (result) {
      this.logService.trace("URLService#handleURL(): handled", uri.toString(true));
      await this.nativeHostService.focusWindow({ mode: 2, targetWindowId: this.nativeHostService.windowId });
    } else {
      this.logService.trace("URLService#handleURL(): not handled", uri.toString(true));
    }
    return result;
  }
};
RelayURLService = __decorate([
  __param(0, IMainProcessService),
  __param(1, IOpenerService),
  __param(2, INativeHostService),
  __param(3, IProductService),
  __param(4, ILogService)
], RelayURLService);
registerSingleton(
  IURLService,
  RelayURLService,
  0
  /* InstantiationType.Eager */
);
export {
  RelayURLService
};
//# sourceMappingURL=urlService.js.map
