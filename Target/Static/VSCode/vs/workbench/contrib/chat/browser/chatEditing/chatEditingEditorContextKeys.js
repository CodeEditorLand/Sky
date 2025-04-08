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
import { Event } from "../../../../../base/common/event.js";
import { DisposableMap, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun, constObservable, derived, IObservable, observableFromEvent } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import { IContextKey, RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../../common/editor.js";
import { IEditorGroup, IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.js";
import { IChatEditingService, IChatEditingSession, IModifiedFileEntry, ModifiedFileEntryState } from "../../common/chatEditingService.js";
import { IChatService } from "../../common/chatService.js";
const ctxIsGlobalEditingSession = new RawContextKey("chatEdits.isGlobalEditingSession", void 0, localize("chat.ctxEditSessionIsGlobal", "The current editor is part of the global edit session"));
const ctxHasEditorModification = new RawContextKey("chatEdits.hasEditorModifications", void 0, localize("chat.hasEditorModifications", "The current editor contains chat modifications"));
const ctxReviewModeEnabled = new RawContextKey("chatEdits.isReviewModeEnabled", true, localize("chat.ctxReviewModeEnabled", "Review mode for chat changes is enabled"));
const ctxHasRequestInProgress = new RawContextKey("chatEdits.isRequestInProgress", false, localize("chat.ctxHasRequestInProgress", "The current editor shows a file from an edit session which is still in progress"));
const ctxRequestCount = new RawContextKey("chatEdits.requestCount", 0, localize("chatEdits.requestCount", "The number of turns the editing session in this editor has"));
let ChatEditingEditorContextKeys = class {
  static {
    __name(this, "ChatEditingEditorContextKeys");
  }
  static ID = "chat.edits.editorContextKeys";
  _store = new DisposableStore();
  constructor(instaService, editorGroupsService) {
    const editorGroupCtx = this._store.add(new DisposableMap());
    const editorGroups = observableFromEvent(
      this,
      Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
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
ChatEditingEditorContextKeys = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IEditorGroupsService)
], ChatEditingEditorContextKeys);
let ContextKeyGroup = class {
  static {
    __name(this, "ContextKeyGroup");
  }
  _ctxIsGlobalEditingSession;
  _ctxHasEditorModification;
  _ctxHasRequestInProgress;
  _ctxReviewModeEnabled;
  _ctxRequestCount;
  _store = new DisposableStore();
  constructor(group, inlineChatSessionService, chatEditingService, chatService) {
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
      const { session, entry, isInlineChat } = tuple;
      const chatModel = chatService.getSession(session.chatSessionId);
      const isRequestInProgress = chatModel ? observableFromEvent(this, chatModel.onDidChange, () => chatModel.requestInProgress) : constObservable(false);
      this._ctxHasEditorModification.set(isInlineChat || entry?.state.read(r) === ModifiedFileEntryState.Modified);
      this._ctxIsGlobalEditingSession.set(session.isGlobalEditingSession);
      this._ctxReviewModeEnabled.set(entry ? entry.reviewMode.read(r) : false);
      this._ctxHasRequestInProgress.set(
        Boolean(entry?.isCurrentlyBeingModifiedBy.read(r)) || isInlineChat && isRequestInProgress.read(r)
        // inline chat request
      );
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
ContextKeyGroup = __decorateClass([
  __decorateParam(1, IInlineChatSessionService),
  __decorateParam(2, IChatEditingService),
  __decorateParam(3, IChatService)
], ContextKeyGroup);
let ObservableEditorSession = class {
  static {
    __name(this, "ObservableEditorSession");
  }
  value;
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
ObservableEditorSession = __decorateClass([
  __decorateParam(1, IChatEditingService),
  __decorateParam(2, IInlineChatSessionService)
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
