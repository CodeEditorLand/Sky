var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as cssValue from "../../../../base/browser/cssValue.js";
import * as domStylesheets from "../../../../base/browser/domStylesheets.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
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
let WebviewIconManager = class WebviewIconManager2 extends Disposable {
  static {
    __name(this, "WebviewIconManager");
  }
  constructor(_lifecycleService, _configService) {
    super();
    this._lifecycleService = _lifecycleService;
    this._configService = _configService;
    this._icons = /* @__PURE__ */ new Map();
    this._register(this._configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.iconTheme")) {
        this.updateStyleSheet();
      }
    }));
  }
  dispose() {
    super.dispose();
    this._styleElement = void 0;
  }
  get styleElement() {
    if (!this._styleElement) {
      this._styleElement = domStylesheets.createStyleSheet(void 0, void 0, this._store);
      this._styleElement.className = "webview-icons";
    }
    return this._styleElement;
  }
  setIcons(webviewId, iconPath) {
    if (iconPath) {
      this._icons.set(webviewId, iconPath);
    } else {
      this._icons.delete(webviewId);
    }
    this.updateStyleSheet();
  }
  async updateStyleSheet() {
    await this._lifecycleService.when(
      1
      /* LifecyclePhase.Starting */
    );
    const cssRules = [];
    if (this._configService.getValue("workbench.iconTheme") !== null) {
      for (const [key, value] of this._icons) {
        const webviewSelector = `.show-file-icons .webview-${key}-name-file-icon::before`;
        try {
          cssRules.push(`.monaco-workbench.vs ${webviewSelector}, .monaco-workbench.hc-light ${webviewSelector} { content: ""; background-image: ${cssValue.asCSSUrl(value.light)}; }`, `.monaco-workbench.vs-dark ${webviewSelector}, .monaco-workbench.hc-black ${webviewSelector} { content: ""; background-image: ${cssValue.asCSSUrl(value.dark)}; }`);
        } catch {
        }
      }
    }
    this.styleElement.textContent = cssRules.join("\n");
  }
};
WebviewIconManager = __decorate([
  __param(0, ILifecycleService),
  __param(1, IConfigurationService)
], WebviewIconManager);
export {
  WebviewIconManager
};
//# sourceMappingURL=webviewIconManager.js.map
