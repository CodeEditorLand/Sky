var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IURLService, IURLHandler, IOpenURLOptions } from "../../../../platform/url/common/url.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { URLHandlerChannel } from "../../../../platform/url/common/urlIpc.js";
import { IOpenerService, IOpener } from "../../../../platform/opener/common/opener.js";
import { matchesScheme } from "../../../../base/common/network.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { NativeURLService } from "../../../../platform/url/common/urlService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let RelayURLService = class extends NativeURLService {
  constructor(mainProcessService, openerService, nativeHostService, productService, logService) {
    super(productService);
    this.nativeHostService = nativeHostService;
    this.logService = logService;
    this.urlService = ProxyChannel.toService(mainProcessService.getChannel("url"));
    mainProcessService.registerChannel("urlHandler", new URLHandlerChannel(this));
    openerService.registerOpener(this);
  }
  static {
    __name(this, "RelayURLService");
  }
  urlService;
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
      await this.nativeHostService.focusWindow({ force: true, targetWindowId: this.nativeHostService.windowId });
    } else {
      this.logService.trace("URLService#handleURL(): not handled", uri.toString(true));
    }
    return result;
  }
};
RelayURLService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ILogService)
], RelayURLService);
registerSingleton(IURLService, RelayURLService, InstantiationType.Eager);
export {
  RelayURLService
};
//# sourceMappingURL=urlService.js.map
