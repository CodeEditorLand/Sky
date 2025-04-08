var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorContributionInstantiation, registerEditorAction, registerEditorContribution, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { Selection } from "../../../common/core/selection.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import * as nls from "../../../../nls.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
class CursorState {
  static {
    __name(this, "CursorState");
  }
  selections;
  constructor(selections) {
    this.selections = selections;
  }
  equals(other) {
    const thisLen = this.selections.length;
    const otherLen = other.selections.length;
    if (thisLen !== otherLen) {
      return false;
    }
    for (let i = 0; i < thisLen; i++) {
      if (!this.selections[i].equalsSelection(other.selections[i])) {
        return false;
      }
    }
    return true;
  }
}
class StackElement {
  constructor(cursorState, scrollTop, scrollLeft) {
    this.cursorState = cursorState;
    this.scrollTop = scrollTop;
    this.scrollLeft = scrollLeft;
  }
  static {
    __name(this, "StackElement");
  }
}
class CursorUndoRedoController extends Disposable {
  static {
    __name(this, "CursorUndoRedoController");
  }
  static ID = "editor.contrib.cursorUndoRedoController";
  static get(editor) {
    return editor.getContribution(CursorUndoRedoController.ID);
  }
  _editor;
  _isCursorUndoRedo;
  _undoStack;
  _redoStack;
  constructor(editor) {
    super();
    this._editor = editor;
    this._isCursorUndoRedo = false;
    this._undoStack = [];
    this._redoStack = [];
    this._register(editor.onDidChangeModel((e) => {
      this._undoStack = [];
      this._redoStack = [];
    }));
    this._register(editor.onDidChangeModelContent((e) => {
      this._undoStack = [];
      this._redoStack = [];
    }));
    this._register(editor.onDidChangeCursorSelection((e) => {
      if (this._isCursorUndoRedo) {
        return;
      }
      if (!e.oldSelections) {
        return;
      }
      if (e.oldModelVersionId !== e.modelVersionId) {
        return;
      }
      const prevState = new CursorState(e.oldSelections);
      const isEqualToLastUndoStack = this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1].cursorState.equals(prevState);
      if (!isEqualToLastUndoStack) {
        this._undoStack.push(new StackElement(prevState, editor.getScrollTop(), editor.getScrollLeft()));
        this._redoStack = [];
        if (this._undoStack.length > 50) {
          this._undoStack.shift();
        }
      }
    }));
  }
  cursorUndo() {
    if (!this._editor.hasModel() || this._undoStack.length === 0) {
      return;
    }
    this._redoStack.push(new StackElement(new CursorState(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
    this._applyState(this._undoStack.pop());
  }
  cursorRedo() {
    if (!this._editor.hasModel() || this._redoStack.length === 0) {
      return;
    }
    this._undoStack.push(new StackElement(new CursorState(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
    this._applyState(this._redoStack.pop());
  }
  _applyState(stackElement) {
    this._isCursorUndoRedo = true;
    this._editor.setSelections(stackElement.cursorState.selections);
    this._editor.setScrollPosition({
      scrollTop: stackElement.scrollTop,
      scrollLeft: stackElement.scrollLeft
    });
    this._isCursorUndoRedo = false;
  }
}
class CursorUndo extends EditorAction {
  static {
    __name(this, "CursorUndo");
  }
  constructor() {
    super({
      id: "cursorUndo",
      label: nls.localize2("cursor.undo", "Cursor Undo"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: KeyMod.CtrlCmd | KeyCode.KeyU,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor, editor, args) {
    CursorUndoRedoController.get(editor)?.cursorUndo();
  }
}
class CursorRedo extends EditorAction {
  static {
    __name(this, "CursorRedo");
  }
  constructor() {
    super({
      id: "cursorRedo",
      label: nls.localize2("cursor.redo", "Cursor Redo"),
      precondition: void 0
    });
  }
  run(accessor, editor, args) {
    CursorUndoRedoController.get(editor)?.cursorRedo();
  }
}
registerEditorContribution(CursorUndoRedoController.ID, CursorUndoRedoController, EditorContributionInstantiation.Eager);
registerEditorAction(CursorUndo);
registerEditorAction(CursorRedo);
export {
  CursorRedo,
  CursorUndo,
  CursorUndoRedoController
};
//# sourceMappingURL=cursorUndo.js.map
