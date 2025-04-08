var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IWebviewElement, WebviewInitInfo } from "../browser/webview.js";
import { WebviewService } from "../browser/webviewService.js";
import { ElectronWebviewElement } from "./webviewElement.js";
class ElectronWebviewService extends WebviewService {
  static {
    __name(this, "ElectronWebviewService");
  }
  createWebviewElement(initInfo) {
    const webview = this._instantiationService.createInstance(ElectronWebviewElement, initInfo, this._webviewThemeDataProvider);
    this.registerNewWebview(webview);
    return webview;
  }
}
export {
  ElectronWebviewService
};
//# sourceMappingURL=webviewService.js.map
