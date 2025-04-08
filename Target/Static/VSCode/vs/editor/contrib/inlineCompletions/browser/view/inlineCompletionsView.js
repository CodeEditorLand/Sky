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
import { createStyleSheetFromObservable } from "../../../../../base/browser/dom.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { derived, mapObservableArrayCached, derivedDisposable, constObservable, derivedObservableWithCache, IObservable, ISettableObservable } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { InlineCompletionsHintsWidget } from "../hintsWidget/inlineCompletionsHintsWidget.js";
import { InlineCompletionsModel } from "../model/inlineCompletionsModel.js";
import { convertItemsToStableObservables } from "../utils.js";
import { GhostTextView } from "./ghostText/ghostTextView.js";
import { InlineEditsViewAndDiffProducer } from "./inlineEdits/inlineEditsViewProducer.js";
let InlineCompletionsView = class extends Disposable {
  constructor(_editor, _model, _focusIsInMenu, _instantiationService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._focusIsInMenu = _focusIsInMenu;
    this._instantiationService = _instantiationService;
    this._register(createStyleSheetFromObservable(derived((reader) => {
      const fontFamily = this._fontFamily.read(reader);
      if (fontFamily === "" || fontFamily === "default") {
        return "";
      }
      return `
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${fontFamily};
}`;
    })));
    this._register(new InlineCompletionsHintsWidget(this._editor, this._model, this._instantiationService));
  }
  static {
    __name(this, "InlineCompletionsView");
  }
  _ghostTexts = derived(this, (reader) => {
    const model = this._model.read(reader);
    return model?.ghostTexts.read(reader) ?? [];
  });
  _stablizedGhostTexts = convertItemsToStableObservables(this._ghostTexts, this._store);
  _editorObs = observableCodeEditor(this._editor);
  _ghostTextWidgets = mapObservableArrayCached(
    this,
    this._stablizedGhostTexts,
    (ghostText, store) => derivedDisposable(
      (reader) => this._instantiationService.createInstance(
        GhostTextView.hot.read(reader),
        this._editor,
        {
          ghostText,
          warning: this._model.map((m, reader2) => {
            const warning = m?.warning?.read(reader2);
            return warning ? { icon: warning.icon } : void 0;
          }),
          minReservedLineCount: constObservable(0),
          targetTextModel: this._model.map((v) => v?.textModel)
        },
        this._editorObs.getOption(EditorOption.inlineSuggest).map((v) => ({ syntaxHighlightingEnabled: v.syntaxHighlightingEnabled })),
        false,
        false
      )
    ).recomputeInitiallyAndOnChange(store)
  ).recomputeInitiallyAndOnChange(this._store);
  _inlineEdit = derived(this, (reader) => this._model.read(reader)?.inlineEditState.read(reader)?.inlineEdit);
  _everHadInlineEdit = derivedObservableWithCache(this, (reader, last) => last || !!this._inlineEdit.read(reader) || !!this._model.read(reader)?.inlineCompletionState.read(reader)?.inlineCompletion?.sourceInlineCompletion.showInlineEditMenu);
  _inlineEditWidget = derivedDisposable((reader) => {
    if (!this._everHadInlineEdit.read(reader)) {
      return void 0;
    }
    return this._instantiationService.createInstance(InlineEditsViewAndDiffProducer.hot.read(reader), this._editor, this._inlineEdit, this._model, this._focusIsInMenu);
  }).recomputeInitiallyAndOnChange(this._store);
  _fontFamily = this._editorObs.getOption(EditorOption.inlineSuggest).map((val) => val.fontFamily);
  shouldShowHoverAtViewZone(viewZoneId) {
    return this._ghostTextWidgets.get()[0]?.get().ownsViewZone(viewZoneId) ?? false;
  }
};
InlineCompletionsView = __decorateClass([
  __decorateParam(3, IInstantiationService)
], InlineCompletionsView);
export {
  InlineCompletionsView
};
//# sourceMappingURL=inlineCompletionsView.js.map
