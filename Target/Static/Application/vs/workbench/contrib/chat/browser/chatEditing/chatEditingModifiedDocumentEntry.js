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
var ChatEditingModifiedDocumentEntry_1;
import { assert } from "../../../../../base/common/assert.js";
import { RunOnceScheduler } from "../../../../../base/common/async.js";
import { MutableDisposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { observableValue, autorun, transaction } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { themeColorFromId } from "../../../../../base/common/themables.js";
import { assertType } from "../../../../../base/common/types.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { OffsetEdit } from "../../../../../editor/common/core/offsetEdit.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { nullDocumentDiff } from "../../../../../editor/common/diff/documentDiffProvider.js";
import { TextEdit } from "../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { OverviewRulerLane } from "../../../../../editor/common/model.js";
import { SingleModelEditStackElement } from "../../../../../editor/common/model/editStack.js";
import { ModelDecorationOptions, createTextBufferFactoryFromSnapshot } from "../../../../../editor/common/model/textModel.js";
import { OffsetEdits } from "../../../../../editor/common/model/textModelOffsetEdit.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { TextModelChangeRecorder } from "../../../../../editor/contrib/inlineCompletions/browser/model/changeRecorder.js";
import { localize } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IMarkerService } from "../../../../../platform/markers/common/markers.js";
import { editorSelectionBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { isTextFileEditorModel, ITextFileService, stringToSnapshot } from "../../../../services/textfile/common/textfiles.js";
import { IChatService } from "../../common/chatService.js";
import { ChatEditingCodeEditorIntegration } from "./chatEditingCodeEditorIntegration.js";
import { AbstractChatEditingModifiedFileEntry, pendingRewriteMinimap } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
let ChatEditingModifiedDocumentEntry = class ChatEditingModifiedDocumentEntry2 extends AbstractChatEditingModifiedFileEntry {
  static {
    __name(this, "ChatEditingModifiedDocumentEntry");
  }
  static {
    ChatEditingModifiedDocumentEntry_1 = this;
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
  constructor(resourceRef, _multiDiffEntryDelegate, telemetryInfo, kind, initialContent, markerService, modelService, textModelService, languageService, configService, fileConfigService, chatService, _editorWorkerService, _textFileService, fileService, undoRedoService, instantiationService, _accessibilitySignalService) {
    super(resourceRef.object.textEditorModel.uri, telemetryInfo, kind, configService, fileConfigService, chatService, fileService, undoRedoService, instantiationService);
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this._editorWorkerService = _editorWorkerService;
    this._textFileService = _textFileService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._edit = OffsetEdit.empty;
    this._isEditFromUs = false;
    this._allEditsAreFromUs = true;
    this._diffOperationIds = 0;
    this._diffInfo = observableValue(this, nullDocumentDiff);
    this.changesCount = this._diffInfo.map((diff) => diff.changes.length);
    this._editDecorationClear = this._register(new RunOnceScheduler(() => {
      this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
    }, 500));
    this._editDecorations = [];
    this._docFileEditorModel = this._register(resourceRef).object;
    this.modifiedModel = resourceRef.object.textEditorModel;
    this.originalURI = ChatEditingTextModelContentProvider.getFileURI(telemetryInfo.sessionId, this.entryId, this.modifiedURI.path);
    this.initialContent = initialContent ?? this.modifiedModel.getValue();
    const docSnapshot = this.originalModel = this._register(modelService.createModel(createTextBufferFactoryFromSnapshot(initialContent ? stringToSnapshot(initialContent) : this.modifiedModel.createSnapshot()), languageService.createById(this.modifiedModel.getLanguageId()), this.originalURI, false));
    (async () => {
      const reference = await textModelService.createModelReference(docSnapshot.uri);
      if (this._store.isDisposed) {
        reference.dispose();
        return;
      }
      this._register(reference);
    })();
    this._register(this.modifiedModel.onDidChangeContent((e) => this._mirrorEdits(e)));
    this._register(toDisposable(() => {
      this._clearCurrentEditLineDecoration();
    }));
    const resourceFilter = this._register(new MutableDisposable());
    this._register(autorun((r) => {
      const inProgress = this._lastModifyingResponseInProgressObs.read(r);
      if (inProgress) {
        const res = this._lastModifyingResponseObs.read(r);
        const req = res && res.session.getRequests().find((value) => value.id === res.requestId);
        resourceFilter.value = markerService.installResourceFilter(this.modifiedURI, req?.message.text || localize("default", "Chat Edits"));
      } else {
        resourceFilter.clear();
      }
    }));
  }
  _clearCurrentEditLineDecoration() {
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, []);
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && this.modifiedURI.toString() === snapshot.resource.toString() && this.modifiedModel.getLanguageId() === snapshot.languageId && this.originalModel.getValue() === snapshot.original && this.modifiedModel.getValue() === snapshot.current && this._edit.equals(snapshot.originalToCurrentEdit) && this.state.get() === snapshot.state;
  }
  createSnapshot(requestId, undoStop) {
    return {
      resource: this.modifiedURI,
      languageId: this.modifiedModel.getLanguageId(),
      snapshotUri: ChatEditingSnapshotTextModelContentProvider.getSnapshotFileURI(this._telemetryInfo.sessionId, requestId, undoStop, this.modifiedURI.path),
      original: this.originalModel.getValue(),
      current: this.modifiedModel.getValue(),
      originalToCurrentEdit: this._edit,
      state: this.state.get(),
      telemetryInfo: this._telemetryInfo
    };
  }
  restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this._stateObs.set(snapshot.state, void 0);
    this.originalModel.setValue(snapshot.original);
    if (restoreToDisk) {
      this._setDocValue(snapshot.current);
    }
    this._edit = snapshot.originalToCurrentEdit;
    this._updateDiffInfoSeq();
  }
  resetToInitialContent() {
    this._setDocValue(this.initialContent);
  }
  async _areOriginalAndModifiedIdentical() {
    const diff = await this._diffOperation;
    return diff ? diff.identical : false;
  }
  _resetEditsState(tx) {
    super._resetEditsState(tx);
    this._clearCurrentEditLineDecoration();
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
      this._userEditScheduler.schedule();
      this._updateDiffInfoSeq();
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      const currentState = this._stateObs.get();
      switch (currentState) {
        case 0:
          if (didResetToOriginalContent) {
            this._stateObs.set(2, void 0);
            break;
          }
      }
    }
  }
  _createUndoRedoElement(response) {
    const request = response.session.getRequests().find((req) => req.id === response.requestId);
    const label = request?.message.text ? localize("chatEditing1", "Chat Edit: '{0}'", request.message.text) : localize("chatEditing2", "Chat Edit");
    return new SingleModelEditStackElement(label, "chat.edit", this.modifiedModel, null);
  }
  async acceptAgentEdits(resource, textEdits, isLastEdits, responseModel) {
    assertType(textEdits.every(TextEdit.isTextEdit), "INVALID args, can only handle text edits");
    assert(isEqual(resource, this.modifiedURI), " INVALID args, can only edit THIS document");
    const ops = textEdits.map(TextEdit.asEditOperation);
    const undoEdits = this._applyEdits(ops);
    const maxLineNumber = undoEdits.reduce((max, op) => Math.max(max, op.range.startLineNumber), 0);
    const newDecorations = [
      // decorate pending edit (region)
      {
        options: ChatEditingModifiedDocumentEntry_1._pendingEditDecorationOptions,
        range: new Range(maxLineNumber + 1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
      }
    ];
    if (maxLineNumber > 0) {
      newDecorations.push({
        options: ChatEditingModifiedDocumentEntry_1._lastEditDecorationOptions,
        range: new Range(maxLineNumber, 1, maxLineNumber, Number.MAX_SAFE_INTEGER)
      });
    }
    this._editDecorations = this.modifiedModel.deltaDecorations(this._editDecorations, newDecorations);
    transaction((tx) => {
      if (!isLastEdits) {
        this._stateObs.set(0, tx);
        this._isCurrentlyBeingModifiedByObs.set(responseModel, tx);
        const lineCount = this.modifiedModel.getLineCount();
        this._rewriteRatioObs.set(Math.min(1, maxLineNumber / lineCount), tx);
      } else {
        this._resetEditsState(tx);
        this._updateDiffInfoSeq();
        this._rewriteRatioObs.set(1, tx);
        this._editDecorationClear.schedule();
      }
    });
  }
  async _acceptHunk(change) {
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
      this._stateObs.set(1, void 0);
      this._notifyAction("accepted");
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
    return true;
  }
  async _rejectHunk(change) {
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
      this._stateObs.set(2, void 0);
      this._notifyAction("rejected");
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
    return true;
  }
  _applyEdits(edits) {
    this._isEditFromUs = true;
    try {
      let result = [];
      TextModelChangeRecorder.editWithMetadata({ source: "Chat.applyEdits" }, () => {
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
      return void 0;
    }
    if (this.state.get() !== 0) {
      this._diffInfo.set(nullDocumentDiff, void 0);
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
    if (this.originalModel.isDisposed() || this.modifiedModel.isDisposed()) {
      return void 0;
    }
    if (this.modifiedModel.getVersionId() === docVersionNow && this.originalModel.getVersionId() === snapshotVersionNow) {
      const diff2 = diff ?? nullDocumentDiff;
      this._diffInfo.set(diff2, void 0);
      this._edit = OffsetEdits.fromLineRangeMapping(this.originalModel, this.modifiedModel, diff2.changes);
      return diff2;
    }
    return void 0;
  }
  async _doAccept(tx) {
    this.originalModel.setValue(this.modifiedModel.createSnapshot());
    this._diffInfo.set(nullDocumentDiff, tx);
    this._edit = OffsetEdit.empty;
    await this._collapse(tx);
    const config = this._fileConfigService.getAutoSaveConfiguration(this.modifiedURI);
    if (!config.autoSave || !this._textFileService.isDirty(this.modifiedURI)) {
      try {
        await this._textFileService.save(this.modifiedURI, {
          reason: 1,
          force: true,
          ignoreErrorHandler: true
        });
      } catch {
      }
    }
  }
  async _doReject(tx) {
    if (this.createdInRequestId === this._telemetryInfo.requestId) {
      if (isTextFileEditorModel(this._docFileEditorModel)) {
        await this._docFileEditorModel.revert({ soft: true });
        await this._fileService.del(this.modifiedURI);
      }
      this._onDidDelete.fire();
    } else {
      this._setDocValue(this.originalModel.getValue());
      if (this._allEditsAreFromUs && isTextFileEditorModel(this._docFileEditorModel)) {
        await this._docFileEditorModel.save({ reason: 1, skipSaveParticipants: true });
      }
      await this._collapse(tx);
    }
  }
  _setDocValue(value) {
    if (this.modifiedModel.getValue() !== value) {
      this.modifiedModel.pushStackElement();
      const edit = EditOperation.replace(this.modifiedModel.getFullModelRange(), value);
      this._applyEdits([edit]);
      this._updateDiffInfoSeq();
      this.modifiedModel.pushStackElement();
    }
  }
  async _collapse(transaction2) {
    this._multiDiffEntryDelegate.collapse(transaction2);
  }
  _createEditorIntegration(editor) {
    const codeEditor = getCodeEditor(editor.getControl());
    assertType(codeEditor);
    const diffInfo = this._diffInfo.map((value) => {
      return {
        ...value,
        originalModel: this.originalModel,
        modifiedModel: this.modifiedModel,
        keep: /* @__PURE__ */ __name((changes) => this._acceptHunk(changes), "keep"),
        undo: /* @__PURE__ */ __name((changes) => this._rejectHunk(changes), "undo")
      };
    });
    return this._instantiationService.createInstance(ChatEditingCodeEditorIntegration, this, codeEditor, diffInfo, false);
  }
};
ChatEditingModifiedDocumentEntry = ChatEditingModifiedDocumentEntry_1 = __decorate([
  __param(5, IMarkerService),
  __param(6, IModelService),
  __param(7, ITextModelService),
  __param(8, ILanguageService),
  __param(9, IConfigurationService),
  __param(10, IFilesConfigurationService),
  __param(11, IChatService),
  __param(12, IEditorWorkerService),
  __param(13, ITextFileService),
  __param(14, IFileService),
  __param(15, IUndoRedoService),
  __param(16, IInstantiationService),
  __param(17, IAccessibilitySignalService)
], ChatEditingModifiedDocumentEntry);
export {
  ChatEditingModifiedDocumentEntry
};
//# sourceMappingURL=chatEditingModifiedDocumentEntry.js.map
