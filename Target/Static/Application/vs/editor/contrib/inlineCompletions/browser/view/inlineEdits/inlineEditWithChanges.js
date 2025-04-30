var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SingleLineEdit } from "../../../../../common/core/lineEdit.js";
import { LineRange } from "../../../../../common/core/lineRange.js";
class InlineEditWithChanges {
  static {
    __name(this, "InlineEditWithChanges");
  }
  get lineEdit() {
    return SingleLineEdit.fromSingleTextEdit(this.edit.toSingle(this.originalText), this.originalText);
  }
  get originalLineRange() {
    return this.lineEdit.lineRange;
  }
  get modifiedLineRange() {
    return this.lineEdit.toLineEdit().getNewLineRanges()[0];
  }
  get displayRange() {
    return this.originalText.lineRange.intersect(this.originalLineRange.join(LineRange.ofLength(this.originalLineRange.startLineNumber, this.lineEdit.newLines.length)));
  }
  constructor(originalText, edit, cursorPosition, commands, inlineCompletion) {
    this.originalText = originalText;
    this.edit = edit;
    this.cursorPosition = cursorPosition;
    this.commands = commands;
    this.inlineCompletion = inlineCompletion;
  }
  equals(other) {
    return this.originalText.getValue() === other.originalText.getValue() && this.edit.equals(other.edit) && this.cursorPosition.equals(other.cursorPosition) && this.commands === other.commands && this.inlineCompletion === other.inlineCompletion;
  }
}
export {
  InlineEditWithChanges
};
//# sourceMappingURL=inlineEditWithChanges.js.map
