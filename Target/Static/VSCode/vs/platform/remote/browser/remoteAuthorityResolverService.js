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
import { mainWindow } from "../../../base/browser/window.js";
import { DeferredPromise } from "../../../base/common/async.js";
import * as errors from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { RemoteAuthorities } from "../../../base/common/network.js";
import * as performance from "../../../base/common/performance.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { URI } from "../../../base/common/uri.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { IRemoteAuthorityResolverService, IRemoteConnectionData, RemoteConnectionType, ResolvedAuthority, ResolvedOptions, ResolverResult, WebSocketRemoteConnection, getRemoteAuthorityPrefix } from "../common/remoteAuthorityResolver.js";
import { parseAuthorityWithOptionalPort } from "../common/remoteHosts.js";
let RemoteAuthorityResolverService = class extends Disposable {
  constructor(isWorkbenchOptionsBasedResolution, connectionToken, resourceUriProvider, serverBasePath, productService, _logService) {
    super();
    this._logService = _logService;
    this._connectionToken = connectionToken;
    this._connectionTokens = /* @__PURE__ */ new Map();
    this._isWorkbenchOptionsBasedResolution = isWorkbenchOptionsBasedResolution;
    if (resourceUriProvider) {
      RemoteAuthorities.setDelegate(resourceUriProvider);
    }
    RemoteAuthorities.setServerRootPath(productService, serverBasePath);
  }
  static {
    __name(this, "RemoteAuthorityResolverService");
  }
  _onDidChangeConnectionData = this._register(new Emitter());
  onDidChangeConnectionData = this._onDidChangeConnectionData.event;
  _resolveAuthorityRequests = /* @__PURE__ */ new Map();
  _cache = /* @__PURE__ */ new Map();
  _connectionToken;
  _connectionTokens;
  _isWorkbenchOptionsBasedResolution;
  async resolveAuthority(authority) {
    let result = this._resolveAuthorityRequests.get(authority);
    if (!result) {
      result = new DeferredPromise();
      this._resolveAuthorityRequests.set(authority, result);
      if (this._isWorkbenchOptionsBasedResolution) {
        this._doResolveAuthority(authority).then((v) => result.complete(v), (err) => result.error(err));
      }
    }
    return result.p;
  }
  async getCanonicalURI(uri) {
    return uri;
  }
  getConnectionData(authority) {
    if (!this._cache.has(authority)) {
      return null;
    }
    const resolverResult = this._cache.get(authority);
    const connectionToken = this._connectionTokens.get(authority) || resolverResult.authority.connectionToken;
    return {
      connectTo: resolverResult.authority.connectTo,
      connectionToken
    };
  }
  async _doResolveAuthority(authority) {
    const authorityPrefix = getRemoteAuthorityPrefix(authority);
    const sw = StopWatch.create(false);
    this._logService.info(`Resolving connection token (${authorityPrefix})...`);
    performance.mark(`code/willResolveConnectionToken/${authorityPrefix}`);
    const connectionToken = await Promise.resolve(this._connectionTokens.get(authority) || this._connectionToken);
    performance.mark(`code/didResolveConnectionToken/${authorityPrefix}`);
    this._logService.info(`Resolved connection token (${authorityPrefix}) after ${sw.elapsed()} ms`);
    const defaultPort = /^https:/.test(mainWindow.location.href) ? 443 : 80;
    const { host, port } = parseAuthorityWithOptionalPort(authority, defaultPort);
    const result = { authority: { authority, connectTo: new WebSocketRemoteConnection(host, port), connectionToken } };
    RemoteAuthorities.set(authority, host, port);
    this._cache.set(authority, result);
    this._onDidChangeConnectionData.fire();
    return result;
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
      if (resolvedAuthority.connectTo.type === RemoteConnectionType.WebSocket) {
        RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
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
  }
};
RemoteAuthorityResolverService = __decorateClass([
  __decorateParam(4, IProductService),
  __decorateParam(5, ILogService)
], RemoteAuthorityResolverService);
export {
  RemoteAuthorityResolverService
};
//# sourceMappingURL=remoteAuthorityResolverService.js.map
