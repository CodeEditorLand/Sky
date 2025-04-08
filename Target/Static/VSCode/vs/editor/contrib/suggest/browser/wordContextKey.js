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
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { localize } from "../../../../nls.js";
let WordContextKey = class {
  constructor(_editor, contextKeyService) {
    this._editor = _editor;
    this._ckAtEnd = WordContextKey.AtEnd.bindTo(contextKeyService);
    this._configListener = this._editor.onDidChangeConfiguration((e) => e.hasChanged(EditorOption.tabCompletion) && this._update());
    this._update();
  }
  static {
    __name(this, "WordContextKey");
  }
  static AtEnd = new RawContextKey("atEndOfWord", false, { type: "boolean", description: localize("desc", "A context key that is true when at the end of a word. Note that this is only defined when tab-completions are enabled") });
  _ckAtEnd;
  _configListener;
  _enabled = false;
  _selectionListener;
  dispose() {
    this._configListener.dispose();
    this._selectionListener?.dispose();
    this._ckAtEnd.reset();
  }
  _update() {
    const enabled = this._editor.getOption(EditorOption.tabCompletion) === "on";
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    if (this._enabled) {
      const checkForWordEnd = /* @__PURE__ */ __name(() => {
        if (!this._editor.hasModel()) {
          this._ckAtEnd.set(false);
          return;
        }
        const model = this._editor.getModel();
        const selection = this._editor.getSelection();
        const word = model.getWordAtPosition(selection.getStartPosition());
        if (!word) {
          this._ckAtEnd.set(false);
          return;
        }
        this._ckAtEnd.set(word.endColumn === selection.getStartPosition().column && selection.getStartPosition().lineNumber === selection.getEndPosition().lineNumber);
      }, "checkForWordEnd");
      this._selectionListener = this._editor.onDidChangeCursorSelection(checkForWordEnd);
      checkForWordEnd();
    } else if (this._selectionListener) {
      this._ckAtEnd.reset();
      this._selectionListener.dispose();
      this._selectionListener = void 0;
    }
  }
};
WordContextKey = __decorateClass([
  __decorateParam(1, IContextKeyService)
], WordContextKey);
export {
  WordContextKey
};
//# sourceMappingURL=wordContextKey.js.map
