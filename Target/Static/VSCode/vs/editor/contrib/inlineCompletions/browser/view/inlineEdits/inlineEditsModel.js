var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../../../base/common/event.js";
import { derived, IObservable } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { ICodeEditor } from "../../../../../browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { LineRange } from "../../../../../common/core/lineRange.js";
import { StringText, TextEdit } from "../../../../../common/core/textEdit.js";
import { Command } from "../../../../../common/languages.js";
import { InlineCompletionsModel } from "../../model/inlineCompletionsModel.js";
import { InlineCompletionWithUpdatedRange } from "../../model/inlineCompletionsSource.js";
import { IInlineEditHost, IInlineEditModel, InlineEditTabAction } from "./inlineEditsViewInterface.js";
import { InlineEditWithChanges } from "./inlineEditWithChanges.js";
class InlineEditModel {
  constructor(_model, inlineEdit, tabAction) {
    this._model = _model;
    this.inlineEdit = inlineEdit;
    this.tabAction = tabAction;
    this.action = this.inlineEdit.inlineCompletion.action;
    this.displayName = this.inlineEdit.inlineCompletion.source.provider.displayName ?? localize("inlineEdit", "Inline Edit");
    this.extensionCommands = this.inlineEdit.inlineCompletion.source.inlineCompletions.commands ?? [];
    this.showCollapsed = this._model.showCollapsed;
  }
  static {
    __name(this, "InlineEditModel");
  }
  action;
  displayName;
  extensionCommands;
  showCollapsed;
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
    this._model.handleInlineEditShown(this.inlineEdit.inlineCompletion);
  }
}
class InlineEditHost {
  constructor(_model) {
    this._model = _model;
    this.onDidAccept = this._model.onDidAccept;
    this.inAcceptFlow = this._model.inAcceptFlow;
  }
  static {
    __name(this, "InlineEditHost");
  }
  onDidAccept;
  inAcceptFlow;
}
class GhostTextIndicator {
  constructor(editor, model, lineRange, inlineCompletion) {
    this.lineRange = lineRange;
    const editorObs = observableCodeEditor(editor);
    const tabAction = derived(this, (reader) => {
      if (editorObs.isFocused.read(reader)) {
        if (model.inlineCompletionState.read(reader)?.inlineCompletion?.sourceInlineCompletion.showInlineEditMenu) {
          return InlineEditTabAction.Accept;
        }
      }
      return InlineEditTabAction.Inactive;
    });
    this.model = new InlineEditModel(
      model,
      new InlineEditWithChanges(
        new StringText(""),
        new TextEdit([]),
        model.primaryPosition.get(),
        inlineCompletion.source.inlineCompletions.commands ?? [],
        inlineCompletion.inlineCompletion
      ),
      tabAction
    );
  }
  static {
    __name(this, "GhostTextIndicator");
  }
  model;
}
export {
  GhostTextIndicator,
  InlineEditHost,
  InlineEditModel
};
//# sourceMappingURL=inlineEditsModel.js.map
