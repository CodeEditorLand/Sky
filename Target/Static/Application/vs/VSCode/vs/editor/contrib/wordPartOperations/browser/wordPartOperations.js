var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerEditorCommand } from "../../../browser/editorExtensions.js";
import { WordPartOperations } from "../../../common/cursor/cursorWordOperations.js";
import { Range } from "../../../common/core/range.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { DeleteWordCommand, MoveWordCommand } from "../../wordOperations/browser/wordOperations.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
class DeleteWordPartLeft extends DeleteWordCommand {
  static {
    __name(this, "DeleteWordPartLeft");
  }
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 0,
      id: "deleteWordPartLeft",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 1
          /* KeyCode.Backspace */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  _delete(ctx, wordNavigationType) {
    const r = WordPartOperations.deleteWordPartLeft(ctx);
    if (r) {
      return r;
    }
    return new Range(1, 1, 1, 1);
  }
}
class DeleteWordPartRight extends DeleteWordCommand {
  static {
    __name(this, "DeleteWordPartRight");
  }
  constructor() {
    super({
      whitespaceHeuristics: true,
      wordNavigationType: 2,
      id: "deleteWordPartRight",
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 20
          /* KeyCode.Delete */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
  _delete(ctx, wordNavigationType) {
    const r = WordPartOperations.deleteWordPartRight(ctx);
    if (r) {
      return r;
    }
    const lineCount = ctx.model.getLineCount();
    const maxColumn = ctx.model.getLineMaxColumn(lineCount);
    return new Range(lineCount, maxColumn, lineCount, maxColumn);
  }
}
class WordPartLeftCommand extends MoveWordCommand {
  static {
    __name(this, "WordPartLeftCommand");
  }
  _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
    return WordPartOperations.moveWordPartLeft(wordSeparators, model, position, hasMulticursor);
  }
}
class CursorWordPartLeft extends WordPartLeftCommand {
  static {
    __name(this, "CursorWordPartLeft");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 0,
      id: "cursorWordPartLeft",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 15
          /* KeyCode.LeftArrow */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
}
CommandsRegistry.registerCommandAlias("cursorWordPartStartLeft", "cursorWordPartLeft");
class CursorWordPartLeftSelect extends WordPartLeftCommand {
  static {
    __name(this, "CursorWordPartLeftSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 0,
      id: "cursorWordPartLeftSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 1024 | 15
          /* KeyCode.LeftArrow */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
}
CommandsRegistry.registerCommandAlias("cursorWordPartStartLeftSelect", "cursorWordPartLeftSelect");
class WordPartRightCommand extends MoveWordCommand {
  static {
    __name(this, "WordPartRightCommand");
  }
  _move(wordSeparators, model, position, wordNavigationType, hasMulticursor) {
    return WordPartOperations.moveWordPartRight(wordSeparators, model, position);
  }
}
class CursorWordPartRight extends WordPartRightCommand {
  static {
    __name(this, "CursorWordPartRight");
  }
  constructor() {
    super({
      inSelectionMode: false,
      wordNavigationType: 2,
      id: "cursorWordPartRight",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 17
          /* KeyCode.RightArrow */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
}
class CursorWordPartRightSelect extends WordPartRightCommand {
  static {
    __name(this, "CursorWordPartRightSelect");
  }
  constructor() {
    super({
      inSelectionMode: true,
      wordNavigationType: 2,
      id: "cursorWordPartRightSelect",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 | 512 | 1024 | 17
          /* KeyCode.RightArrow */
        },
        weight: 100
        /* KeybindingWeight.EditorContrib */
      }
    });
  }
}
registerEditorCommand(new DeleteWordPartLeft());
registerEditorCommand(new DeleteWordPartRight());
registerEditorCommand(new CursorWordPartLeft());
registerEditorCommand(new CursorWordPartLeftSelect());
registerEditorCommand(new CursorWordPartRight());
registerEditorCommand(new CursorWordPartRightSelect());
export {
  CursorWordPartLeft,
  CursorWordPartLeftSelect,
  CursorWordPartRight,
  CursorWordPartRightSelect,
  DeleteWordPartLeft,
  DeleteWordPartRight,
  WordPartLeftCommand,
  WordPartRightCommand
};
//# sourceMappingURL=wordPartOperations.js.map
