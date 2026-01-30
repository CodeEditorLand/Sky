var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertNever } from "../../../../../base/common/assert.js";
import { isMarkdownString } from "../../../../../base/common/htmlContent.js";
import { equals as objectsEqual } from "../../../../../base/common/objects.js";
import { isEqual as _urisEqual } from "../../../../../base/common/resources.js";
import { hasKey } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import * as Adapt from "./objectMutationLog.js";
const toJson = /* @__PURE__ */ __name((obj) => {
  const cast = obj;
  return cast && typeof cast.toJSON === "function" ? cast.toJSON() : obj;
}, "toJson");
const responsePartSchema = Adapt.v((obj) => obj.kind === "markdownContent" ? obj.content : toJson(obj), (a, b) => {
  if (isMarkdownString(a) && isMarkdownString(b)) {
    return a.value === b.value;
  }
  if (hasKey(a, { kind: true }) && hasKey(b, { kind: true })) {
    if (a.kind !== b.kind) {
      return false;
    }
    switch (a.kind) {
      case "markdownContent":
        return a.content === b.content;
      // Dynamic types that can change after initial push need deep equality
      // Note: these are the *serialized* kind names (e.g. toolInvocationSerialized not toolInvocation)
      case "toolInvocationSerialized":
      case "elicitationSerialized":
      case "progressTaskSerialized":
      case "textEditGroup":
      case "multiDiffData":
      case "mcpServersStarting":
        return objectsEqual(a, b);
      // Static types that won't change after being pushed can use strict equality.
      case "clearToPreviousToolInvocation":
      case "codeblockUri":
      case "command":
      case "confirmation":
      case "extensions":
      case "inlineReference":
      case "markdownVuln":
      case "notebookEditGroup":
      case "progressMessage":
      case "pullRequest":
      case "thinking":
      case "undoStop":
      case "warning":
      case "treeData":
        return a.kind === b.kind;
      default: {
        assertNever(a);
      }
    }
  }
  return false;
});
const urisEqual = /* @__PURE__ */ __name((a, b) => {
  return _urisEqual(URI.from(a), URI.from(b));
}, "urisEqual");
const messageSchema = Adapt.object({
  text: Adapt.v((m) => m.text),
  parts: Adapt.v((m) => m.parts, (a, b) => a.length === b.length && a.every((part, i) => part.text === b[i].text))
});
const agentEditedFileEventSchema = Adapt.object({
  uri: Adapt.v((e) => e.uri, urisEqual),
  eventKind: Adapt.v((e) => e.eventKind)
});
const chatVariableSchema = Adapt.object({
  variables: Adapt.t((v) => v.variables, Adapt.array(Adapt.value((a, b) => a.name === b.name)))
});
const requestSchema = Adapt.object({
  // request parts
  requestId: Adapt.t((m) => m.id, Adapt.key()),
  timestamp: Adapt.v((m) => m.timestamp),
  confirmation: Adapt.v((m) => m.confirmation),
  message: Adapt.t((m) => m.message, messageSchema),
  shouldBeRemovedOnSend: Adapt.v((m) => m.shouldBeRemovedOnSend, objectsEqual),
  agent: Adapt.v((m) => m.response?.agent, (a, b) => a?.id === b?.id),
  modelId: Adapt.v((m) => m.modelId),
  editedFileEvents: Adapt.t((m) => m.editedFileEvents, Adapt.array(agentEditedFileEventSchema)),
  variableData: Adapt.t((m) => m.variableData, chatVariableSchema),
  isHidden: Adapt.v(() => void 0),
  // deprecated, always undefined for new data
  isCanceled: Adapt.v(() => void 0),
  // deprecated, modelState is used instead
  // response parts (from ISerializableChatResponseData via response.toJSON())
  response: Adapt.t((m) => m.response?.entireResponse.value, Adapt.array(responsePartSchema)),
  responseId: Adapt.v((m) => m.response?.id),
  result: Adapt.v((m) => m.response?.result, objectsEqual),
  responseMarkdownInfo: Adapt.v((m) => m.response?.codeBlockInfos?.map((info) => ({ suggestionId: info.suggestionId })), objectsEqual),
  followups: Adapt.v((m) => m.response?.followups, objectsEqual),
  modelState: Adapt.v((m) => m.response?.stateT, objectsEqual),
  vote: Adapt.v((m) => m.response?.vote),
  voteDownReason: Adapt.v((m) => m.response?.voteDownReason),
  slashCommand: Adapt.t((m) => m.response?.slashCommand, Adapt.value((a, b) => a?.name === b?.name)),
  usedContext: Adapt.v((m) => m.response?.usedContext, objectsEqual),
  contentReferences: Adapt.v((m) => m.response?.contentReferences, objectsEqual),
  codeCitations: Adapt.v((m) => m.response?.codeCitations, objectsEqual),
  timeSpentWaiting: Adapt.v((m) => m.response?.timestamp)
  // based on response timestamp
}, {
  sealed: /* @__PURE__ */ __name((o) => o.modelState?.value === 2 || o.modelState?.value === 3 || o.modelState?.value === 1, "sealed")
});
const inputStateSchema = Adapt.object({
  attachments: Adapt.v((i) => i.attachments, objectsEqual),
  mode: Adapt.v((i) => i.mode, (a, b) => a.id === b.id),
  selectedModel: Adapt.v((i) => i.selectedModel, (a, b) => a?.identifier === b?.identifier),
  inputText: Adapt.v((i) => i.inputText),
  selections: Adapt.v((i) => i.selections, objectsEqual),
  contrib: Adapt.v((i) => i.contrib, objectsEqual)
});
const storageSchema = Adapt.object({
  version: Adapt.v(() => 3),
  creationDate: Adapt.v((m) => m.timestamp),
  customTitle: Adapt.v((m) => m.hasCustomTitle ? m.title : void 0),
  initialLocation: Adapt.v((m) => m.initialLocation),
  inputState: Adapt.t((m) => m.inputModel.toJSON(), inputStateSchema),
  responderUsername: Adapt.v((m) => m.responderUsername),
  sessionId: Adapt.v((m) => m.sessionId),
  requests: Adapt.t((m) => m.getRequests(), Adapt.array(requestSchema)),
  hasPendingEdits: Adapt.v((m) => m.editingSession?.entries.get().some(
    (e) => e.state.get() === 0
    /* ModifiedFileEntryState.Modified */
  )),
  repoData: Adapt.v((m) => m.repoData, objectsEqual)
});
class ChatSessionOperationLog extends Adapt.ObjectMutationLog {
  static {
    __name(this, "ChatSessionOperationLog");
  }
  constructor() {
    super(storageSchema, 1024);
  }
}
export {
  ChatSessionOperationLog,
  storageSchema
};
//# sourceMappingURL=chatSessionOperationLog.js.map
