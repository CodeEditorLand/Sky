var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable, IReader, ITransaction } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { TextEdit } from "../../../../editor/common/languages.js";
import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorPane } from "../../../common/editor.js";
import { ICellEditOperation } from "../../notebook/common/notebookCommon.js";
import { ChatModel, IChatResponseModel } from "./chatModel.js";
const IChatEditingService = createDecorator("chatEditingService");
const chatEditingSnapshotScheme = "chat-editing-snapshot-text-model";
var ModifiedFileEntryState = /* @__PURE__ */ ((ModifiedFileEntryState2) => {
  ModifiedFileEntryState2[ModifiedFileEntryState2["Modified"] = 0] = "Modified";
  ModifiedFileEntryState2[ModifiedFileEntryState2["Accepted"] = 1] = "Accepted";
  ModifiedFileEntryState2[ModifiedFileEntryState2["Rejected"] = 2] = "Rejected";
  return ModifiedFileEntryState2;
})(ModifiedFileEntryState || {});
var ChatEditingSessionState = /* @__PURE__ */ ((ChatEditingSessionState2) => {
  ChatEditingSessionState2[ChatEditingSessionState2["Initial"] = 0] = "Initial";
  ChatEditingSessionState2[ChatEditingSessionState2["StreamingEdits"] = 1] = "StreamingEdits";
  ChatEditingSessionState2[ChatEditingSessionState2["Idle"] = 2] = "Idle";
  ChatEditingSessionState2[ChatEditingSessionState2["Disposed"] = 3] = "Disposed";
  return ChatEditingSessionState2;
})(ChatEditingSessionState || {});
const CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME = "chat-editing-multi-diff-source";
const chatEditingWidgetFileStateContextKey = new RawContextKey("chatEditingWidgetFileState", void 0, localize("chatEditingWidgetFileState", "The current state of the file in the chat editing widget"));
const chatEditingAgentSupportsReadonlyReferencesContextKey = new RawContextKey("chatEditingAgentSupportsReadonlyReferences", void 0, localize("chatEditingAgentSupportsReadonlyReferences", "Whether the chat editing agent supports readonly references (temporary)"));
const decidedChatEditingResourceContextKey = new RawContextKey("decidedChatEditingResource", []);
const chatEditingResourceContextKey = new RawContextKey("chatEditingResource", void 0);
const inChatEditingSessionContextKey = new RawContextKey("inChatEditingSession", void 0);
const hasUndecidedChatEditingResourceContextKey = new RawContextKey("hasUndecidedChatEditingResource", false);
const hasAppliedChatEditsContextKey = new RawContextKey("hasAppliedChatEdits", false);
const applyingChatEditsFailedContextKey = new RawContextKey("applyingChatEditsFailed", false);
const chatEditingMaxFileAssignmentName = "chatEditingSessionFileLimit";
const defaultChatEditingMaxFileLimit = 10;
var ChatEditKind = /* @__PURE__ */ ((ChatEditKind2) => {
  ChatEditKind2[ChatEditKind2["Created"] = 0] = "Created";
  ChatEditKind2[ChatEditKind2["Modified"] = 1] = "Modified";
  return ChatEditKind2;
})(ChatEditKind || {});
function isChatEditingActionContext(thing) {
  return typeof thing === "object" && !!thing && "sessionId" in thing;
}
__name(isChatEditingActionContext, "isChatEditingActionContext");
function getMultiDiffSourceUri(session, showPreviousChanges) {
  return URI.from({
    scheme: CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME,
    authority: session.chatSessionId,
    query: showPreviousChanges ? "previous" : void 0
  });
}
__name(getMultiDiffSourceUri, "getMultiDiffSourceUri");
function parseChatMultiDiffUri(uri) {
  const chatSessionId = uri.authority;
  const showPreviousChanges = uri.query === "previous";
  return { chatSessionId, showPreviousChanges };
}
__name(parseChatMultiDiffUri, "parseChatMultiDiffUri");
export {
  CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME,
  ChatEditKind,
  ChatEditingSessionState,
  IChatEditingService,
  ModifiedFileEntryState,
  applyingChatEditsFailedContextKey,
  chatEditingAgentSupportsReadonlyReferencesContextKey,
  chatEditingMaxFileAssignmentName,
  chatEditingResourceContextKey,
  chatEditingSnapshotScheme,
  chatEditingWidgetFileStateContextKey,
  decidedChatEditingResourceContextKey,
  defaultChatEditingMaxFileLimit,
  getMultiDiffSourceUri,
  hasAppliedChatEditsContextKey,
  hasUndecidedChatEditingResourceContextKey,
  inChatEditingSessionContextKey,
  isChatEditingActionContext,
  parseChatMultiDiffUri
};
//# sourceMappingURL=chatEditingService.js.map
