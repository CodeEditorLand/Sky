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
var WebviewInput_1;
import { Schemas } from "../../../../base/common/network.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { isDark } from "../../../../platform/theme/common/theme.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
let WebviewInput = class WebviewInput2 extends EditorInput {
  static {
    __name(this, "WebviewInput");
  }
  static {
    WebviewInput_1 = this;
  }
  static {
    this.typeId = "workbench.editors.webviewInput";
  }
  get typeId() {
    return WebviewInput_1.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    return 2 | 8 | 128;
  }
  get resource() {
    return URI.from({
      scheme: Schemas.webviewPanel,
      path: `webview-panel/webview-${this.providerId}-${this._resourceId}`
    });
  }
  constructor(init, webview, _themeService) {
    super();
    this._themeService = _themeService;
    this._resourceId = generateUuid();
    this._hasTransfered = false;
    this.viewType = init.viewType;
    this.providerId = init.providedId;
    this._webviewTitle = init.name;
    this._iconPath = init.iconPath;
    this._webview = webview;
    this._register(_themeService.onDidColorThemeChange(() => {
      this._onDidChangeLabel.fire();
    }));
  }
  dispose() {
    if (!this.isDisposed()) {
      if (!this._hasTransfered) {
        this._webview?.dispose();
      }
    }
    super.dispose();
  }
  getName() {
    return this._webviewTitle;
  }
  getTitle(_verbosity) {
    return this.getName();
  }
  getDescription() {
    return void 0;
  }
  setWebviewTitle(value) {
    this._webviewTitle = value;
    this.webview.setTitle(value);
    this._onDidChangeLabel.fire();
  }
  getWebviewTitle() {
    return this._webviewTitle;
  }
  get webview() {
    return this._webview;
  }
  get extension() {
    return this.webview.extension;
  }
  getIcon() {
    if (!this._iconPath) {
      return;
    }
    if (ThemeIcon.isThemeIcon(this._iconPath)) {
      return this._iconPath;
    }
    return isDark(this._themeService.getColorTheme().type) ? this._iconPath.dark : this._iconPath.light ?? this._iconPath.dark;
  }
  get iconPath() {
    return this._iconPath;
  }
  set iconPath(value) {
    this._iconPath = value;
    this._onDidChangeLabel.fire();
  }
  matches(other) {
    return super.matches(other) || other === this;
  }
  get group() {
    return this._group;
  }
  updateGroup(group) {
    this._group = group;
  }
  transfer(other) {
    if (this._hasTransfered) {
      return void 0;
    }
    this._hasTransfered = true;
    other._webview = this._webview;
    return other;
  }
  claim(claimant, targetWindow, scopedContextKeyService) {
    return this._webview.claim(claimant, targetWindow, scopedContextKeyService);
  }
};
WebviewInput = WebviewInput_1 = __decorate([
  __param(2, IThemeService)
], WebviewInput);
export {
  WebviewInput
};
//# sourceMappingURL=webviewEditorInput.js.map
