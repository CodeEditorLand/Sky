var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../base/common/errors.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { Disposable } from "./extHostTypes.js";
import { MainContext, ExtHostDocumentContentProvidersShape, MainThreadDocumentContentProvidersShape, IMainContext } from "./extHost.protocol.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { Schemas } from "../../../base/common/network.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { splitLines } from "../../../base/common/strings.js";
class ExtHostDocumentContentProvider {
  constructor(mainContext, _documentsAndEditors, _logService) {
    this._documentsAndEditors = _documentsAndEditors;
    this._logService = _logService;
    this._proxy = mainContext.getProxy(MainContext.MainThreadDocumentContentProviders);
  }
  static {
    __name(this, "ExtHostDocumentContentProvider");
  }
  static _handlePool = 0;
  _documentContentProviders = /* @__PURE__ */ new Map();
  _proxy;
  registerTextDocumentContentProvider(scheme, provider) {
    if (Object.keys(Schemas).indexOf(scheme) >= 0) {
      throw new Error(`scheme '${scheme}' already registered`);
    }
    const handle = ExtHostDocumentContentProvider._handlePool++;
    this._documentContentProviders.set(handle, provider);
    this._proxy.$registerTextContentProvider(handle, scheme);
    let subscription;
    if (typeof provider.onDidChange === "function") {
      let lastEvent;
      subscription = provider.onDidChange(async (uri) => {
        if (uri.scheme !== scheme) {
          this._logService.warn(`Provider for scheme '${scheme}' is firing event for schema '${uri.scheme}' which will be IGNORED`);
          return;
        }
        if (!this._documentsAndEditors.getDocument(uri)) {
          return;
        }
        if (lastEvent) {
          await lastEvent;
        }
        const thisEvent = this.$provideTextDocumentContent(handle, uri).then(async (value) => {
          if (!value && typeof value !== "string") {
            return;
          }
          const document = this._documentsAndEditors.getDocument(uri);
          if (!document) {
            return;
          }
          const lines = splitLines(value);
          if (!document.equalLines(lines)) {
            return this._proxy.$onVirtualDocumentChange(uri, value);
          }
        }).catch(onUnexpectedError).finally(() => {
          if (lastEvent === thisEvent) {
            lastEvent = void 0;
          }
        });
        lastEvent = thisEvent;
      });
    }
    return new Disposable(() => {
      if (this._documentContentProviders.delete(handle)) {
        this._proxy.$unregisterTextContentProvider(handle);
      }
      if (subscription) {
        subscription.dispose();
        subscription = void 0;
      }
    });
  }
  $provideTextDocumentContent(handle, uri) {
    const provider = this._documentContentProviders.get(handle);
    if (!provider) {
      return Promise.reject(new Error(`unsupported uri-scheme: ${uri.scheme}`));
    }
    return Promise.resolve(provider.provideTextDocumentContent(URI.revive(uri), CancellationToken.None));
  }
}
export {
  ExtHostDocumentContentProvider
};
//# sourceMappingURL=extHostDocumentContentProviders.js.map
