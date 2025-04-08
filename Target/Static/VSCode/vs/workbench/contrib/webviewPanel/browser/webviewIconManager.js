var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as cssValue from "../../../../base/browser/cssValue.js";
import * as domStylesheets from "../../../../base/browser/domStylesheets.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILifecycleService, LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
let WebviewIconManager = class extends Disposable {
  constructor(_lifecycleService, _configService) {
    super();
    this._lifecycleService = _lifecycleService;
    this._configService = _configService;
    this._register(this._configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.iconTheme")) {
        this.updateStyleSheet();
      }
    }));
  }
  static {
    __name(this, "WebviewIconManager");
  }
  _icons = /* @__PURE__ */ new Map();
  _styleElement;
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
    await this._lifecycleService.when(LifecyclePhase.Starting);
    const cssRules = [];
    if (this._configService.getValue("workbench.iconTheme") !== null) {
      for (const [key, value] of this._icons) {
        const webviewSelector = `.show-file-icons .webview-${key}-name-file-icon::before`;
        try {
          cssRules.push(
            `.monaco-workbench.vs ${webviewSelector}, .monaco-workbench.hc-light ${webviewSelector} { content: ""; background-image: ${cssValue.asCSSUrl(value.light)}; }`,
            `.monaco-workbench.vs-dark ${webviewSelector}, .monaco-workbench.hc-black ${webviewSelector} { content: ""; background-image: ${cssValue.asCSSUrl(value.dark)}; }`
          );
        } catch {
        }
      }
    }
    this.styleElement.textContent = cssRules.join("\n");
  }
};
WebviewIconManager = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, IConfigurationService)
], WebviewIconManager);
export {
  WebviewIconManager
};
//# sourceMappingURL=webviewIconManager.js.map
