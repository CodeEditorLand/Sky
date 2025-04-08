var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { promiseWithResolvers } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IViewBadge } from "../../../common/views.js";
import { IOverlayWebview } from "../../webview/browser/webview.js";
const IWebviewViewService = createDecorator("webviewViewService");
class WebviewViewService extends Disposable {
  static {
    __name(this, "WebviewViewService");
  }
  _serviceBrand;
  _resolvers = /* @__PURE__ */ new Map();
  _awaitingRevival = /* @__PURE__ */ new Map();
  _onNewResolverRegistered = this._register(new Emitter());
  onNewResolverRegistered = this._onNewResolverRegistered.event;
  register(viewType, resolver) {
    if (this._resolvers.has(viewType)) {
      throw new Error(`View resolver already registered for ${viewType}`);
    }
    this._resolvers.set(viewType, resolver);
    this._onNewResolverRegistered.fire({ viewType });
    const pending = this._awaitingRevival.get(viewType);
    if (pending) {
      resolver.resolve(pending.webview, CancellationToken.None).then(() => {
        this._awaitingRevival.delete(viewType);
        pending.resolve();
      });
    }
    return toDisposable(() => {
      this._resolvers.delete(viewType);
    });
  }
  resolve(viewType, webview, cancellation) {
    const resolver = this._resolvers.get(viewType);
    if (!resolver) {
      if (this._awaitingRevival.has(viewType)) {
        throw new Error("View already awaiting revival");
      }
      const { promise, resolve } = promiseWithResolvers();
      this._awaitingRevival.set(viewType, { webview, resolve });
      return promise;
    }
    return resolver.resolve(webview, cancellation);
  }
}
export {
  IWebviewViewService,
  WebviewViewService
};
//# sourceMappingURL=webviewViewService.js.map
