var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IURLService } from "../../../platform/url/common/url.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IExtensionUrlHandler } from "../../services/extensions/browser/extensionUrlHandler.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { ITrustedDomainService } from "../../contrib/url/browser/trustedDomainService.js";
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
class ExtensionUrlHandler {
  static {
    __name(this, "ExtensionUrlHandler");
  }
  constructor(proxy, handle, extensionId, extensionDisplayName) {
    this.proxy = proxy;
    this.handle = handle;
    this.extensionId = extensionId;
    this.extensionDisplayName = extensionDisplayName;
  }
  async handleURL(uri, options) {
    if (!ExtensionIdentifier.equals(this.extensionId, uri.authority)) {
      return false;
    }
    await this.proxy.$handleExternalUri(this.handle, uri);
    return true;
  }
}
let MainThreadUrls = class MainThreadUrls2 extends Disposable {
  static {
    __name(this, "MainThreadUrls");
  }
  constructor(context, trustedDomainService, urlService, extensionUrlHandler) {
    super();
    this.urlService = urlService;
    this.extensionUrlHandler = extensionUrlHandler;
    this.handlers = /* @__PURE__ */ new Map();
    this.proxy = context.getProxy(ExtHostContext.ExtHostUrls);
  }
  async $registerUriHandler(handle, extensionId, extensionDisplayName) {
    const handler = new ExtensionUrlHandler(this.proxy, handle, extensionId, extensionDisplayName);
    const disposable = this.urlService.registerHandler(handler);
    this.handlers.set(handle, { extensionId, disposable });
    this.extensionUrlHandler.registerExtensionHandler(extensionId, handler);
    return void 0;
  }
  async $unregisterUriHandler(handle) {
    const tuple = this.handlers.get(handle);
    if (!tuple) {
      return void 0;
    }
    const { extensionId, disposable } = tuple;
    this.extensionUrlHandler.unregisterExtensionHandler(extensionId);
    this.handlers.delete(handle);
    disposable.dispose();
    return void 0;
  }
  async $createAppUri(uri) {
    return this.urlService.create(uri);
  }
  dispose() {
    super.dispose();
    this.handlers.forEach(({ disposable }) => disposable.dispose());
    this.handlers.clear();
  }
};
MainThreadUrls = __decorate([
  extHostNamedCustomer(MainContext.MainThreadUrls),
  __param(1, ITrustedDomainService),
  __param(2, IURLService),
  __param(3, IExtensionUrlHandler)
], MainThreadUrls);
export {
  MainThreadUrls
};
//# sourceMappingURL=mainThreadUrls.js.map
