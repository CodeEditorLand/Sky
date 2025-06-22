var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener, getWindow } from "../../../../../base/browser/dom.js";
import { assert } from "../../../../../base/common/assert.js";
import { DeferredPromise, RunOnceScheduler, timeout } from "../../../../../base/common/async.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { observableValue } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { themeColorFromId } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { StringEdit } from "../../../../../editor/common/core/edits/stringEdit.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { nullDocumentDiff } from "../../../../../editor/common/diff/documentDiffProvider.js";
import { TextEdit } from "../../../../../editor/common/languages.js";
import { OverviewRulerLane } from "../../../../../editor/common/model.js";
import { ModelDecorationOptions } from "../../../../../editor/common/model/textModel.js";
import { offsetEditFromContentChanges, offsetEditFromLineRangeMapping, offsetEditToEditOperations } from "../../../../../editor/common/model/textModelStringEdit.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { TextModelEditReason } from "../../../../../editor/common/textModelEditReason.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { editorSelectionBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { pendingRewriteMinimap } from "./chatEditingModifiedFileEntry.js";
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
var ChatEditingTextModelChangeService_1;
let ChatEditingTextModelChangeService = class ChatEditingTextModelChangeService2 extends Disposable {
  static {
    __name(this, "ChatEditingTextModelChangeService");
  }
  static {
    ChatEditingTextModelChangeService_1 = this;
  }
  static {
    this._lastEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-last-edit",
      className: "chat-editing-last-edit-line",
      marginClassName: "chat-editing-last-edit",
      overviewRuler: {
        position: OverviewRulerLane.Full,
        color: themeColorFromId(editorSelectionBackground)
      }
    });
  }
  static {
    this._pendingEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-pending-edit",
      className: "chat-editing-pending-edit",
      minimap: {
        position: 1,
        color: themeColorFromId(pendingRewriteMinimap)
      }
    });
  }
  static {
    this._atomicEditDecorationOptions = ModelDecorationOptions.register({
      isWholeLine: true,
      description: "chat-atomic-edit",
      className: "chat-editing-atomic-edit",
      minimap: {
        position: 1,
        color: themeColorFromId(pendingRewriteMinimap)
      }
    });
  }
  get isEditFromUs() {
    return this._isEditFromUs;
  }
  get allEditsAreFromUs() {
    return this._allEditsAreFromUs;
  }
  get diffInfo() {
    return this._diffInfo.map((value) => {
      return {
        ...value,
        originalModel: this.originalModel,
        modifiedModel: this.modifiedModel,
        keep: /* @__PURE__ */ __name((changes) => this._keepHunk(changes), "keep"),
        undo: /* @__PURE__ */ __name((changes) => this._undoHunk(changes), "undo")
      };
    });
  }
  constructor(originalModel, modifiedModel, state, _editorWorkerService, _accessibilitySignalService) {
    super();
    this.originalModel = originalModel;
    this.modifiedModel = modifiedModel;
    this.state = state;
    this._editorWorkerService = _editorWorkerService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._isEditFromUs = false;
    this._allEditsAreFromUs = true;
    this._diffOperationIds = 0;
    this._diffInfo = observableValue(this, nullDocumentDiff);
    this._editDecorationClear = this._register(new RunOnceScheduler(() => {
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
    }, 500));
    this._editDecorations = [];
    this._didAcceptOrRejectAllHunks = this._register(new Emitter());
    this.onDidAcceptOrRejectAllHunks = this._didAcceptOrRejectAllHunks.event;
    this._didUserEditModel = this._register(new Emitter());
    this.onDidUserEditModel = this._didUserEditModel.event;
    this._originalToModifiedEdit = StringEdit.empty;
    this._register(this.modifiedModel.onDidChangeContent((e) => {
      this._mirrorEdits(e);
    }));
    this._register(toDisposable(() => {
      this.clearCurrentEditLineDecoration();
    }));
  }
  clearCurrentEditLineDecoration() {
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
  }
  async areOriginalAndModifiedIdentical() {
    const diff = await this._diffOperation;
    return diff ? diff.identical : false;
  }
  async acceptAgentEdits(resource, textEdits, isLastEdits) {
    assertType(textEdits.every(TextEdit.isTextEdit), "INVALID args, can only handle text edits");
    assert(isEqual(resource, this.modifiedModel.uri), " INVALID args, can only edit THIS document");
    const isAtomicEdits = textEdits.length > 0 && isLastEdits;
    let maxLineNumber = 0;
    let rewriteRatio = 0;
    if (isAtomicEdits) {
      const minimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this.modifiedModel.uri, textEdits) ?? textEdits;
      const ops = minimalEdits.map(TextEdit.asEditOperation);
      const undoEdits = this._applyEdits(ops);
      if (undoEdits.length > 0) {
        let range;
        for (let i = 0; i < undoEdits.length; i++) {
          const op = undoEdits[i];
          if (!range) {
            range = Range.lift(op.range);
          } else {
            range = Range.plusRange(range, op.range);
          }
        }
        if (range) {
          const defer = new DeferredPromise();
          const listener = addDisposableListener(getWindow(void 0), "animationend", (e) => {
            if (e.animationName === "kf-chat-editing-atomic-edit") {
              defer.complete();
              listener.dispose();
            }
          });
          this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, [{
            options: ChatEditingTextModelChangeService_1._atomicEditDecorationOptions,
            range
          }]);
          await Promise.any([defer.p, timeout(500)]);
          listener.dispose();
        }
      }
    } else {
      const ops = textEdits.map(TextEdit.asEditOperation);
      const undoEdits = this._applyEdits(ops);
      maxLineNumber = undoEdits.reduce((max, op) => Math.max(max, op.range.startLineNumber), 0);
      rewriteRatio = Math.min(1, maxLineNumber / this.modifiedModel.getLineCount());
      const newDecorations = [
        // decorate pending edit (region)
        {
          options: ChatEditingTextModelChangeService_1._pendingEditDecorationOptions,
          range: new Range(maxLineNumber + 1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
        }
      ];
      if (maxLineNumber > 0) {
        newDecorations.push({
          options: ChatEditingTextModelChangeService_1._lastEditDecorationOptions,
          range: new Range(maxLineNumber, 1, maxLineNumber, Number.MAX_SAFE_INTEGER)
        });
      }
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, newDecorations);
    }
    if (isLastEdits) {
      this._updateDiffInfoSeq();
      this._editDecorationClear.schedule();
    }
    return { rewriteRatio, maxLineNumber };
  }
  _applyEdits(edits) {
    try {
      this._isEditFromUs = true;
      let result = [];
      TextModelEditReason.editWithReason(new TextModelEditReason({ source: "Chat.applyEdits" }), () => {
        this.modifiedModel.pushEditOperations(null, edits, (undoEdits) => {
          result = undoEdits;
          return null;
        });
      });
      return result;
    } finally {
      this._isEditFromUs = false;
    }
  }
  /**
   * Keeps the current modified document as the final contents.
   */
  keep() {
    this.originalModel.setValue(this.modifiedModel.createSnapshot());
    this._diffInfo.set(nullDocumentDiff, void 0);
    this._originalToModifiedEdit = StringEdit.empty;
  }
  /**
   * Undoes the current modified document as the final contents.
   */
  undo() {
    this.modifiedModel.pushStackElement();
    this._applyEdits([EditOperation.replace(this.modifiedModel.getFullModelRange(), this.originalModel.getValue())]);
    this.modifiedModel.pushStackElement();
    this._originalToModifiedEdit = StringEdit.empty;
    this._diffInfo.set(nullDocumentDiff, void 0);
  }
  async resetDocumentValues(newOriginal, newModified) {
    let didChange = false;
    if (newOriginal !== void 0) {
      this.originalModel.setValue(newOriginal);
      didChange = true;
    }
    if (newModified !== void 0 && this.modifiedModel.getValue() !== newModified) {
      this.modifiedModel.pushStackElement();
      this._applyEdits([EditOperation.replace(this.modifiedModel.getFullModelRange(), newModified)]);
      this.modifiedModel.pushStackElement();
      didChange = true;
    }
    if (didChange) {
      await this._updateDiffInfoSeq();
    }
  }
  _mirrorEdits(event) {
    const edit = offsetEditFromContentChanges(event.changes);
    if (this._isEditFromUs) {
      const e_sum = this._originalToModifiedEdit;
      const e_ai = edit;
      this._originalToModifiedEdit = e_sum.compose(e_ai);
    } else {
      const e_ai = this._originalToModifiedEdit;
      const e_user = edit;
      const e_user_r = e_user.tryRebase(e_ai.inverse(this.originalModel.getValue()), true);
      if (e_user_r === void 0) {
        this._originalToModifiedEdit = e_ai.compose(e_user);
      } else {
        const edits = offsetEditToEditOperations(e_user_r, this.originalModel);
        this.originalModel.applyEdits(edits);
        this._originalToModifiedEdit = e_ai.tryRebase(e_user_r);
      }
      this._allEditsAreFromUs = false;
      this._updateDiffInfoSeq();
      this._didUserEditModel.fire();
    }
  }
  async _keepHunk(change) {
    if (!this._diffInfo.get().changes.includes(change)) {
      return false;
    }
    const edits = [];
    for (const edit of change.innerChanges ?? []) {
      const newText = this.modifiedModel.getValueInRange(edit.modifiedRange);
      edits.push(EditOperation.replace(edit.originalRange, newText));
    }
    this.originalModel.pushEditOperations(null, edits, (_) => null);
    await this._updateDiffInfoSeq();
    if (this._diffInfo.get().identical) {
      this._didAcceptOrRejectAllHunks.fire(
        1
        /* ModifiedFileEntryState.Accepted */
      );
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
    return true;
  }
  async _undoHunk(change) {
    if (!this._diffInfo.get().changes.includes(change)) {
      return false;
    }
    const edits = [];
    for (const edit of change.innerChanges ?? []) {
      const newText = this.originalModel.getValueInRange(edit.originalRange);
      edits.push(EditOperation.replace(edit.modifiedRange, newText));
    }
    this.modifiedModel.pushEditOperations(null, edits, (_) => null);
    await this._updateDiffInfoSeq();
    if (this._diffInfo.get().identical) {
      this._didAcceptOrRejectAllHunks.fire(
        2
        /* ModifiedFileEntryState.Rejected */
      );
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
    return true;
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
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed() || this._store.isDisposed) {
      return void 0;
    }
    if (this.state.get() !== 0) {
      this._diffInfo.set(nullDocumentDiff, void 0);
      this._originalToModifiedEdit = StringEdit.empty;
      return nullDocumentDiff;
    }
    const docVersionNow = this.modifiedModel.getVersionId();
    const snapshotVersionNow = this.originalModel.getVersionId();
    const diff = await this._editorWorkerService.computeDiff(this.originalModel.uri, this.modifiedModel.uri, {
      ignoreTrimWhitespace: false,
      // NEVER ignore whitespace so that undo/accept edits are correct and so that all changes (1 of 2) are spelled out
      computeMoves: false,
      maxComputationTimeMs: 3e3
    }, "advanced");
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed() || this._store.isDisposed) {
      return void 0;
    }
    if (this.modifiedModel.getVersionId() === docVersionNow && this.originalModel.getVersionId() === snapshotVersionNow) {
      const diff2 = diff ?? nullDocumentDiff;
      this._diffInfo.set(diff2, void 0);
      this._originalToModifiedEdit = offsetEditFromLineRangeMapping(this.originalModel, this.modifiedModel, diff2.changes);
      return diff2;
    }
    return void 0;
  }
};
ChatEditingTextModelChangeService = ChatEditingTextModelChangeService_1 = __decorate([
  __param(3, IEditorWorkerService),
  __param(4, IAccessibilitySignalService)
], ChatEditingTextModelChangeService);
export {
  ChatEditingTextModelChangeService
};
//# sourceMappingURL=chatEditingTextModelChangeService.js.map
