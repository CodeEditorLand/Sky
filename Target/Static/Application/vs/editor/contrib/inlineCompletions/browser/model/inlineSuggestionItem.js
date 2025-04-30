var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { matchesSubString } from "../../../../../base/common/filters.js";
import { observableSignal } from "../../../../../base/common/observable.js";
import { commonPrefixLength, commonSuffixLength, splitLines } from "../../../../../base/common/strings.js";
import { applyEditsToRanges, OffsetEdit, SingleOffsetEdit } from "../../../../common/core/offsetEdit.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
import { getPositionOffsetTransformerFromTextModel } from "../../../../common/core/positionToOffset.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit, StringText, TextEdit } from "../../../../common/core/textEdit.js";
import { TextLength } from "../../../../common/core/textLength.js";
import { linesDiffComputers } from "../../../../common/diff/linesDiffComputers.js";
import { InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { TextModelText } from "../../../../common/model/textModelText.js";
import { singleTextRemoveCommonPrefix } from "./singleTextEditHelpers.js";
var InlineSuggestionItem;
(function(InlineSuggestionItem2) {
  function create(data, textModel) {
    if (!data.isInlineEdit) {
      return InlineCompletionItem.create(data, textModel);
    } else {
      return InlineEditItem.create(data, textModel);
    }
  }
  __name(create, "create");
  InlineSuggestionItem2.create = create;
})(InlineSuggestionItem || (InlineSuggestionItem = {}));
class InlineSuggestionItemBase {
  static {
    __name(this, "InlineSuggestionItemBase");
  }
  constructor(_data, identity, displayLocation) {
    this._data = _data;
    this.identity = identity;
    this.displayLocation = displayLocation;
  }
  /**
   * A reference to the original inline completion list this inline completion has been constructed from.
   * Used for event data to ensure referential equality.
  */
  get source() {
    return this._data.source;
  }
  get isFromExplicitRequest() {
    return this._data.context.triggerKind === InlineCompletionTriggerKind.Explicit;
  }
  get forwardStable() {
    return this.source.inlineSuggestions.enableForwardStability ?? false;
  }
  get editRange() {
    return this.getSingleTextEdit().range;
  }
  get targetRange() {
    return this.displayLocation?.range ?? this.editRange;
  }
  get insertText() {
    return this.getSingleTextEdit().text;
  }
  get semanticId() {
    return this.hash;
  }
  get action() {
    return this._sourceInlineCompletion.action;
  }
  get command() {
    return this._sourceInlineCompletion.command;
  }
  get warning() {
    return this._sourceInlineCompletion.warning;
  }
  get showInlineEditMenu() {
    return !!this._sourceInlineCompletion.showInlineEditMenu;
  }
  get hash() {
    return JSON.stringify([
      this.getSingleTextEdit().text,
      this.getSingleTextEdit().range.getStartPosition().toString()
    ]);
  }
  /** @deprecated */
  get shownCommand() {
    return this._sourceInlineCompletion.shownCommand;
  }
  /**
   * A reference to the original inline completion this inline completion has been constructed from.
   * Used for event data to ensure referential equality.
  */
  get _sourceInlineCompletion() {
    return this._data.sourceInlineCompletion;
  }
  addRef() {
    this.identity.addRef();
    this.source.addRef();
  }
  removeRef() {
    this.identity.removeRef();
    this.source.removeRef();
  }
  reportInlineEditShown(commandService) {
    this._data.reportInlineEditShown(commandService, this.insertText);
  }
  reportPartialAccept(acceptedCharacters, info) {
    this._data.reportPartialAccept(acceptedCharacters, info);
  }
  reportEndOfLife(reason) {
    this._data.reportEndOfLife(reason);
  }
  setEndOfLifeReason(reason) {
    this._data.setEndOfLifeReason(reason);
  }
  /**
   * Avoid using this method. Instead introduce getters for the needed properties.
  */
  getSourceCompletion() {
    return this._sourceInlineCompletion;
  }
}
class InlineSuggestionIdentity {
  static {
    __name(this, "InlineSuggestionIdentity");
  }
  constructor() {
    this._onDispose = observableSignal(this);
    this.onDispose = this._onDispose;
    this._refCount = 1;
    this.id = "InlineCompletionIdentity" + InlineSuggestionIdentity.idCounter++;
  }
  static {
    this.idCounter = 0;
  }
  addRef() {
    this._refCount++;
  }
  removeRef() {
    this._refCount--;
    if (this._refCount === 0) {
      this._onDispose.trigger(void 0);
    }
  }
}
class InlineSuggestDisplayLocation {
  static {
    __name(this, "InlineSuggestDisplayLocation");
  }
  static create(displayLocation, textmodel) {
    const offsetRange = new OffsetRange(textmodel.getOffsetAt(displayLocation.range.getStartPosition()), textmodel.getOffsetAt(displayLocation.range.getEndPosition()));
    return new InlineSuggestDisplayLocation(offsetRange, displayLocation.range, displayLocation.label);
  }
  constructor(_offsetRange, range, label) {
    this._offsetRange = _offsetRange;
    this.range = range;
    this.label = label;
  }
  withEdit(edit, positionOffsetTransformer) {
    const newOffsetRange = applyEditsToRanges([this._offsetRange], edit)[0];
    if (!newOffsetRange || newOffsetRange.length !== this._offsetRange.length) {
      return void 0;
    }
    const newRange = positionOffsetTransformer.getRange(newOffsetRange);
    return new InlineSuggestDisplayLocation(newOffsetRange, newRange, this.label);
  }
}
class InlineCompletionItem extends InlineSuggestionItemBase {
  static {
    __name(this, "InlineCompletionItem");
  }
  static create(data, textModel) {
    const identity = new InlineSuggestionIdentity();
    const textEdit = new SingleTextEdit(data.range, data.insertText);
    const edit = getPositionOffsetTransformerFromTextModel(textModel).getSingleOffsetEdit(textEdit);
    const displayLocation = data.displayLocation ? InlineSuggestDisplayLocation.create(data.displayLocation, textModel) : void 0;
    return new InlineCompletionItem(edit, textEdit, data.range, data.snippetInfo, data.additionalTextEdits, data, identity, displayLocation);
  }
  constructor(_edit, _textEdit, _originalRange, snippetInfo, additionalTextEdits, data, identity, displayLocation) {
    super(data, identity, displayLocation);
    this._edit = _edit;
    this._textEdit = _textEdit;
    this._originalRange = _originalRange;
    this.snippetInfo = snippetInfo;
    this.additionalTextEdits = additionalTextEdits;
    this.isInlineEdit = false;
  }
  getSingleTextEdit() {
    return this._textEdit;
  }
  withIdentity(identity) {
    return new InlineCompletionItem(this._edit, this._textEdit, this._originalRange, this.snippetInfo, this.additionalTextEdits, this._data, identity, this.displayLocation);
  }
  withEdit(textModelEdit, textModel) {
    const newEditRange = applyEditsToRanges([this._edit.replaceRange], textModelEdit);
    if (newEditRange.length === 0) {
      return void 0;
    }
    const newEdit = new SingleOffsetEdit(newEditRange[0], this._textEdit.text);
    const positionOffsetTransformer = getPositionOffsetTransformerFromTextModel(textModel);
    const newTextEdit = positionOffsetTransformer.getSingleTextEdit(newEdit);
    let newDisplayLocation = this.displayLocation;
    if (newDisplayLocation) {
      newDisplayLocation = newDisplayLocation.withEdit(textModelEdit, positionOffsetTransformer);
      if (!newDisplayLocation) {
        return void 0;
      }
    }
    return new InlineCompletionItem(newEdit, newTextEdit, this._originalRange, this.snippetInfo, this.additionalTextEdits, this._data, this.identity, newDisplayLocation);
  }
  canBeReused(model, position) {
    const updatedRange = this._textEdit.range;
    const result = !!updatedRange && updatedRange.containsPosition(position) && this.isVisible(model, position) && TextLength.ofRange(updatedRange).isGreaterThanOrEqualTo(TextLength.ofRange(this._originalRange));
    return result;
  }
  isVisible(model, cursorPosition) {
    const minimizedReplacement = singleTextRemoveCommonPrefix(this.getSingleTextEdit(), model);
    if (!this.editRange || !this._originalRange.getStartPosition().equals(this.editRange.getStartPosition()) || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber || minimizedReplacement.isEmpty) {
      return false;
    }
    const originalValue = model.getValueInRange(
      minimizedReplacement.range,
      1
      /* EndOfLinePreference.LF */
    );
    const filterText = minimizedReplacement.text;
    const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
    let filterTextBefore = filterText.substring(0, cursorPosIndex);
    let filterTextAfter = filterText.substring(cursorPosIndex);
    let originalValueBefore = originalValue.substring(0, cursorPosIndex);
    let originalValueAfter = originalValue.substring(cursorPosIndex);
    const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
    if (minimizedReplacement.range.startColumn <= originalValueIndent) {
      originalValueBefore = originalValueBefore.trimStart();
      if (originalValueBefore.length === 0) {
        originalValueAfter = originalValueAfter.trimStart();
      }
      filterTextBefore = filterTextBefore.trimStart();
      if (filterTextBefore.length === 0) {
        filterTextAfter = filterTextAfter.trimStart();
      }
    }
    return filterTextBefore.startsWith(originalValueBefore) && !!matchesSubString(originalValueAfter, filterTextAfter);
  }
}
class InlineEditItem extends InlineSuggestionItemBase {
  static {
    __name(this, "InlineEditItem");
  }
  static create(data, textModel) {
    const offsetEdit = getOffsetEdit(textModel, data.range, data.insertText);
    const text = new TextModelText(textModel);
    const textEdit = TextEdit.fromOffsetEdit(offsetEdit, text);
    const singleTextEdit = textEdit.toSingle(text);
    const identity = new InlineSuggestionIdentity();
    const edits = offsetEdit.edits.map((edit) => {
      const replacedRange = Range.fromPositions(textModel.getPositionAt(edit.replaceRange.start), textModel.getPositionAt(edit.replaceRange.endExclusive));
      const replacedText = textModel.getValueInRange(replacedRange);
      return SingleUpdatedNextEdit.create(edit, replacedText);
    });
    const displayLocation = data.displayLocation ? InlineSuggestDisplayLocation.create(data.displayLocation, textModel) : void 0;
    return new InlineEditItem(offsetEdit, singleTextEdit, data, identity, edits, displayLocation, false, textModel.getVersionId());
  }
  constructor(_edit, _textEdit, data, identity, _edits, displayLocation, _lastChangePartOfInlineEdit = false, _inlineEditModelVersion) {
    super(data, identity, displayLocation);
    this._edit = _edit;
    this._textEdit = _textEdit;
    this._edits = _edits;
    this._lastChangePartOfInlineEdit = _lastChangePartOfInlineEdit;
    this._inlineEditModelVersion = _inlineEditModelVersion;
    this.snippetInfo = void 0;
    this.additionalTextEdits = [];
    this.isInlineEdit = true;
  }
  get updatedEditModelVersion() {
    return this._inlineEditModelVersion;
  }
  get updatedEdit() {
    return this._edit;
  }
  getSingleTextEdit() {
    return this._textEdit;
  }
  withIdentity(identity) {
    return new InlineEditItem(this._edit, this._textEdit, this._data, identity, this._edits, this.displayLocation, this._lastChangePartOfInlineEdit, this._inlineEditModelVersion);
  }
  canBeReused(model, position) {
    return this._lastChangePartOfInlineEdit && this.updatedEditModelVersion === model.getVersionId();
  }
  withEdit(textModelChanges, textModel) {
    const edit = this._applyTextModelChanges(textModelChanges, this._edits, textModel);
    return edit;
  }
  _applyTextModelChanges(textModelChanges, edits, textModel) {
    edits = edits.map((innerEdit) => innerEdit.applyTextModelChanges(textModelChanges));
    if (edits.some((edit) => edit.edit === void 0)) {
      return void 0;
    }
    const newTextModelVersion = textModel.getVersionId();
    let inlineEditModelVersion = this._inlineEditModelVersion;
    const lastChangePartOfInlineEdit = edits.some((edit) => edit.lastChangeUpdatedEdit);
    if (lastChangePartOfInlineEdit) {
      inlineEditModelVersion = newTextModelVersion ?? -1;
    }
    if (newTextModelVersion === null || inlineEditModelVersion + 20 < newTextModelVersion) {
      return void 0;
    }
    edits = edits.filter((innerEdit) => !innerEdit.edit.isEmpty);
    if (edits.length === 0) {
      return void 0;
    }
    const newEdit = new OffsetEdit(edits.map((edit) => edit.edit));
    const positionOffsetTransformer = getPositionOffsetTransformerFromTextModel(textModel);
    const newTextEdit = positionOffsetTransformer.getTextEdit(newEdit).toSingle(new TextModelText(textModel));
    let newDisplayLocation = this.displayLocation;
    if (newDisplayLocation) {
      newDisplayLocation = newDisplayLocation.withEdit(textModelChanges, positionOffsetTransformer);
      if (!newDisplayLocation) {
        return void 0;
      }
    }
    return new InlineEditItem(newEdit, newTextEdit, this._data, this.identity, edits, newDisplayLocation, lastChangePartOfInlineEdit, inlineEditModelVersion);
  }
}
function getOffsetEdit(textModel, editRange, replaceText) {
  const eol = textModel.getEOL();
  const editOriginalText = textModel.getValueInRange(editRange);
  const editReplaceText = replaceText.replace(/\r\n|\r|\n/g, eol);
  const diffAlgorithm = linesDiffComputers.getDefault();
  const lineDiffs = diffAlgorithm.computeDiff(splitLines(editOriginalText), splitLines(editReplaceText), {
    ignoreTrimWhitespace: false,
    computeMoves: false,
    extendToSubwords: true,
    maxComputationTimeMs: 500
  });
  const innerChanges = lineDiffs.changes.flatMap((c) => c.innerChanges ?? []);
  function addRangeToPos(pos, range) {
    const start = TextLength.fromPosition(range.getStartPosition());
    return TextLength.ofRange(range).createRange(start.addToPosition(pos));
  }
  __name(addRangeToPos, "addRangeToPos");
  const modifiedText = new StringText(editReplaceText);
  const offsetEdit = new OffsetEdit(innerChanges.map((c) => {
    const rangeInModel = addRangeToPos(editRange.getStartPosition(), c.originalRange);
    const originalRange = getPositionOffsetTransformerFromTextModel(textModel).getOffsetRange(rangeInModel);
    const replaceText2 = modifiedText.getValueOfRange(c.modifiedRange);
    const edit = new SingleOffsetEdit(originalRange, replaceText2);
    const originalText = textModel.getValueInRange(rangeInModel);
    return reshapeEdit(edit, originalText, innerChanges.length, textModel);
  }));
  return offsetEdit;
}
__name(getOffsetEdit, "getOffsetEdit");
class SingleUpdatedNextEdit {
  static {
    __name(this, "SingleUpdatedNextEdit");
  }
  static create(edit, replacedText) {
    const prefixLength = commonPrefixLength(edit.newText, replacedText);
    const suffixLength = commonSuffixLength(edit.newText, replacedText);
    const trimmedNewText = edit.newText.substring(prefixLength, edit.newText.length - suffixLength);
    return new SingleUpdatedNextEdit(edit, trimmedNewText, prefixLength, suffixLength);
  }
  get edit() {
    return this._edit;
  }
  get lastChangeUpdatedEdit() {
    return this._lastChangeUpdatedEdit;
  }
  constructor(_edit, _trimmedNewText, _prefixLength, _suffixLength, _lastChangeUpdatedEdit = false) {
    this._edit = _edit;
    this._trimmedNewText = _trimmedNewText;
    this._prefixLength = _prefixLength;
    this._suffixLength = _suffixLength;
    this._lastChangeUpdatedEdit = _lastChangeUpdatedEdit;
  }
  applyTextModelChanges(textModelChanges) {
    const c = this._clone();
    c._applyTextModelChanges(textModelChanges);
    return c;
  }
  _clone() {
    return new SingleUpdatedNextEdit(this._edit, this._trimmedNewText, this._prefixLength, this._suffixLength, this._lastChangeUpdatedEdit);
  }
  _applyTextModelChanges(textModelChanges) {
    this._lastChangeUpdatedEdit = false;
    if (!this._edit) {
      throw new BugIndicatingError("UpdatedInnerEdits: No edit to apply changes to");
    }
    const result = this._applyChanges(this._edit, textModelChanges);
    if (!result) {
      this._edit = void 0;
      return;
    }
    this._edit = result.edit;
    this._lastChangeUpdatedEdit = result.editHasChanged;
  }
  _applyChanges(edit, textModelChanges) {
    let editStart = edit.replaceRange.start;
    let editEnd = edit.replaceRange.endExclusive;
    let editReplaceText = edit.newText;
    let editHasChanged = false;
    const shouldPreserveEditShape = this._prefixLength > 0 || this._suffixLength > 0;
    for (let i = textModelChanges.edits.length - 1; i >= 0; i--) {
      const change = textModelChanges.edits[i];
      const isInsertion = change.newText.length > 0 && change.replaceRange.isEmpty;
      if (isInsertion && !shouldPreserveEditShape && change.replaceRange.start === editStart && editReplaceText.startsWith(change.newText)) {
        editStart += change.newText.length;
        editReplaceText = editReplaceText.substring(change.newText.length);
        editEnd = Math.max(editStart, editEnd);
        editHasChanged = true;
        continue;
      }
      if (isInsertion && shouldPreserveEditShape && change.replaceRange.start === editStart + this._prefixLength && this._trimmedNewText.startsWith(change.newText)) {
        editEnd += change.newText.length;
        editHasChanged = true;
        this._prefixLength += change.newText.length;
        this._trimmedNewText = this._trimmedNewText.substring(change.newText.length);
        continue;
      }
      const isDeletion = change.newText.length === 0 && change.replaceRange.length > 0;
      if (isDeletion && change.replaceRange.start >= editStart + this._prefixLength && change.replaceRange.endExclusive <= editEnd - this._suffixLength) {
        editEnd -= change.replaceRange.length;
        editHasChanged = true;
        continue;
      }
      if (change.equals(edit)) {
        editHasChanged = true;
        editStart = change.replaceRange.endExclusive;
        editReplaceText = "";
        continue;
      }
      if (change.replaceRange.start > editEnd) {
        continue;
      }
      if (change.replaceRange.endExclusive < editStart) {
        editStart += change.newText.length - change.replaceRange.length;
        editEnd += change.newText.length - change.replaceRange.length;
        continue;
      }
      return void 0;
    }
    if (this._trimmedNewText.length === 0 && editStart + this._prefixLength === editEnd - this._suffixLength) {
      return { edit: new SingleOffsetEdit(new OffsetRange(editStart + this._prefixLength, editStart + this._prefixLength), ""), editHasChanged: true };
    }
    return { edit: new SingleOffsetEdit(new OffsetRange(editStart, editEnd), editReplaceText), editHasChanged };
  }
}
function reshapeEdit(edit, originalText, totalInnerEdits, textModel) {
  const eol = textModel.getEOL();
  if (edit.newText.endsWith(eol) && originalText.endsWith(eol)) {
    edit = new SingleOffsetEdit(edit.replaceRange.deltaEnd(-eol.length), edit.newText.slice(0, -eol.length));
  }
  if (totalInnerEdits === 1 && edit.replaceRange.isEmpty && edit.newText.includes(eol)) {
    edit = reshapeMultiLineInsertion(edit, textModel);
  }
  if (totalInnerEdits === 1) {
    const prefixLength = commonPrefixLength(originalText, edit.newText);
    const suffixLength = commonSuffixLength(originalText.slice(prefixLength), edit.newText.slice(prefixLength));
    if (prefixLength + suffixLength === originalText.length) {
      return new SingleOffsetEdit(edit.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), edit.newText.substring(prefixLength, edit.newText.length - suffixLength));
    }
    if (prefixLength + suffixLength === edit.newText.length) {
      return new SingleOffsetEdit(edit.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), "");
    }
  }
  return edit;
}
__name(reshapeEdit, "reshapeEdit");
function reshapeMultiLineInsertion(edit, textModel) {
  if (!edit.replaceRange.isEmpty) {
    throw new BugIndicatingError("Unexpected original range");
  }
  if (edit.replaceRange.start === 0) {
    return edit;
  }
  const eol = textModel.getEOL();
  const startPosition = textModel.getPositionAt(edit.replaceRange.start);
  const startColumn = startPosition.column;
  const startLineNumber = startPosition.lineNumber;
  if (startColumn === 1 && startLineNumber > 1 && textModel.getLineLength(startLineNumber) !== 0 && edit.newText.endsWith(eol) && !edit.newText.startsWith(eol)) {
    return new SingleOffsetEdit(edit.replaceRange.delta(-1), eol + edit.newText.slice(0, -eol.length));
  }
  return edit;
}
__name(reshapeMultiLineInsertion, "reshapeMultiLineInsertion");
export {
  InlineCompletionItem,
  InlineEditItem,
  InlineSuggestionIdentity,
  InlineSuggestionItem
};
//# sourceMappingURL=inlineSuggestionItem.js.map
