var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { WebviewThemeDataProvider } from "./themeing.js";
import { WebviewElement } from "./webviewElement.js";
import { OverlayWebview } from "./overlayWebview.js";
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
let WebviewService = class WebviewService2 extends Disposable {
  static {
    __name(this, "WebviewService");
  }
  constructor(_instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._webviews = /* @__PURE__ */ new Set();
    this._onDidChangeActiveWebview = this._register(new Emitter());
    this.onDidChangeActiveWebview = this._onDidChangeActiveWebview.event;
    this._webviewThemeDataProvider = this._instantiationService.createInstance(WebviewThemeDataProvider);
  }
  get activeWebview() {
    return this._activeWebview;
  }
  _updateActiveWebview(value) {
    if (value !== this._activeWebview) {
      this._activeWebview = value;
      this._onDidChangeActiveWebview.fire(value);
    }
  }
  get webviews() {
    return this._webviews.values();
  }
  createWebviewElement(initInfo) {
    const webview = this._instantiationService.createInstance(WebviewElement, initInfo, this._webviewThemeDataProvider);
    this.registerNewWebview(webview);
    return webview;
  }
  createWebviewOverlay(initInfo) {
    const webview = this._instantiationService.createInstance(OverlayWebview, initInfo);
    this.registerNewWebview(webview);
    return webview;
  }
  registerNewWebview(webview) {
    this._webviews.add(webview);
    const store = new DisposableStore();
    store.add(webview.onDidFocus(() => {
      this._updateActiveWebview(webview);
    }));
    const onBlur = /* @__PURE__ */ __name(() => {
      if (this._activeWebview === webview) {
        this._updateActiveWebview(void 0);
      }
    }, "onBlur");
    store.add(webview.onDidBlur(onBlur));
    store.add(webview.onDidDispose(() => {
      onBlur();
      store.dispose();
      this._webviews.delete(webview);
    }));
  }
};
WebviewService = __decorate([
  __param(0, IInstantiationService)
], WebviewService);
export {
  WebviewService
};
//# sourceMappingURL=webviewService.js.map
