var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mapFindFirst } from "../../../../../base/common/arraysFind.js";
import { itemsEquals } from "../../../../../base/common/equals.js";
import { BugIndicatingError, onUnexpectedError, onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { autorun, autorunWithStore, constObservable, derived, derivedHandleChanges, derivedOpts, observableFromEvent, observableSignal, observableValue, recomputeInitiallyAndOnChange, subtransaction, transaction } from "../../../../../base/common/observable.js";
import { commonPrefixLength, firstNonWhitespaceIndex } from "../../../../../base/common/strings.js";
import { isDefined } from "../../../../../base/common/types.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { CursorColumns } from "../../../../common/core/cursorColumns.js";
import { EditOperation } from "../../../../common/core/editOperation.js";
import { LineRange } from "../../../../common/core/ranges/lineRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { TextReplacement, TextEdit } from "../../../../common/core/edits/textEdit.js";
import { TextLength } from "../../../../common/core/text/textLength.js";
import { InlineCompletionEndOfLifeReasonKind, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { TextModelText } from "../../../../common/model/textModelText.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { SnippetController2 } from "../../../snippet/browser/snippetController2.js";
import { addPositions, getEndPositionsAfterApplying, removeTextReplacementCommonSuffixPrefix, substringPos, subtractPositions } from "../utils.js";
import { AnimatedValue, easeOutCubic, ObservableAnimatedValue } from "./animation.js";
import { computeGhostText } from "./computeGhostText.js";
import { GhostText, ghostTextOrReplacementEquals, ghostTextsOrReplacementsEqual } from "./ghostText.js";
import { InlineCompletionsSource } from "./inlineCompletionsSource.js";
import { InlineEdit } from "./inlineEdit.js";
import { InlineCompletionEditorType } from "./provideInlineCompletions.js";
import { singleTextEditAugments, singleTextRemoveCommonPrefix } from "./singleTextEditHelpers.js";
import { TextModelEditReason } from "../../../../common/textModelEditReason.js";
import { ICodeEditorService } from "../../../../browser/services/codeEditorService.js";
import { InlineCompletionViewKind } from "../view/inlineEdits/inlineEditsViewInterface.js";
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
let InlineCompletionsModel = class InlineCompletionsModel2 extends Disposable {
  static {
    __name(this, "InlineCompletionsModel");
  }
  get isAcceptingPartially() {
    return this._isAcceptingPartially;
  }
  constructor(textModel, _selectedSuggestItem, _textModelVersionId, _positions, _debounceValue, _enabled, _editor, _instantiationService, _commandService, _languageConfigurationService, _accessibilityService, _languageFeaturesService, _codeEditorService) {
    super();
    this.textModel = textModel;
    this._selectedSuggestItem = _selectedSuggestItem;
    this._textModelVersionId = _textModelVersionId;
    this._positions = _positions;
    this._debounceValue = _debounceValue;
    this._enabled = _enabled;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._commandService = _commandService;
    this._languageConfigurationService = _languageConfigurationService;
    this._accessibilityService = _accessibilityService;
    this._languageFeaturesService = _languageFeaturesService;
    this._codeEditorService = _codeEditorService;
    this.primaryPosition = derived(this, (reader) => this._positions.read(reader)[0] ?? new Position(1, 1));
    this._source = this._register(this._instantiationService.createInstance(InlineCompletionsSource, this.textModel, this._textModelVersionId, this._debounceValue, this.primaryPosition));
    this._isActive = observableValue(this, false);
    this._onlyRequestInlineEditsSignal = observableSignal(this);
    this._forceUpdateExplicitlySignal = observableSignal(this);
    this._noDelaySignal = observableSignal(this);
    this._fetchSpecificProviderSignal = observableSignal(this);
    this._selectedInlineCompletionId = observableValue(this, void 0);
    this._isAcceptingPartially = false;
    this._onDidAccept = new Emitter();
    this.onDidAccept = this._onDidAccept.event;
    this._editorObs = observableCodeEditor(this._editor);
    this._suggestPreviewEnabled = this._editorObs.getOption(
      126
      /* EditorOption.suggest */
    ).map((v) => v.preview);
    this._suggestPreviewMode = this._editorObs.getOption(
      126
      /* EditorOption.suggest */
    ).map((v) => v.previewMode);
    this._inlineSuggestMode = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((v) => v.mode);
    this._suppressedInlineCompletionGroupIds = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((v) => new Set(v.experimental.suppressInlineSuggestions));
    this._inlineEditsEnabled = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((v) => !!v.edits.enabled);
    this._inlineEditsShowCollapsedEnabled = this._editorObs.getOption(
      67
      /* EditorOption.inlineSuggest */
    ).map((s) => s.edits.showCollapsed);
    this._lastShownInlineCompletionInfo = void 0;
    this._lastAcceptedInlineCompletionInfo = void 0;
    this._didUndoInlineEdits = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: /* @__PURE__ */ __name(() => ({ didUndo: false }), "createChangeSummary"),
        handleChange: /* @__PURE__ */ __name((ctx, changeSummary) => {
          changeSummary.didUndo = ctx.didChange(this._textModelVersionId) && !!ctx.change?.isUndoing;
          return true;
        }, "handleChange")
      }
    }, (reader, changeSummary) => {
      const versionId = this._textModelVersionId.read(reader);
      if (versionId !== null && this._lastAcceptedInlineCompletionInfo && this._lastAcceptedInlineCompletionInfo.textModelVersionIdAfter === versionId - 1 && this._lastAcceptedInlineCompletionInfo.inlineCompletion.isInlineEdit && changeSummary.didUndo) {
        this._lastAcceptedInlineCompletionInfo = void 0;
        return true;
      }
      return false;
    });
    this._preserveCurrentCompletionReasons = /* @__PURE__ */ new Set([
      VersionIdChangeReason.Redo,
      VersionIdChangeReason.Undo,
      VersionIdChangeReason.AcceptWord
    ]);
    this.dontRefetchSignal = observableSignal(this);
    this._fetchInlineCompletionsPromise = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: /* @__PURE__ */ __name(() => ({
          dontRefetch: false,
          preserveCurrentCompletion: false,
          inlineCompletionTriggerKind: InlineCompletionTriggerKind.Automatic,
          onlyRequestInlineEdits: false,
          shouldDebounce: true,
          provider: void 0
        }), "createChangeSummary"),
        handleChange: /* @__PURE__ */ __name((ctx, changeSummary) => {
          if (ctx.didChange(this._textModelVersionId) && this._preserveCurrentCompletionReasons.has(this._getReason(ctx.change))) {
            changeSummary.preserveCurrentCompletion = true;
          } else if (ctx.didChange(this._forceUpdateExplicitlySignal)) {
            changeSummary.inlineCompletionTriggerKind = InlineCompletionTriggerKind.Explicit;
          } else if (ctx.didChange(this.dontRefetchSignal)) {
            changeSummary.dontRefetch = true;
          } else if (ctx.didChange(this._onlyRequestInlineEditsSignal)) {
            changeSummary.onlyRequestInlineEdits = true;
          } else if (ctx.didChange(this._fetchSpecificProviderSignal)) {
            changeSummary.provider = ctx.change;
          }
          return true;
        }, "handleChange")
      }
    }, (reader, changeSummary) => {
      this._source.clearOperationOnTextModelChange.read(reader);
      this._noDelaySignal.read(reader);
      this.dontRefetchSignal.read(reader);
      this._onlyRequestInlineEditsSignal.read(reader);
      this._forceUpdateExplicitlySignal.read(reader);
      this._fetchSpecificProviderSignal.read(reader);
      const shouldUpdate = this._enabled.read(reader) && this._selectedSuggestItem.read(reader) || this._isActive.read(reader);
      if (!shouldUpdate) {
        this._source.cancelUpdate();
        return void 0;
      }
      this._textModelVersionId.read(reader);
      const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.get();
      const suggestItem = this._selectedSuggestItem.read(reader);
      if (suggestWidgetInlineCompletions && !suggestItem) {
        this._source.seedInlineCompletionsWithSuggestWidget();
      }
      if (changeSummary.dontRefetch) {
        return Promise.resolve(true);
      }
      if (this._didUndoInlineEdits.read(reader) && changeSummary.inlineCompletionTriggerKind !== InlineCompletionTriggerKind.Explicit) {
        transaction((tx) => {
          this._source.clear(tx);
        });
        return void 0;
      }
      let context = {
        triggerKind: changeSummary.inlineCompletionTriggerKind,
        selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo(),
        includeInlineCompletions: !changeSummary.onlyRequestInlineEdits,
        includeInlineEdits: this._inlineEditsEnabled.read(reader)
      };
      if (context.triggerKind === InlineCompletionTriggerKind.Automatic) {
        if (this.textModel.getAlternativeVersionId() === this._lastShownInlineCompletionInfo?.alternateTextModelVersionId) {
          context = {
            ...context,
            includeInlineCompletions: !this._lastShownInlineCompletionInfo.inlineCompletion.isInlineEdit,
            includeInlineEdits: this._lastShownInlineCompletionInfo.inlineCompletion.isInlineEdit
          };
        }
      }
      const itemToPreserveCandidate = this.selectedInlineCompletion.get() ?? this._inlineCompletionItems.get()?.inlineEdit;
      const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable ? itemToPreserveCandidate : void 0;
      const userJumpedToActiveCompletion = this._jumpedToId.map((jumpedTo) => !!jumpedTo && jumpedTo === this._inlineCompletionItems.get()?.inlineEdit?.semanticId);
      const providers = changeSummary.provider ? [changeSummary.provider] : this._languageFeaturesService.inlineCompletionsProvider.all(this.textModel);
      const suppressedProviderGroupIds = this._suppressedInlineCompletionGroupIds.get();
      const availableProviders = providers.filter((provider) => !(provider.groupId && suppressedProviderGroupIds.has(provider.groupId)));
      return this._source.fetch(availableProviders, context, itemToPreserve?.identity, changeSummary.shouldDebounce, userJumpedToActiveCompletion, !!changeSummary.provider, this.editorType);
    });
    this._inlineCompletionItems = derivedOpts({ owner: this }, (reader) => {
      const c = this._source.inlineCompletions.read(reader);
      if (!c) {
        return void 0;
      }
      const cursorPosition = this.primaryPosition.read(reader);
      let inlineEdit = void 0;
      const visibleCompletions = [];
      for (const completion of c.inlineCompletions) {
        if (!completion.isInlineEdit) {
          if (completion.isVisible(this.textModel, cursorPosition)) {
            visibleCompletions.push(completion);
          }
        } else {
          inlineEdit = completion;
        }
      }
      if (visibleCompletions.length !== 0) {
        inlineEdit = void 0;
      }
      return {
        inlineCompletions: visibleCompletions,
        inlineEdit
      };
    });
    this._filteredInlineCompletionItems = derivedOpts({ owner: this, equalsFn: itemsEquals() }, (reader) => {
      const c = this._inlineCompletionItems.read(reader);
      return c?.inlineCompletions ?? [];
    });
    this.selectedInlineCompletionIndex = derived(this, (reader) => {
      const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
      const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
      const idx = this._selectedInlineCompletionId === void 0 ? -1 : filteredCompletions.findIndex((v) => v.semanticId === selectedInlineCompletionId);
      if (idx === -1) {
        this._selectedInlineCompletionId.set(void 0, void 0);
        return 0;
      }
      return idx;
    });
    this.selectedInlineCompletion = derived(this, (reader) => {
      const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
      const idx = this.selectedInlineCompletionIndex.read(reader);
      return filteredCompletions[idx];
    });
    this.activeCommands = derivedOpts({ owner: this, equalsFn: itemsEquals() }, (r) => this.selectedInlineCompletion.read(r)?.source.inlineSuggestions.commands ?? []);
    this.lastTriggerKind = this._source.inlineCompletions.map(this, (v) => v?.request?.context.triggerKind);
    this.inlineCompletionsCount = derived(this, (reader) => {
      if (this.lastTriggerKind.read(reader) === InlineCompletionTriggerKind.Explicit) {
        return this._filteredInlineCompletionItems.read(reader).length;
      } else {
        return void 0;
      }
    });
    this._hasVisiblePeekWidgets = derived(this, (reader) => this._editorObs.openedPeekWidgets.read(reader) > 0);
    this.state = derivedOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name((a, b) => {
        if (!a || !b) {
          return a === b;
        }
        if (a.kind === "ghostText" && b.kind === "ghostText") {
          return ghostTextsOrReplacementsEqual(a.ghostTexts, b.ghostTexts) && a.inlineCompletion === b.inlineCompletion && a.suggestItem === b.suggestItem;
        } else if (a.kind === "inlineEdit" && b.kind === "inlineEdit") {
          return a.inlineEdit.equals(b.inlineEdit);
        }
        return false;
      }, "equalsFn")
    }, (reader) => {
      const model = this.textModel;
      const item = this._inlineCompletionItems.read(reader);
      const inlineEditResult = item?.inlineEdit;
      if (inlineEditResult) {
        if (this._hasVisiblePeekWidgets.read(reader)) {
          return void 0;
        }
        let edit = inlineEditResult.getSingleTextEdit();
        edit = singleTextRemoveCommonPrefix(edit, model);
        const cursorAtInlineEdit = this.primaryPosition.map((cursorPos) => LineRange.fromRangeInclusive(inlineEditResult.targetRange).addMargin(1, 1).contains(cursorPos.lineNumber));
        const commands = inlineEditResult.source.inlineSuggestions.commands;
        const inlineEdit = new InlineEdit(edit, commands ?? [], inlineEditResult);
        const edits = inlineEditResult.updatedEdit;
        const e = edits ? TextEdit.fromStringEdit(edits, new TextModelText(this.textModel)).replacements : [edit];
        return { kind: "inlineEdit", inlineEdit, inlineCompletion: inlineEditResult, edits: e, cursorAtInlineEdit };
      }
      const suggestItem = this._selectedSuggestItem.read(reader);
      if (suggestItem) {
        const suggestCompletionEdit = singleTextRemoveCommonPrefix(suggestItem.getSingleTextEdit(), model);
        const augmentation = this._computeAugmentation(suggestCompletionEdit, reader);
        const isSuggestionPreviewEnabled = this._suggestPreviewEnabled.read(reader);
        if (!isSuggestionPreviewEnabled && !augmentation) {
          return void 0;
        }
        const fullEdit = augmentation?.edit ?? suggestCompletionEdit;
        const fullEditPreviewLength = augmentation ? augmentation.edit.text.length - suggestCompletionEdit.text.length : 0;
        const mode = this._suggestPreviewMode.read(reader);
        const positions = this._positions.read(reader);
        const edits = [fullEdit, ...getSecondaryEdits(this.textModel, positions, fullEdit)];
        const ghostTexts = edits.map((edit, idx) => computeGhostText(edit, model, mode, positions[idx], fullEditPreviewLength)).filter(isDefined);
        const primaryGhostText = ghostTexts[0] ?? new GhostText(fullEdit.range.endLineNumber, []);
        return { kind: "ghostText", edits, primaryGhostText, ghostTexts, inlineCompletion: augmentation?.completion, suggestItem };
      } else {
        if (!this._isActive.read(reader)) {
          return void 0;
        }
        const inlineCompletion = this.selectedInlineCompletion.read(reader);
        if (!inlineCompletion) {
          return void 0;
        }
        const replacement = inlineCompletion.getSingleTextEdit();
        const mode = this._inlineSuggestMode.read(reader);
        const positions = this._positions.read(reader);
        const edits = [replacement, ...getSecondaryEdits(this.textModel, positions, replacement)];
        const ghostTexts = edits.map((edit, idx) => computeGhostText(edit, model, mode, positions[idx], 0)).filter(isDefined);
        if (!ghostTexts[0]) {
          return void 0;
        }
        return { kind: "ghostText", edits, primaryGhostText: ghostTexts[0], ghostTexts, inlineCompletion, suggestItem: void 0 };
      }
    });
    this.status = derived(this, (reader) => {
      if (this._source.loading.read(reader)) {
        return "loading";
      }
      const s = this.state.read(reader);
      if (s?.kind === "ghostText") {
        return "ghostText";
      }
      if (s?.kind === "inlineEdit") {
        return "inlineEdit";
      }
      return "noSuggestion";
    });
    this.inlineCompletionState = derived(this, (reader) => {
      const s = this.state.read(reader);
      if (!s || s.kind !== "ghostText") {
        return void 0;
      }
      if (this._editorObs.inComposition.read(reader)) {
        return void 0;
      }
      return s;
    });
    this.inlineEditState = derived(this, (reader) => {
      const s = this.state.read(reader);
      if (!s || s.kind !== "inlineEdit") {
        return void 0;
      }
      return s;
    });
    this.inlineEditAvailable = derived(this, (reader) => {
      const s = this.inlineEditState.read(reader);
      return !!s;
    });
    this.warning = derived(this, (reader) => {
      return this.inlineCompletionState.read(reader)?.inlineCompletion?.warning;
    });
    this.ghostTexts = derivedOpts({ owner: this, equalsFn: ghostTextsOrReplacementsEqual }, (reader) => {
      const v = this.inlineCompletionState.read(reader);
      if (!v) {
        return void 0;
      }
      return v.ghostTexts;
    });
    this.primaryGhostText = derivedOpts({ owner: this, equalsFn: ghostTextOrReplacementEquals }, (reader) => {
      const v = this.inlineCompletionState.read(reader);
      if (!v) {
        return void 0;
      }
      return v?.primaryGhostText;
    });
    this._jumpedToId = observableValue(this, void 0);
    this._inAcceptFlow = observableValue(this, false);
    this.inAcceptFlow = this._inAcceptFlow;
    const appearedInsideViewport = derived(this, (reader) => {
      const state = this.state.read(reader);
      if (!state || !state.inlineCompletion) {
        return false;
      }
      const targetRange = state.inlineCompletion.targetRange;
      const visibleRanges = this._editorObs.editor.getVisibleRanges();
      if (visibleRanges.length < 1) {
        return false;
      }
      const viewportRange = new Range(visibleRanges[0].startLineNumber, visibleRanges[0].startColumn, visibleRanges[visibleRanges.length - 1].endLineNumber, visibleRanges[visibleRanges.length - 1].endColumn);
      return viewportRange.containsRange(targetRange);
    });
    this.showCollapsed = derived(this, (reader) => {
      const state = this.state.read(reader);
      if (!state || state.kind !== "inlineEdit") {
        return false;
      }
      if (state.inlineCompletion.displayLocation) {
        return false;
      }
      const isCurrentModelVersion = state.inlineCompletion.updatedEditModelVersion === this._textModelVersionId.read(reader);
      return (this._inlineEditsShowCollapsedEnabled.read(reader) || !isCurrentModelVersion) && this._jumpedToId.read(reader) !== state.inlineCompletion.semanticId && !this._inAcceptFlow.read(reader);
    });
    this._tabShouldIndent = derived(this, (reader) => {
      if (this._inAcceptFlow.read(reader)) {
        return false;
      }
      function isMultiLine(range) {
        return range.startLineNumber !== range.endLineNumber;
      }
      __name(isMultiLine, "isMultiLine");
      function getNonIndentationRange(model, lineNumber) {
        const columnStart = model.getLineIndentColumn(lineNumber);
        const lastNonWsColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
        const columnEnd = Math.max(lastNonWsColumn, columnStart);
        return new Range(lineNumber, columnStart, lineNumber, columnEnd);
      }
      __name(getNonIndentationRange, "getNonIndentationRange");
      const selections = this._editorObs.selections.read(reader);
      return selections?.some((s) => {
        if (s.isEmpty()) {
          return this.textModel.getLineLength(s.startLineNumber) === 0;
        } else {
          return isMultiLine(s) || s.containsRange(getNonIndentationRange(this.textModel, s.startLineNumber));
        }
      });
    });
    this.tabShouldJumpToInlineEdit = derived(this, (reader) => {
      if (this._tabShouldIndent.read(reader)) {
        return false;
      }
      const s = this.inlineEditState.read(reader);
      if (!s) {
        return false;
      }
      if (this.showCollapsed.read(reader)) {
        return true;
      }
      if (this._inAcceptFlow.read(reader) && appearedInsideViewport.read(reader)) {
        return false;
      }
      return !s.cursorAtInlineEdit.read(reader);
    });
    this.tabShouldAcceptInlineEdit = derived(this, (reader) => {
      const s = this.inlineEditState.read(reader);
      if (!s) {
        return false;
      }
      if (this.showCollapsed.read(reader)) {
        return false;
      }
      if (this._inAcceptFlow.read(reader) && appearedInsideViewport.read(reader)) {
        return true;
      }
      if (s.inlineCompletion.targetRange.startLineNumber === this._editorObs.cursorLineNumber.read(reader)) {
        return true;
      }
      if (this._jumpedToId.read(reader) === s.inlineCompletion.semanticId) {
        return true;
      }
      if (this._tabShouldIndent.read(reader)) {
        return false;
      }
      return s.cursorAtInlineEdit.read(reader);
    });
    {
      const [diffEditor] = this._codeEditorService.listDiffEditors().filter((d) => d.getOriginalEditor().getId() === this._editor.getId() || d.getModifiedEditor().getId() === this._editor.getId());
      this.editorType = !!diffEditor ? InlineCompletionEditorType.DiffEditor : InlineCompletionEditorType.TextEditor;
      this.isInDiffEditor = this.editorType === InlineCompletionEditorType.DiffEditor;
    }
    this._register(recomputeInitiallyAndOnChange(this._fetchInlineCompletionsPromise));
    this._register(autorun((reader) => {
      const item = this.inlineCompletionState.read(reader);
      const completion = item?.inlineCompletion;
      if (completion) {
        this.handleInlineSuggestionShown(completion, InlineCompletionViewKind.GhostText);
      }
    }));
    this._register(autorun((reader) => {
      this._editorObs.versionId.read(reader);
      this._inAcceptFlow.set(false, void 0);
    }));
    this._register(autorun((reader) => {
      const jumpToReset = this.state.map((s, reader2) => !s || s.kind === "inlineEdit" && !s.cursorAtInlineEdit.read(reader2)).read(reader);
      if (jumpToReset) {
        this._jumpedToId.set(void 0, void 0);
      }
    }));
    const inlineEditSemanticId = this.inlineEditState.map((s) => s?.inlineCompletion.semanticId);
    this._register(autorun((reader) => {
      const id = inlineEditSemanticId.read(reader);
      if (id) {
        this._editor.pushUndoStop();
        this._lastShownInlineCompletionInfo = {
          alternateTextModelVersionId: this.textModel.getAlternativeVersionId(),
          inlineCompletion: this.state.get().inlineCompletion
        };
      }
    }));
    const inlineCompletionProviders = observableFromEvent(this._languageFeaturesService.inlineCompletionsProvider.onDidChange, () => this._languageFeaturesService.inlineCompletionsProvider.all(textModel));
    this._register(autorunWithStore((reader, store) => {
      const providers = inlineCompletionProviders.read(reader);
      for (const provider of providers) {
        if (!provider.onDidChangeInlineCompletions) {
          continue;
        }
        store.add(provider.onDidChangeInlineCompletions(() => {
          if (!this._enabled.get()) {
            return;
          }
          const activeState = this.state.get();
          if (activeState && (activeState.inlineCompletion || activeState.edits) && activeState.inlineCompletion?.source.provider !== provider) {
            return;
          }
          transaction((tx) => {
            this._fetchSpecificProviderSignal.trigger(tx, provider);
            this.trigger(tx);
          });
        }));
      }
    }));
    this._didUndoInlineEdits.recomputeInitiallyAndOnChange(this._store);
  }
  debugGetSelectedSuggestItem() {
    return this._selectedSuggestItem;
  }
  getIndentationInfo(reader) {
    let startsWithIndentation = false;
    let startsWithIndentationLessThanTabSize = true;
    const ghostText = this?.primaryGhostText.read(reader);
    if (!!this?._selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
      const { column, lines } = ghostText.parts[0];
      const firstLine = lines[0].line;
      const indentationEndColumn = this.textModel.getLineIndentColumn(ghostText.lineNumber);
      const inIndentation = column <= indentationEndColumn;
      if (inIndentation) {
        let firstNonWsIdx = firstNonWhitespaceIndex(firstLine);
        if (firstNonWsIdx === -1) {
          firstNonWsIdx = firstLine.length - 1;
        }
        startsWithIndentation = firstNonWsIdx > 0;
        const tabSize = this.textModel.getOptions().tabSize;
        const visibleColumnIndentation = CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
        startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
      }
    }
    return {
      startsWithIndentation,
      startsWithIndentationLessThanTabSize
    };
  }
  _getReason(e) {
    if (e?.isUndoing) {
      return VersionIdChangeReason.Undo;
    }
    if (e?.isRedoing) {
      return VersionIdChangeReason.Redo;
    }
    if (this.isAcceptingPartially) {
      return VersionIdChangeReason.AcceptWord;
    }
    return VersionIdChangeReason.Other;
  }
  async trigger(tx, options) {
    subtransaction(tx, (tx2) => {
      if (options?.onlyFetchInlineEdits) {
        this._onlyRequestInlineEditsSignal.trigger(tx2);
      }
      if (options?.noDelay) {
        this._noDelaySignal.trigger(tx2);
      }
      this._isActive.set(true, tx2);
    });
    await this._fetchInlineCompletionsPromise.get();
  }
  async triggerExplicitly(tx, onlyFetchInlineEdits = false) {
    subtransaction(tx, (tx2) => {
      if (onlyFetchInlineEdits) {
        this._onlyRequestInlineEditsSignal.trigger(tx2);
      }
      this._isActive.set(true, tx2);
      this._inAcceptFlow.set(true, tx2);
      this._forceUpdateExplicitlySignal.trigger(tx2);
    });
    await this._fetchInlineCompletionsPromise.get();
  }
  stop(stopReason = "automatic", tx) {
    subtransaction(tx, (tx2) => {
      if (stopReason === "explicitCancel") {
        const inlineCompletion = this.state.get()?.inlineCompletion;
        if (inlineCompletion) {
          inlineCompletion.reportEndOfLife({ kind: InlineCompletionEndOfLifeReasonKind.Rejected });
        }
      }
      this._isActive.set(false, tx2);
      this._source.clear(tx2);
    });
  }
  _computeAugmentation(suggestCompletion, reader) {
    const model = this.textModel;
    const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
    const candidateInlineCompletions = suggestWidgetInlineCompletions ? suggestWidgetInlineCompletions.inlineCompletions.filter((c) => !c.isInlineEdit) : [this.selectedInlineCompletion.read(reader)].filter(isDefined);
    const augmentedCompletion = mapFindFirst(candidateInlineCompletions, (completion) => {
      let r = completion.getSingleTextEdit();
      r = singleTextRemoveCommonPrefix(r, model, Range.fromPositions(r.range.getStartPosition(), suggestCompletion.range.getEndPosition()));
      return singleTextEditAugments(r, suggestCompletion) ? { completion, edit: r } : void 0;
    });
    return augmentedCompletion;
  }
  async _deltaSelectedInlineCompletionIndex(delta) {
    await this.triggerExplicitly();
    const completions = this._filteredInlineCompletionItems.get() || [];
    if (completions.length > 0) {
      const newIdx = (this.selectedInlineCompletionIndex.get() + delta + completions.length) % completions.length;
      this._selectedInlineCompletionId.set(completions[newIdx].semanticId, void 0);
    } else {
      this._selectedInlineCompletionId.set(void 0, void 0);
    }
  }
  async next() {
    await this._deltaSelectedInlineCompletionIndex(1);
  }
  async previous() {
    await this._deltaSelectedInlineCompletionIndex(-1);
  }
  _getMetadata(completion, type = void 0) {
    return new TextModelEditReason({
      extensionId: completion.source.provider.groupId,
      nes: completion.isInlineEdit,
      type,
      requestUuid: completion.requestUuid
    });
  }
  async accept(editor = this._editor) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    let completion;
    const state = this.state.get();
    if (state?.kind === "ghostText") {
      if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
        return;
      }
      completion = state.inlineCompletion;
    } else if (state?.kind === "inlineEdit") {
      completion = state.inlineCompletion;
    } else {
      return;
    }
    completion.addRef();
    try {
      editor.pushUndoStop();
      if (completion.snippetInfo) {
        TextModelEditReason.editWithReason(this._getMetadata(completion), () => {
          editor.executeEdits("inlineSuggestion.accept", [
            EditOperation.replace(completion.editRange, ""),
            ...completion.additionalTextEdits
          ]);
        });
        editor.setPosition(completion.snippetInfo.range.getStartPosition(), "inlineCompletionAccept");
        SnippetController2.get(editor)?.insert(completion.snippetInfo.snippet, { undoStopBefore: false });
      } else {
        const edits = state.edits;
        let minimalEdits = edits;
        if (state.kind === "ghostText") {
          minimalEdits = removeTextReplacementCommonSuffixPrefix(edits, this.textModel);
        }
        const selections = getEndPositionsAfterApplying(minimalEdits).map((p) => Selection.fromPositions(p));
        TextModelEditReason.editWithReason(this._getMetadata(completion), () => {
          editor.executeEdits("inlineSuggestion.accept", [
            ...edits.map((edit) => EditOperation.replace(edit.range, edit.text)),
            ...completion.additionalTextEdits
          ]);
        });
        if (completion.displayLocation === void 0) {
          editor.setSelections(state.kind === "inlineEdit" ? selections.slice(-1) : selections, "inlineCompletionAccept");
        }
        if (state.kind === "inlineEdit" && !this._accessibilityService.isMotionReduced()) {
          const editRanges = new TextEdit(edits).getNewRanges();
          const dec = this._store.add(new FadeoutDecoration(editor, editRanges, () => {
            this._store.delete(dec);
          }));
        }
      }
      this._onDidAccept.fire();
      this.stop();
      if (completion.command) {
        await this._commandService.executeCommand(completion.command.id, ...completion.command.arguments || []).then(void 0, onUnexpectedExternalError);
      }
      completion.reportEndOfLife({ kind: InlineCompletionEndOfLifeReasonKind.Accepted });
    } finally {
      completion.removeRef();
      this._inAcceptFlow.set(true, void 0);
      this._lastAcceptedInlineCompletionInfo = { textModelVersionIdAfter: this.textModel.getVersionId(), inlineCompletion: completion };
    }
  }
  async acceptNextWord() {
    await this._acceptNext(
      this._editor,
      "word",
      (pos, text) => {
        const langId = this.textModel.getLanguageIdAtPosition(pos.lineNumber, pos.column);
        const config = this._languageConfigurationService.getLanguageConfiguration(langId);
        const wordRegExp = new RegExp(config.wordDefinition.source, config.wordDefinition.flags.replace("g", ""));
        const m1 = text.match(wordRegExp);
        let acceptUntilIndexExclusive = 0;
        if (m1 && m1.index !== void 0) {
          if (m1.index === 0) {
            acceptUntilIndexExclusive = m1[0].length;
          } else {
            acceptUntilIndexExclusive = m1.index;
          }
        } else {
          acceptUntilIndexExclusive = text.length;
        }
        const wsRegExp = /\s+/g;
        const m2 = wsRegExp.exec(text);
        if (m2 && m2.index !== void 0) {
          if (m2.index + m2[0].length < acceptUntilIndexExclusive) {
            acceptUntilIndexExclusive = m2.index + m2[0].length;
          }
        }
        return acceptUntilIndexExclusive;
      },
      0
      /* PartialAcceptTriggerKind.Word */
    );
  }
  async acceptNextLine() {
    await this._acceptNext(
      this._editor,
      "line",
      (pos, text) => {
        const m = text.match(/\n/);
        if (m && m.index !== void 0) {
          return m.index + 1;
        }
        return text.length;
      },
      1
      /* PartialAcceptTriggerKind.Line */
    );
  }
  async _acceptNext(editor, type, getAcceptUntilIndex, kind) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const state = this.inlineCompletionState.get();
    if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
      return;
    }
    const ghostText = state.primaryGhostText;
    const completion = state.inlineCompletion;
    if (completion.snippetInfo) {
      await this.accept(editor);
      return;
    }
    const firstPart = ghostText.parts[0];
    const ghostTextPos = new Position(ghostText.lineNumber, firstPart.column);
    const ghostTextVal = firstPart.text;
    const acceptUntilIndexExclusive = getAcceptUntilIndex(ghostTextPos, ghostTextVal);
    if (acceptUntilIndexExclusive === ghostTextVal.length && ghostText.parts.length === 1) {
      this.accept(editor);
      return;
    }
    const partialGhostTextVal = ghostTextVal.substring(0, acceptUntilIndexExclusive);
    const positions = this._positions.get();
    const cursorPosition = positions[0];
    completion.addRef();
    try {
      this._isAcceptingPartially = true;
      try {
        editor.pushUndoStop();
        const replaceRange = Range.fromPositions(cursorPosition, ghostTextPos);
        const newText = editor.getModel().getValueInRange(replaceRange) + partialGhostTextVal;
        const primaryEdit = new TextReplacement(replaceRange, newText);
        const edits = [primaryEdit, ...getSecondaryEdits(this.textModel, positions, primaryEdit)];
        const selections = getEndPositionsAfterApplying(edits).map((p) => Selection.fromPositions(p));
        TextModelEditReason.editWithReason(this._getMetadata(completion, type), () => {
          editor.executeEdits("inlineSuggestion.accept", edits.map((edit) => EditOperation.replace(edit.range, edit.text)));
        });
        editor.setSelections(selections, "inlineCompletionPartialAccept");
        editor.revealPositionInCenterIfOutsideViewport(
          editor.getPosition(),
          1
          /* ScrollType.Immediate */
        );
      } finally {
        this._isAcceptingPartially = false;
      }
      const acceptedRange = Range.fromPositions(completion.editRange.getStartPosition(), TextLength.ofText(partialGhostTextVal).addToPosition(ghostTextPos));
      const text = editor.getModel().getValueInRange(
        acceptedRange,
        1
        /* EndOfLinePreference.LF */
      );
      const acceptedLength = text.length;
      completion.reportPartialAccept(acceptedLength, { kind, acceptedLength });
    } finally {
      completion.removeRef();
    }
  }
  handleSuggestAccepted(item) {
    const itemEdit = singleTextRemoveCommonPrefix(item.getSingleTextEdit(), this.textModel);
    const augmentedCompletion = this._computeAugmentation(itemEdit, void 0);
    if (!augmentedCompletion) {
      return;
    }
    const alreadyAcceptedLength = this.textModel.getValueInRange(
      augmentedCompletion.completion.editRange,
      1
      /* EndOfLinePreference.LF */
    ).length;
    const acceptedLength = alreadyAcceptedLength + itemEdit.text.length;
    augmentedCompletion.completion.reportPartialAccept(itemEdit.text.length, {
      kind: 2,
      acceptedLength
    });
  }
  extractReproSample() {
    const value = this.textModel.getValue();
    const item = this.state.get()?.inlineCompletion;
    return {
      documentValue: value,
      inlineCompletion: item?.getSourceCompletion()
    };
  }
  jump() {
    const s = this.inlineEditState.get();
    if (!s) {
      return;
    }
    transaction((tx) => {
      this._jumpedToId.set(s.inlineCompletion.semanticId, tx);
      this.dontRefetchSignal.trigger(tx);
      const targetRange = s.inlineCompletion.targetRange;
      const targetPosition = targetRange.getStartPosition();
      this._editor.setPosition(targetPosition, "inlineCompletions.jump");
      const isSingleLineChange = targetRange.isSingleLine() && (s.inlineCompletion.displayLocation || !s.inlineCompletion.insertText.includes("\n"));
      if (isSingleLineChange) {
        this._editor.revealPosition(targetPosition);
      } else {
        const revealRange = new Range(targetRange.startLineNumber - 1, 1, targetRange.endLineNumber + 1, 1);
        this._editor.revealRange(
          revealRange,
          1
          /* ScrollType.Immediate */
        );
      }
      this._editor.focus();
    });
  }
  async handleInlineSuggestionShown(inlineCompletion, viewKind) {
    await inlineCompletion.reportInlineEditShown(this._commandService, viewKind);
  }
};
InlineCompletionsModel = __decorate([
  __param(7, IInstantiationService),
  __param(8, ICommandService),
  __param(9, ILanguageConfigurationService),
  __param(10, IAccessibilityService),
  __param(11, ILanguageFeaturesService),
  __param(12, ICodeEditorService)
], InlineCompletionsModel);
var VersionIdChangeReason;
(function(VersionIdChangeReason2) {
  VersionIdChangeReason2[VersionIdChangeReason2["Undo"] = 0] = "Undo";
  VersionIdChangeReason2[VersionIdChangeReason2["Redo"] = 1] = "Redo";
  VersionIdChangeReason2[VersionIdChangeReason2["AcceptWord"] = 2] = "AcceptWord";
  VersionIdChangeReason2[VersionIdChangeReason2["Other"] = 3] = "Other";
})(VersionIdChangeReason || (VersionIdChangeReason = {}));
function getSecondaryEdits(textModel, positions, primaryEdit) {
  if (positions.length === 1) {
    return [];
  }
  const primaryPosition = positions[0];
  const secondaryPositions = positions.slice(1);
  const primaryEditStartPosition = primaryEdit.range.getStartPosition();
  const primaryEditEndPosition = primaryEdit.range.getEndPosition();
  const replacedTextAfterPrimaryCursor = textModel.getValueInRange(Range.fromPositions(primaryPosition, primaryEditEndPosition));
  const positionWithinTextEdit = subtractPositions(primaryPosition, primaryEditStartPosition);
  if (positionWithinTextEdit.lineNumber < 1) {
    onUnexpectedError(new BugIndicatingError(`positionWithinTextEdit line number should be bigger than 0.
			Invalid subtraction between ${primaryPosition.toString()} and ${primaryEditStartPosition.toString()}`));
    return [];
  }
  const secondaryEditText = substringPos(primaryEdit.text, positionWithinTextEdit);
  return secondaryPositions.map((pos) => {
    const posEnd = addPositions(subtractPositions(pos, primaryEditStartPosition), primaryEditEndPosition);
    const textAfterSecondaryCursor = textModel.getValueInRange(Range.fromPositions(pos, posEnd));
    const l = commonPrefixLength(replacedTextAfterPrimaryCursor, textAfterSecondaryCursor);
    const range = Range.fromPositions(pos, pos.delta(0, l));
    return new TextReplacement(range, secondaryEditText);
  });
}
__name(getSecondaryEdits, "getSecondaryEdits");
class FadeoutDecoration extends Disposable {
  static {
    __name(this, "FadeoutDecoration");
  }
  constructor(editor, ranges, onDispose) {
    super();
    if (onDispose) {
      this._register({ dispose: /* @__PURE__ */ __name(() => onDispose(), "dispose") });
    }
    this._register(observableCodeEditor(editor).setDecorations(constObservable(ranges.map((range) => ({
      range,
      options: {
        description: "animation",
        className: "edits-fadeout-decoration",
        zIndex: 1
      }
    })))));
    const animation = new AnimatedValue(1, 0, 1e3, easeOutCubic);
    const val = new ObservableAnimatedValue(animation);
    this._register(autorun((reader) => {
      const opacity = val.getValue(reader);
      editor.getContainerDomNode().style.setProperty("--animation-opacity", opacity.toString());
      if (animation.isFinished()) {
        this.dispose();
      }
    }));
  }
}
export {
  InlineCompletionsModel,
  VersionIdChangeReason,
  getSecondaryEdits
};
//# sourceMappingURL=inlineCompletionsModel.js.map
