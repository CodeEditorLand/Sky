var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { Command } from "../../../../common/languages.js";
import { InlineCompletionItem } from "./provideInlineCompletions.js";
class InlineEdit {
  constructor(edit, commands, inlineCompletion) {
    this.edit = edit;
    this.commands = commands;
    this.inlineCompletion = inlineCompletion;
  }
  static {
    __name(this, "InlineEdit");
  }
  get range() {
    return this.edit.range;
  }
  get text() {
    return this.edit.text;
  }
  equals(other) {
    return this.edit.equals(other.edit) && this.inlineCompletion === other.inlineCompletion;
  }
}
export {
  InlineEdit
};
//# sourceMappingURL=inlineEdit.js.map
