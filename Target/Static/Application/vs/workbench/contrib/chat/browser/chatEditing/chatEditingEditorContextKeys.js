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
import { Event } from "../../../../../base/common/event.js";
import { DisposableMap, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, constObservable, derived, observableFromEvent } from "../../../../../base/common/observable.js";
import { localize } from "../../../../../nls.js";
import { RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { IChatEditingService } from "../../common/chatEditingService.js";
import { IChatService } from "../../common/chatService.js";
const ctxIsGlobalEditingSession = new RawContextKey("chatEdits.isGlobalEditingSession", void 0, localize("chat.ctxEditSessionIsGlobal", "The current editor is part of the global edit session"));
const ctxHasEditorModification = new RawContextKey("chatEdits.hasEditorModifications", void 0, localize("chat.hasEditorModifications", "The current editor contains chat modifications"));
const ctxReviewModeEnabled = new RawContextKey("chatEdits.isReviewModeEnabled", true, localize("chat.ctxReviewModeEnabled", "Review mode for chat changes is enabled"));
const ctxHasRequestInProgress = new RawContextKey("chatEdits.isRequestInProgress", false, localize("chat.ctxHasRequestInProgress", "The current editor shows a file from an edit session which is still in progress"));
const ctxRequestCount = new RawContextKey("chatEdits.requestCount", 0, localize("chatEdits.requestCount", "The number of turns the editing session in this editor has"));
let ChatEditingEditorContextKeys = class ChatEditingEditorContextKeys2 {
  static {
    __name(this, "ChatEditingEditorContextKeys");
  }
  static {
    this.ID = "chat.edits.editorContextKeys";
  }
  constructor(instaService, editorGroupsService) {
    this._store = new DisposableStore();
    const editorGroupCtx = this._store.add(new DisposableMap());
    const editorGroups = observableFromEvent(this, Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup), () => editorGroupsService.groups);
    this._store.add(autorun((r) => {
      const toDispose = new Set(editorGroupCtx.keys());
      for (const group of editorGroups.read(r)) {
        toDispose.delete(group);
        if (editorGroupCtx.has(group)) {
          continue;
        }
        editorGroupCtx.set(group, instaService.createInstance(ContextKeyGroup, group));
      }
      for (const item of toDispose) {
        editorGroupCtx.deleteAndDispose(item);
      }
    }));
  }
  dispose() {
    this._store.dispose();
  }
};
ChatEditingEditorContextKeys = __decorate([
  __param(0, IInstantiationService),
  __param(1, IEditorGroupsService)
], ChatEditingEditorContextKeys);
let ContextKeyGroup = class ContextKeyGroup2 {
  static {
    __name(this, "ContextKeyGroup");
  }
  constructor(group, inlineChatSessionService, chatEditingService, chatService) {
    this._store = new DisposableStore();
    this._ctxIsGlobalEditingSession = ctxIsGlobalEditingSession.bindTo(group.scopedContextKeyService);
    this._ctxHasEditorModification = ctxHasEditorModification.bindTo(group.scopedContextKeyService);
    this._ctxHasRequestInProgress = ctxHasRequestInProgress.bindTo(group.scopedContextKeyService);
    this._ctxReviewModeEnabled = ctxReviewModeEnabled.bindTo(group.scopedContextKeyService);
    this._ctxRequestCount = ctxRequestCount.bindTo(group.scopedContextKeyService);
    const editorObs = observableFromEvent(this, group.onDidModelChange, () => group.activeEditor);
    this._store.add(autorun((r) => {
      const editor = editorObs.read(r);
      const uri = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
      if (!uri) {
        this._reset();
        return;
      }
      const tuple = new ObservableEditorSession(uri, chatEditingService, inlineChatSessionService).value.read(r);
      if (!tuple) {
        this._reset();
        return;
      }
      const { session, entry } = tuple;
      const chatModel = chatService.getSession(session.chatSessionId);
      const lastResponse = chatModel ? observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().at(-1)?.response).read(r) : void 0;
      const isRequestInProgress = lastResponse ? observableFromEvent(this, lastResponse.onDidChange, () => !lastResponse.isPendingConfirmation && !lastResponse.isComplete) : constObservable(false);
      this._ctxHasEditorModification.set(
        entry?.state.read(r) === 0
        /* ModifiedFileEntryState.Modified */
      );
      this._ctxIsGlobalEditingSession.set(session.isGlobalEditingSession);
      this._ctxReviewModeEnabled.set(entry ? entry.reviewMode.read(r) : false);
      this._ctxHasRequestInProgress.set(isRequestInProgress.read(r));
      const requestCount = chatModel ? observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().length) : constObservable(0);
      this._ctxRequestCount.set(requestCount.read(r));
    }));
  }
  _reset() {
    this._ctxIsGlobalEditingSession.reset();
    this._ctxHasEditorModification.reset();
    this._ctxHasRequestInProgress.reset();
    this._ctxReviewModeEnabled.reset();
    this._ctxRequestCount.reset();
  }
  dispose() {
    this._store.dispose();
    this._reset();
  }
};
ContextKeyGroup = __decorate([
  __param(1, IInlineChatSessionService),
  __param(2, IChatEditingService),
  __param(3, IChatService)
], ContextKeyGroup);
let ObservableEditorSession = class ObservableEditorSession2 {
  static {
    __name(this, "ObservableEditorSession");
  }
  constructor(uri, chatEditingService, inlineChatService) {
    const inlineSessionObs = observableFromEvent(this, inlineChatService.onDidChangeSessions, () => inlineChatService.getSession2(uri));
    const sessionObs = chatEditingService.editingSessionsObs.map((value, r) => {
      for (const session of value) {
        const entry = session.readEntry(uri, r);
        if (entry) {
          return { session, entry, isInlineChat: false };
        }
      }
      return void 0;
    });
    this.value = derived((r) => {
      const inlineSession = inlineSessionObs.read(r);
      if (inlineSession) {
        return { session: inlineSession.editingSession, entry: inlineSession.editingSession.readEntry(uri, r), isInlineChat: true };
      }
      return sessionObs.read(r);
    });
  }
};
ObservableEditorSession = __decorate([
  __param(1, IChatEditingService),
  __param(2, IInlineChatSessionService)
], ObservableEditorSession);
export {
  ChatEditingEditorContextKeys,
  ObservableEditorSession,
  ctxHasEditorModification,
  ctxHasRequestInProgress,
  ctxIsGlobalEditingSession,
  ctxRequestCount,
  ctxReviewModeEnabled
};
//# sourceMappingURL=chatEditingEditorContextKeys.js.map
