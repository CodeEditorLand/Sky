var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { localize } from "../../../../nls.js";
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
var WordContextKey_1;
let WordContextKey = class WordContextKey2 {
  static {
    __name(this, "WordContextKey");
  }
  static {
    WordContextKey_1 = this;
  }
  static {
    this.AtEnd = new RawContextKey("atEndOfWord", false, { type: "boolean", description: localize("desc", "A context key that is true when at the end of a word. Note that this is only defined when tab-completions are enabled") });
  }
  constructor(_editor, contextKeyService) {
    this._editor = _editor;
    this._enabled = false;
    this._ckAtEnd = WordContextKey_1.AtEnd.bindTo(contextKeyService);
    this._configListener = this._editor.onDidChangeConfiguration((e) => e.hasChanged(
      131
      /* EditorOption.tabCompletion */
    ) && this._update());
    this._update();
  }
  dispose() {
    this._configListener.dispose();
    this._selectionListener?.dispose();
    this._ckAtEnd.reset();
  }
  _update() {
    const enabled = this._editor.getOption(
      131
      /* EditorOption.tabCompletion */
    ) === "on";
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
WordContextKey = WordContextKey_1 = __decorate([
  __param(1, IContextKeyService)
], WordContextKey);
export {
  WordContextKey
};
//# sourceMappingURL=wordContextKey.js.map
