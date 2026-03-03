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
import { DeferredPromise } from "../../../base/common/async.js";
import * as errors from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { RemoteAuthorities } from "../../../base/common/network.js";
import { IProductService } from "../../product/common/productService.js";
let RemoteAuthorityResolverService = class RemoteAuthorityResolverService2 extends Disposable {
  static {
    __name(this, "RemoteAuthorityResolverService");
  }
  constructor(productService, remoteResourceLoader) {
    super();
    this.remoteResourceLoader = remoteResourceLoader;
    this._onDidChangeConnectionData = this._register(new Emitter());
    this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
    this._resolveAuthorityRequests = /* @__PURE__ */ new Map();
    this._connectionTokens = /* @__PURE__ */ new Map();
    this._canonicalURIRequests = /* @__PURE__ */ new Map();
    this._canonicalURIProvider = null;
    RemoteAuthorities.setServerRootPath(productService, void 0);
  }
  resolveAuthority(authority) {
    if (!this._resolveAuthorityRequests.has(authority)) {
      this._resolveAuthorityRequests.set(authority, new DeferredPromise());
    }
    return this._resolveAuthorityRequests.get(authority).p;
  }
  async getCanonicalURI(uri) {
    const key = uri.toString();
    const existing = this._canonicalURIRequests.get(key);
    if (existing) {
      return existing.result.p;
    }
    const result = new DeferredPromise();
    this._canonicalURIProvider?.(uri).then((uri2) => result.complete(uri2), (err) => result.error(err));
    this._canonicalURIRequests.set(key, { input: uri, result });
    return result.p;
  }
  getConnectionData(authority) {
    if (!this._resolveAuthorityRequests.has(authority)) {
      return null;
    }
    const request = this._resolveAuthorityRequests.get(authority);
    if (!request.isResolved) {
      return null;
    }
    const connectionToken = this._connectionTokens.get(authority);
    return {
      connectTo: request.value.authority.connectTo,
      connectionToken
    };
  }
  _clearResolvedAuthority(authority) {
    if (this._resolveAuthorityRequests.has(authority)) {
      this._resolveAuthorityRequests.get(authority).cancel();
      this._resolveAuthorityRequests.delete(authority);
    }
  }
  _setResolvedAuthority(resolvedAuthority, options) {
    if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
      const request = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
      if (resolvedAuthority.connectTo.type === 0) {
        RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
      } else {
        RemoteAuthorities.setDelegate(this.remoteResourceLoader.getResourceUriProvider());
      }
      if (resolvedAuthority.connectionToken) {
        RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
      }
      request.complete({ authority: resolvedAuthority, options });
      this._onDidChangeConnectionData.fire();
    }
  }
  _setResolvedAuthorityError(authority, err) {
    if (this._resolveAuthorityRequests.has(authority)) {
      const request = this._resolveAuthorityRequests.get(authority);
      request.error(errors.ErrorNoTelemetry.fromError(err));
    }
  }
  _setAuthorityConnectionToken(authority, connectionToken) {
    this._connectionTokens.set(authority, connectionToken);
    RemoteAuthorities.setConnectionToken(authority, connectionToken);
    this._onDidChangeConnectionData.fire();
  }
  _setCanonicalURIProvider(provider) {
    this._canonicalURIProvider = provider;
    this._canonicalURIRequests.forEach(({ result, input }) => {
      this._canonicalURIProvider(input).then((uri) => result.complete(uri), (err) => result.error(err));
    });
  }
};
RemoteAuthorityResolverService = __decorate([
  __param(0, IProductService)
], RemoteAuthorityResolverService);
export {
  RemoteAuthorityResolverService
};
//# sourceMappingURL=remoteAuthorityResolverService.js.map
