var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ExtHostTextEditor } from "./extHostTextEditor.js";
import { ExtHostEditors } from "./extHostTextEditors.js";
import { asWebviewUri, webviewGenericCspSource, WebviewRemoteInfo } from "../../contrib/webview/common/webview.js";
import { ExtHostEditorInsetsShape, MainThreadEditorInsetsShape } from "./extHost.protocol.js";
class ExtHostEditorInsets {
  constructor(_proxy, _editors, _remoteInfo) {
    this._proxy = _proxy;
    this._editors = _editors;
    this._remoteInfo = _remoteInfo;
    this._disposables.add(_editors.onDidChangeVisibleTextEditors(() => {
      const visibleEditor = _editors.getVisibleTextEditors();
      for (const value of this._insets.values()) {
        if (visibleEditor.indexOf(value.editor) < 0) {
          value.inset.dispose();
        }
      }
    }));
  }
  static {
    __name(this, "ExtHostEditorInsets");
  }
  _handlePool = 0;
  _disposables = new DisposableStore();
  _insets = /* @__PURE__ */ new Map();
  dispose() {
    this._insets.forEach((value) => value.inset.dispose());
    this._disposables.dispose();
  }
  createWebviewEditorInset(editor, line, height, options, extension) {
    let apiEditor;
    for (const candidate of this._editors.getVisibleTextEditors(true)) {
      if (candidate.value === editor) {
        apiEditor = candidate;
        break;
      }
    }
    if (!apiEditor) {
      throw new Error("not a visible editor");
    }
    const that = this;
    const handle = this._handlePool++;
    const onDidReceiveMessage = new Emitter();
    const onDidDispose = new Emitter();
    const webview = new class {
      _html = "";
      _options = /* @__PURE__ */ Object.create(null);
      asWebviewUri(resource) {
        return asWebviewUri(resource, that._remoteInfo);
      }
      get cspSource() {
        return webviewGenericCspSource;
      }
      set options(value) {
        this._options = value;
        that._proxy.$setOptions(handle, value);
      }
      get options() {
        return this._options;
      }
      set html(value) {
        this._html = value;
        that._proxy.$setHtml(handle, value);
      }
      get html() {
        return this._html;
      }
      get onDidReceiveMessage() {
        return onDidReceiveMessage.event;
      }
      postMessage(message) {
        return that._proxy.$postMessage(handle, message);
      }
    }();
    const inset = new class {
      editor = editor;
      line = line;
      height = height;
      webview = webview;
      onDidDispose = onDidDispose.event;
      dispose() {
        if (that._insets.has(handle)) {
          that._insets.delete(handle);
          that._proxy.$disposeEditorInset(handle);
          onDidDispose.fire();
          onDidDispose.dispose();
          onDidReceiveMessage.dispose();
        }
      }
    }();
    this._proxy.$createEditorInset(handle, apiEditor.id, apiEditor.value.document.uri, line + 1, height, options || {}, extension.identifier, extension.extensionLocation);
    this._insets.set(handle, { editor, inset, onDidReceiveMessage });
    return inset;
  }
  $onDidDispose(handle) {
    const value = this._insets.get(handle);
    if (value) {
      value.inset.dispose();
    }
  }
  $onDidReceiveMessage(handle, message) {
    const value = this._insets.get(handle);
    value?.onDidReceiveMessage.fire(message);
  }
}
export {
  ExtHostEditorInsets
};
//# sourceMappingURL=extHostCodeInsets.js.map
