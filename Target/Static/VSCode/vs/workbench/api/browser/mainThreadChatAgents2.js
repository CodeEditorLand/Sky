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
import { DeferredPromise } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable, DisposableMap, IDisposable } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { Position } from "../../../editor/common/core/position.js";
import { Range } from "../../../editor/common/core/range.js";
import { getWordAtText } from "../../../editor/common/core/wordHelper.js";
import { CompletionContext, CompletionItem, CompletionItemKind, CompletionList } from "../../../editor/common/languages.js";
import { ITextModel } from "../../../editor/common/model.js";
import { ILanguageFeaturesService } from "../../../editor/common/services/languageFeatures.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IChatWidgetService } from "../../contrib/chat/browser/chat.js";
import { ChatInputPart } from "../../contrib/chat/browser/chatInputPart.js";
import { AddDynamicVariableAction, IAddDynamicVariableContext } from "../../contrib/chat/browser/contrib/chatDynamicVariables.js";
import { IChatAgentHistoryEntry, IChatAgentImplementation, IChatAgentRequest, IChatAgentService } from "../../contrib/chat/common/chatAgents.js";
import { IChatEditingService, IChatRelatedFileProviderMetadata } from "../../contrib/chat/common/chatEditingService.js";
import { ChatRequestAgentPart } from "../../contrib/chat/common/chatParserTypes.js";
import { ChatRequestParser } from "../../contrib/chat/common/chatRequestParser.js";
import { IChatContentInlineReference, IChatContentReference, IChatFollowup, IChatNotebookEdit, IChatProgress, IChatService, IChatTask, IChatWarningMessage } from "../../contrib/chat/common/chatService.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { Dto } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostChatAgentsShape2, ExtHostContext, IChatNotebookEditDto, IChatParticipantMetadata, IChatProgressDto, IDynamicChatAgentProps, IExtensionChatAgentMetadata, MainContext, MainThreadChatAgentsShape2 } from "../common/extHost.protocol.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
class MainThreadChatTask {
  constructor(content) {
    this.content = content;
  }
  static {
    __name(this, "MainThreadChatTask");
  }
  kind = "progressTask";
  deferred = new DeferredPromise();
  _onDidAddProgress = new Emitter();
  get onDidAddProgress() {
    return this._onDidAddProgress.event;
  }
  progress = [];
  task() {
    return this.deferred.p;
  }
  isSettled() {
    return this.deferred.isSettled;
  }
  complete(v) {
    this.deferred.complete(v);
  }
  add(progress) {
    this.progress.push(progress);
    this._onDidAddProgress.fire(progress);
  }
}
let MainThreadChatAgents2 = class extends Disposable {
  constructor(extHostContext, _chatAgentService, _chatService, _chatEditingService, _languageFeaturesService, _chatWidgetService, _instantiationService, _logService, _extensionService) {
    super();
    this._chatAgentService = _chatAgentService;
    this._chatService = _chatService;
    this._chatEditingService = _chatEditingService;
    this._languageFeaturesService = _languageFeaturesService;
    this._chatWidgetService = _chatWidgetService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._extensionService = _extensionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatAgents2);
    this._register(this._chatService.onDidDisposeSession((e) => {
      this._proxy.$releaseSession(e.sessionId);
    }));
    this._register(this._chatService.onDidPerformUserAction((e) => {
      if (typeof e.agentId === "string") {
        for (const [handle, agent] of this._agents) {
          if (agent.id === e.agentId) {
            if (e.action.kind === "vote") {
              this._proxy.$acceptFeedback(handle, e.result ?? {}, e.action);
            } else {
              this._proxy.$acceptAction(handle, e.result || {}, e);
            }
            break;
          }
        }
      }
    }));
  }
  _agents = this._register(new DisposableMap());
  _agentCompletionProviders = this._register(new DisposableMap());
  _agentIdsToCompletionProviders = this._register(new DisposableMap());
  _chatParticipantDetectionProviders = this._register(new DisposableMap());
  _chatRelatedFilesProviders = this._register(new DisposableMap());
  _pendingProgress = /* @__PURE__ */ new Map();
  _proxy;
  _responsePartHandlePool = 0;
  _activeTasks = /* @__PURE__ */ new Map();
  _unresolvedAnchors = /* @__PURE__ */ new Map();
  $unregisterAgent(handle) {
    this._agents.deleteAndDispose(handle);
  }
  $transferActiveChatSession(toWorkspace) {
    const widget = this._chatWidgetService.lastFocusedWidget;
    const sessionId = widget?.viewModel?.model.sessionId;
    if (!sessionId) {
      this._logService.error(`MainThreadChat#$transferActiveChatSession: No active chat session found`);
      return;
    }
    const inputValue = widget?.inputEditor.getValue() ?? "";
    const location = widget.location;
    const mode = widget.input.currentMode;
    this._chatService.transferChatSession({ sessionId, inputValue, location, mode }, URI.revive(toWorkspace));
  }
  async $registerAgent(handle, extension, id, metadata, dynamicProps) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const staticAgentRegistration = this._chatAgentService.getAgent(id, true);
    if (!staticAgentRegistration && !dynamicProps) {
      if (this._chatAgentService.getAgentsByName(id).length) {
        throw new Error(`chatParticipant must be declared with an ID in package.json. The "id" property may be missing! "${id}"`);
      }
      throw new Error(`chatParticipant must be declared in package.json: ${id}`);
    }
    const impl = {
      invoke: /* @__PURE__ */ __name(async (request, progress, history, token) => {
        this._pendingProgress.set(request.requestId, progress);
        try {
          return await this._proxy.$invokeAgent(handle, request, { history }, token) ?? {};
        } finally {
          this._pendingProgress.delete(request.requestId);
        }
      }, "invoke"),
      setRequestPaused: /* @__PURE__ */ __name((requestId, isPaused) => {
        this._proxy.$setRequestPaused(handle, requestId, isPaused);
      }, "setRequestPaused"),
      provideFollowups: /* @__PURE__ */ __name(async (request, result, history, token) => {
        if (!this._agents.get(handle)?.hasFollowups) {
          return [];
        }
        return this._proxy.$provideFollowups(request, handle, result, { history }, token);
      }, "provideFollowups"),
      provideChatTitle: /* @__PURE__ */ __name((history, token) => {
        return this._proxy.$provideChatTitle(handle, history, token);
      }, "provideChatTitle"),
      provideSampleQuestions: /* @__PURE__ */ __name((location, token) => {
        return this._proxy.$provideSampleQuestions(handle, location, token);
      }, "provideSampleQuestions")
    };
    let disposable;
    if (!staticAgentRegistration && dynamicProps) {
      const extensionDescription = this._extensionService.extensions.find((e) => ExtensionIdentifier.equals(e.identifier, extension));
      disposable = this._chatAgentService.registerDynamicAgent(
        {
          id,
          name: dynamicProps.name,
          description: dynamicProps.description,
          extensionId: extension,
          extensionDisplayName: extensionDescription?.displayName ?? extension.value,
          extensionPublisherId: extensionDescription?.publisher ?? "",
          publisherDisplayName: dynamicProps.publisherName,
          fullName: dynamicProps.fullName,
          metadata: revive(metadata),
          slashCommands: [],
          disambiguation: [],
          locations: [ChatAgentLocation.Panel]
          // TODO all dynamic participants are panel only?
        },
        impl
      );
    } else {
      disposable = this._chatAgentService.registerAgentImplementation(id, impl);
    }
    this._agents.set(handle, {
      id,
      extensionId: extension,
      dispose: disposable.dispose,
      hasFollowups: metadata.hasFollowups
    });
  }
  async $updateAgent(handle, metadataUpdate) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const data = this._agents.get(handle);
    if (!data) {
      this._logService.error(`MainThreadChatAgents2#$updateAgent: No agent with handle ${handle} registered`);
      return;
    }
    data.hasFollowups = metadataUpdate.hasFollowups;
    this._chatAgentService.updateAgent(data.id, revive(metadataUpdate));
  }
  async $handleProgressChunk(requestId, progress, responsePartHandle) {
    const revivedProgress = progress.kind === "notebookEdit" ? ChatNotebookEdit.fromChatEdit(revive(progress)) : revive(progress);
    if (revivedProgress.kind === "progressTask") {
      const handle = ++this._responsePartHandlePool;
      const responsePartId = `${requestId}_${handle}`;
      const task = new MainThreadChatTask(revivedProgress.content);
      this._activeTasks.set(responsePartId, task);
      this._pendingProgress.get(requestId)?.(task);
      return handle;
    } else if (responsePartHandle !== void 0) {
      const responsePartId = `${requestId}_${responsePartHandle}`;
      const task = this._activeTasks.get(responsePartId);
      switch (revivedProgress.kind) {
        case "progressTaskResult":
          if (task && revivedProgress.content) {
            task.complete(revivedProgress.content.value);
            this._activeTasks.delete(responsePartId);
          } else {
            task?.complete(void 0);
          }
          return responsePartHandle;
        case "warning":
        case "reference":
          task?.add(revivedProgress);
          return;
      }
    }
    if (revivedProgress.kind === "inlineReference" && revivedProgress.resolveId) {
      if (!this._unresolvedAnchors.has(requestId)) {
        this._unresolvedAnchors.set(requestId, /* @__PURE__ */ new Map());
      }
      this._unresolvedAnchors.get(requestId)?.set(revivedProgress.resolveId, revivedProgress);
    }
    this._pendingProgress.get(requestId)?.(revivedProgress);
  }
  $handleAnchorResolve(requestId, handle, resolveAnchor) {
    const anchor = this._unresolvedAnchors.get(requestId)?.get(handle);
    if (!anchor) {
      return;
    }
    this._unresolvedAnchors.get(requestId)?.delete(handle);
    if (resolveAnchor) {
      const revivedAnchor = revive(resolveAnchor);
      anchor.inlineReference = revivedAnchor.inlineReference;
    }
  }
  $registerAgentCompletionsProvider(handle, id, triggerCharacters) {
    const provide = /* @__PURE__ */ __name(async (query, token) => {
      const completions = await this._proxy.$invokeCompletionProvider(handle, query, token);
      return completions.map((c) => ({ ...c, icon: c.icon ? ThemeIcon.fromId(c.icon) : void 0 }));
    }, "provide");
    this._agentIdsToCompletionProviders.set(id, this._chatAgentService.registerAgentCompletionProvider(id, provide));
    this._agentCompletionProviders.set(handle, this._languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentCompletions:" + handle,
      triggerCharacters,
      provideCompletionItems: /* @__PURE__ */ __name(async (model, position, _context, token) => {
        const widget = this._chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return;
        }
        const triggerCharsPart = triggerCharacters.map((c) => escapeRegExpCharacters(c)).join("");
        const wordRegex = new RegExp(`[${triggerCharsPart}]\\S*`, "g");
        const query = getWordAtText(position.column, wordRegex, model.getLineContent(position.lineNumber), 0)?.word ?? "";
        if (query && !triggerCharacters.some((c) => query.startsWith(c))) {
          return;
        }
        const parsedRequest = this._instantiationService.createInstance(ChatRequestParser).parseChatRequest(widget.viewModel.sessionId, model.getValue()).parts;
        const agentPart = parsedRequest.find((part) => part instanceof ChatRequestAgentPart);
        const thisAgentId = this._agents.get(handle)?.id;
        if (agentPart?.agent.id !== thisAgentId) {
          return;
        }
        const range = computeCompletionRanges(model, position, wordRegex);
        if (!range) {
          return null;
        }
        const result = await provide(query, token);
        const variableItems = result.map((v) => {
          const insertText = v.insertText ?? (typeof v.label === "string" ? v.label : v.label.label);
          const rangeAfterInsert = new Range(range.insert.startLineNumber, range.insert.startColumn, range.insert.endLineNumber, range.insert.startColumn + insertText.length);
          return {
            label: v.label,
            range,
            insertText: insertText + " ",
            kind: CompletionItemKind.Text,
            detail: v.detail,
            documentation: v.documentation,
            command: { id: AddDynamicVariableAction.ID, title: "", arguments: [{ id: v.id, widget, range: rangeAfterInsert, variableData: revive(v.value), command: v.command }] }
          };
        });
        return {
          suggestions: variableItems
        };
      }, "provideCompletionItems")
    }));
  }
  $unregisterAgentCompletionsProvider(handle, id) {
    this._agentCompletionProviders.deleteAndDispose(handle);
    this._agentIdsToCompletionProviders.deleteAndDispose(id);
  }
  $registerChatParticipantDetectionProvider(handle) {
    this._chatParticipantDetectionProviders.set(handle, this._chatAgentService.registerChatParticipantDetectionProvider(
      handle,
      {
        provideParticipantDetection: /* @__PURE__ */ __name(async (request, history, options, token) => {
          return await this._proxy.$detectChatParticipant(handle, request, { history }, options, token);
        }, "provideParticipantDetection")
      }
    ));
  }
  $unregisterChatParticipantDetectionProvider(handle) {
    this._chatParticipantDetectionProviders.deleteAndDispose(handle);
  }
  $registerRelatedFilesProvider(handle, metadata) {
    this._chatRelatedFilesProviders.set(handle, this._chatEditingService.registerRelatedFilesProvider(handle, {
      description: metadata.description,
      provideRelatedFiles: /* @__PURE__ */ __name(async (request, token) => {
        return (await this._proxy.$provideRelatedFiles(handle, request, token))?.map((v) => ({ uri: URI.from(v.uri), description: v.description })) ?? [];
      }, "provideRelatedFiles")
    }));
  }
  $unregisterRelatedFilesProvider(handle) {
    this._chatRelatedFilesProviders.deleteAndDispose(handle);
  }
};
__name(MainThreadChatAgents2, "MainThreadChatAgents2");
MainThreadChatAgents2 = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatAgents2),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatEditingService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IExtensionService)
], MainThreadChatAgents2);
function computeCompletionRanges(model, position, reg) {
  const varWord = getWordAtText(position.column, reg, model.getLineContent(position.lineNumber), 0);
  if (!varWord && model.getWordUntilPosition(position).word) {
    return;
  }
  let insert;
  let replace;
  if (!varWord) {
    insert = replace = Range.fromPositions(position);
  } else {
    insert = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, position.column);
    replace = new Range(position.lineNumber, varWord.startColumn, position.lineNumber, varWord.endColumn);
  }
  return { insert, replace };
}
__name(computeCompletionRanges, "computeCompletionRanges");
var ChatNotebookEdit;
((ChatNotebookEdit2) => {
  function fromChatEdit(part) {
    return {
      kind: "notebookEdit",
      uri: part.uri,
      done: part.done,
      edits: part.edits.map(NotebookDto.fromCellEditOperationDto)
    };
  }
  ChatNotebookEdit2.fromChatEdit = fromChatEdit;
  __name(fromChatEdit, "fromChatEdit");
})(ChatNotebookEdit || (ChatNotebookEdit = {}));
export {
  MainThreadChatAgents2,
  MainThreadChatTask
};
//# sourceMappingURL=mainThreadChatAgents2.js.map
