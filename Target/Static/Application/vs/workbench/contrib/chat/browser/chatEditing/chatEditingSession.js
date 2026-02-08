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
var ChatEditingSession_1;
import { DeferredPromise, Sequencer, SequencerByKey, timeout } from "../../../../../base/common/async.js";
import { VSBuffer } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, dispose } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { derived, observableValue, transaction } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { hasKey } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { IBulkEditService } from "../../../../../editor/browser/services/bulkEditService.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { EditorActivation } from "../../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { MultiDiffEditorInput } from "../../../multiDiffEditor/browser/multiDiffEditorInput.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { chatEditingSessionIsReady, getMultiDiffSourceUri } from "../../common/editing/chatEditingService.js";
import { ChatAgentLocation } from "../../common/constants.js";
import { ChatEditingCheckpointTimelineImpl } from "./chatEditingCheckpointTimelineImpl.js";
import { ChatEditingDeletedFileEntry } from "./chatEditingDeletedFileEntry.js";
import { ChatEditingModifiedDocumentEntry } from "./chatEditingModifiedDocumentEntry.js";
import { AbstractChatEditingModifiedFileEntry } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingModifiedNotebookEntry } from "./chatEditingModifiedNotebookEntry.js";
import { FileOperationType } from "./chatEditingOperations.js";
import { IChatEditingExplanationModelManager } from "./chatEditingExplanationModelManager.js";
import { ChatEditingSessionStorage } from "./chatEditingSessionStorage.js";
import { ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
import { getChatSessionType } from "../../common/model/chatUri.js";
import { AgentSessionProviders } from "../agentSessions/agentSessions.js";
var NotExistBehavior;
(function(NotExistBehavior2) {
  NotExistBehavior2[NotExistBehavior2["Create"] = 0] = "Create";
  NotExistBehavior2[NotExistBehavior2["Abort"] = 1] = "Abort";
})(NotExistBehavior || (NotExistBehavior = {}));
class ThrottledSequencer extends Sequencer {
  static {
    __name(this, "ThrottledSequencer");
  }
  constructor(_minDuration, _maxOverallDelay) {
    super();
    this._minDuration = _minDuration;
    this._maxOverallDelay = _maxOverallDelay;
    this._size = 0;
  }
  queue(promiseTask) {
    this._size += 1;
    const noDelay = this._size * this._minDuration > this._maxOverallDelay;
    return super.queue(async () => {
      try {
        const p1 = promiseTask();
        const p2 = noDelay ? Promise.resolve(void 0) : timeout(this._minDuration, CancellationToken.None);
        const [result] = await Promise.all([p1, p2]);
        return result;
      } finally {
        this._size -= 1;
      }
    });
  }
}
function createOpeningEditCodeBlock(uri, isNotebook, undoStopId) {
  return [
    {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    },
    {
      kind: "codeblockUri",
      uri,
      isEdit: true,
      undoStopId
    },
    {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    },
    isNotebook ? {
      kind: "notebookEdit",
      uri,
      edits: [],
      done: false,
      isExternalEdit: true
    } : {
      kind: "textEdit",
      uri,
      edits: [],
      done: false,
      isExternalEdit: true
    }
  ];
}
__name(createOpeningEditCodeBlock, "createOpeningEditCodeBlock");
let ChatEditingSession = ChatEditingSession_1 = class ChatEditingSession2 extends Disposable {
  static {
    __name(this, "ChatEditingSession");
  }
  get state() {
    return this._state;
  }
  get requestDisablement() {
    return this._timeline.requestDisablement;
  }
  get onDidDispose() {
    this._assertNotDisposed();
    return this._onDidDispose.event;
  }
  constructor(chatSessionResource, isGlobalEditingSession, _lookupExternalEntry, transferFrom, _instantiationService, _modelService, _languageService, _textModelService, _bulkEditService, _editorGroupsService, _editorService, _notebookService, _accessibilitySignalService, _logService, configurationService, _fileService, _explanationModelManager) {
    super();
    this.chatSessionResource = chatSessionResource;
    this.isGlobalEditingSession = isGlobalEditingSession;
    this._lookupExternalEntry = _lookupExternalEntry;
    this._instantiationService = _instantiationService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._textModelService = _textModelService;
    this._bulkEditService = _bulkEditService;
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._notebookService = _notebookService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._logService = _logService;
    this.configurationService = configurationService;
    this._fileService = _fileService;
    this._explanationModelManager = _explanationModelManager;
    this._state = observableValue(
      this,
      0
      /* ChatEditingSessionState.Initial */
    );
    this._initialFileContents = new ResourceMap();
    this._baselineCreationLocks = new SequencerByKey();
    this._streamingEditLocks = new SequencerByKey();
    this._externalEditOperations = /* @__PURE__ */ new Map();
    this._entriesObs = observableValue(this, []);
    this.entries = derived((reader) => {
      const state = this._state.read(reader);
      if (state === 3 || state === 0) {
        return [];
      } else {
        return this._entriesObs.read(reader);
      }
    });
    this._onDidDispose = new Emitter();
    this._timeline = this._instantiationService.createInstance(ChatEditingCheckpointTimelineImpl, chatSessionResource, this._getTimelineDelegate());
    this.canRedo = this._timeline.canRedo.map(
      (hasHistory, reader) => hasHistory && this._state.read(reader) === 2
      /* ChatEditingSessionState.Idle */
    );
    this.canUndo = this._timeline.canUndo.map(
      (hasHistory, reader) => hasHistory && this._state.read(reader) === 2
      /* ChatEditingSessionState.Idle */
    );
    this._init(transferFrom);
  }
  _getTimelineDelegate() {
    return {
      createFile: /* @__PURE__ */ __name((uri, content) => {
        return this._bulkEditService.apply({
          edits: [{
            newResource: uri,
            options: {
              overwrite: true,
              contents: content ? Promise.resolve(VSBuffer.fromString(content)) : void 0
            }
          }]
        });
      }, "createFile"),
      deleteFile: /* @__PURE__ */ __name(async (uri) => {
        const entries = this._entriesObs.get().filter((e) => !isEqual(e.modifiedURI, uri));
        this._entriesObs.set(entries, void 0);
        await this._bulkEditService.apply({ edits: [{ oldResource: uri, options: { ignoreIfNotExists: true } }] });
      }, "deleteFile"),
      renameFile: /* @__PURE__ */ __name(async (fromUri, toUri) => {
        const entries = this._entriesObs.get();
        const previousEntry = entries.find((e) => isEqual(e.modifiedURI, fromUri));
        if (previousEntry) {
          const newEntry = await this._getOrCreateModifiedFileEntry(toUri, 0, previousEntry.telemetryInfo, this._getCurrentTextOrNotebookSnapshot(previousEntry));
          previousEntry.dispose();
          this._entriesObs.set(entries.map((e) => e === previousEntry ? newEntry : e), void 0);
        }
      }, "renameFile"),
      setContents: /* @__PURE__ */ __name(async (uri, content, telemetryInfo) => {
        const entry = await this._getOrCreateModifiedFileEntry(uri, 0, telemetryInfo);
        const state = entry.state.get();
        if (entry instanceof ChatEditingModifiedNotebookEntry) {
          await entry.restoreModifiedModelFromSnapshot(content);
        } else {
          await entry.acceptAgentEdits(uri, [{ range: new Range(1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), text: content }], true, void 0);
        }
        if (state !== 0) {
          await entry.accept();
        }
      }, "setContents")
    };
  }
  async _init(transferFrom) {
    const storage = this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource);
    let restoredSessionState;
    if (transferFrom instanceof ChatEditingSession_1) {
      restoredSessionState = transferFrom._getStoredState(this.chatSessionResource);
    } else {
      restoredSessionState = await storage.restoreState().catch((err) => {
        this._logService.error(`Error restoring chat editing session state for ${this.chatSessionResource}`, err);
        return void 0;
      });
      if (this._store.isDisposed) {
        return;
      }
    }
    if (restoredSessionState) {
      for (const [uri, content] of restoredSessionState.initialFileContents) {
        this._initialFileContents.set(uri, content);
      }
      if (restoredSessionState.timeline) {
        transaction((tx) => this._timeline.restoreFromState(restoredSessionState.timeline, tx));
      }
      await this._initEntries(restoredSessionState.recentSnapshot);
    }
    this._state.set(2, void 0);
  }
  _getEntry(uri) {
    uri = CellUri.parse(uri)?.notebook ?? uri;
    return this._entriesObs.get().find((e) => isEqual(e.modifiedURI, uri));
  }
  getEntry(uri) {
    return this._getEntry(uri);
  }
  readEntry(uri, reader) {
    uri = CellUri.parse(uri)?.notebook ?? uri;
    return this._entriesObs.read(reader).find((e) => isEqual(e.modifiedURI, uri));
  }
  storeState() {
    const storage = this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource);
    return storage.storeState(this._getStoredState());
  }
  _getStoredState(sessionResource = this.chatSessionResource) {
    const entries = new ResourceMap();
    for (const entry of this._entriesObs.get()) {
      entries.set(entry.modifiedURI, entry.createSnapshot(sessionResource, void 0, void 0));
    }
    const state = {
      initialFileContents: this._initialFileContents,
      timeline: this._timeline.getStateForPersistence(),
      recentSnapshot: { entries, stopId: void 0 }
    };
    return state;
  }
  getEntryDiffBetweenStops(uri, requestId, stopId) {
    return this._timeline.getEntryDiffBetweenStops(uri, requestId, stopId);
  }
  getEntryDiffBetweenRequests(uri, startRequestId, stopRequestId) {
    return this._timeline.getEntryDiffBetweenRequests(uri, startRequestId, stopRequestId);
  }
  getDiffsForFilesInSession() {
    return this._timeline.getDiffsForFilesInSession();
  }
  getDiffForSession() {
    return this._timeline.getDiffForSession();
  }
  getDiffsForFilesInRequest(requestId) {
    return this._timeline.getDiffsForFilesInRequest(requestId);
  }
  hasEditsInRequest(requestId, reader) {
    return this._timeline.hasEditsInRequest(requestId, reader);
  }
  createSnapshot(requestId, undoStop) {
    const label = undoStop ? `Request ${requestId} - Stop ${undoStop}` : `Request ${requestId}`;
    this._timeline.createCheckpoint(requestId, undoStop, label);
  }
  async getSnapshotContents(requestId, uri, stopId) {
    const content = await this._timeline.getContentAtStop(requestId, uri, stopId);
    return typeof content === "string" ? VSBuffer.fromString(content) : content;
  }
  async getSnapshotModel(requestId, undoStop, snapshotUri) {
    await this._baselineCreationLocks.peek(snapshotUri.path);
    const content = await this._timeline.getContentAtStop(requestId, snapshotUri, undoStop);
    if (content === void 0) {
      return null;
    }
    const contentStr = typeof content === "string" ? content : content.toString();
    const model = this._modelService.createModel(contentStr, this._languageService.createByFilepathOrFirstLine(snapshotUri), snapshotUri, false);
    const store = new DisposableStore();
    store.add(model.onWillDispose(() => store.dispose()));
    store.add(this._timeline.onDidChangeContentsAtStop(requestId, snapshotUri, undoStop, (c) => model.setValue(c)));
    return model;
  }
  getSnapshotUri(requestId, uri, stopId) {
    return this._timeline.getContentURIAtStop(requestId, uri, stopId);
  }
  async restoreSnapshot(requestId, stopId) {
    const checkpointId = this._timeline.getCheckpointIdForRequest(requestId, stopId);
    if (checkpointId) {
      await this._timeline.navigateToCheckpoint(checkpointId);
    }
  }
  _assertNotDisposed() {
    if (this._state.get() === 3) {
      throw new BugIndicatingError(`Cannot access a disposed editing session`);
    }
  }
  async accept(...uris) {
    if (await this._operateEntry("accept", uris)) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
    }
  }
  async reject(...uris) {
    if (await this._operateEntry("reject", uris)) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
    }
  }
  async _operateEntry(action, uris) {
    this._assertNotDisposed();
    const applicableEntries = this._entriesObs.get().filter((e) => uris.length === 0 || uris.some((u) => isEqual(u, e.modifiedURI))).filter((e) => !e.isCurrentlyBeingModifiedBy.get()).filter(
      (e) => e.state.get() === 0
      /* ModifiedFileEntryState.Modified */
    );
    if (applicableEntries.length === 0) {
      return 0;
    }
    const method = action === "accept" ? "acceptDeferred" : "rejectDeferred";
    const transitionCallbacks = await Promise.all(applicableEntries.map((entry) => entry[method]().catch((err) => {
      this._logService.error(`Error calling ${method} on entry ${entry.modifiedURI}`, err);
    })));
    transaction((tx) => {
      transitionCallbacks.forEach((callback) => callback?.(tx));
    });
    return applicableEntries.length;
  }
  async show(previousChanges) {
    this._assertNotDisposed();
    if (this._editorPane) {
      if (this._editorPane.isVisible()) {
        return;
      } else if (this._editorPane.input) {
        await this._editorGroupsService.activeGroup.openEditor(this._editorPane.input, { pinned: true, activation: EditorActivation.ACTIVATE });
        return;
      }
    }
    const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
      multiDiffSource: getMultiDiffSourceUri(this, previousChanges),
      label: localize("multiDiffEditorInput.name", "Suggested Edits")
    }, this._instantiationService);
    this._editorPane = await this._editorGroupsService.activeGroup.openEditor(input, { pinned: true, activation: EditorActivation.ACTIVATE });
  }
  async stop(clearState = false) {
    this._stopPromise ??= Promise.allSettled([this._performStop(), this.storeState()]).then(() => {
    });
    await this._stopPromise;
    if (clearState) {
      await this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource).clearState();
    }
  }
  async _performStop() {
    const schemes = [AbstractChatEditingModifiedFileEntry.scheme, ChatEditingTextModelContentProvider.scheme];
    await Promise.allSettled(this._editorGroupsService.groups.flatMap(async (g) => {
      return g.editors.map(async (e) => {
        if (e instanceof MultiDiffEditorInput && e.initialResources?.some((r) => r.originalUri && schemes.indexOf(r.originalUri.scheme) !== -1) || e instanceof DiffEditorInput && e.original.resource && schemes.indexOf(e.original.resource.scheme) !== -1) {
          await g.closeEditor(e);
        }
      });
    }));
  }
  dispose() {
    this._assertNotDisposed();
    this.clearExplanations();
    dispose(this._entriesObs.get());
    super.dispose();
    this._state.set(3, void 0);
    this._onDidDispose.fire();
    this._onDidDispose.dispose();
  }
  get isDisposed() {
    return this._state.get() === 3;
  }
  startStreamingEdits(resource, responseModel, inUndoStop) {
    const completePromise = new DeferredPromise();
    const startPromise = new DeferredPromise();
    const sequencer = new ThrottledSequencer(15, 1e3);
    sequencer.queue(() => startPromise.p);
    this._baselineCreationLocks.queue(resource.path, () => startPromise.p);
    this._streamingEditLocks.queue(resource.toString(), async () => {
      await chatEditingSessionIsReady(this);
      if (!this.isDisposed) {
        await this._acceptStreamingEditsStart(responseModel, inUndoStop, resource);
      }
      startPromise.complete();
      return completePromise.p;
    });
    let didComplete = false;
    return {
      pushText: /* @__PURE__ */ __name((edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, edits, isLastEdits, responseModel);
          }
        });
      }, "pushText"),
      pushNotebookCellText: /* @__PURE__ */ __name((cell, edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(cell, edits, isLastEdits, responseModel);
          }
        });
      }, "pushNotebookCellText"),
      pushNotebook: /* @__PURE__ */ __name((edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, edits, isLastEdits, responseModel);
          }
        });
      }, "pushNotebook"),
      complete: /* @__PURE__ */ __name(() => {
        if (didComplete) {
          return;
        }
        didComplete = true;
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, [], true, responseModel);
            await this._resolve(responseModel.requestId, inUndoStop, resource);
            completePromise.complete();
          }
        });
      }, "complete")
    };
  }
  startDeletion(resource, responseModel, undoStopId) {
    this._assertNotDisposed();
    this._streamingEditLocks.queue(resource.toString(), async () => {
      if (this.isDisposed) {
        return;
      }
      await chatEditingSessionIsReady(this);
      let fileContent;
      try {
        const content = await this._fileService.readFile(resource);
        fileContent = content.value.toString();
      } catch (e) {
        this._logService.warn(`Cannot delete file ${resource.toString()}: file does not exist`);
        return;
      }
      const existingEntry = this._getEntry(resource);
      if (existingEntry) {
        existingEntry.dispose();
        const entries2 = this._entriesObs.get().filter((e) => e !== existingEntry);
        this._entriesObs.set(entries2, void 0);
      }
      if (!this._initialFileContents.has(resource)) {
        this._initialFileContents.set(resource, fileContent);
      }
      await this._bulkEditService.apply({
        edits: [{ oldResource: resource, options: { ignoreIfNotExists: true } }]
      });
      this._timeline.recordFileOperation({
        type: FileOperationType.Delete,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        finalContent: fileContent
      });
      const telemetryInfo = this._getTelemetryInfoForModel(responseModel);
      const languageSelection = this._languageService.createByFilepathOrFirstLine(resource);
      const entry = this._instantiationService.createInstance(ChatEditingDeletedFileEntry, resource, fileContent, { collapse: /* @__PURE__ */ __name((tx) => this._collapse(resource, tx), "collapse") }, telemetryInfo, languageSelection.languageId);
      const entries = [...this._entriesObs.get(), entry];
      this._entriesObs.set(entries, void 0);
    });
  }
  applyWorkspaceEdit(edit, responseModel, undoStopId) {
    for (const fileEdit of edit.edits) {
      if (fileEdit.oldResource && !fileEdit.newResource) {
        this.startDeletion(fileEdit.oldResource, responseModel, undoStopId);
      }
    }
  }
  async startExternalEdits(responseModel, operationId, resources, undoStopId) {
    const snapshots = new ResourceMap();
    const acquiredLockPromises = [];
    const releaseLockPromises = [];
    const progress = [];
    const telemetryInfo = this._getTelemetryInfoForModel(responseModel);
    await chatEditingSessionIsReady(this);
    for (const resource of resources) {
      const releaseLock = new DeferredPromise();
      releaseLockPromises.push(releaseLock);
      const acquiredLock = new DeferredPromise();
      acquiredLockPromises.push(acquiredLock);
      this._streamingEditLocks.queue(resource.toString(), async () => {
        if (this.isDisposed) {
          acquiredLock.complete();
          return;
        }
        const entry = await this._getOrCreateModifiedFileEntry(resource, 1, telemetryInfo);
        if (entry) {
          await this._acceptStreamingEditsStart(responseModel, undoStopId, resource);
        }
        const notebookUri = CellUri.parse(resource)?.notebook || resource;
        progress.push(...createOpeningEditCodeBlock(resource, this._notebookService.hasSupportedNotebooks(notebookUri), undoStopId));
        await entry?.save();
        snapshots.set(resource, entry && this._getCurrentTextOrNotebookSnapshot(entry));
        entry?.startExternalEdit();
        acquiredLock.complete();
        return releaseLock.p;
      });
    }
    await Promise.all(acquiredLockPromises.map((p) => p.p));
    this.createSnapshot(responseModel.requestId, undoStopId);
    this._externalEditOperations.set(operationId, {
      responseModel,
      snapshots,
      undoStopId,
      releaseLocks: /* @__PURE__ */ __name(() => releaseLockPromises.forEach((p) => p.complete()), "releaseLocks")
    });
    return progress;
  }
  async stopExternalEdits(responseModel, operationId) {
    const operation = this._externalEditOperations.get(operationId);
    if (!operation) {
      this._logService.warn(`stopExternalEdits called for unknown operation ${operationId}`);
      return [];
    }
    this._externalEditOperations.delete(operationId);
    const progress = [];
    try {
      for (const [resource, beforeSnapshot] of operation.snapshots) {
        let entry = this._getEntry(resource);
        if (!entry && beforeSnapshot === void 0) {
          entry = await this._getOrCreateModifiedFileEntry(resource, 1, this._getTelemetryInfoForModel(responseModel), "");
          if (entry) {
            entry.startExternalEdit();
            entry.acceptStreamingEditsStart(responseModel, operation.undoStopId, void 0);
          }
        }
        if (!entry) {
          continue;
        }
        await entry.revertToDisk();
        const afterSnapshot = this._getCurrentTextOrNotebookSnapshot(entry);
        let edits = [];
        if (beforeSnapshot === void 0) {
          this._timeline.recordFileOperation({
            type: FileOperationType.Create,
            uri: resource,
            requestId: responseModel.requestId,
            epoch: this._timeline.incrementEpoch(),
            initialContent: afterSnapshot,
            telemetryInfo: entry.telemetryInfo
          });
        } else {
          edits = await entry.computeEditsFromSnapshots(beforeSnapshot, afterSnapshot);
          this._recordEditOperations(entry, resource, edits, responseModel);
        }
        progress.push(entry instanceof ChatEditingModifiedNotebookEntry ? {
          kind: "notebookEdit",
          uri: resource,
          edits,
          done: true,
          isExternalEdit: true
        } : {
          kind: "textEdit",
          uri: resource,
          edits,
          done: true,
          isExternalEdit: true
        });
        await entry.acceptStreamingEditsEnd();
        if (getChatSessionType(this.chatSessionResource) === AgentSessionProviders.Background) {
          await entry.accept();
        }
        entry.stopExternalEdit();
      }
    } finally {
      operation.releaseLocks();
      const hasOtherTasks = Iterable.some(this._streamingEditLocks.keys(), (k) => !operation.snapshots.has(URI.parse(k)));
      if (!hasOtherTasks) {
        this._state.set(2, void 0);
      }
    }
    return progress;
  }
  async undoInteraction() {
    await this._timeline.undoToLastCheckpoint();
  }
  async redoInteraction() {
    await this._timeline.redoToNextCheckpoint();
  }
  async triggerExplanationGeneration() {
    this.clearExplanations();
    const entries = this._entriesObs.get();
    const diffInfos = [];
    for (const entry of entries) {
      if (entry instanceof ChatEditingModifiedDocumentEntry) {
        const diff = await entry.getDiffInfo();
        diffInfos.push({
          changes: diff.changes,
          identical: diff.identical,
          originalModel: entry.originalModel,
          modifiedModel: entry.modifiedModel
        });
      }
    }
    if (diffInfos.length > 0) {
      this._explanationHandle = this._explanationModelManager.generateExplanations(diffInfos, this.chatSessionResource, CancellationToken.None);
      await this._explanationHandle.completed;
    }
  }
  clearExplanations() {
    if (this._explanationHandle) {
      this._explanationHandle.dispose();
      this._explanationHandle = void 0;
    }
  }
  hasExplanations() {
    return this._explanationHandle !== void 0;
  }
  _recordEditOperations(entry, resource, edits, responseModel) {
    const isNotebookEdits = edits.length > 0 && hasKey(edits[0], { cells: true });
    if (isNotebookEdits) {
      const notebookEdits = edits;
      this._timeline.recordFileOperation({
        type: FileOperationType.NotebookEdit,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        cellEdits: notebookEdits
      });
    } else {
      let cellIndex;
      if (entry instanceof ChatEditingModifiedNotebookEntry) {
        const cellUri = CellUri.parse(resource);
        if (cellUri) {
          const i = entry.getIndexOfCellHandle(cellUri.handle);
          if (i !== -1) {
            cellIndex = i;
          }
        }
      }
      const textEdits = edits;
      this._timeline.recordFileOperation({
        type: FileOperationType.TextEdit,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        edits: textEdits,
        cellIndex
      });
    }
  }
  _getCurrentTextOrNotebookSnapshot(entry) {
    if (entry instanceof ChatEditingModifiedNotebookEntry) {
      return entry.getCurrentSnapshot();
    } else if (entry instanceof ChatEditingModifiedDocumentEntry) {
      return entry.getCurrentContents();
    } else if (entry instanceof ChatEditingDeletedFileEntry) {
      return "";
    } else {
      throw new Error(`unknown entry type for ${entry.modifiedURI}`);
    }
  }
  async _acceptStreamingEditsStart(responseModel, undoStop, resource) {
    const entry = await this._getOrCreateModifiedFileEntry(resource, 0, this._getTelemetryInfoForModel(responseModel));
    if (!this._timeline.hasFileBaseline(resource, responseModel.requestId)) {
      this._timeline.recordFileBaseline({
        uri: resource,
        requestId: responseModel.requestId,
        content: this._getCurrentTextOrNotebookSnapshot(entry),
        epoch: this._timeline.incrementEpoch(),
        telemetryInfo: entry.telemetryInfo,
        notebookViewType: entry instanceof ChatEditingModifiedNotebookEntry ? entry.viewType : void 0
      });
    }
    transaction((tx) => {
      this._state.set(1, tx);
      entry.acceptStreamingEditsStart(responseModel, undoStop, tx);
    });
    return entry;
  }
  async _initEntries({ entries }) {
    for (const entry of this._entriesObs.get()) {
      const snapshotEntry = entries.get(entry.modifiedURI);
      if (!snapshotEntry) {
        await entry.resetToInitialContent();
        entry.dispose();
      }
    }
    const entriesArr = [];
    for (const snapshotEntry of entries.values()) {
      let entry;
      if (snapshotEntry.isDeleted) {
        entry = this._instantiationService.createInstance(
          ChatEditingDeletedFileEntry,
          snapshotEntry.resource,
          snapshotEntry.original,
          // original content before deletion
          { collapse: /* @__PURE__ */ __name((tx) => this._collapse(snapshotEntry.resource, tx), "collapse") },
          snapshotEntry.telemetryInfo,
          snapshotEntry.languageId
        );
        await entry.restoreFromSnapshot(snapshotEntry, false);
      } else {
        entry = await this._getOrCreateModifiedFileEntry(snapshotEntry.resource, 1, snapshotEntry.telemetryInfo);
        if (entry) {
          const restoreToDisk = snapshotEntry.state === 0;
          await entry.restoreFromSnapshot(snapshotEntry, restoreToDisk);
        }
      }
      if (entry) {
        entriesArr.push(entry);
      }
    }
    this._entriesObs.set(entriesArr, void 0);
  }
  async _acceptEdits(resource, textEdits, isLastEdits, responseModel) {
    const entry = await this._getOrCreateModifiedFileEntry(resource, 0, this._getTelemetryInfoForModel(responseModel));
    if (textEdits.length > 0) {
      this._recordEditOperations(entry, resource, textEdits, responseModel);
    }
    await entry.acceptAgentEdits(resource, textEdits, isLastEdits, responseModel);
  }
  _getTelemetryInfoForModel(responseModel) {
    return new class {
      get agentId() {
        return responseModel.agent?.id;
      }
      get modelId() {
        return responseModel.request?.modelId;
      }
      get modeId() {
        return responseModel.request?.modeInfo?.modeId;
      }
      get command() {
        return responseModel.slashCommand?.name;
      }
      get sessionResource() {
        return responseModel.session.sessionResource;
      }
      get requestId() {
        return responseModel.requestId;
      }
      get result() {
        return responseModel.result;
      }
      get applyCodeBlockSuggestionId() {
        return responseModel.request?.modeInfo?.applyCodeBlockSuggestionId;
      }
      get feature() {
        if (responseModel.session.initialLocation === ChatAgentLocation.Chat) {
          return "sideBarChat";
        } else if (responseModel.session.initialLocation === ChatAgentLocation.EditorInline) {
          return "inlineChat";
        }
        return void 0;
      }
    }();
  }
  async _resolve(requestId, undoStop, resource) {
    const hasOtherTasks = Iterable.some(this._streamingEditLocks.keys(), (k) => k !== resource.toString());
    if (!hasOtherTasks) {
      this._state.set(2, void 0);
    }
    const entry = this._getEntry(resource);
    if (!entry) {
      return;
    }
    const label = undoStop ? `Request ${requestId} - Stop ${undoStop}` : `Request ${requestId}`;
    this._timeline.createCheckpoint(requestId, undoStop, label);
    return entry.acceptStreamingEditsEnd();
  }
  async _getOrCreateModifiedFileEntry(resource, ifNotExists, telemetryInfo, _initialContent) {
    resource = CellUri.parse(resource)?.notebook ?? resource;
    const existingEntry = this._entriesObs.get().find((e) => isEqual(e.modifiedURI, resource));
    if (existingEntry) {
      if (existingEntry instanceof ChatEditingDeletedFileEntry) {
        const initialContentFromDeleted = existingEntry.state.get() === 0 ? existingEntry.initialContent : void 0;
        existingEntry.dispose();
        const entries = this._entriesObs.get().filter((e) => e !== existingEntry);
        this._entriesObs.set(entries, void 0);
        if (initialContentFromDeleted !== void 0) {
          _initialContent = initialContentFromDeleted;
        }
      } else {
        if (telemetryInfo.requestId !== existingEntry.telemetryInfo.requestId) {
          existingEntry.updateTelemetryInfo(telemetryInfo);
        }
        return existingEntry;
      }
    }
    let entry;
    const existingExternalEntry = this._lookupExternalEntry(resource);
    if (existingExternalEntry) {
      entry = existingExternalEntry;
      if (telemetryInfo.requestId !== entry.telemetryInfo.requestId) {
        entry.updateTelemetryInfo(telemetryInfo);
      }
    } else {
      const initialContent = _initialContent ?? this._initialFileContents.get(resource);
      const maybeEntry = await this._createModifiedFileEntry(resource, telemetryInfo, ifNotExists, initialContent);
      if (!maybeEntry) {
        return void 0;
      }
      entry = maybeEntry;
      if (initialContent === void 0) {
        this._initialFileContents.set(resource, entry.initialContent);
      }
    }
    const listener = entry.onDidDelete(() => {
      const newEntries = this._entriesObs.get().filter((e) => !isEqual(e.modifiedURI, entry.modifiedURI));
      this._entriesObs.set(newEntries, void 0);
      this._editorService.closeEditors(this._editorService.findEditors(entry.modifiedURI));
      if (!existingExternalEntry) {
        entry.dispose();
      }
      this._store.delete(listener);
    });
    this._store.add(listener);
    const entriesArr = [...this._entriesObs.get(), entry];
    this._entriesObs.set(entriesArr, void 0);
    return entry;
  }
  async _createModifiedFileEntry(resource, telemetryInfo, ifNotExists, initialContent) {
    const multiDiffEntryDelegate = {
      collapse: /* @__PURE__ */ __name((transaction2) => this._collapse(resource, transaction2), "collapse"),
      recordOperation: /* @__PURE__ */ __name((operation) => {
        operation.epoch = this._timeline.incrementEpoch();
        this._timeline.recordFileOperation(operation);
      }, "recordOperation")
    };
    const notebookUri = CellUri.parse(resource)?.notebook || resource;
    const doCreate = /* @__PURE__ */ __name(async (chatKind) => {
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(notebookUri, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent, this._instantiationService);
      } else {
        const ref = await this._textModelService.createModelReference(resource);
        return this._instantiationService.createInstance(ChatEditingModifiedDocumentEntry, ref, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent);
      }
    }, "doCreate");
    try {
      return await doCreate(
        1
        /* ChatEditKind.Modified */
      );
    } catch (err) {
      if (ifNotExists === 1) {
        return void 0;
      }
      await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
      if (this.configurationService.getValue("accessibility.openChatEditedFiles")) {
        this._editorService.openEditor({ resource, options: { inactive: true, preserveFocus: true, pinned: true } });
      }
      this._timeline.recordFileOperation({
        type: FileOperationType.Create,
        uri: resource,
        requestId: telemetryInfo.requestId,
        epoch: this._timeline.incrementEpoch(),
        initialContent: initialContent || "",
        telemetryInfo
      });
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(resource, multiDiffEntryDelegate, telemetryInfo, 0, initialContent, this._instantiationService);
      } else {
        return await doCreate(
          0
          /* ChatEditKind.Created */
        );
      }
    }
  }
  _collapse(resource, transaction2) {
    const multiDiffItem = this._editorPane?.findDocumentDiffItem(resource);
    if (multiDiffItem) {
      this._editorPane?.viewModel?.items.get().find((documentDiffItem) => isEqual(documentDiffItem.originalUri, multiDiffItem.originalUri) && isEqual(documentDiffItem.modifiedUri, multiDiffItem.modifiedUri))?.collapsed.set(true, transaction2);
    }
  }
};
ChatEditingSession = ChatEditingSession_1 = __decorate([
  __param(4, IInstantiationService),
  __param(5, IModelService),
  __param(6, ILanguageService),
  __param(7, ITextModelService),
  __param(8, IBulkEditService),
  __param(9, IEditorGroupsService),
  __param(10, IEditorService),
  __param(11, INotebookService),
  __param(12, IAccessibilitySignalService),
  __param(13, ILogService),
  __param(14, IConfigurationService),
  __param(15, IFileService),
  __param(16, IChatEditingExplanationModelManager)
], ChatEditingSession);
export {
  ChatEditingSession
};
//# sourceMappingURL=chatEditingSession.js.map
