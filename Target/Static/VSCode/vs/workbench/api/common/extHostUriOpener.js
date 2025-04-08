var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toDisposable } from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import * as languages from "../../../editor/common/languages.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { ExtHostUriOpenersShape, IMainContext, MainContext, MainThreadUriOpenersShape } from "./extHost.protocol.js";
class ExtHostUriOpeners {
  static {
    __name(this, "ExtHostUriOpeners");
  }
  static supportedSchemes = /* @__PURE__ */ new Set([Schemas.http, Schemas.https]);
  _proxy;
  _openers = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadUriOpeners);
  }
  registerExternalUriOpener(extensionId, id, opener, metadata) {
    if (this._openers.has(id)) {
      throw new Error(`Opener with id '${id}' already registered`);
    }
    const invalidScheme = metadata.schemes.find((scheme) => !ExtHostUriOpeners.supportedSchemes.has(scheme));
    if (invalidScheme) {
      throw new Error(`Scheme '${invalidScheme}' is not supported. Only http and https are currently supported.`);
    }
    this._openers.set(id, opener);
    this._proxy.$registerUriOpener(id, metadata.schemes, extensionId, metadata.label);
    return toDisposable(() => {
      this._openers.delete(id);
      this._proxy.$unregisterUriOpener(id);
    });
  }
  async $canOpenUri(id, uriComponents, token) {
    const opener = this._openers.get(id);
    if (!opener) {
      throw new Error(`Unknown opener with id: ${id}`);
    }
    const uri = URI.revive(uriComponents);
    return opener.canOpenExternalUri(uri, token);
  }
  async $openUri(id, context, token) {
    const opener = this._openers.get(id);
    if (!opener) {
      throw new Error(`Unknown opener id: '${id}'`);
    }
    return opener.openExternalUri(URI.revive(context.resolvedUri), {
      sourceUri: URI.revive(context.sourceUri)
    }, token);
  }
}
export {
  ExtHostUriOpeners
};
//# sourceMappingURL=extHostUriOpener.js.map
