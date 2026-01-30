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
import { DeferredPromise } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { Schemas } from "../../../base/common/network.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { URI } from "../../../base/common/uri.js";
import { Range } from "../../../editor/common/core/range.js";
import { getWordAtText } from "../../../editor/common/core/wordHelper.js";
import { ILanguageFeaturesService } from "../../../editor/common/services/languageFeatures.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../platform/uriIdentity/common/uriIdentity.js";
import { IChatWidgetService } from "../../contrib/chat/browser/chat.js";
import { AddDynamicVariableAction } from "../../contrib/chat/browser/attachments/chatDynamicVariables.js";
import { IChatAgentService } from "../../contrib/chat/common/participants/chatAgents.js";
import { IPromptsService } from "../../contrib/chat/common/promptSyntax/service/promptsService.js";
import { isValidPromptType } from "../../contrib/chat/common/promptSyntax/promptTypes.js";
import { IChatPromptContentStore } from "../../contrib/chat/common/promptSyntax/chatPromptContentStore.js";
import { IChatEditingService } from "../../contrib/chat/common/editing/chatEditingService.js";
import { ChatRequestAgentPart } from "../../contrib/chat/common/requestParser/chatParserTypes.js";
import { ChatRequestParser } from "../../contrib/chat/common/requestParser/chatRequestParser.js";
import { IChatService } from "../../contrib/chat/common/chatService/chatService.js";
import { IChatSessionsService } from "../../contrib/chat/common/chatSessionsService.js";
import { ChatAgentLocation, ChatModeKind } from "../../contrib/chat/common/constants.js";
import { ILanguageModelToolsService } from "../../contrib/chat/common/tools/languageModelToolsService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
class MainThreadChatTask {
  static {
    __name(this, "MainThreadChatTask");
  }
  get onDidAddProgress() {
    return this._onDidAddProgress.event;
  }
  constructor(content) {
    this.content = content;
    this.kind = "progressTask";
    this.deferred = new DeferredPromise();
    this._onDidAddProgress = new Emitter();
    this.progress = [];
  }
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
  toJSON() {
    return {
      kind: "progressTaskSerialized",
      content: this.content,
      progress: this.progress
    };
  }
}
let MainThreadChatAgents2 = class MainThreadChatAgents22 extends Disposable {
  static {
    __name(this, "MainThreadChatAgents2");
  }
  constructor(extHostContext, _chatAgentService, _chatSessionService, _chatService, _chatEditingService, _languageFeaturesService, _chatWidgetService, _instantiationService, _logService, _extensionService, _uriIdentityService, _promptsService, _chatPromptContentStore, _languageModelToolsService) {
    super();
    this._chatAgentService = _chatAgentService;
    this._chatSessionService = _chatSessionService;
    this._chatService = _chatService;
    this._chatEditingService = _chatEditingService;
    this._languageFeaturesService = _languageFeaturesService;
    this._chatWidgetService = _chatWidgetService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._extensionService = _extensionService;
    this._uriIdentityService = _uriIdentityService;
    this._promptsService = _promptsService;
    this._chatPromptContentStore = _chatPromptContentStore;
    this._languageModelToolsService = _languageModelToolsService;
    this._agents = this._register(new DisposableMap());
    this._agentCompletionProviders = this._register(new DisposableMap());
    this._agentIdsToCompletionProviders = this._register(new DisposableMap());
    this._chatParticipantDetectionProviders = this._register(new DisposableMap());
    this._chatRelatedFilesProviders = this._register(new DisposableMap());
    this._promptFileProviders = this._register(new DisposableMap());
    this._promptFileProviderEmitters = this._register(new DisposableMap());
    this._promptFileContentRegistrations = this._register(new DisposableMap());
    this._pendingProgress = /* @__PURE__ */ new Map();
    this._activeTasks = /* @__PURE__ */ new Map();
    this._unresolvedAnchors = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatAgents2);
    this._register(this._chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResource) {
        this._proxy.$releaseSession(resource);
      }
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
  $unregisterAgent(handle) {
    this._agents.deleteAndDispose(handle);
  }
  async $transferActiveChatSession(toWorkspace) {
    const widget = this._chatWidgetService.lastFocusedWidget;
    const model = widget?.viewModel?.model;
    if (!model) {
      this._logService.error(`MainThreadChat#$transferActiveChatSession: No active chat session found`);
      return;
    }
    await this._chatService.transferChatSession(model.sessionResource, URI.revive(toWorkspace));
  }
  async $registerAgent(handle, extension, id, metadata, dynamicProps) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const staticAgentRegistration = this._chatAgentService.getAgent(id, true);
    const chatSessionRegistration = this._chatSessionService.getAllChatSessionContributions().find((c) => c.type === id || c.alternativeIds?.includes(id));
    if (!staticAgentRegistration && !chatSessionRegistration && !dynamicProps) {
      if (this._chatAgentService.getAgentsByName(id).length) {
        throw new Error(`chatParticipant must be declared with an ID in package.json. The "id" property may be missing! "${id}"`);
      }
      throw new Error(`chatParticipant must be declared in package.json: ${id}`);
    }
    const impl = {
      invoke: /* @__PURE__ */ __name(async (request, progress, history, token) => {
        const chatSession = this._chatService.getSession(request.sessionResource);
        this._pendingProgress.set(request.requestId, { progress, chatSession });
        try {
          return await this._proxy.$invokeAgent(handle, request, {
            history,
            chatSessionContext: chatSession?.contributedChatSession
          }, token) ?? {};
        } finally {
          this._pendingProgress.delete(request.requestId);
        }
      }, "invoke"),
      setRequestTools: /* @__PURE__ */ __name((requestId, tools) => {
        this._proxy.$setRequestTools(requestId, tools);
      }, "setRequestTools"),
      provideFollowups: /* @__PURE__ */ __name(async (request, result, history, token) => {
        if (!this._agents.get(handle)?.hasFollowups) {
          return [];
        }
        return this._proxy.$provideFollowups(request, handle, result, { history }, token);
      }, "provideFollowups"),
      provideChatTitle: /* @__PURE__ */ __name((history, token) => {
        return this._proxy.$provideChatTitle(handle, history, token);
      }, "provideChatTitle"),
      provideChatSummary: /* @__PURE__ */ __name((history, token) => {
        return this._proxy.$provideChatSummary(handle, history, token);
      }, "provideChatSummary")
    };
    if (chatSessionRegistration?.alternativeIds?.includes(id)) {
      return;
    }
    let disposable;
    if (!staticAgentRegistration && dynamicProps) {
      const extensionDescription = this._extensionService.extensions.find((e) => ExtensionIdentifier.equals(e.identifier, extension));
      disposable = this._chatAgentService.registerDynamicAgent({
        id,
        name: dynamicProps.name,
        description: dynamicProps.description,
        extensionId: extension,
        extensionVersion: extensionDescription?.version,
        extensionDisplayName: extensionDescription?.displayName ?? extension.value,
        extensionPublisherId: extensionDescription?.publisher ?? "",
        publisherDisplayName: dynamicProps.publisherName,
        fullName: dynamicProps.fullName,
        metadata: revive(metadata),
        slashCommands: [],
        disambiguation: [],
        locations: [ChatAgentLocation.Chat],
        modes: [ChatModeKind.Ask, ChatModeKind.Agent, ChatModeKind.Edit]
      }, impl);
    } else {
      disposable = this._chatAgentService.registerAgentImplementation(id, impl);
    }
    this._agents.set(handle, {
      id,
      extensionId: extension,
      dispose: /* @__PURE__ */ __name(() => disposable.dispose(), "dispose"),
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
  async $handleProgressChunk(requestId, chunks) {
    const pendingProgress = this._pendingProgress.get(requestId);
    if (!pendingProgress) {
      this._logService.warn(`MainThreadChatAgents2#$handleProgressChunk: No pending progress for requestId ${requestId}`);
      return;
    }
    const { progress, chatSession } = pendingProgress;
    const chatProgressParts = [];
    for (const item of chunks) {
      const [progress2, responsePartHandle] = Array.isArray(item) ? item : [item];
      if (progress2.kind === "externalEdits") {
        const response = chatSession?.getRequests().at(-1)?.response;
        if (chatSession?.editingSession && responsePartHandle !== void 0 && response) {
          const parts = progress2.start ? await chatSession.editingSession.startExternalEdits(response, responsePartHandle, revive(progress2.resources), progress2.undoStopId) : await chatSession.editingSession.stopExternalEdits(response, responsePartHandle);
          chatProgressParts.push(...parts);
        }
        continue;
      }
      if (progress2.kind === "beginToolInvocation") {
        this._languageModelToolsService.beginToolCall({
          toolCallId: progress2.toolCallId,
          toolId: progress2.toolName,
          chatRequestId: requestId,
          sessionResource: chatSession?.sessionResource,
          subagentInvocationId: progress2.subagentInvocationId
        });
        continue;
      }
      if (progress2.kind === "updateToolInvocation") {
        this._languageModelToolsService.updateToolStream(progress2.toolCallId, progress2.streamData?.partialInput, CancellationToken.None);
        continue;
      }
      const revivedProgress = progress2.kind === "notebookEdit" ? ChatNotebookEdit.fromChatEdit(progress2) : revive(progress2);
      if (revivedProgress.kind === "notebookEdit" || revivedProgress.kind === "textEdit" || revivedProgress.kind === "codeblockUri") {
        revivedProgress.uri = this._uriIdentityService.asCanonicalUri(revivedProgress.uri);
      }
      if (responsePartHandle !== void 0) {
        if (revivedProgress.kind === "progressTask") {
          const handle = responsePartHandle;
          const responsePartId = `${requestId}_${handle}`;
          const task = new MainThreadChatTask(revivedProgress.content);
          this._activeTasks.set(responsePartId, task);
          chatProgressParts.push(task);
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
              break;
            case "warning":
            case "reference":
              task?.add(revivedProgress);
              break;
          }
        }
        continue;
      }
      if (revivedProgress.kind === "inlineReference" && revivedProgress.resolveId) {
        if (!this._unresolvedAnchors.has(requestId)) {
          this._unresolvedAnchors.set(requestId, /* @__PURE__ */ new Map());
        }
        this._unresolvedAnchors.get(requestId)?.set(revivedProgress.resolveId, revivedProgress);
      }
      chatProgressParts.push(revivedProgress);
    }
    progress(chatProgressParts);
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
    this._agentCompletionProviders.set(handle, this._languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
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
        const parsedRequest = this._instantiationService.createInstance(ChatRequestParser).parseChatRequest(widget.viewModel.sessionResource, model.getValue()).parts;
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
            kind: 18,
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
    this._chatParticipantDetectionProviders.set(handle, this._chatAgentService.registerChatParticipantDetectionProvider(handle, {
      provideParticipantDetection: /* @__PURE__ */ __name(async (request, history, options, token) => {
        return await this._proxy.$detectChatParticipant(handle, request, { history }, options, token);
      }, "provideParticipantDetection")
    }));
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
  async $registerPromptFileProvider(handle, type, extensionId) {
    const extension = await this._extensionService.getExtension(extensionId.value);
    if (!extension) {
      this._logService.error(`[MainThreadChatAgents2] Could not find extension for prompt file provider: ${extensionId.value}`);
      return;
    }
    if (!isValidPromptType(type)) {
      this._logService.error(`[MainThreadChatAgents2] Invalid contribution type: ${type}`);
      return;
    }
    const emitter = new Emitter();
    this._promptFileProviderEmitters.set(handle, emitter);
    const contentRegistrations = new DisposableMap();
    this._promptFileContentRegistrations.set(handle, contentRegistrations);
    const disposable = this._promptsService.registerPromptFileProvider(extension, type, {
      onDidChangePromptFiles: emitter.event,
      providePromptFiles: /* @__PURE__ */ __name(async (context, token) => {
        const contributions = await this._proxy.$providePromptFiles(handle, type, context, token);
        if (!contributions) {
          return void 0;
        }
        return contributions.map((c) => {
          const uri = URI.revive(c.uri);
          if (c.content && uri.scheme === Schemas.vscodeChatPrompt) {
            const uriKey = uri.toString();
            contentRegistrations.deleteAndDispose(uriKey);
            contentRegistrations.set(uriKey, this._chatPromptContentStore.registerContent(uri, c.content));
          }
          return {
            uri,
            isEditable: c.isEditable
          };
        });
      }, "providePromptFiles")
    });
    this._promptFileProviders.set(handle, disposable);
  }
  $unregisterPromptFileProvider(handle) {
    this._promptFileProviders.deleteAndDispose(handle);
    this._promptFileProviderEmitters.deleteAndDispose(handle);
    this._promptFileContentRegistrations.deleteAndDispose(handle);
  }
  $onDidChangePromptFiles(handle) {
    const emitter = this._promptFileProviderEmitters.get(handle);
    if (emitter) {
      emitter.fire();
    }
  }
};
MainThreadChatAgents2 = __decorate([
  extHostNamedCustomer(MainContext.MainThreadChatAgents2),
  __param(1, IChatAgentService),
  __param(2, IChatSessionsService),
  __param(3, IChatService),
  __param(4, IChatEditingService),
  __param(5, ILanguageFeaturesService),
  __param(6, IChatWidgetService),
  __param(7, IInstantiationService),
  __param(8, ILogService),
  __param(9, IExtensionService),
  __param(10, IUriIdentityService),
  __param(11, IPromptsService),
  __param(12, IChatPromptContentStore),
  __param(13, ILanguageModelToolsService)
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
(function(ChatNotebookEdit2) {
  function fromChatEdit(part) {
    return {
      kind: "notebookEdit",
      uri: URI.revive(part.uri),
      done: part.done,
      edits: part.edits.map(NotebookDto.fromCellEditOperationDto)
    };
  }
  __name(fromChatEdit, "fromChatEdit");
  ChatNotebookEdit2.fromChatEdit = fromChatEdit;
})(ChatNotebookEdit || (ChatNotebookEdit = {}));
export {
  MainThreadChatAgents2,
  MainThreadChatTask
};
//# sourceMappingURL=mainThreadChatAgents2.js.map
