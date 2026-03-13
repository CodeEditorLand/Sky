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
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { constObservable, observableValue, transaction } from "../../../../../base/common/observable.js";
import { LineRange } from "../../../../../editor/common/core/ranges/lineRange.js";
import { DetailedLineRangeMapping } from "../../../../../editor/common/diff/rangeMapping.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { createTextBufferFactoryFromSnapshot } from "../../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IUndoRedoService } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { IFilesConfigurationService } from "../../../../services/filesConfiguration/common/filesConfigurationService.js";
import { stringToSnapshot } from "../../../../services/textfile/common/textfiles.js";
import { IAiEditTelemetryService } from "../../../editTelemetry/browser/telemetry/aiEditTelemetry/aiEditTelemetryService.js";
import { IChatService } from "../../common/chatService/chatService.js";
import { AbstractChatEditingModifiedFileEntry } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
let ChatEditingDeletedFileEntry = class ChatEditingDeletedFileEntry2 extends AbstractChatEditingModifiedFileEntry {
  static {
    __name(this, "ChatEditingDeletedFileEntry");
  }
  constructor(resource, originalContent, _multiDiffEntryDelegate, telemetryInfo, _languageId, _modelService, _languageService, configService, fileConfigService, chatService, fileService, undoRedoService, instantiationService, aiEditTelemetryService) {
    super(resource, telemetryInfo, 2, configService, fileConfigService, chatService, fileService, undoRedoService, instantiationService, aiEditTelemetryService);
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this._languageId = _languageId;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this.linesAdded = constObservable(0);
    this._changesCount = observableValue(this, 1);
    this.changesCount = this._changesCount;
    this.isDeletion = true;
    this._originalContent = originalContent;
    this.initialContent = originalContent;
    this.originalURI = ChatEditingTextModelContentProvider.getFileURI(telemetryInfo.sessionResource, this.entryId, resource.path);
    this.diffInfo = constObservable(this._diffInfo());
    this.linesRemoved = constObservable(this._getOrCreateOriginalModel().getLineCount());
  }
  dispose() {
    this._originalModel?.dispose();
    this._modifiedModel?.dispose();
    super.dispose();
  }
  /**
   * Gets or creates the original model for diff display.
   */
  _getOrCreateOriginalModel() {
    if (!this._originalModel || this._originalModel.isDisposed()) {
      this._originalModel = this._modelService.createModel(createTextBufferFactoryFromSnapshot(stringToSnapshot(this._originalContent)), this._languageService.createById(this._languageId), this.originalURI, false);
    }
    return this._originalModel;
  }
  /**
   * Gets or creates an empty model representing the deleted state.
   */
  _getOrCreateModifiedModel() {
    if (!this._modifiedModel || this._modifiedModel.isDisposed()) {
      this._modifiedModel = this._modelService.createModel("", this._languageService.createById(this._languageId), this.modifiedURI.with({ scheme: "deleted-file" }), false);
    }
    return this._modifiedModel;
  }
  _diffInfo() {
    const originalModel = this._getOrCreateOriginalModel();
    this._getOrCreateModifiedModel();
    const originalLineCount = originalModel.getLineCount();
    return {
      changes: [new DetailedLineRangeMapping(new LineRange(1, originalLineCount + 1), new LineRange(1, 1), void 0)],
      quitEarly: false,
      identical: false,
      moves: []
    };
  }
  getDiffInfo() {
    return Promise.resolve(this._diffInfo());
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && this.modifiedURI.toString() === snapshot.resource.toString() && this._languageId === snapshot.languageId && this._originalContent === snapshot.original && snapshot.current === "" && this.state.get() === snapshot.state;
  }
  createSnapshot(chatSessionResource, requestId, undoStop) {
    return {
      resource: this.modifiedURI,
      languageId: this._languageId,
      snapshotUri: this.originalURI,
      original: this._originalContent,
      current: "",
      // File is deleted, so current content is empty
      state: this.state.get(),
      telemetryInfo: this._telemetryInfo,
      isDeleted: true
    };
  }
  async restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this._stateObs.set(snapshot.state, void 0);
    if (restoreToDisk && snapshot.current !== "") {
      await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(snapshot.current));
    }
  }
  async resetToInitialContent() {
    await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
  }
  async _areOriginalAndModifiedIdentical() {
    return this._originalContent === "";
  }
  _createUndoRedoElement(response) {
    return {
      type: 0,
      resource: this.modifiedURI,
      label: "Chat File Deletion",
      code: "chat.delete",
      undo: /* @__PURE__ */ __name(async () => {
        await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
      }, "undo"),
      redo: /* @__PURE__ */ __name(async () => {
        await this._fileService.del(this.modifiedURI, { useTrash: false });
      }, "redo")
    };
  }
  async acceptAgentEdits(_uri, _edits, isLastEdits, _responseModel) {
    transaction((tx) => {
      this._waitsForLastEdits.set(!isLastEdits, tx);
      this._stateObs.set(0, tx);
      if (isLastEdits) {
        this._resetEditsState(tx);
        this._rewriteRatioObs.set(1, tx);
      }
    });
  }
  async _doAccept() {
    this._multiDiffEntryDelegate.collapse(void 0);
  }
  async _doReject() {
    await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
    this._multiDiffEntryDelegate.collapse(void 0);
  }
  _createEditorIntegration(_editor) {
    return {
      currentIndex: observableValue(this, 0),
      reveal: /* @__PURE__ */ __name(() => {
      }, "reveal"),
      next: /* @__PURE__ */ __name(() => false, "next"),
      previous: /* @__PURE__ */ __name(() => false, "previous"),
      enableAccessibleDiffView: /* @__PURE__ */ __name(() => {
      }, "enableAccessibleDiffView"),
      acceptNearestChange: /* @__PURE__ */ __name(async () => {
      }, "acceptNearestChange"),
      rejectNearestChange: /* @__PURE__ */ __name(async () => {
      }, "rejectNearestChange"),
      toggleDiff: /* @__PURE__ */ __name(async () => {
      }, "toggleDiff"),
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
  async computeEditsFromSnapshots(_beforeSnapshot, _afterSnapshot) {
    return [];
  }
  async save() {
  }
  async revertToDisk() {
  }
};
ChatEditingDeletedFileEntry = __decorate([
  __param(5, IModelService),
  __param(6, ILanguageService),
  __param(7, IConfigurationService),
  __param(8, IFilesConfigurationService),
  __param(9, IChatService),
  __param(10, IFileService),
  __param(11, IUndoRedoService),
  __param(12, IInstantiationService),
  __param(13, IAiEditTelemetryService)
], ChatEditingDeletedFileEntry);
export {
  ChatEditingDeletedFileEntry
};
//# sourceMappingURL=chatEditingDeletedFileEntry.js.map
