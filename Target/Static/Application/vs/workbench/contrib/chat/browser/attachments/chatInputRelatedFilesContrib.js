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
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../../../base/common/map.js";
import { autorun } from "../../../../../base/common/observable.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { localize } from "../../../../../nls.js";
import { IChatEditingService } from "../../common/editing/chatEditingService.js";
import { IChatWidgetService } from "../chat.js";
let ChatRelatedFilesContribution = class ChatRelatedFilesContribution2 extends Disposable {
  static {
    __name(this, "ChatRelatedFilesContribution");
  }
  static {
    this.ID = "chat.relatedFilesWorkingSet";
  }
  constructor(chatEditingService, chatWidgetService) {
    super();
    this.chatEditingService = chatEditingService;
    this.chatWidgetService = chatWidgetService;
    this.chatEditingSessionDisposables = new ResourceMap();
    this._register(autorun((reader) => {
      const sessions = this.chatEditingService.editingSessionsObs.read(reader);
      sessions.forEach((session) => {
        const widget = this.chatWidgetService.getWidgetBySessionResource(session.chatSessionResource);
        if (widget && !this.chatEditingSessionDisposables.has(session.chatSessionResource)) {
          this._handleNewEditingSession(session, widget);
        }
      });
    }));
  }
  _updateRelatedFileSuggestions(currentEditingSession, widget) {
    if (this._currentRelatedFilesRetrievalOperation) {
      return;
    }
    const workingSetEntries = currentEditingSession.entries.get();
    if (workingSetEntries.length > 0 || widget.attachmentModel.fileAttachments.length === 0) {
      return;
    }
    this._currentRelatedFilesRetrievalOperation = this.chatEditingService.getRelatedFiles(currentEditingSession.chatSessionResource, widget.getInput(), widget.attachmentModel.fileAttachments, CancellationToken.None).then((files) => {
      if (!files?.length || !widget.viewModel || !widget.input.relatedFiles) {
        return;
      }
      const currentEditingSession2 = this.chatEditingService.getEditingSession(widget.viewModel.sessionResource);
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
    disposableStore.add(widget.attachmentModel.onDidChange(() => {
      this._updateRelatedFileSuggestions(currentEditingSession, widget);
    }));
    disposableStore.add(currentEditingSession.onDidDispose(() => {
      disposableStore.dispose();
    }));
    disposableStore.add(widget.onDidAcceptInput(() => {
      widget.input.relatedFiles?.clear();
      this._updateRelatedFileSuggestions(currentEditingSession, widget);
    }));
    this.chatEditingSessionDisposables.set(currentEditingSession.chatSessionResource, disposableStore);
  }
  dispose() {
    for (const store of this.chatEditingSessionDisposables.values()) {
      store.dispose();
    }
    super.dispose();
  }
};
ChatRelatedFilesContribution = __decorate([
  __param(0, IChatEditingService),
  __param(1, IChatWidgetService)
], ChatRelatedFilesContribution);
class ChatRelatedFiles extends Disposable {
  static {
    __name(this, "ChatRelatedFiles");
  }
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._removedFiles = new ResourceSet();
    this._value = [];
  }
  get removedFiles() {
    return this._removedFiles;
  }
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
