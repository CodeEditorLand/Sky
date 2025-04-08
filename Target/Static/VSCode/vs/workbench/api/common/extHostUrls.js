var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext, IMainContext, ExtHostUrlsShape, MainThreadUrlsShape } from "./extHost.protocol.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import { onUnexpectedError } from "../../../base/common/errors.js";
import { ExtensionIdentifierSet, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
class ExtHostUrls {
  static {
    __name(this, "ExtHostUrls");
  }
  static HandlePool = 0;
  _proxy;
  handles = new ExtensionIdentifierSet();
  handlers = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadUrls);
  }
  registerUriHandler(extension, handler) {
    const extensionId = extension.identifier;
    if (this.handles.has(extensionId)) {
      throw new Error(`Protocol handler already registered for extension ${extensionId}`);
    }
    const handle = ExtHostUrls.HandlePool++;
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
}
export {
  ExtHostUrls
};
//# sourceMappingURL=extHostUrls.js.map
