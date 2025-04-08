var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { CharacterSet } from "../../../common/core/characterClassifier.js";
import { State, SuggestModel } from "./suggestModel.js";
import { ISelectedSuggestion, SuggestWidget } from "./suggestWidget.js";
class CommitCharacterController {
  static {
    __name(this, "CommitCharacterController");
  }
  _disposables = new DisposableStore();
  _active;
  constructor(editor, widget, model, accept) {
    this._disposables.add(model.onDidSuggest((e) => {
      if (e.completionModel.items.length === 0) {
        this.reset();
      }
    }));
    this._disposables.add(model.onDidCancel((e) => {
      this.reset();
    }));
    this._disposables.add(widget.onDidShow(() => this._onItem(widget.getFocusedItem())));
    this._disposables.add(widget.onDidFocus(this._onItem, this));
    this._disposables.add(widget.onDidHide(this.reset, this));
    this._disposables.add(editor.onWillType((text) => {
      if (this._active && !widget.isFrozen() && model.state !== State.Idle) {
        const ch = text.charCodeAt(text.length - 1);
        if (this._active.acceptCharacters.has(ch) && editor.getOption(EditorOption.acceptSuggestionOnCommitCharacter)) {
          accept(this._active.item);
        }
      }
    }));
  }
  _onItem(selected) {
    if (!selected || !isNonEmptyArray(selected.item.completion.commitCharacters)) {
      this.reset();
      return;
    }
    if (this._active && this._active.item.item === selected.item) {
      return;
    }
    const acceptCharacters = new CharacterSet();
    for (const ch of selected.item.completion.commitCharacters) {
      if (ch.length > 0) {
        acceptCharacters.add(ch.charCodeAt(0));
      }
    }
    this._active = { acceptCharacters, item: selected };
  }
  reset() {
    this._active = void 0;
  }
  dispose() {
    this._disposables.dispose();
  }
}
export {
  CommitCharacterController
};
//# sourceMappingURL=suggestCommitCharacters.js.map
