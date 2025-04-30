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
var MainThreadWebviews_1;
import { Disposable, DisposableStore } from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import { isWeb } from "../../../base/common/platform.js";
import { escape } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { IProductService } from "../../../platform/product/common/productService.js";
import * as extHostProtocol from "../common/extHost.protocol.js";
import { deserializeWebviewMessage, serializeWebviewMessage } from "../common/extHostWebviewMessaging.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
let MainThreadWebviews = class MainThreadWebviews2 extends Disposable {
  static {
    __name(this, "MainThreadWebviews");
  }
  static {
    MainThreadWebviews_1 = this;
  }
  static {
    this.standardSupportedLinkSchemes = /* @__PURE__ */ new Set([
      Schemas.http,
      Schemas.https,
      Schemas.mailto,
      Schemas.vscode,
      "vscode-insider"
    ]);
  }
  constructor(context, _openerService, _productService) {
    super();
    this._openerService = _openerService;
    this._productService = _productService;
    this._webviews = /* @__PURE__ */ new Map();
    this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviews);
  }
  addWebview(handle, webview, options) {
    if (this._webviews.has(handle)) {
      throw new Error("Webview already registered");
    }
    this._webviews.set(handle, webview);
    this.hookupWebviewEventDelegate(handle, webview, options);
  }
  $setHtml(handle, value) {
    this.tryGetWebview(handle)?.setHtml(value);
  }
  $setOptions(handle, options) {
    const webview = this.tryGetWebview(handle);
    if (webview) {
      webview.contentOptions = reviveWebviewContentOptions(options);
    }
  }
  async $postMessage(handle, jsonMessage, ...buffers) {
    const webview = this.tryGetWebview(handle);
    if (!webview) {
      return false;
    }
    const { message, arrayBuffers } = deserializeWebviewMessage(jsonMessage, buffers);
    return webview.postMessage(message, arrayBuffers);
  }
  hookupWebviewEventDelegate(handle, webview, options) {
    const disposables = new DisposableStore();
    disposables.add(webview.onDidClickLink((uri) => this.onDidClickLink(handle, uri)));
    disposables.add(webview.onMessage((message) => {
      const serialized = serializeWebviewMessage(message.message, options);
      this._proxy.$onMessage(handle, serialized.message, new SerializableObjectWithBuffers(serialized.buffers));
    }));
    disposables.add(webview.onMissingCsp((extension) => this._proxy.$onMissingCsp(handle, extension.value)));
    disposables.add(webview.onDidDispose(() => {
      disposables.dispose();
      this._webviews.delete(handle);
    }));
  }
  onDidClickLink(handle, link) {
    const webview = this.getWebview(handle);
    if (this.isSupportedLink(webview, URI.parse(link))) {
      this._openerService.open(link, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: Array.isArray(webview.contentOptions.enableCommandUris) || webview.contentOptions.enableCommandUris === true, fromWorkspace: true });
    }
  }
  isSupportedLink(webview, link) {
    if (MainThreadWebviews_1.standardSupportedLinkSchemes.has(link.scheme)) {
      return true;
    }
    if (!isWeb && this._productService.urlProtocol === link.scheme) {
      return true;
    }
    if (link.scheme === Schemas.command) {
      if (Array.isArray(webview.contentOptions.enableCommandUris)) {
        return webview.contentOptions.enableCommandUris.includes(link.path);
      }
      return webview.contentOptions.enableCommandUris === true;
    }
    return false;
  }
  tryGetWebview(handle) {
    return this._webviews.get(handle);
  }
  getWebview(handle) {
    const webview = this.tryGetWebview(handle);
    if (!webview) {
      throw new Error(`Unknown webview handle:${handle}`);
    }
    return webview;
  }
  getWebviewResolvedFailedContent(viewType) {
    return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">
			</head>
			<body>${localize("errorMessage", "An error occurred while loading view: {0}", escape(viewType))}</body>
		</html>`;
  }
};
MainThreadWebviews = MainThreadWebviews_1 = __decorate([
  __param(1, IOpenerService),
  __param(2, IProductService)
], MainThreadWebviews);
function reviveWebviewExtension(extensionData) {
  return {
    id: extensionData.id,
    location: URI.revive(extensionData.location)
  };
}
__name(reviveWebviewExtension, "reviveWebviewExtension");
function reviveWebviewContentOptions(webviewOptions) {
  return {
    allowScripts: webviewOptions.enableScripts,
    allowForms: webviewOptions.enableForms,
    enableCommandUris: webviewOptions.enableCommandUris,
    localResourceRoots: Array.isArray(webviewOptions.localResourceRoots) ? webviewOptions.localResourceRoots.map((r) => URI.revive(r)) : void 0,
    portMapping: webviewOptions.portMapping
  };
}
__name(reviveWebviewContentOptions, "reviveWebviewContentOptions");
export {
  MainThreadWebviews,
  reviveWebviewContentOptions,
  reviveWebviewExtension
};
//# sourceMappingURL=mainThreadWebviews.js.map
