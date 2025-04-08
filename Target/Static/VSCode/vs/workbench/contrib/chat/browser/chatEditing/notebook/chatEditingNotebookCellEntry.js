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
import { RunOnceScheduler } from "../../../../../../base/common/async.js";
import { DisposableStore, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { ITransaction, IObservable, observableValue, autorun, transaction } from "../../../../../../base/common/observable.js";
import { ObservableDisposable } from "../../../../../../base/common/observableDisposable.js";
import { themeColorFromId } from "../../../../../../base/common/themables.js";
import { URI } from "../../../../../../base/common/uri.js";
import { EditOperation, ISingleEditOperation } from "../../../../../../editor/common/core/editOperation.js";
import { OffsetEdit } from "../../../../../../editor/common/core/offsetEdit.js";
import { Range } from "../../../../../../editor/common/core/range.js";
import { IDocumentDiff, nullDocumentDiff } from "../../../../../../editor/common/diff/documentDiffProvider.js";
import { DetailedLineRangeMapping } from "../../../../../../editor/common/diff/rangeMapping.js";
import { TextEdit } from "../../../../../../editor/common/languages.js";
import { IModelDeltaDecoration, ITextModel, MinimapPosition, OverviewRulerLane } from "../../../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../../../editor/common/model/textModel.js";
import { OffsetEdits } from "../../../../../../editor/common/model/textModelOffsetEdit.js";
import { IEditorWorkerService } from "../../../../../../editor/common/services/editorWorker.js";
import { IModelContentChangedEvent } from "../../../../../../editor/common/textModelEvents.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { observableConfigValue } from "../../../../../../platform/observable/common/platformObservableUtils.js";
import { editorSelectionBackground } from "../../../../../../platform/theme/common/colorRegistry.js";
import { CellEditState } from "../../../../notebook/browser/notebookBrowser.js";
import { INotebookEditorService } from "../../../../notebook/browser/services/notebookEditorService.js";
import { NotebookCellTextModel } from "../../../../notebook/common/model/notebookCellTextModel.js";
import { ModifiedFileEntryState } from "../../../common/chatEditingService.js";
import { IChatResponseModel } from "../../../common/chatModel.js";
import { pendingRewriteMinimap } from "../chatEditingModifiedFileEntry.js";
let ChatEditingNotebookCellEntry = class extends ObservableDisposable {
  constructor(notebookUri, cell, modifiedModel, originalModel, disposables, configService, _editorWorkerService, notebookEditorService) {
    super();
    this.notebookUri = notebookUri;
    this.cell = cell;
    this.modifiedModel = modifiedModel;
    this.originalModel = originalModel;
    this._editorWorkerService = _editorWorkerService;
    this.notebookEditorService = notebookEditorService;
    this.initialContent = this.originalModel.getValue();
    this._register(disposables);
    this._register(this.modifiedModel.onDidChangeContent((e) => {
      this._mirrorEdits(e);
    }));
    this._register(toDisposable(() => {
      this.clearCurrentEditLineDecoration();
    }));
    this._diffTrimWhitespace = observableConfigValue("diffEditor.ignoreTrimWhitespace", true, configService);
    this._register(autorun((r) => {
      this._diffTrimWhitespace.read(r);
      this._updateDiffInfoSeq();
    }));
  }
  static {
    __name(this, "ChatEditingNotebookCellEntry");
  }
  static _lastEditDecorationOptions = ModelDecorationOptions.register({
    isWholeLine: true,
    description: "chat-last-edit",
    className: "chat-editing-last-edit-line",
    marginClassName: "chat-editing-last-edit",
    overviewRuler: {
      position: OverviewRulerLane.Full,
      color: themeColorFromId(editorSelectionBackground)
    }
  });
  static _pendingEditDecorationOptions = ModelDecorationOptions.register({
    isWholeLine: true,
    description: "chat-pending-edit",
    className: "chat-editing-pending-edit",
    minimap: {
      position: MinimapPosition.Inline,
      color: themeColorFromId(pendingRewriteMinimap)
    }
  });
  _edit = OffsetEdit.empty;
  _isEditFromUs = false;
  get isEditFromUs() {
    return this._isEditFromUs;
  }
  _allEditsAreFromUs = true;
  get allEditsAreFromUs() {
    return this._allEditsAreFromUs;
  }
  _diffOperation;
  _diffOperationIds = 0;
  _diffInfo = observableValue(this, nullDocumentDiff);
  get diffInfo() {
    return this._diffInfo;
  }
  _maxModifiedLineNumber = observableValue(this, 0);
  maxModifiedLineNumber = this._maxModifiedLineNumber;
  _editDecorationClear = this._register(new RunOnceScheduler(() => {
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
  }, 500));
  _editDecorations = [];
  _diffTrimWhitespace;
  _stateObs = observableValue(this, ModifiedFileEntryState.Modified);
  state = this._stateObs;
  _isCurrentlyBeingModifiedByObs = observableValue(this, void 0);
  isCurrentlyBeingModifiedBy = this._isCurrentlyBeingModifiedByObs;
  initialContent;
  clearCurrentEditLineDecoration() {
    if (this.modifiedModel.isDisposed()) {
      return;
    }
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
  }
  _mirrorEdits(event) {
    const edit = OffsetEdits.fromContentChanges(event.changes);
    if (this._isEditFromUs) {
      const e_sum = this._edit;
      const e_ai = edit;
      this._edit = e_sum.compose(e_ai);
    } else {
      const e_ai = this._edit;
      const e_user = edit;
      const e_user_r = e_user.tryRebase(e_ai.inverse(this.originalModel.getValue()), true);
      if (e_user_r === void 0) {
        this._edit = e_ai.compose(e_user);
      } else {
        const edits = OffsetEdits.asEditOperations(e_user_r, this.originalModel);
        this.originalModel.applyEdits(edits);
        this._edit = e_ai.tryRebase(e_user_r);
      }
      this._allEditsAreFromUs = false;
      this._updateDiffInfoSeq();
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      const currentState = this._stateObs.get();
      switch (currentState) {
        case ModifiedFileEntryState.Modified:
          if (didResetToOriginalContent) {
            this._stateObs.set(ModifiedFileEntryState.Rejected, void 0);
            break;
          }
      }
    }
  }
  acceptAgentEdits(textEdits, isLastEdits, responseModel) {
    const notebookEditor = this.notebookEditorService.retrieveExistingWidgetFromURI(this.notebookUri)?.value;
    if (notebookEditor) {
      const vm = notebookEditor.getCellByHandle(this.cell.handle);
      vm?.updateEditState(CellEditState.Editing, "chatEdit");
    }
    const ops = textEdits.map(TextEdit.asEditOperation);
    const undoEdits = this._applyEdits(ops);
    const maxLineNumber = undoEdits.reduce((max, op) => Math.max(max, op.range.startLineNumber), 0);
    const newDecorations = [
      // decorate pending edit (region)
      {
        options: ChatEditingNotebookCellEntry._pendingEditDecorationOptions,
        range: new Range(maxLineNumber + 1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
      }
    ];
    if (maxLineNumber > 0) {
      newDecorations.push({
        options: ChatEditingNotebookCellEntry._lastEditDecorationOptions,
        range: new Range(maxLineNumber, 1, maxLineNumber, Number.MAX_SAFE_INTEGER)
      });
    }
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, newDecorations);
    transaction((tx) => {
      if (!isLastEdits) {
        this._stateObs.set(ModifiedFileEntryState.Modified, tx);
        this._isCurrentlyBeingModifiedByObs.set(responseModel, tx);
        this._maxModifiedLineNumber.set(maxLineNumber, tx);
      } else {
        this._resetEditsState(tx);
        this._updateDiffInfoSeq();
        this._maxModifiedLineNumber.set(0, tx);
        this._editDecorationClear.schedule();
      }
    });
  }
  scheduleEditDecorations() {
    this._editDecorationClear.schedule();
  }
  _resetEditsState(tx) {
    this._isCurrentlyBeingModifiedByObs.set(void 0, tx);
    this._maxModifiedLineNumber.set(0, tx);
  }
  async keep(change) {
    return this._acceptHunk(change);
  }
  async _acceptHunk(change) {
    this._isEditFromUs = true;
    try {
      if (!this._diffInfo.get().changes.includes(change)) {
        return false;
      }
      const edits = [];
      for (const edit of change.innerChanges ?? []) {
        const newText = this.modifiedModel.getValueInRange(edit.modifiedRange);
        edits.push(EditOperation.replace(edit.originalRange, newText));
      }
      this.originalModel.pushEditOperations(null, edits, (_) => null);
    } finally {
      this._isEditFromUs = false;
    }
    await this._updateDiffInfoSeq();
    if (this._diffInfo.get().identical) {
      this._stateObs.set(ModifiedFileEntryState.Accepted, void 0);
    }
    return true;
  }
  async undo(change) {
    return this._rejectHunk(change);
  }
  async _rejectHunk(change) {
    this._isEditFromUs = true;
    try {
      if (!this._diffInfo.get().changes.includes(change)) {
        return false;
      }
      const edits = [];
      for (const edit of change.innerChanges ?? []) {
        const newText = this.originalModel.getValueInRange(edit.originalRange);
        edits.push(EditOperation.replace(edit.modifiedRange, newText));
      }
      this.modifiedModel.pushEditOperations(null, edits, (_) => null);
    } finally {
      this._isEditFromUs = false;
    }
    await this._updateDiffInfoSeq();
    if (this._diffInfo.get().identical) {
      this._stateObs.set(ModifiedFileEntryState.Rejected, void 0);
    }
    return true;
  }
  _applyEdits(edits) {
    this._isEditFromUs = true;
    try {
      let result = [];
      this.modifiedModel.pushEditOperations(null, edits, (undoEdits) => {
        result = undoEdits;
        return null;
      });
      return result;
    } finally {
      this._isEditFromUs = false;
    }
  }
  async _updateDiffInfoSeq() {
    const myDiffOperationId = ++this._diffOperationIds;
    await Promise.resolve(this._diffOperation);
    if (this._diffOperationIds === myDiffOperationId) {
      const thisDiffOperation = this._updateDiffInfo();
      this._diffOperation = thisDiffOperation;
      await thisDiffOperation;
    }
  }
  async _updateDiffInfo() {
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed()) {
      return;
    }
    const docVersionNow = this.modifiedModel.getVersionId();
    const snapshotVersionNow = this.originalModel.getVersionId();
    const ignoreTrimWhitespace = this._diffTrimWhitespace.get();
    const diff = await this._editorWorkerService.computeDiff(
      this.originalModel.uri,
      this.modifiedModel.uri,
      { ignoreTrimWhitespace, computeMoves: false, maxComputationTimeMs: 3e3 },
      "advanced"
    );
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed()) {
      return;
    }
    if (this.modifiedModel.getVersionId() === docVersionNow && this.originalModel.getVersionId() === snapshotVersionNow) {
      const diff2 = diff ?? nullDocumentDiff;
      this._diffInfo.set(diff2, void 0);
      this._edit = OffsetEdits.fromLineRangeMapping(this.originalModel, this.modifiedModel, diff2.changes);
    }
  }
};
ChatEditingNotebookCellEntry = __decorateClass([
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IEditorWorkerService),
  __decorateParam(7, INotebookEditorService)
], ChatEditingNotebookCellEntry);
export {
  ChatEditingNotebookCellEntry
};
//# sourceMappingURL=chatEditingNotebookCellEntry.js.map
