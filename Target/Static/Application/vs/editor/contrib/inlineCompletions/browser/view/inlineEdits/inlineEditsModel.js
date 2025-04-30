var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { derived } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { StringText, TextEdit } from "../../../../../common/core/textEdit.js";
import { InlineEditTabAction } from "./inlineEditsViewInterface.js";
import { InlineEditWithChanges } from "./inlineEditWithChanges.js";
class InlineEditModel {
  static {
    __name(this, "InlineEditModel");
  }
  constructor(_model, inlineEdit, tabAction) {
    this._model = _model;
    this.inlineEdit = inlineEdit;
    this.tabAction = tabAction;
    this.action = this.inlineEdit.inlineCompletion.action;
    this.displayName = this.inlineEdit.inlineCompletion.source.provider.displayName ?? localize("inlineEdit", "Inline Edit");
    this.extensionCommands = this.inlineEdit.inlineCompletion.source.inlineSuggestions.commands ?? [];
    this.displayLocation = this.inlineEdit.inlineCompletion.displayLocation;
    this.showCollapsed = this._model.showCollapsed;
  }
  accept() {
    this._model.accept();
  }
  jump() {
    this._model.jump();
  }
  abort(reason) {
    console.error(reason);
    this._model.stop();
  }
  handleInlineEditShown() {
    this._model.handleInlineSuggestionShown(this.inlineEdit.inlineCompletion);
  }
}
class InlineEditHost {
  static {
    __name(this, "InlineEditHost");
  }
  constructor(_model) {
    this._model = _model;
    this.onDidAccept = this._model.onDidAccept;
    this.inAcceptFlow = this._model.inAcceptFlow;
  }
}
class GhostTextIndicator {
  static {
    __name(this, "GhostTextIndicator");
  }
  constructor(editor, model, lineRange, inlineCompletion) {
    this.lineRange = lineRange;
    const editorObs = observableCodeEditor(editor);
    const tabAction = derived(this, (reader) => {
      if (editorObs.isFocused.read(reader)) {
        if (inlineCompletion.showInlineEditMenu) {
          return InlineEditTabAction.Accept;
        }
      }
      return InlineEditTabAction.Inactive;
    });
    this.model = new InlineEditModel(model, new InlineEditWithChanges(new StringText(""), new TextEdit([inlineCompletion.getSingleTextEdit()]), model.primaryPosition.get(), inlineCompletion.source.inlineSuggestions.commands ?? [], inlineCompletion), tabAction);
  }
}
export {
  GhostTextIndicator,
  InlineEditHost,
  InlineEditModel
};
//# sourceMappingURL=inlineEditsModel.js.map
