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
import { createStyleSheetFromObservable } from "../../../../../base/browser/domStylesheets.js";
import { createHotClass } from "../../../../../base/common/hotReloadHelpers.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { derived, mapObservableArrayCached, derivedDisposable, derivedObservableWithCache, constObservable, observableValue } from "../../../../../base/common/observable.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { LineRange } from "../../../../common/core/ranges/lineRange.js";
import { InlineCompletionsHintsWidget } from "../hintsWidget/inlineCompletionsHintsWidget.js";
import { convertItemsToStableObservables } from "../utils.js";
import { GhostTextView, GhostTextWidgetWarning } from "./ghostText/ghostTextView.js";
import { InlineEditsGutterIndicator, InlineEditsGutterIndicatorData, InlineSuggestionGutterMenuData, SimpleInlineSuggestModel } from "./inlineEdits/components/gutterIndicatorView.js";
import { InlineEditsOnboardingExperience } from "./inlineEdits/inlineEditsNewUsers.js";
import { InlineCompletionViewKind, InlineEditTabAction } from "./inlineEdits/inlineEditsViewInterface.js";
import { InlineEditsViewAndDiffProducer } from "./inlineEdits/inlineEditsViewProducer.js";
let InlineSuggestionsView = class InlineSuggestionsView2 extends Disposable {
  static {
    __name(this, "InlineSuggestionsView");
  }
  static {
    this.hot = createHotClass(this);
  }
  constructor(_editor, _model, _focusIsInMenu, _instantiationService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._focusIsInMenu = _focusIsInMenu;
    this._instantiationService = _instantiationService;
    this._ghostTexts = derived(this, (reader) => {
      const model = this._model.read(reader);
      return model?.ghostTexts.read(reader) ?? [];
    });
    this._inlineEdit = derived(this, (reader) => this._model.read(reader)?.inlineEditState.read(reader)?.inlineSuggestion);
    this._everHadInlineEdit = derivedObservableWithCache(this, (reader, last) => last || !!this._inlineEdit.read(reader) || !!this._model.read(reader)?.inlineCompletionState.read(reader)?.inlineSuggestion?.showInlineEditMenu);
    this._indicatorIsHoverVisible = observableValue(this, void 0);
    this._showInlineEditCollapsed = derived(this, (reader) => {
      const s = this._model.read(reader)?.showCollapsed.read(reader) ?? false;
      return s && !this._indicatorIsHoverVisible.read(reader)?.read(reader);
    });
    this._inlineEditWidget = derivedDisposable((reader) => {
      if (!this._everHadInlineEdit.read(reader)) {
        return void 0;
      }
      return this._instantiationService.createInstance(InlineEditsViewAndDiffProducer, this._editor, this._model, this._showInlineEditCollapsed);
    });
    this._gutterIndicatorState = derived((reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return void 0;
      }
      const state = model.state.read(reader);
      if (state?.kind === "ghostText" && state.inlineSuggestion?.showInlineEditMenu) {
        return {
          displayRange: LineRange.ofLength(state.primaryGhostText.lineNumber, 1),
          tabAction: derived(this, (reader2) => this._editorObs.isFocused.read(reader2) ? InlineEditTabAction.Accept : InlineEditTabAction.Inactive),
          gutterIndicatorOffset: constObservable(getGhostTextTopOffset(state.inlineSuggestion, this._editor)),
          inlineSuggestion: state.inlineSuggestion,
          model
        };
      } else if (state?.kind === "inlineEdit") {
        const inlineEditWidget = this._inlineEditWidget.read(reader)?.view;
        if (!inlineEditWidget) {
          return void 0;
        }
        const displayRange = inlineEditWidget.displayRange.read(reader);
        if (!displayRange) {
          return void 0;
        }
        return {
          displayRange,
          tabAction: derived((reader2) => {
            if (this._editorObs.isFocused.read(reader2)) {
              if (model.tabShouldJumpToInlineEdit.read(reader2)) {
                return InlineEditTabAction.Jump;
              }
              if (model.tabShouldAcceptInlineEdit.read(reader2)) {
                return InlineEditTabAction.Accept;
              }
            }
            return InlineEditTabAction.Inactive;
          }),
          gutterIndicatorOffset: inlineEditWidget.gutterIndicatorOffset,
          inlineSuggestion: state.inlineSuggestion,
          model
        };
      } else {
        return void 0;
      }
    });
    this._stablizedGhostTexts = convertItemsToStableObservables(this._ghostTexts, this._store);
    this._editorObs = observableCodeEditor(this._editor);
    this._ghostTextWidgets = mapObservableArrayCached(this, this._stablizedGhostTexts, (ghostText, store) => store.add(this._createGhostText(ghostText))).recomputeInitiallyAndOnChange(this._store);
    this._inlineEditWidget.recomputeInitiallyAndOnChange(this._store);
    this._fontFamily = this._editorObs.getOption(
      71
      /* EditorOption.inlineSuggest */
    ).map((val) => val.fontFamily);
    this._register(createStyleSheetFromObservable(derived((reader) => {
      const fontFamily = this._fontFamily.read(reader);
      return `
.monaco-editor .ghost-text-decoration,
.monaco-editor .ghost-text-decoration-preview,
.monaco-editor .ghost-text {
	font-family: ${fontFamily};
}`;
    })));
    this._register(new InlineCompletionsHintsWidget(this._editor, this._model, this._instantiationService));
    this._indicator = this._register(this._instantiationService.createInstance(InlineEditsGutterIndicator, this._editorObs, derived((reader) => {
      const s = this._gutterIndicatorState.read(reader);
      if (!s) {
        return void 0;
      }
      return new InlineEditsGutterIndicatorData(InlineSuggestionGutterMenuData.fromInlineSuggestion(s.inlineSuggestion), s.displayRange, SimpleInlineSuggestModel.fromInlineCompletionModel(s.model), s.inlineSuggestion.action?.kind === "edit" ? s.inlineSuggestion.action.alternativeAction : void 0);
    }), this._gutterIndicatorState.map((s, reader) => s?.tabAction.read(reader) ?? InlineEditTabAction.Inactive), this._gutterIndicatorState.map((s, reader) => s?.gutterIndicatorOffset.read(reader) ?? 0), this._inlineEditWidget.map((w, reader) => w?.view.inlineEditsIsHovered.read(reader) ?? false), this._focusIsInMenu));
    this._indicatorIsHoverVisible.set(this._indicator.isHoverVisible, void 0);
    derived((reader) => {
      const w = this._inlineEditWidget.read(reader);
      if (!w) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(InlineEditsOnboardingExperience, w._inlineEditModel, constObservable(this._indicator), w.view._inlineCollapsedView));
    }).recomputeInitiallyAndOnChange(this._store);
  }
  _createGhostText(ghostText) {
    return this._instantiationService.createInstance(GhostTextView, this._editor, derived((reader) => {
      const model = this._model.read(reader);
      const inlineCompletion = model?.inlineCompletionState.read(reader)?.inlineSuggestion;
      if (!model || !inlineCompletion) {
        return {
          ghostText: ghostText.read(reader),
          handleInlineCompletionShown: /* @__PURE__ */ __name(() => {
          }, "handleInlineCompletionShown"),
          warning: void 0
        };
      }
      return {
        ghostText: ghostText.read(reader),
        handleInlineCompletionShown: /* @__PURE__ */ __name((viewData) => model.handleInlineSuggestionShown(inlineCompletion, InlineCompletionViewKind.GhostText, viewData, Date.now()), "handleInlineCompletionShown"),
        warning: GhostTextWidgetWarning.from(model?.warning.read(reader))
      };
    }), {
      useSyntaxHighlighting: this._editorObs.getOption(
        71
        /* EditorOption.inlineSuggest */
      ).map((v) => v.syntaxHighlightingEnabled)
    });
  }
  shouldShowHoverAtViewZone(viewZoneId) {
    return this._ghostTextWidgets.get()[0]?.ownsViewZone(viewZoneId) ?? false;
  }
};
InlineSuggestionsView = __decorate([
  __param(3, IInstantiationService)
], InlineSuggestionsView);
function getGhostTextTopOffset(inlineCompletion, editor) {
  const replacement = inlineCompletion.getSingleTextEdit();
  const textModel = editor.getModel();
  if (!textModel) {
    return 0;
  }
  const EOL = textModel.getEOL();
  if (replacement.range.isEmpty() && replacement.text.startsWith(EOL)) {
    const lineHeight = editor.getLineHeightForPosition(replacement.range.getStartPosition());
    return countPrefixRepeats(replacement.text, EOL) * lineHeight;
  }
  return 0;
}
__name(getGhostTextTopOffset, "getGhostTextTopOffset");
function countPrefixRepeats(str, prefix) {
  if (!prefix.length) {
    return 0;
  }
  let count = 0;
  let i = 0;
  while (str.startsWith(prefix, i)) {
    count++;
    i += prefix.length;
  }
  return count;
}
__name(countPrefixRepeats, "countPrefixRepeats");
export {
  InlineSuggestionsView
};
//# sourceMappingURL=inlineSuggestionsView.js.map
