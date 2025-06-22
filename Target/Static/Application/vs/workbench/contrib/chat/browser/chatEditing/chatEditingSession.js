var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equals as arraysEqual, binarySearch2 } from "../../../../../base/common/arrays.js";
import { findLast } from "../../../../../base/common/arraysFind.js";
import { DeferredPromise, Sequencer, SequencerByKey, timeout } from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Disposable, DisposableStore, dispose } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { autorun, derived, derivedOpts, ObservablePromise, observableValue, transaction } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { IBulkEditService } from "../../../../../editor/browser/services/bulkEditService.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { EditorActivation } from "../../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { observableConfigValue } from "../../../../../platform/observable/common/platformObservableUtils.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { MultiDiffEditorInput } from "../../../multiDiffEditor/browser/multiDiffEditorInput.js";
import { CellUri } from "../../../notebook/common/notebookCommon.js";
import { INotebookService } from "../../../notebook/common/notebookService.js";
import { getMultiDiffSourceUri } from "../../common/chatEditingService.js";
import { IChatService } from "../../common/chatService.js";
import { ChatEditingModifiedDocumentEntry } from "./chatEditingModifiedDocumentEntry.js";
import { AbstractChatEditingModifiedFileEntry } from "./chatEditingModifiedFileEntry.js";
import { ChatEditingModifiedNotebookEntry } from "./chatEditingModifiedNotebookEntry.js";
import { ChatEditingSessionStorage } from "./chatEditingSessionStorage.js";
import { ChatEditingTextModelContentProvider } from "./chatEditingTextModelContentProviders.js";
import { ChatEditingModifiedNotebookDiff } from "./notebook/chatEditingModifiedNotebookDiff.js";
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
const POST_EDIT_STOP_ID = "d19944f6-f46c-4e17-911b-79a8e843c7c0";
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
function getMaxHistoryIndex(history) {
  const lastHistory = history.at(-1);
  return lastHistory ? lastHistory.startIndex + lastHistory.stops.length : 0;
}
__name(getMaxHistoryIndex, "getMaxHistoryIndex");
function snapshotsEqualForDiff(a, b) {
  if (!a || !b) {
    return a === b;
  }
  return isEqual(a.snapshotUri, b.snapshotUri) && a.current === b.current;
}
__name(snapshotsEqualForDiff, "snapshotsEqualForDiff");
function getCurrentAndNextStop(requestId, stopId, history) {
  const snapshotIndex = history.findIndex((s) => s.requestId === requestId);
  if (snapshotIndex === -1) {
    return void 0;
  }
  const snapshot = history[snapshotIndex];
  const stopIndex = snapshot.stops.findIndex((s) => s.stopId === stopId);
  if (stopIndex === -1) {
    return void 0;
  }
  const current = snapshot.stops[stopIndex].entries;
  const next = stopIndex < snapshot.stops.length - 1 ? snapshot.stops[stopIndex + 1].entries : snapshot.postEdit || history[snapshotIndex + 1]?.stops[0].entries;
  if (!next) {
    return void 0;
  }
  return { current, next };
}
__name(getCurrentAndNextStop, "getCurrentAndNextStop");
function getFirstAndLastStop(uri, history) {
  let firstStopWithUri;
  for (const snapshot of history) {
    const stop = snapshot.stops.find((s) => s.entries.has(uri));
    if (stop) {
      firstStopWithUri = stop;
      break;
    }
  }
  let lastStopWithUri;
  for (let i = history.length - 1; i >= 0; i--) {
    const snapshot = history[i];
    if (snapshot.postEdit?.has(uri)) {
      lastStopWithUri = snapshot.postEdit;
      break;
    }
    const stop = findLast(snapshot.stops, (s) => s.entries.has(uri));
    if (stop) {
      lastStopWithUri = stop.entries;
      break;
    }
  }
  if (!firstStopWithUri || !lastStopWithUri) {
    return void 0;
  }
  return { current: firstStopWithUri.entries, next: lastStopWithUri };
}
__name(getFirstAndLastStop, "getFirstAndLastStop");
let ChatEditingSession = class ChatEditingSession2 extends Disposable {
  static {
    __name(this, "ChatEditingSession");
  }
  get entries() {
    this._assertNotDisposed();
    return this._entriesObs;
  }
  get state() {
    return this._state;
  }
  get onDidDispose() {
    this._assertNotDisposed();
    return this._onDidDispose.event;
  }
  constructor(chatSessionId, isGlobalEditingSession, _lookupExternalEntry, _instantiationService, _modelService, _languageService, _textModelService, _bulkEditService, _editorGroupsService, _editorService, _chatService, _notebookService, _editorWorkerService, _configurationService, _accessibilitySignalService) {
    super();
    this.chatSessionId = chatSessionId;
    this.isGlobalEditingSession = isGlobalEditingSession;
    this._lookupExternalEntry = _lookupExternalEntry;
    this._instantiationService = _instantiationService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._textModelService = _textModelService;
    this._bulkEditService = _bulkEditService;
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._chatService = _chatService;
    this._notebookService = _notebookService;
    this._editorWorkerService = _editorWorkerService;
    this._configurationService = _configurationService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._state = observableValue(
      this,
      0
      /* ChatEditingSessionState.Initial */
    );
    this._linearHistory = observableValue(this, []);
    this._linearHistoryIndex = observableValue(this, 0);
    this._initialFileContents = new ResourceMap();
    this._entriesObs = observableValue(this, []);
    this.canUndo = derived((r) => {
      if (this.state.read(r) !== 2) {
        return false;
      }
      const linearHistoryIndex = this._linearHistoryIndex.read(r);
      return linearHistoryIndex > 0;
    });
    this.canRedo = derived((r) => {
      if (this.state.read(r) !== 2) {
        return false;
      }
      const linearHistoryIndex = this._linearHistoryIndex.read(r);
      return linearHistoryIndex < getMaxHistoryIndex(this._linearHistory.read(r));
    });
    this._onDidDispose = new Emitter();
    this._diffsBetweenStops = /* @__PURE__ */ new Map();
    this._fullDiffs = /* @__PURE__ */ new Map();
    this._streamingEditLocks = new SequencerByKey();
    this._ignoreTrimWhitespaceObservable = observableConfigValue("diffEditor.ignoreTrimWhitespace", true, this._configurationService);
  }
  async init() {
    const restoredSessionState = await this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionId).restoreState();
    if (restoredSessionState) {
      for (const [uri, content] of restoredSessionState.initialFileContents) {
        this._initialFileContents.set(uri, content);
      }
      this._pendingSnapshot = restoredSessionState.pendingSnapshot;
      await this._restoreSnapshot(restoredSessionState.recentSnapshot, false);
      transaction(async (tx) => {
        this._linearHistory.set(restoredSessionState.linearHistory, tx);
        this._linearHistoryIndex.set(restoredSessionState.linearHistoryIndex, tx);
        this._state.set(2, tx);
      });
    } else {
      this._state.set(2, void 0);
    }
    this._register(autorun((reader) => {
      const entries = this.entries.read(reader);
      entries.forEach((entry) => {
        entry.state.read(reader);
      });
    }));
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
    const storage = this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionId);
    const state = {
      initialFileContents: this._initialFileContents,
      pendingSnapshot: this._pendingSnapshot,
      recentSnapshot: this._createSnapshot(void 0, void 0),
      linearHistoryIndex: this._linearHistoryIndex.get(),
      linearHistory: this._linearHistory.get()
    };
    return storage.storeState(state);
  }
  _findSnapshot(requestId) {
    return this._linearHistory.get().find((s) => s.requestId === requestId);
  }
  _findEditStop(requestId, undoStop) {
    const snapshot = this._findSnapshot(requestId);
    if (!snapshot) {
      return void 0;
    }
    const idx = snapshot.stops.findIndex((s) => s.stopId === undoStop);
    return idx === -1 ? void 0 : { stop: snapshot.stops[idx], snapshot, historyIndex: snapshot.startIndex + idx };
  }
  _ensurePendingSnapshot() {
    this._pendingSnapshot ??= this._createSnapshot(void 0, void 0);
  }
  /**
   * Gets diff for text entries between stops.
   * @param entriesContent Observable that observes either snapshot entry
   * @param modelUrisObservable Observable that observes only the snapshot URIs.
   */
  _entryDiffBetweenTextStops(entriesContent, modelUrisObservable) {
    const modelRefsPromise = derived(this, (reader) => {
      const modelUris = modelUrisObservable.read(reader);
      if (!modelUris) {
        return void 0;
      }
      const store = reader.store.add(new DisposableStore());
      const promise = Promise.all(modelUris.map((u) => this._textModelService.createModelReference(u))).then((refs) => {
        if (store.isDisposed) {
          refs.forEach((r) => r.dispose());
        } else {
          refs.forEach((r) => store.add(r));
        }
        return refs;
      });
      return new ObservablePromise(promise);
    });
    return derived((reader) => {
      const refs2 = modelRefsPromise.read(reader)?.promiseResult.read(reader);
      const refs = refs2?.data;
      if (!refs) {
        return;
      }
      const entries = entriesContent.read(reader);
      if (entries?.before && ChatEditingModifiedNotebookEntry.canHandleSnapshot(entries.before)) {
        const diffService = this._instantiationService.createInstance(ChatEditingModifiedNotebookDiff, entries.before, entries.after);
        return new ObservablePromise(diffService.computeDiff());
      }
      const ignoreTrimWhitespace = this._ignoreTrimWhitespaceObservable.read(reader);
      const promise = this._editorWorkerService.computeDiff(refs[0].object.textEditorModel.uri, refs[1].object.textEditorModel.uri, { ignoreTrimWhitespace, computeMoves: false, maxComputationTimeMs: 3e3 }, "advanced").then((diff) => {
        const entryDiff = {
          originalURI: refs[0].object.textEditorModel.uri,
          modifiedURI: refs[1].object.textEditorModel.uri,
          identical: !!diff?.identical,
          quitEarly: !diff || diff.quitEarly,
          added: 0,
          removed: 0
        };
        if (diff) {
          for (const change of diff.changes) {
            entryDiff.removed += change.original.endLineNumberExclusive - change.original.startLineNumber;
            entryDiff.added += change.modified.endLineNumberExclusive - change.modified.startLineNumber;
          }
        }
        return entryDiff;
      });
      return new ObservablePromise(promise);
    });
  }
  _createDiffBetweenStopsObservable(uri, requestId, stopId) {
    const entries = derivedOpts({
      equalsFn: /* @__PURE__ */ __name((a, b) => snapshotsEqualForDiff(a?.before, b?.before) && snapshotsEqualForDiff(a?.after, b?.after), "equalsFn")
    }, (reader) => {
      const stops = requestId ? getCurrentAndNextStop(requestId, stopId, this._linearHistory.read(reader)) : getFirstAndLastStop(uri, this._linearHistory.read(reader));
      if (!stops) {
        return void 0;
      }
      const before = stops.current.get(uri);
      const after = stops.next.get(uri);
      if (!before || !after) {
        return void 0;
      }
      return { before, after };
    });
    const modelUrisObservable = derivedOpts({ equalsFn: /* @__PURE__ */ __name((a, b) => arraysEqual(a, b, isEqual), "equalsFn") }, (reader) => {
      const entriesValue = entries.read(reader);
      if (!entriesValue) {
        return void 0;
      }
      return [entriesValue.before.snapshotUri, entriesValue.after.snapshotUri];
    });
    const diff = this._entryDiffBetweenTextStops(entries, modelUrisObservable);
    return derived((reader) => {
      return diff.read(reader)?.promiseResult.read(reader)?.data || void 0;
    });
  }
  getEntryDiffBetweenStops(uri, requestId, stopId) {
    if (requestId) {
      const key = `${uri}\0${requestId}\0${stopId}`;
      let observable = this._diffsBetweenStops.get(key);
      if (!observable) {
        observable = this._createDiffBetweenStopsObservable(uri, requestId, stopId);
        this._diffsBetweenStops.set(key, observable);
      }
      return observable;
    } else {
      const key = uri.toString();
      let observable = this._fullDiffs.get(key);
      if (!observable) {
        observable = this._createDiffBetweenStopsObservable(uri, requestId, stopId);
        this._fullDiffs.set(key, observable);
      }
      return observable;
    }
  }
  createSnapshot(requestId, undoStop, makeEmpty = undoStop !== void 0) {
    const snapshot = makeEmpty ? this._createEmptySnapshot(undoStop) : this._createSnapshot(requestId, undoStop);
    const linearHistoryPtr = this._linearHistoryIndex.get();
    const newLinearHistory = [];
    for (const entry of this._linearHistory.get()) {
      if (entry.startIndex >= linearHistoryPtr) {
        break;
      } else if (linearHistoryPtr - entry.startIndex < entry.stops.length) {
        newLinearHistory.push({ requestId: entry.requestId, stops: entry.stops.slice(0, linearHistoryPtr - entry.startIndex), startIndex: entry.startIndex, postEdit: void 0 });
      } else {
        newLinearHistory.push(entry);
      }
    }
    const lastEntry = newLinearHistory.at(-1);
    if (requestId && lastEntry?.requestId === requestId) {
      newLinearHistory[newLinearHistory.length - 1] = { ...lastEntry, stops: [...lastEntry.stops, snapshot], postEdit: void 0 };
    } else {
      newLinearHistory.push({ requestId, startIndex: lastEntry ? lastEntry.startIndex + lastEntry.stops.length : 0, stops: [snapshot], postEdit: void 0 });
    }
    transaction((tx) => {
      const last = newLinearHistory[newLinearHistory.length - 1];
      this._linearHistory.set(newLinearHistory, tx);
      this._linearHistoryIndex.set(last.startIndex + last.stops.length, tx);
    });
  }
  _createEmptySnapshot(undoStop) {
    return {
      stopId: undoStop,
      entries: new ResourceMap()
    };
  }
  _createSnapshot(requestId, undoStop) {
    const entries = new ResourceMap();
    for (const entry of this._entriesObs.get()) {
      entries.set(entry.modifiedURI, entry.createSnapshot(requestId, undoStop));
    }
    return {
      stopId: undoStop,
      entries
    };
  }
  getSnapshot(requestId, undoStop, snapshotUri) {
    const entries = undoStop === POST_EDIT_STOP_ID ? this._findSnapshot(requestId)?.postEdit : this._findEditStop(requestId, undoStop)?.stop.entries;
    return entries && [...entries.values()].find((e) => isEqual(e.snapshotUri, snapshotUri));
  }
  async getSnapshotModel(requestId, undoStop, snapshotUri) {
    const snapshotEntry = this.getSnapshot(requestId, undoStop, snapshotUri);
    if (!snapshotEntry) {
      return null;
    }
    return this._modelService.createModel(snapshotEntry.current, this._languageService.createById(snapshotEntry.languageId), snapshotUri, false);
  }
  getSnapshotUri(requestId, uri, stopId) {
    const stops = getCurrentAndNextStop(requestId, stopId, this._linearHistory.get());
    return stops?.next.get(uri)?.snapshotUri;
  }
  async restoreSnapshot(requestId, stopId) {
    if (requestId !== void 0) {
      const stopRef = this._findEditStop(requestId, stopId);
      if (stopRef) {
        this._ensurePendingSnapshot();
        this._linearHistoryIndex.set(stopRef.historyIndex, void 0);
        await this._restoreSnapshot(stopRef.stop);
        this._updateRequestHiddenState();
      }
    } else {
      const pendingSnapshot = this._pendingSnapshot;
      if (!pendingSnapshot) {
        return;
      }
      this._pendingSnapshot = void 0;
      await this._restoreSnapshot(pendingSnapshot, void 0);
    }
  }
  async _restoreSnapshot({ entries }, restoreResolvedToDisk = true) {
    for (const entry of this._entriesObs.get()) {
      const snapshotEntry = entries.get(entry.modifiedURI);
      if (!snapshotEntry) {
        await entry.resetToInitialContent();
        entry.dispose();
      }
    }
    const entriesArr = [];
    for (const snapshotEntry of entries.values()) {
      const entry = await this._getOrCreateModifiedFileEntry(snapshotEntry.resource, snapshotEntry.telemetryInfo);
      const restoreToDisk = snapshotEntry.state === 0 || restoreResolvedToDisk;
      await entry.restoreFromSnapshot(snapshotEntry, restoreToDisk);
      entriesArr.push(entry);
    }
    this._entriesObs.set(entriesArr, void 0);
  }
  _assertNotDisposed() {
    if (this._state.get() === 3) {
      throw new BugIndicatingError(`Cannot access a disposed editing session`);
    }
  }
  async accept(...uris) {
    this._assertNotDisposed();
    if (uris.length === 0) {
      await Promise.all(this._entriesObs.get().map((entry) => entry.accept()));
    }
    for (const uri of uris) {
      const entry = this._entriesObs.get().find((e) => isEqual(e.modifiedURI, uri));
      if (entry) {
        await entry.accept();
      }
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
  }
  async reject(...uris) {
    this._assertNotDisposed();
    if (uris.length === 0) {
      await Promise.all(this._entriesObs.get().map((entry) => entry.reject()));
    }
    for (const uri of uris) {
      const entry = this._entriesObs.get().find((e) => isEqual(e.modifiedURI, uri));
      if (entry) {
        await entry.reject();
      }
    }
    this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
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
      await this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionId).clearState();
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
    this._chatService.cancelCurrentRequestForSession(this.chatSessionId);
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
    this._streamingEditLocks.queue(resource.toString(), async () => {
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
  _getHistoryEntryByLinearIndex(index) {
    const history = this._linearHistory.get();
    const searchedIndex = binarySearch2(history.length, (e) => history[e].startIndex - index);
    const entry = history[searchedIndex < 0 ? ~searchedIndex - 1 : searchedIndex];
    if (!entry || index - entry.startIndex >= entry.stops.length) {
      return void 0;
    }
    return {
      entry,
      stop: entry.stops[index - entry.startIndex]
    };
  }
  async undoInteraction() {
    const newIndex = this._linearHistoryIndex.get() - 1;
    const previousSnapshot = this._getHistoryEntryByLinearIndex(newIndex);
    if (!previousSnapshot) {
      return;
    }
    this._ensurePendingSnapshot();
    await this._restoreSnapshot(previousSnapshot.stop);
    this._linearHistoryIndex.set(newIndex, void 0);
    this._updateRequestHiddenState();
  }
  async redoInteraction() {
    const maxIndex = getMaxHistoryIndex(this._linearHistory.get());
    const newIndex = this._linearHistoryIndex.get() + 1;
    if (newIndex > maxIndex) {
      return;
    }
    const nextSnapshot = newIndex === maxIndex ? this._pendingSnapshot : this._getHistoryEntryByLinearIndex(newIndex)?.stop;
    if (!nextSnapshot) {
      return;
    }
    await this._restoreSnapshot(nextSnapshot);
    this._linearHistoryIndex.set(newIndex, void 0);
    this._updateRequestHiddenState();
  }
  _updateRequestHiddenState() {
    const history = this._linearHistory.get();
    const index = this._linearHistoryIndex.get();
    const undoRequests = [];
    for (const entry of history) {
      if (!entry.requestId) {
      } else if (entry.startIndex >= index) {
        undoRequests.push({ requestId: entry.requestId });
      } else if (entry.startIndex + entry.stops.length > index) {
        undoRequests.push({ requestId: entry.requestId, afterUndoStop: entry.stops[index - entry.startIndex].stopId });
      }
    }
    this._chatService.getSession(this.chatSessionId)?.setDisabledRequests(undoRequests);
  }
  async _acceptStreamingEditsStart(responseModel, undoStop, resource) {
    const entry = await this._getOrCreateModifiedFileEntry(resource, this._getTelemetryInfoForModel(responseModel));
    transaction((tx) => {
      this._state.set(1, tx);
      entry.acceptStreamingEditsStart(responseModel, tx);
      this.ensureEditInUndoStopMatches(responseModel.requestId, undoStop, entry, false, tx);
    });
  }
  /**
   * Ensures the state of the file in the given snapshot matches the current
   * state of the {@param entry}. This is used to handle concurrent file edits.
   *
   * Given the case of two different edits, we will place and undo stop right
   * before we `textEditGroup` in the underlying markdown stream, but at the
   * time those are added the edits haven't been made yet, so both files will
   * simply have the unmodified state.
   *
   * This method is called after each edit, so after the first file finishes
   * being edits, it will update its content in the second undo snapshot such
   * that it can be undone successfully.
   *
   * We ensure that the same file is not concurrently edited via the
   * {@link _streamingEditLocks}, avoiding race conditions.
   *
   * @param next If true, this will edit the snapshot _after_ the undo stop
   */
  ensureEditInUndoStopMatches(requestId, undoStop, entry, next, tx) {
    const history = this._linearHistory.get();
    const snapIndex = history.findIndex((s) => s.requestId === requestId);
    if (snapIndex === -1) {
      return;
    }
    const snap = history[snapIndex];
    let stopIndex = snap.stops.findIndex((s) => s.stopId === undoStop);
    if (stopIndex === -1) {
      return;
    }
    if (next) {
      if (stopIndex === snap.stops.length - 1) {
        const postEdit = new ResourceMap(snap.postEdit || this._createEmptySnapshot(void 0).entries);
        if (!snap.postEdit || !entry.equalsSnapshot(postEdit.get(entry.modifiedURI))) {
          postEdit.set(entry.modifiedURI, entry.createSnapshot(requestId, POST_EDIT_STOP_ID));
          const newHistory2 = history.slice();
          newHistory2[snapIndex] = { ...snap, postEdit };
          this._linearHistory.set(newHistory2, tx);
        }
        return;
      }
      stopIndex++;
    }
    const stop = snap.stops[stopIndex];
    if (entry.equalsSnapshot(stop.entries.get(entry.modifiedURI))) {
      return;
    }
    const newMap = new ResourceMap(stop.entries);
    newMap.set(entry.modifiedURI, entry.createSnapshot(requestId, stop.stopId));
    const newStop = snap.stops.slice();
    newStop[stopIndex] = { ...stop, entries: newMap };
    const newHistory = history.slice();
    newHistory[snapIndex] = { ...snap, stops: newStop };
    this._linearHistory.set(newHistory, tx);
  }
  async _acceptEdits(resource, textEdits, isLastEdits, responseModel) {
    this._fullDiffs.delete(resource.toString());
    const entry = await this._getOrCreateModifiedFileEntry(resource, this._getTelemetryInfoForModel(responseModel));
    await entry.acceptAgentEdits(resource, textEdits, isLastEdits, responseModel);
  }
  _getTelemetryInfoForModel(responseModel) {
    return new class {
      get agentId() {
        return responseModel.agent?.id;
      }
      get command() {
        return responseModel.slashCommand?.name;
      }
      get sessionId() {
        return responseModel.session.sessionId;
      }
      get requestId() {
        return responseModel.requestId;
      }
      get result() {
        return responseModel.result;
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
    this.ensureEditInUndoStopMatches(
      requestId,
      undoStop,
      entry,
      /* next= */
      true,
      void 0
    );
    return entry.acceptStreamingEditsEnd();
  }
  /**
   * Retrieves or creates a modified file entry.
   *
   * @returns The modified file entry.
   */
  async _getOrCreateModifiedFileEntry(resource, telemetryInfo) {
    resource = CellUri.parse(resource)?.notebook ?? resource;
    const existingEntry = this._entriesObs.get().find((e) => isEqual(e.modifiedURI, resource));
    if (existingEntry) {
      if (telemetryInfo.requestId !== existingEntry.telemetryInfo.requestId) {
        existingEntry.updateTelemetryInfo(telemetryInfo);
      }
      return existingEntry;
    }
    let entry;
    const existingExternalEntry = this._lookupExternalEntry(resource);
    if (existingExternalEntry) {
      entry = existingExternalEntry;
    } else {
      const initialContent = this._initialFileContents.get(resource);
      entry = await this._createModifiedFileEntry(resource, telemetryInfo, false, initialContent);
      if (!initialContent) {
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
  async _createModifiedFileEntry(resource, telemetryInfo, mustExist = false, initialContent) {
    const multiDiffEntryDelegate = { collapse: /* @__PURE__ */ __name((transaction2) => this._collapse(resource, transaction2), "collapse") };
    const chatKind = mustExist ? 0 : 1;
    const notebookUri = CellUri.parse(resource)?.notebook || resource;
    try {
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(notebookUri, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent, this._instantiationService);
      } else {
        const ref = await this._textModelService.createModelReference(resource);
        return this._instantiationService.createInstance(ChatEditingModifiedDocumentEntry, ref, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent);
      }
    } catch (err) {
      if (mustExist) {
        throw err;
      }
      await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
      this._editorService.openEditor({ resource, options: { inactive: true, preserveFocus: true, pinned: true } });
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(resource, multiDiffEntryDelegate, telemetryInfo, 0, initialContent, this._instantiationService);
      } else {
        return this._createModifiedFileEntry(resource, telemetryInfo, true, initialContent);
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
ChatEditingSession = __decorate([
  __param(3, IInstantiationService),
  __param(4, IModelService),
  __param(5, ILanguageService),
  __param(6, ITextModelService),
  __param(7, IBulkEditService),
  __param(8, IEditorGroupsService),
  __param(9, IEditorService),
  __param(10, IChatService),
  __param(11, INotebookService),
  __param(12, IEditorWorkerService),
  __param(13, IConfigurationService),
  __param(14, IAccessibilitySignalService)
], ChatEditingSession);
export {
  ChatEditingSession
};
//# sourceMappingURL=chatEditingSession.js.map
