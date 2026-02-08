var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MainContext } from "./extHost.protocol.js";
import { Disposable } from "./extHostTypes.js";
class ExtHostChatOutputRenderer {
  static {
    __name(this, "ExtHostChatOutputRenderer");
  }
  constructor(mainContext, webviews) {
    this.webviews = webviews;
    this._renderers = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatOutputRenderer);
  }
  registerChatOutputRenderer(extension, viewType, renderer) {
    if (this._renderers.has(viewType)) {
      throw new Error(`Chat output renderer already registered for: ${viewType}`);
    }
    this._renderers.set(viewType, { extension, renderer });
    this._proxy.$registerChatOutputRenderer(viewType, extension.identifier, extension.extensionLocation);
    return new Disposable(() => {
      this._renderers.delete(viewType);
      this._proxy.$unregisterChatOutputRenderer(viewType);
    });
  }
  async $renderChatOutput(viewType, mime, valueData, webviewHandle, token) {
    const entry = this._renderers.get(viewType);
    if (!entry) {
      throw new Error(`No chat output renderer registered for: ${viewType}`);
    }
    const extHostWebview = this.webviews.createNewWebview(webviewHandle, {}, entry.extension);
    const chatOutputWebview = Object.freeze({
      webview: extHostWebview,
      onDidDispose: extHostWebview._onDidDispose
    });
    return entry.renderer.renderChatOutput(Object.freeze({ mime, value: valueData.buffer }), chatOutputWebview, {}, token);
  }
}
export {
  ExtHostChatOutputRenderer
};
//# sourceMappingURL=extHostChatOutputRenderer.js.map
