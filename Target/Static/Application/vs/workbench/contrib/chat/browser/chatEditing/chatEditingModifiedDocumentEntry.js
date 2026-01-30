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
import { MutableDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { autorun, transaction } from "../../../../../base/common/observable.js";
import { assertType } from "../../../../../base/common/types.js";
import { getCodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { TextEdit as EditorTextEdit } from "../../../../../editor/common/core/edits/textEdit.js";
import { StringText } from "../../../../../editor/common/core/text/abstractText.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { SingleModelEditStackElement } from "../../../../../editor/common/model/editStack.js";
import { createTextBufferFactoryFromSnapshot } from "../../../../../editor/common/model/textModel.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IMarkerService } from "../../../../../platform/markers/common/markers.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { ITextFileService, isTextFileEditorModel, stringToSnapshot } from "../../../../services/textfile/common/textfiles.js";
import { IAiEditTelemetryService } from "../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { ChatEditingCodeEditorIntegration } from "./chatEditingCodeEditorIntegration.js";
import { AbstractChatEditingModifiedFileEntry } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingTextModelChangeService } from "./chatEditingTextModelChangeService.js";
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
let ChatEditingModifiedDocumentEntry = class ChatEditingModifiedDocumentEntry2 extends AbstractChatEditingModifiedFileEntry {
  static {
    __name(this, "ChatEditingModifiedDocumentEntry");
  }
  get changesCount() {
    return this._textModelChangeService.diffInfo.map((diff) => diff.changes.length);
  }
  get diffInfo() {
    return this._textModelChangeService.diffInfo;
  }
  get linesAdded() {
    return this._textModelChangeService.diffInfo.map((diff) => {
      let added = 0;
      for (const c of diff.changes) {
        added += Math.max(0, c.modified.endLineNumberExclusive - c.modified.startLineNumber);
      }
      return added;
    });
  }
  get linesRemoved() {
    return this._textModelChangeService.diffInfo.map((diff) => {
      let removed = 0;
      for (const c of diff.changes) {
        removed += Math.max(0, c.original.endLineNumberExclusive - c.original.startLineNumber);
      }
      return removed;
    });
  }
  constructor(resourceRef, _multiDiffEntryDelegate, telemetryInfo, kind, initialContent, markerService, modelService, textModelService, languageService, configService, fileConfigService, chatService, _textFileService, fileService, undoRedoService, instantiationService, aiEditTelemetryService, _editorWorkerService) {
    super(resourceRef.object.textEditorModel.uri, telemetryInfo, kind, configService, fileConfigService, chatService, fileService, undoRedoService, instantiationService, aiEditTelemetryService);
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this._textFileService = _textFileService;
    this._editorWorkerService = _editorWorkerService;
    this._docFileEditorModel = this._register(resourceRef).object;
    this.modifiedModel = resourceRef.object.textEditorModel;
    this.originalURI = ChatEditingTextModelContentProvider.getFileURI(telemetryInfo.sessionResource, this.entryId, this.modifiedURI.path);
    this.initialContent = initialContent ?? this.modifiedModel.getValue();
    const docSnapshot = this.originalModel = this._register(modelService.createModel(createTextBufferFactoryFromSnapshot(initialContent !== void 0 ? stringToSnapshot(initialContent) : this.modifiedModel.createSnapshot()), languageService.createById(this.modifiedModel.getLanguageId()), this.originalURI, false));
    this._textModelChangeService = this._register(instantiationService.createInstance(ChatEditingTextModelChangeService, this.originalModel, this.modifiedModel, this._stateObs, () => this._isExternalEditInProgress));
    this._register(this._textModelChangeService.onDidAcceptOrRejectAllHunks((action) => {
      this._stateObs.set(action, void 0);
      this._notifySessionAction(action === 1 ? "accepted" : "rejected");
    }));
    this._register(this._textModelChangeService.onDidAcceptOrRejectLines((action) => {
      this._notifyAction({
        kind: "chatEditingHunkAction",
        uri: this.modifiedURI,
        outcome: action.state,
        languageId: this.modifiedModel.getLanguageId(),
        ...action
      });
    }));
    (async () => {
      const reference = await textModelService.createModelReference(docSnapshot.uri);
      if (this._store.isDisposed) {
        reference.dispose();
        return;
      }
      this._register(reference);
    })();
    this._register(this._textModelChangeService.onDidUserEditModel(() => {
      this._userEditScheduler.schedule();
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      if (this._stateObs.get() === 0 && didResetToOriginalContent) {
        this._stateObs.set(2, void 0);
      }
    }));
    const resourceFilter = this._register(new MutableDisposable());
    this._register(autorun((r) => {
      const inProgress = this._waitsForLastEdits.read(r);
      if (inProgress) {
        const res = this._lastModifyingResponseObs.read(r);
        const req = res && res.session.getRequests().find((value) => value.id === res.requestId);
        resourceFilter.value = markerService.installResourceFilter(this.modifiedURI, req?.message.text || localize("default", "Chat Edits"));
      } else {
        resourceFilter.clear();
      }
    }));
  }
  getDiffInfo() {
    return this._textModelChangeService.getDiffInfo();
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && this.modifiedURI.toString() === snapshot.resource.toString() && this.modifiedModel.getLanguageId() === snapshot.languageId && this.originalModel.getValue() === snapshot.original && this.modifiedModel.getValue() === snapshot.current && this.state.get() === snapshot.state;
  }
  createSnapshot(chatSessionResource, requestId, undoStop) {
    return {
      resource: this.modifiedURI,
      languageId: this.modifiedModel.getLanguageId(),
      snapshotUri: ChatEditingSnapshotTextModelContentProvider.getSnapshotFileURI(chatSessionResource, requestId, undoStop, this.modifiedURI.path),
      original: this.originalModel.getValue(),
      current: this.modifiedModel.getValue(),
      state: this.state.get(),
      telemetryInfo: this._telemetryInfo
    };
  }
  getCurrentContents() {
    return this.modifiedModel.getValue();
  }
  hasModificationAt(location) {
    return location.uri.toString() === this.modifiedModel.uri.toString() && this._textModelChangeService.hasHunkAt(location.range);
  }
  async restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this._stateObs.set(snapshot.state, void 0);
    await this._textModelChangeService.resetDocumentValues(snapshot.original, restoreToDisk ? snapshot.current : void 0);
  }
  async resetToInitialContent() {
    await this._textModelChangeService.resetDocumentValues(void 0, this.initialContent);
  }
  async _areOriginalAndModifiedIdentical() {
    return this._textModelChangeService.areOriginalAndModifiedIdentical();
  }
  _resetEditsState(tx) {
    super._resetEditsState(tx);
    this._textModelChangeService.clearCurrentEditLineDecoration();
  }
  _createUndoRedoElement(response) {
    const request = response.session.getRequests().find((req) => req.id === response.requestId);
    const label = request?.message.text ? localize("chatEditing1", "Chat Edit: '{0}'", request.message.text) : localize("chatEditing2", "Chat Edit");
    return new SingleModelEditStackElement(label, "chat.edit", this.modifiedModel, null);
  }
  async acceptAgentEdits(resource, textEdits, isLastEdits, responseModel) {
    const result = await this._textModelChangeService.acceptAgentEdits(resource, textEdits, isLastEdits, responseModel);
    transaction((tx) => {
      this._waitsForLastEdits.set(!isLastEdits, tx);
      this._stateObs.set(0, tx);
      if (!isLastEdits) {
        this._rewriteRatioObs.set(result.rewriteRatio, tx);
      } else {
        this._resetEditsState(tx);
        this._rewriteRatioObs.set(1, tx);
      }
    });
    if (isLastEdits && this._shouldAutoSave()) {
      await this._textFileService.save(this.modifiedModel.uri, {
        reason: 2,
        skipSaveParticipants: true
      });
    }
  }
  async _doAccept() {
    this._textModelChangeService.keep();
    this._multiDiffEntryDelegate.collapse(void 0);
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
  async _doReject() {
    if (this.createdInRequestId === this._telemetryInfo.requestId) {
      if (isTextFileEditorModel(this._docFileEditorModel)) {
        await this._docFileEditorModel.revert({ soft: true });
        await this._fileService.del(this.modifiedURI).catch((err) => {
        });
      }
      this._onDidDelete.fire();
    } else {
      this._textModelChangeService.undo();
      if (this._textModelChangeService.allEditsAreFromUs && isTextFileEditorModel(this._docFileEditorModel) && this._shouldAutoSave()) {
        await this._docFileEditorModel.save({ reason: 1, skipSaveParticipants: true });
      }
      this._multiDiffEntryDelegate.collapse(void 0);
    }
  }
  _createEditorIntegration(editor) {
    const codeEditor = getCodeEditor(editor.getControl());
    assertType(codeEditor);
    const diffInfo = this._textModelChangeService.diffInfo;
    return this._instantiationService.createInstance(ChatEditingCodeEditorIntegration, this, codeEditor, diffInfo, false);
  }
  _shouldAutoSave() {
    return this.modifiedURI.scheme !== Schemas.untitled;
  }
  async computeEditsFromSnapshots(beforeSnapshot, afterSnapshot) {
    const stringEdit = await this._editorWorkerService.computeStringEditFromDiff(beforeSnapshot, afterSnapshot, { maxComputationTimeMs: 5e3 }, "advanced");
    const editorTextEdit = EditorTextEdit.fromStringEdit(stringEdit, new StringText(beforeSnapshot));
    return editorTextEdit.replacements.slice();
  }
  async save() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    if (this._textFileService.isDirty(this.modifiedModel.uri)) {
      await this._textFileService.save(this.modifiedModel.uri, {
        reason: 1,
        skipSaveParticipants: true
      });
    }
  }
  async revertToDisk() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    const fileModel = this._textFileService.files.get(this.modifiedModel.uri);
    if (fileModel && !fileModel.isDisposed()) {
      await fileModel.revert({ soft: false });
    }
  }
};
ChatEditingModifiedDocumentEntry = __decorate([
  __param(5, IMarkerService),
  __param(6, IModelService),
  __param(7, ITextModelService),
  __param(8, ILanguageService),
  __param(9, IConfigurationService),
  __param(10, IFilesConfigurationService),
  __param(11, IChatService),
  __param(12, ITextFileService),
  __param(13, IFileService),
  __param(14, IUndoRedoService),
  __param(15, IInstantiationService),
  __param(16, IAiEditTelemetryService),
  __param(17, IEditorWorkerService)
], ChatEditingModifiedDocumentEntry);
export {
  ChatEditingModifiedDocumentEntry
};
//# sourceMappingURL=chatEditingModifiedDocumentEntry.js.map
