var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SingleLineEdit } from "../../../../../common/core/lineEdit.js";
import { Position } from "../../../../../common/core/position.js";
import { AbstractText, TextEdit } from "../../../../../common/core/textEdit.js";
import { Command } from "../../../../../common/languages.js";
import { InlineCompletionItem } from "../../model/provideInlineCompletions.js";
class InlineEditWithChanges {
  constructor(originalText, edit, cursorPosition, commands, inlineCompletion) {
    this.originalText = originalText;
    this.edit = edit;
    this.cursorPosition = cursorPosition;
    this.commands = commands;
    this.inlineCompletion = inlineCompletion;
  }
  static {
    __name(this, "InlineEditWithChanges");
  }
  lineEdit = SingleLineEdit.fromSingleTextEdit(this.edit.toSingle(this.originalText), this.originalText);
  originalLineRange = this.lineEdit.lineRange;
  modifiedLineRange = this.lineEdit.toLineEdit().getNewLineRanges()[0];
  equals(other) {
    return this.originalText.getValue() === other.originalText.getValue() && this.edit.equals(other.edit) && this.cursorPosition.equals(other.cursorPosition) && this.commands === other.commands && this.inlineCompletion === other.inlineCompletion;
  }
}
export {
  InlineEditWithChanges
};
//# sourceMappingURL=inlineEditWithChanges.js.map
