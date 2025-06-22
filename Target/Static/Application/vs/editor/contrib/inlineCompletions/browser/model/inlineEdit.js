var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class InlineEdit {
  static {
    __name(this, "InlineEdit");
  }
  constructor(edit, commands, inlineCompletion) {
    this.edit = edit;
    this.commands = commands;
    this.inlineCompletion = inlineCompletion;
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
