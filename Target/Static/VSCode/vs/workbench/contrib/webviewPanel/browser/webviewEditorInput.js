var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CodeWindow } from "../../../../base/browser/window.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { EditorInputCapabilities, GroupIdentifier, IUntypedEditorInput, Verbosity } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IOverlayWebview } from "../../webview/browser/webview.js";
import { WebviewIconManager, WebviewIcons } from "./webviewIconManager.js";
class WebviewInput extends EditorInput {
  constructor(init, webview, _iconManager) {
    super();
    this._iconManager = _iconManager;
    this.viewType = init.viewType;
    this.providedId = init.providedId;
    this._name = init.name;
    this._webview = webview;
  }
  static {
    __name(this, "WebviewInput");
  }
  static typeId = "workbench.editors.webviewInput";
  get typeId() {
    return WebviewInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton | EditorInputCapabilities.CanDropIntoEditor;
  }
  _resourceId = generateUuid();
  _name;
  _iconPath;
  _group;
  _webview;
  _hasTransfered = false;
  get resource() {
    return URI.from({
      scheme: Schemas.webviewPanel,
      path: `webview-panel/webview-${this._resourceId}`
    });
  }
  viewType;
  providedId;
  dispose() {
    if (!this.isDisposed()) {
      if (!this._hasTransfered) {
        this._webview?.dispose();
      }
    }
    super.dispose();
  }
  getName() {
    return this._name;
  }
  getTitle(_verbosity) {
    return this.getName();
  }
  getDescription() {
    return void 0;
  }
  setName(value) {
    this._name = value;
    this.webview.setTitle(value);
    this._onDidChangeLabel.fire();
  }
  get webview() {
    return this._webview;
  }
  get extension() {
    return this.webview.extension;
  }
  get iconPath() {
    return this._iconPath;
  }
  set iconPath(value) {
    this._iconPath = value;
    this._iconManager.setIcons(this._resourceId, value);
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
}
export {
  WebviewInput
};
//# sourceMappingURL=webviewEditorInput.js.map
