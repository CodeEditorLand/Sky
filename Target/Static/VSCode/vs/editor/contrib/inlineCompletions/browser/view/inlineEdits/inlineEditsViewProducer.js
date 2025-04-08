var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { createHotClass } from "../../../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { derived, IObservable, ISettableObservable } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../../browser/editorBrowser.js";
import { ObservableCodeEditor, observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { LineRange } from "../../../../../common/core/lineRange.js";
import { Range } from "../../../../../common/core/range.js";
import { SingleTextEdit, TextEdit } from "../../../../../common/core/textEdit.js";
import { TextModelText } from "../../../../../common/model/textModelText.js";
import { InlineCompletionsModel } from "../../model/inlineCompletionsModel.js";
import { InlineEdit } from "../../model/inlineEdit.js";
import { InlineEditWithChanges } from "./inlineEditWithChanges.js";
import { GhostTextIndicator, InlineEditHost, InlineEditModel } from "./inlineEditsModel.js";
import { InlineEditsView } from "./inlineEditsView.js";
import { InlineEditTabAction } from "./inlineEditsViewInterface.js";
let InlineEditsViewAndDiffProducer = class extends Disposable {
  constructor(_editor, _edit, _model, _focusIsInMenu, instantiationService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._model = _model;
    this._focusIsInMenu = _focusIsInMenu;
    this._editorObs = observableCodeEditor(this._editor);
    this._register(instantiationService.createInstance(InlineEditsView, this._editor, this._inlineEditHost, this._inlineEditModel, this._ghostTextIndicator, this._focusIsInMenu));
  }
  static {
    __name(this, "InlineEditsViewAndDiffProducer");
  }
  // TODO: This class is no longer a diff producer. Rename it or get rid of it
  static hot = createHotClass(InlineEditsViewAndDiffProducer);
  _editorObs;
  _inlineEdit = derived(this, (reader) => {
    const model = this._model.read(reader);
    if (!model) {
      return void 0;
    }
    const inlineEdit = this._edit.read(reader);
    if (!inlineEdit) {
      return void 0;
    }
    const textModel = this._editor.getModel();
    if (!textModel) {
      return void 0;
    }
    const editOffset = model.inlineEditState.get()?.inlineCompletion.updatedEdit.read(reader);
    if (!editOffset) {
      return void 0;
    }
    const edits = editOffset.edits.map((e) => {
      const innerEditRange = Range.fromPositions(
        textModel.getPositionAt(e.replaceRange.start),
        textModel.getPositionAt(e.replaceRange.endExclusive)
      );
      return new SingleTextEdit(innerEditRange, e.newText);
    });
    const diffEdits = new TextEdit(edits);
    const text = new TextModelText(textModel);
    return new InlineEditWithChanges(text, diffEdits, model.primaryPosition.get(), inlineEdit.commands, inlineEdit.inlineCompletion);
  });
  _inlineEditModel = derived(this, (reader) => {
    const model = this._model.read(reader);
    if (!model) {
      return void 0;
    }
    const edit = this._inlineEdit.read(reader);
    if (!edit) {
      return void 0;
    }
    const tabAction = derived(this, (reader2) => {
      if (this._editorObs.isFocused.read(reader2)) {
        if (model.tabShouldJumpToInlineEdit.read(reader2)) {
          return InlineEditTabAction.Jump;
        }
        if (model.tabShouldAcceptInlineEdit.read(reader2)) {
          return InlineEditTabAction.Accept;
        }
      }
      return InlineEditTabAction.Inactive;
    });
    return new InlineEditModel(model, edit, tabAction);
  });
  _inlineEditHost = derived(this, (reader) => {
    const model = this._model.read(reader);
    if (!model) {
      return void 0;
    }
    return new InlineEditHost(model);
  });
  _ghostTextIndicator = derived(this, (reader) => {
    const model = this._model.read(reader);
    if (!model) {
      return void 0;
    }
    const state = model.inlineCompletionState.read(reader);
    if (!state) {
      return void 0;
    }
    const inlineCompletion = state.inlineCompletion;
    if (!inlineCompletion) {
      return void 0;
    }
    if (!inlineCompletion.sourceInlineCompletion.showInlineEditMenu) {
      return void 0;
    }
    const lineRange = LineRange.ofLength(state.primaryGhostText.lineNumber, 1);
    return new GhostTextIndicator(this._editor, model, lineRange, inlineCompletion);
  });
};
InlineEditsViewAndDiffProducer = __decorateClass([
  __decorateParam(4, IInstantiationService)
], InlineEditsViewAndDiffProducer);
export {
  InlineEditsViewAndDiffProducer
};
//# sourceMappingURL=inlineEditsViewProducer.js.map
