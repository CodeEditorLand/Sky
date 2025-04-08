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
import { getWindow } from "../../../base/browser/dom.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { isEqual } from "../../../base/common/resources.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IActiveCodeEditor, IViewZone } from "../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../editor/browser/services/codeEditorService.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { reviveWebviewContentOptions } from "./mainThreadWebviews.js";
import { ExtHostContext, ExtHostEditorInsetsShape, IWebviewContentOptions, MainContext, MainThreadEditorInsetsShape } from "../common/extHost.protocol.js";
import { IWebviewService, IWebviewElement } from "../../contrib/webview/browser/webview.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
class EditorWebviewZone {
  // suppressMouseDown?: boolean | undefined;
  // heightInPx?: number | undefined;
  // minWidthInPx?: number | undefined;
  // marginDomNode?: HTMLElement | null | undefined;
  // onDomNodeTop?: ((top: number) => void) | undefined;
  // onComputedHeight?: ((height: number) => void) | undefined;
  constructor(editor, line, height, webview) {
    this.editor = editor;
    this.line = line;
    this.height = height;
    this.webview = webview;
    this.domNode = document.createElement("div");
    this.domNode.style.zIndex = "10";
    this.afterLineNumber = line;
    this.afterColumn = 1;
    this.heightInLines = height;
    editor.changeViewZones((accessor) => this._id = accessor.addZone(this));
    webview.mountTo(this.domNode, getWindow(editor.getDomNode()));
  }
  static {
    __name(this, "EditorWebviewZone");
  }
  domNode;
  afterLineNumber;
  afterColumn;
  heightInLines;
  _id;
  dispose() {
    this.editor.changeViewZones((accessor) => this._id && accessor.removeZone(this._id));
  }
}
let MainThreadEditorInsets = class {
  constructor(context, _editorService, _webviewService) {
    this._editorService = _editorService;
    this._webviewService = _webviewService;
    this._proxy = context.getProxy(ExtHostContext.ExtHostEditorInsets);
  }
  _proxy;
  _disposables = new DisposableStore();
  _insets = /* @__PURE__ */ new Map();
  dispose() {
    this._disposables.dispose();
  }
  async $createEditorInset(handle, id, uri, line, height, options, extensionId, extensionLocation) {
    let editor;
    id = id.substr(0, id.indexOf(","));
    for (const candidate of this._editorService.listCodeEditors()) {
      if (candidate.getId() === id && candidate.hasModel() && isEqual(candidate.getModel().uri, URI.revive(uri))) {
        editor = candidate;
        break;
      }
    }
    if (!editor) {
      setTimeout(() => this._proxy.$onDidDispose(handle));
      return;
    }
    const disposables = new DisposableStore();
    const webview = this._webviewService.createWebviewElement({
      title: void 0,
      options: {
        enableFindWidget: false
      },
      contentOptions: reviveWebviewContentOptions(options),
      extension: { id: extensionId, location: URI.revive(extensionLocation) }
    });
    const webviewZone = new EditorWebviewZone(editor, line, height, webview);
    const remove = /* @__PURE__ */ __name(() => {
      disposables.dispose();
      this._proxy.$onDidDispose(handle);
      this._insets.delete(handle);
    }, "remove");
    disposables.add(editor.onDidChangeModel(remove));
    disposables.add(editor.onDidDispose(remove));
    disposables.add(webviewZone);
    disposables.add(webview);
    disposables.add(webview.onMessage((msg) => this._proxy.$onDidReceiveMessage(handle, msg.message)));
    this._insets.set(handle, webviewZone);
  }
  $disposeEditorInset(handle) {
    const inset = this.getInset(handle);
    this._insets.delete(handle);
    inset.dispose();
  }
  $setHtml(handle, value) {
    const inset = this.getInset(handle);
    inset.webview.setHtml(value);
  }
  $setOptions(handle, options) {
    const inset = this.getInset(handle);
    inset.webview.contentOptions = reviveWebviewContentOptions(options);
  }
  async $postMessage(handle, value) {
    const inset = this.getInset(handle);
    inset.webview.postMessage(value);
    return true;
  }
  getInset(handle) {
    const inset = this._insets.get(handle);
    if (!inset) {
      throw new Error("Unknown inset");
    }
    return inset;
  }
};
__name(MainThreadEditorInsets, "MainThreadEditorInsets");
MainThreadEditorInsets = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadEditorInsets),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IWebviewService)
], MainThreadEditorInsets);
export {
  MainThreadEditorInsets
};
//# sourceMappingURL=mainThreadCodeInsets.js.map
