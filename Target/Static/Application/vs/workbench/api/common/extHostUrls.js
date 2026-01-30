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
var ExtHostUrls_1;
import { MainContext } from "./extHost.protocol.js";
import { URI } from "../../../base/common/uri.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import { onUnexpectedError } from "../../../base/common/errors.js";
import { ExtensionIdentifierSet } from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
let ExtHostUrls = class ExtHostUrls2 {
  static {
    __name(this, "ExtHostUrls");
  }
  static {
    ExtHostUrls_1 = this;
  }
  static {
    this.HandlePool = 0;
  }
  constructor(extHostRpc) {
    this.handles = new ExtensionIdentifierSet();
    this.handlers = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadUrls);
  }
  registerUriHandler(extension, handler) {
    const extensionId = extension.identifier;
    if (this.handles.has(extensionId)) {
      throw new Error(`Protocol handler already registered for extension ${extensionId}`);
    }
    const handle = ExtHostUrls_1.HandlePool++;
    this.handles.add(extensionId);
    this.handlers.set(handle, handler);
    this._proxy.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
    return toDisposable(() => {
      this.handles.delete(extensionId);
      this.handlers.delete(handle);
      this._proxy.$unregisterUriHandler(handle);
    });
  }
  $handleExternalUri(handle, uri) {
    const handler = this.handlers.get(handle);
    if (!handler) {
      return Promise.resolve(void 0);
    }
    try {
      handler.handleUri(URI.revive(uri));
    } catch (err) {
      onUnexpectedError(err);
    }
    return Promise.resolve(void 0);
  }
  async createAppUri(uri) {
    return URI.revive(await this._proxy.$createAppUri(uri));
  }
};
ExtHostUrls = ExtHostUrls_1 = __decorate([
  __param(0, IExtHostRpcService)
], ExtHostUrls);
const IExtHostUrlsService = createDecorator("IExtHostUrlsService");
export {
  ExtHostUrls,
  IExtHostUrlsService
};
//# sourceMappingURL=extHostUrls.js.map
