var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { derived } from "../../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../../browser/observableCodeEditor.js";
import { Range } from "../../../../../common/core/range.js";
import { TextReplacement, TextEdit } from "../../../../../common/core/edits/textEdit.js";
import { InlineEditWithChanges } from "./inlineEditWithChanges.js";
import { ModelPerInlineEdit } from "./inlineEditsModel.js";
import { InlineEditsView } from "./inlineEditsView.js";
import { InlineEditTabAction } from "./inlineEditsViewInterface.js";
import { InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "./components/gutterIndicatorView.js";
let InlineEditsViewAndDiffProducer = class InlineEditsViewAndDiffProducer2 extends Disposable {
  static {
    __name(this, "InlineEditsViewAndDiffProducer");
  }
  constructor(_editor, _model, _showCollapsed, instantiationService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._showCollapsed = _showCollapsed;
    this._inlineEdit = derived(this, (reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      const textModel = this._editor.getModel();
      if (!textModel) {
        return void 0;
      }
      const state = model.inlineEditState.read(reader);
      if (!state) {
        return void 0;
      }
      const action = state.inlineSuggestion.action;
      let diffEdits;
      if (action?.kind === "edit") {
        const editOffset = action.stringEdit;
        const t = state.inlineSuggestion.originalTextRef.getTransformer();
        const edits = editOffset.replacements.map((e) => {
          const innerEditRange = Range.fromPositions(t.getPosition(e.replaceRange.start), t.getPosition(e.replaceRange.endExclusive));
          return new TextReplacement(innerEditRange, e.newText);
        });
        diffEdits = new TextEdit(edits);
      } else {
        diffEdits = void 0;
      }
      return new InlineEditWithChanges(state.inlineSuggestion.originalTextRef, action, diffEdits, model.primaryPosition.read(void 0), model.allPositions.read(void 0), state.inlineSuggestion.source.inlineSuggestions.commands ?? [], state.inlineSuggestion);
    });
    this._inlineEditModel = derived(this, (reader) => {
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
      return new ModelPerInlineEdit(model, edit, tabAction);
    });
    this._editorObs = observableCodeEditor(this._editor);
    this.view = this._register(instantiationService.createInstance(InlineEditsView, this._editor, this._inlineEditModel, this._model.map((model) => model ? SimpleInlineSuggestModel.fromInlineCompletionModel(model) : void 0), this._inlineEdit.map((e) => e ? InlineSuggestionGutterMenuData.fromInlineSuggestion(e.inlineCompletion) : void 0), this._showCollapsed));
  }
};
InlineEditsViewAndDiffProducer = __decorate([
  __param(3, IInstantiationService)
], InlineEditsViewAndDiffProducer);
export {
  InlineEditsViewAndDiffProducer
};
//# sourceMappingURL=inlineEditsViewProducer.js.map
