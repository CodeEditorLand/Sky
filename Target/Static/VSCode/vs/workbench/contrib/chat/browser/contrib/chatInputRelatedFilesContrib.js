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
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { autorun } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { IChatEditingService, IChatEditingSession } from "../../common/chatEditingService.js";
import { IChatWidget, IChatWidgetService } from "../chat.js";
let ChatRelatedFilesContribution = class extends Disposable {
  constructor(chatEditingService, chatWidgetService) {
    super();
    this.chatEditingService = chatEditingService;
    this.chatWidgetService = chatWidgetService;
    this._register(autorun((reader) => {
      const sessions = this.chatEditingService.editingSessionsObs.read(reader);
      sessions.forEach((session) => {
        const widget = this.chatWidgetService.getWidgetBySessionId(session.chatSessionId);
        if (widget && !this.chatEditingSessionDisposables.has(session.chatSessionId)) {
          this._handleNewEditingSession(session, widget);
        }
      });
    }));
  }
  static {
    __name(this, "ChatRelatedFilesContribution");
  }
  static ID = "chat.relatedFilesWorkingSet";
  chatEditingSessionDisposables = /* @__PURE__ */ new Map();
  _currentRelatedFilesRetrievalOperation;
  _updateRelatedFileSuggestions(currentEditingSession, widget) {
    if (this._currentRelatedFilesRetrievalOperation) {
      return;
    }
    const workingSetEntries = currentEditingSession.entries.get();
    if (workingSetEntries.length > 0 || widget.attachmentModel.fileAttachments.length === 0) {
      return;
    }
    this._currentRelatedFilesRetrievalOperation = this.chatEditingService.getRelatedFiles(currentEditingSession.chatSessionId, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None).then((files) => {
      if (!files?.length || !widget.viewModel?.sessionId || !widget.input.relatedFiles) {
        return;
      }
      const currentEditingSession2 = this.chatEditingService.getEditingSession(widget.viewModel.sessionId);
      if (!currentEditingSession2 || currentEditingSession2.entries.get().length) {
        return;
      }
      const existingFiles = new ResourceSet([...widget.attachmentModel.fileAttachments, ...widget.input.relatedFiles.removedFiles]);
      if (!existingFiles.size) {
        return;
      }
      const newSuggestions = new ResourceMap();
      for (const group of files) {
        for (const file of group.files) {
          if (newSuggestions.size >= 2) {
            break;
          }
          if (existingFiles.has(file.uri)) {
            continue;
          }
          newSuggestions.set(file.uri, localize("relatedFile", "{0} (Suggested)", file.description));
          existingFiles.add(file.uri);
        }
      }
      widget.input.relatedFiles.value = [...newSuggestions.entries()].map(([uri, description]) => ({ uri, description }));
    }).finally(() => {
      this._currentRelatedFilesRetrievalOperation = void 0;
    });
  }
  _handleNewEditingSession(currentEditingSession, widget) {
    const disposableStore = new DisposableStore();
    disposableStore.add(currentEditingSession.onDidDispose(() => {
      disposableStore.clear();
    }));
    this._updateRelatedFileSuggestions(currentEditingSession, widget);
    const onDebouncedType = Event.debounce(widget.inputEditor.onDidChangeModelContent, () => null, 3e3);
    disposableStore.add(onDebouncedType(() => {
      this._updateRelatedFileSuggestions(currentEditingSession, widget);
    }));
    disposableStore.add(widget.attachmentModel.onDidChangeContext(() => {
      this._updateRelatedFileSuggestions(currentEditingSession, widget);
    }));
    disposableStore.add(currentEditingSession.onDidDispose(() => {
      disposableStore.dispose();
    }));
    disposableStore.add(widget.onDidAcceptInput(() => {
      widget.input.relatedFiles?.clear();
      this._updateRelatedFileSuggestions(currentEditingSession, widget);
    }));
    this.chatEditingSessionDisposables.set(currentEditingSession.chatSessionId, disposableStore);
  }
  dispose() {
    for (const store of this.chatEditingSessionDisposables.values()) {
      store.dispose();
    }
    super.dispose();
  }
};
ChatRelatedFilesContribution = __decorateClass([
  __decorateParam(0, IChatEditingService),
  __decorateParam(1, IChatWidgetService)
], ChatRelatedFilesContribution);
class ChatRelatedFiles extends Disposable {
  static {
    __name(this, "ChatRelatedFiles");
  }
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  _removedFiles = new ResourceSet();
  get removedFiles() {
    return this._removedFiles;
  }
  _value = [];
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = value;
    this._onDidChange.fire();
  }
  remove(uri) {
    this._value = this._value.filter((file) => !isEqual(file.uri, uri));
    this._removedFiles.add(uri);
    this._onDidChange.fire();
  }
  clearRemovedFiles() {
    this._removedFiles.clear();
  }
  clear() {
    this._value = [];
    this._removedFiles.clear();
    this._onDidChange.fire();
  }
}
export {
  ChatRelatedFiles,
  ChatRelatedFilesContribution
};
//# sourceMappingURL=chatInputRelatedFilesContrib.js.map
