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
import { VSBuffer } from "../../../base/common/buffer.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IChatOutputRendererService } from "../../contrib/chat/browser/chatOutputItemRenderer.js";
import { ExtHostContext } from "../common/extHost.protocol.js";
let MainThreadChatOutputRenderer = class MainThreadChatOutputRenderer2 extends Disposable {
  static {
    __name(this, "MainThreadChatOutputRenderer");
  }
  constructor(extHostContext, _mainThreadWebview, _rendererService) {
    super();
    this._mainThreadWebview = _mainThreadWebview;
    this._rendererService = _rendererService;
    this._webviewHandlePool = 0;
    this.registeredRenderers = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatOutputRenderer);
  }
  dispose() {
    super.dispose();
    this.registeredRenderers.forEach((disposable) => disposable.dispose());
    this.registeredRenderers.clear();
  }
  $registerChatOutputRenderer(viewType, extensionId, extensionLocation) {
    this._rendererService.registerRenderer(viewType, {
      renderOutputPart: /* @__PURE__ */ __name(async (mime, data, webview, token) => {
        const webviewHandle = `chat-output-${++this._webviewHandlePool}`;
        this._mainThreadWebview.addWebview(webviewHandle, webview, {
          serializeBuffersForPostMessage: true
        });
        return this._proxy.$renderChatOutput(viewType, mime, VSBuffer.wrap(data), webviewHandle, token);
      }, "renderOutputPart")
    }, {
      extension: { id: extensionId, location: URI.revive(extensionLocation) }
    });
  }
  $unregisterChatOutputRenderer(viewType) {
    this.registeredRenderers.get(viewType)?.dispose();
  }
};
MainThreadChatOutputRenderer = __decorate([
  __param(2, IChatOutputRendererService)
], MainThreadChatOutputRenderer);
export {
  MainThreadChatOutputRenderer
};
//# sourceMappingURL=mainThreadChatOutputRenderer.js.map
