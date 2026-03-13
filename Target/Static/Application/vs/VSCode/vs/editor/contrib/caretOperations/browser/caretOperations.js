var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EditorAction, registerEditorAction } from "../../../browser/editorExtensions.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { MoveCaretCommand } from "./moveCaretCommand.js";
import * as nls from "../../../../nls.js";
class MoveCaretAction extends EditorAction {
  static {
    __name(this, "MoveCaretAction");
  }
  constructor(left, opts) {
    super(opts);
    this.left = left;
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const commands = [];
    const selections = editor.getSelections();
    for (const selection of selections) {
      commands.push(new MoveCaretCommand(selection, this.left));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
}
class MoveCaretLeftAction extends MoveCaretAction {
  static {
    __name(this, "MoveCaretLeftAction");
  }
  constructor() {
    super(true, {
      id: "editor.action.moveCarretLeftAction",
      label: nls.localize2("caret.moveLeft", "Move Selected Text Left"),
      precondition: EditorContextKeys.writable
    });
  }
}
class MoveCaretRightAction extends MoveCaretAction {
  static {
    __name(this, "MoveCaretRightAction");
  }
  constructor() {
    super(false, {
      id: "editor.action.moveCarretRightAction",
      label: nls.localize2("caret.moveRight", "Move Selected Text Right"),
      precondition: EditorContextKeys.writable
    });
  }
}
registerEditorAction(MoveCaretLeftAction);
registerEditorAction(MoveCaretRightAction);
//# sourceMappingURL=caretOperations.js.map
