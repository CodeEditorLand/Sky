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
import { mapFindFirst } from "../../../../../base/common/arraysFind.js";
import { itemsEquals } from "../../../../../base/common/equals.js";
import { BugIndicatingError, onUnexpectedError, onUnexpectedExternalError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IObservableWithChange, IReader, ITransaction, autorun, constObservable, derived, derivedHandleChanges, derivedOpts, observableSignal, observableValue, recomputeInitiallyAndOnChange, subtransaction, transaction } from "../../../../../base/common/observable.js";
import { commonPrefixLength, firstNonWhitespaceIndex } from "../../../../../base/common/strings.js";
import { isDefined } from "../../../../../base/common/types.js";
import { IAccessibilityService } from "../../../../../platform/accessibility/common/accessibility.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { CursorColumns } from "../../../../common/core/cursorColumns.js";
import { EditOperation } from "../../../../common/core/editOperation.js";
import { LineRange } from "../../../../common/core/lineRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { SingleTextEdit, TextEdit } from "../../../../common/core/textEdit.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { ScrollType } from "../../../../common/editorCommon.js";
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletionTriggerKind, PartialAcceptTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { EndOfLinePreference, IModelDeltaDecoration, ITextModel } from "../../../../common/model.js";
import { TextModelText } from "../../../../common/model/textModelText.js";
import { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import { IModelContentChangedEvent } from "../../../../common/textModelEvents.js";
import { SnippetController2 } from "../../../snippet/browser/snippetController2.js";
import { addPositions, getEndPositionsAfterApplying, substringPos, subtractPositions } from "../utils.js";
import { AnimatedValue, easeOutCubic, ObservableAnimatedValue } from "./animation.js";
import { computeGhostText } from "./computeGhostText.js";
import { GhostText, GhostTextOrReplacement, ghostTextOrReplacementEquals, ghostTextsOrReplacementsEqual } from "./ghostText.js";
import { InlineCompletionWithUpdatedRange, InlineCompletionsSource } from "./inlineCompletionsSource.js";
import { InlineEdit } from "./inlineEdit.js";
import { InlineCompletionItem } from "./provideInlineCompletions.js";
import { singleTextEditAugments, singleTextRemoveCommonPrefix } from "./singleTextEditHelpers.js";
import { SuggestItemInfo } from "./suggestWidgetAdapter.js";
let InlineCompletionsModel = class extends Disposable {
  constructor(textModel, _selectedSuggestItem, _textModelVersionId, _positions, _debounceValue, _enabled, _editor, _instantiationService, _commandService, _languageConfigurationService, _accessibilityService) {
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
    this._register(recomputeInitiallyAndOnChange(this._fetchInlineCompletionsPromise));
    let lastItem = void 0;
    this._register(autorun((reader) => {
      const item = this.inlineCompletionState.read(reader);
      const completion = item?.inlineCompletion;
      if (completion?.semanticId !== lastItem?.semanticId) {
        lastItem = completion;
        if (completion) {
          const i = completion.inlineCompletion;
          const src = i.source;
          src.provider.handleItemDidShow?.(src.inlineCompletions, i.sourceInlineCompletion, i.insertText);
        }
      }
    }));
    this._register(autorun((reader) => {
      const inlineCompletions = this._source.inlineCompletions.read(reader);
      if (!inlineCompletions) {
        return;
      }
      for (const inlineCompletion of inlineCompletions.inlineCompletions) {
        if (inlineCompletion.updatedEdit.read(reader) === void 0) {
          this.stop();
          break;
        }
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
          inlineCompletion: this.state.get().inlineCompletion.inlineCompletion
        };
      }
    }));
    this._didUndoInlineEdits.recomputeInitiallyAndOnChange(this._store);
  }
  static {
    __name(this, "InlineCompletionsModel");
  }
  _source = this._register(this._instantiationService.createInstance(InlineCompletionsSource, this.textModel, this._textModelVersionId, this._debounceValue));
  _isActive = observableValue(this, false);
  _onlyRequestInlineEditsSignal = observableSignal(this);
  _forceUpdateExplicitlySignal = observableSignal(this);
  _noDelaySignal = observableSignal(this);
  // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
  _selectedInlineCompletionId = observableValue(this, void 0);
  primaryPosition = derived(this, (reader) => this._positions.read(reader)[0] ?? new Position(1, 1));
  _isAcceptingPartially = false;
  get isAcceptingPartially() {
    return this._isAcceptingPartially;
  }
  _onDidAccept = new Emitter();
  onDidAccept = this._onDidAccept.event;
  _editorObs = observableCodeEditor(this._editor);
  _suggestPreviewEnabled = this._editorObs.getOption(EditorOption.suggest).map((v) => v.preview);
  _suggestPreviewMode = this._editorObs.getOption(EditorOption.suggest).map((v) => v.previewMode);
  _inlineSuggestMode = this._editorObs.getOption(EditorOption.inlineSuggest).map((v) => v.mode);
  _inlineEditsEnabled = this._editorObs.getOption(EditorOption.inlineSuggest).map((v) => !!v.edits.enabled);
  _inlineEditsShowCollapsedEnabled = this._editorObs.getOption(EditorOption.inlineSuggest).map((s) => s.edits.showCollapsed);
  _lastShownInlineCompletionInfo = void 0;
  _lastAcceptedInlineCompletionInfo = void 0;
  _didUndoInlineEdits = derivedHandleChanges({
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
  _preserveCurrentCompletionReasons = /* @__PURE__ */ new Set([
    1 /* Redo */,
    0 /* Undo */,
    2 /* AcceptWord */
  ]);
  _getReason(e) {
    if (e?.isUndoing) {
      return 0 /* Undo */;
    }
    if (e?.isRedoing) {
      return 1 /* Redo */;
    }
    if (this.isAcceptingPartially) {
      return 2 /* AcceptWord */;
    }
    return 3 /* Other */;
  }
  dontRefetchSignal = observableSignal(this);
  _fetchInlineCompletionsPromise = derivedHandleChanges({
    owner: this,
    changeTracker: {
      createChangeSummary: /* @__PURE__ */ __name(() => ({
        dontRefetch: false,
        preserveCurrentCompletion: false,
        inlineCompletionTriggerKind: InlineCompletionTriggerKind.Automatic,
        onlyRequestInlineEdits: false,
        shouldDebounce: true
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
        } else if (ctx.didChange(this._noDelaySignal)) {
          changeSummary.shouldDebounce = false;
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
    const shouldUpdate = this._enabled.read(reader) && this._selectedSuggestItem.read(reader) || this._isActive.read(reader);
    if (!shouldUpdate) {
      this._source.cancelUpdate();
      return void 0;
    }
    this._textModelVersionId.read(reader);
    const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.get();
    const suggestItem = this._selectedSuggestItem.read(reader);
    if (suggestWidgetInlineCompletions && !suggestItem) {
      const inlineCompletions = this._source.inlineCompletions.get();
      transaction((tx) => {
        if (!inlineCompletions || suggestWidgetInlineCompletions.request.versionId > inlineCompletions.request.versionId) {
          this._source.inlineCompletions.set(suggestWidgetInlineCompletions.clone(), tx);
        }
        this._source.clearSuggestWidgetInlineCompletions(tx);
      });
    }
    const cursorPosition = this.primaryPosition.get();
    if (changeSummary.dontRefetch) {
      return Promise.resolve(true);
    }
    if (this._didUndoInlineEdits.read(reader)) {
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
    return this._source.fetch(cursorPosition, context, itemToPreserve, changeSummary.shouldDebounce, userJumpedToActiveCompletion);
  });
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
        const source = inlineCompletion?.source;
        const sourceInlineCompletion = inlineCompletion?.sourceInlineCompletion;
        if (sourceInlineCompletion && source?.provider.handleRejection) {
          source.provider.handleRejection(source.inlineCompletions, sourceInlineCompletion);
        }
      }
      this._isActive.set(false, tx2);
      this._source.clear(tx2);
    });
  }
  _inlineCompletionItems = derivedOpts({ owner: this }, (reader) => {
    const c = this._source.inlineCompletions.read(reader);
    if (!c) {
      return void 0;
    }
    const cursorPosition = this.primaryPosition.read(reader);
    let inlineEdit = void 0;
    const visibleCompletions = [];
    for (const completion of c.inlineCompletions) {
      if (!completion.sourceInlineCompletion.isInlineEdit) {
        if (completion.isVisible(this.textModel, cursorPosition, reader)) {
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
  _filteredInlineCompletionItems = derivedOpts({ owner: this, equalsFn: itemsEquals() }, (reader) => {
    const c = this._inlineCompletionItems.read(reader);
    return c?.inlineCompletions ?? [];
  });
  selectedInlineCompletionIndex = derived(this, (reader) => {
    const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
    const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
    const idx = this._selectedInlineCompletionId === void 0 ? -1 : filteredCompletions.findIndex((v) => v.semanticId === selectedInlineCompletionId);
    if (idx === -1) {
      this._selectedInlineCompletionId.set(void 0, void 0);
      return 0;
    }
    return idx;
  });
  selectedInlineCompletion = derived(this, (reader) => {
    const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
    const idx = this.selectedInlineCompletionIndex.read(reader);
    return filteredCompletions[idx];
  });
  activeCommands = derivedOpts(
    { owner: this, equalsFn: itemsEquals() },
    (r) => this.selectedInlineCompletion.read(r)?.source.inlineCompletions.commands ?? []
  );
  lastTriggerKind = this._source.inlineCompletions.map(this, (v) => v?.request.context.triggerKind);
  inlineCompletionsCount = derived(this, (reader) => {
    if (this.lastTriggerKind.read(reader) === InlineCompletionTriggerKind.Explicit) {
      return this._filteredInlineCompletionItems.read(reader).length;
    } else {
      return void 0;
    }
  });
  _hasVisiblePeekWidgets = derived(this, (reader) => this._editorObs.openedPeekWidgets.read(reader) > 0);
  state = derivedOpts({
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
      let edit = inlineEditResult.toSingleTextEdit(reader);
      edit = singleTextRemoveCommonPrefix(edit, model);
      const cursorAtInlineEdit = this.primaryPosition.map((cursorPos) => LineRange.fromRangeInclusive(edit.range).addMargin(1, 1).contains(cursorPos.lineNumber));
      const commands = inlineEditResult.inlineCompletion.source.inlineCompletions.commands;
      const inlineEdit = new InlineEdit(edit, commands ?? [], inlineEditResult.inlineCompletion);
      const edits = inlineEditResult.updatedEdit.read(reader);
      const e = edits ? TextEdit.fromOffsetEdit(edits, new TextModelText(this.textModel)).edits : [edit];
      return { kind: "inlineEdit", inlineEdit, inlineCompletion: inlineEditResult, edits: e, cursorAtInlineEdit };
    }
    const suggestItem = this._selectedSuggestItem.read(reader);
    if (suggestItem) {
      const suggestCompletionEdit = singleTextRemoveCommonPrefix(suggestItem.toSingleTextEdit(), model);
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
      const replacement = inlineCompletion.toSingleTextEdit(reader);
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
  status = derived(this, (reader) => {
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
  inlineCompletionState = derived(this, (reader) => {
    const s = this.state.read(reader);
    if (!s || s.kind !== "ghostText") {
      return void 0;
    }
    if (this._editorObs.inComposition.read(reader)) {
      return void 0;
    }
    return s;
  });
  inlineEditState = derived(this, (reader) => {
    const s = this.state.read(reader);
    if (!s || s.kind !== "inlineEdit") {
      return void 0;
    }
    return s;
  });
  inlineEditAvailable = derived(this, (reader) => {
    const s = this.inlineEditState.read(reader);
    return !!s;
  });
  _computeAugmentation(suggestCompletion, reader) {
    const model = this.textModel;
    const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
    const candidateInlineCompletions = suggestWidgetInlineCompletions ? suggestWidgetInlineCompletions.inlineCompletions : [this.selectedInlineCompletion.read(reader)].filter(isDefined);
    const augmentedCompletion = mapFindFirst(candidateInlineCompletions, (completion) => {
      let r = completion.toSingleTextEdit(reader);
      r = singleTextRemoveCommonPrefix(
        r,
        model,
        Range.fromPositions(r.range.getStartPosition(), suggestCompletion.range.getEndPosition())
      );
      return singleTextEditAugments(r, suggestCompletion) ? { completion, edit: r } : void 0;
    });
    return augmentedCompletion;
  }
  warning = derived(this, (reader) => {
    return this.inlineCompletionState.read(reader)?.inlineCompletion?.sourceInlineCompletion.warning;
  });
  ghostTexts = derivedOpts({ owner: this, equalsFn: ghostTextsOrReplacementsEqual }, (reader) => {
    const v = this.inlineCompletionState.read(reader);
    if (!v) {
      return void 0;
    }
    return v.ghostTexts;
  });
  primaryGhostText = derivedOpts({ owner: this, equalsFn: ghostTextOrReplacementEquals }, (reader) => {
    const v = this.inlineCompletionState.read(reader);
    if (!v) {
      return void 0;
    }
    return v?.primaryGhostText;
  });
  showCollapsed = derived(this, (reader) => {
    const state = this.state.read(reader);
    if (!state || state.kind !== "inlineEdit") {
      return false;
    }
    const isCurrentModelVersion = state.inlineCompletion.updatedEditModelVersion === this._textModelVersionId.read(reader);
    return (this._inlineEditsShowCollapsedEnabled.read(reader) || !isCurrentModelVersion) && this._jumpedToId.read(reader) !== state.inlineCompletion.semanticId && !this._inAcceptFlow.read(reader);
  });
  _tabShouldIndent = derived(this, (reader) => {
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
  tabShouldJumpToInlineEdit = derived(this, (reader) => {
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
    return !s.cursorAtInlineEdit.read(reader);
  });
  tabShouldAcceptInlineEdit = derived(this, (reader) => {
    const s = this.inlineEditState.read(reader);
    if (!s) {
      return false;
    }
    if (this.showCollapsed.read(reader)) {
      return false;
    }
    if (s.inlineEdit.range.startLineNumber === this._editorObs.cursorLineNumber.read(reader)) {
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
  async accept(editor = this._editor) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    let completionWithUpdatedRange;
    const state = this.state.get();
    if (state?.kind === "ghostText") {
      if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
        return;
      }
      completionWithUpdatedRange = state.inlineCompletion;
    } else if (state?.kind === "inlineEdit") {
      completionWithUpdatedRange = state.inlineCompletion;
    } else {
      return;
    }
    const completion = completionWithUpdatedRange.toInlineCompletion(void 0);
    if (completion.command) {
      completion.source.addRef();
    }
    editor.pushUndoStop();
    if (completion.snippetInfo) {
      editor.executeEdits(
        "inlineSuggestion.accept",
        [
          EditOperation.replace(completion.range, ""),
          ...completion.additionalTextEdits
        ]
      );
      editor.setPosition(completion.snippetInfo.range.getStartPosition(), "inlineCompletionAccept");
      SnippetController2.get(editor)?.insert(completion.snippetInfo.snippet, { undoStopBefore: false });
    } else {
      const edits = state.edits;
      const selections = getEndPositionsAfterApplying(edits).map((p) => Selection.fromPositions(p));
      editor.executeEdits("inlineSuggestion.accept", [
        ...edits.map((edit) => EditOperation.replace(edit.range, edit.text)),
        ...completion.additionalTextEdits
      ]);
      editor.setSelections(state.kind === "inlineEdit" ? selections.slice(-1) : selections, "inlineCompletionAccept");
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
      completion.source.removeRef();
    }
    this._inAcceptFlow.set(true, void 0);
    this._lastAcceptedInlineCompletionInfo = { textModelVersionIdAfter: this.textModel.getVersionId(), inlineCompletion: completion };
  }
  async acceptNextWord() {
    await this._acceptNext(this._editor, (pos, text) => {
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
    }, PartialAcceptTriggerKind.Word);
  }
  async acceptNextLine() {
    await this._acceptNext(this._editor, (pos, text) => {
      const m = text.match(/\n/);
      if (m && m.index !== void 0) {
        return m.index + 1;
      }
      return text.length;
    }, PartialAcceptTriggerKind.Line);
  }
  async _acceptNext(editor, getAcceptUntilIndex, kind) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const state = this.inlineCompletionState.get();
    if (!state || state.primaryGhostText.isEmpty() || !state.inlineCompletion) {
      return;
    }
    const ghostText = state.primaryGhostText;
    const completion = state.inlineCompletion.toInlineCompletion(void 0);
    if (completion.snippetInfo || completion.filterText !== completion.insertText) {
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
    completion.source.addRef();
    try {
      this._isAcceptingPartially = true;
      try {
        editor.pushUndoStop();
        const replaceRange = Range.fromPositions(cursorPosition, ghostTextPos);
        const newText = editor.getModel().getValueInRange(replaceRange) + partialGhostTextVal;
        const primaryEdit = new SingleTextEdit(replaceRange, newText);
        const edits = [primaryEdit, ...getSecondaryEdits(this.textModel, positions, primaryEdit)];
        const selections = getEndPositionsAfterApplying(edits).map((p) => Selection.fromPositions(p));
        editor.executeEdits("inlineSuggestion.accept", edits.map((edit) => EditOperation.replace(edit.range, edit.text)));
        editor.setSelections(selections, "inlineCompletionPartialAccept");
        editor.revealPositionInCenterIfOutsideViewport(editor.getPosition(), ScrollType.Immediate);
      } finally {
        this._isAcceptingPartially = false;
      }
      if (completion.source.provider.handlePartialAccept) {
        const acceptedRange = Range.fromPositions(completion.range.getStartPosition(), TextLength.ofText(partialGhostTextVal).addToPosition(ghostTextPos));
        const text = editor.getModel().getValueInRange(acceptedRange, EndOfLinePreference.LF);
        const acceptedLength = text.length;
        completion.source.provider.handlePartialAccept(
          completion.source.inlineCompletions,
          completion.sourceInlineCompletion,
          acceptedLength,
          { kind, acceptedLength }
        );
      }
    } finally {
      completion.source.removeRef();
    }
  }
  handleSuggestAccepted(item) {
    const itemEdit = singleTextRemoveCommonPrefix(item.toSingleTextEdit(), this.textModel);
    const augmentedCompletion = this._computeAugmentation(itemEdit, void 0);
    if (!augmentedCompletion) {
      return;
    }
    const source = augmentedCompletion.completion.source;
    const sourceInlineCompletion = augmentedCompletion.completion.sourceInlineCompletion;
    const completion = augmentedCompletion.completion.toInlineCompletion(void 0);
    const alreadyAcceptedLength = this.textModel.getValueInRange(completion.range, EndOfLinePreference.LF).length;
    const acceptedLength = alreadyAcceptedLength + itemEdit.text.length;
    source.provider.handlePartialAccept?.(
      source.inlineCompletions,
      sourceInlineCompletion,
      itemEdit.text.length,
      {
        kind: PartialAcceptTriggerKind.Suggest,
        acceptedLength
      }
    );
  }
  extractReproSample() {
    const value = this.textModel.getValue();
    const item = this.state.get()?.inlineCompletion?.toInlineCompletion(void 0);
    return {
      documentValue: value,
      inlineCompletion: item?.sourceInlineCompletion
    };
  }
  _jumpedToId = observableValue(this, void 0);
  _inAcceptFlow = observableValue(this, false);
  inAcceptFlow = this._inAcceptFlow;
  jump() {
    const s = this.inlineEditState.get();
    if (!s) {
      return;
    }
    transaction((tx) => {
      this._jumpedToId.set(s.inlineCompletion.semanticId, tx);
      this.dontRefetchSignal.trigger(tx);
      const edit = s.inlineCompletion.toSingleTextEdit(void 0);
      this._editor.setPosition(edit.range.getStartPosition(), "inlineCompletions.jump");
      const isSingleLineChange = edit.range.startLineNumber === edit.range.endLineNumber && !edit.text.includes("\n");
      if (isSingleLineChange) {
        this._editor.revealPosition(edit.range.getStartPosition());
      } else {
        const revealRange = new Range(edit.range.startLineNumber - 1, 1, edit.range.endLineNumber + 1, 1);
        this._editor.revealRange(revealRange, ScrollType.Immediate);
      }
      this._editor.focus();
    });
  }
  async handleInlineEditShown(inlineCompletion) {
    if (inlineCompletion.didShow) {
      return;
    }
    inlineCompletion.markAsShown();
    inlineCompletion.source.provider.handleItemDidShow?.(inlineCompletion.source.inlineCompletions, inlineCompletion.sourceInlineCompletion, inlineCompletion.insertText);
    if (inlineCompletion.shownCommand) {
      await this._commandService.executeCommand(inlineCompletion.shownCommand.id, ...inlineCompletion.shownCommand.arguments || []);
    }
  }
};
InlineCompletionsModel = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, ILanguageConfigurationService),
  __decorateParam(10, IAccessibilityService)
], InlineCompletionsModel);
var VersionIdChangeReason = /* @__PURE__ */ ((VersionIdChangeReason2) => {
  VersionIdChangeReason2[VersionIdChangeReason2["Undo"] = 0] = "Undo";
  VersionIdChangeReason2[VersionIdChangeReason2["Redo"] = 1] = "Redo";
  VersionIdChangeReason2[VersionIdChangeReason2["AcceptWord"] = 2] = "AcceptWord";
  VersionIdChangeReason2[VersionIdChangeReason2["Other"] = 3] = "Other";
  return VersionIdChangeReason2;
})(VersionIdChangeReason || {});
function getSecondaryEdits(textModel, positions, primaryEdit) {
  if (positions.length === 1) {
    return [];
  }
  const primaryPosition = positions[0];
  const secondaryPositions = positions.slice(1);
  const primaryEditStartPosition = primaryEdit.range.getStartPosition();
  const primaryEditEndPosition = primaryEdit.range.getEndPosition();
  const replacedTextAfterPrimaryCursor = textModel.getValueInRange(
    Range.fromPositions(primaryPosition, primaryEditEndPosition)
  );
  const positionWithinTextEdit = subtractPositions(primaryPosition, primaryEditStartPosition);
  if (positionWithinTextEdit.lineNumber < 1) {
    onUnexpectedError(new BugIndicatingError(
      `positionWithinTextEdit line number should be bigger than 0.
			Invalid subtraction between ${primaryPosition.toString()} and ${primaryEditStartPosition.toString()}`
    ));
    return [];
  }
  const secondaryEditText = substringPos(primaryEdit.text, positionWithinTextEdit);
  return secondaryPositions.map((pos) => {
    const posEnd = addPositions(subtractPositions(pos, primaryEditStartPosition), primaryEditEndPosition);
    const textAfterSecondaryCursor = textModel.getValueInRange(
      Range.fromPositions(pos, posEnd)
    );
    const l = commonPrefixLength(replacedTextAfterPrimaryCursor, textAfterSecondaryCursor);
    const range = Range.fromPositions(pos, pos.delta(0, l));
    return new SingleTextEdit(range, secondaryEditText);
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
