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
var ExtHostChatSessions_1;
import { coalesce } from "../../../base/common/arrays.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { CancellationError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, toDisposable } from "../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../base/common/map.js";
import * as objects from "../../../base/common/objects.js";
import { basename } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { SymbolKinds } from "../../../editor/common/languages.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { IDiagnosticVariableEntryFilterData, PromptFileVariableKind } from "../../contrib/chat/common/attachments/chatVariableEntries.js";
import { ChatAgentLocation } from "../../contrib/chat/common/constants.js";
import { MainContext } from "./extHost.protocol.js";
import { ChatAgentResponseStream } from "./extHostChatAgents2.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import * as typeConvert from "./extHostTypeConverters.js";
import { Diagnostic } from "./extHostTypeConverters.js";
import * as extHostTypes from "./extHostTypes.js";
class ChatSessionItemImpl {
  static {
    __name(this, "ChatSessionItemImpl");
  }
  #label;
  #iconPath;
  #description;
  #badge;
  #status;
  #archived;
  #tooltip;
  #timing;
  #changes;
  #metadata;
  #onChanged;
  constructor(resource, label, onChanged) {
    this.resource = resource;
    this.#label = label;
    this.#onChanged = onChanged;
  }
  get label() {
    return this.#label;
  }
  set label(value) {
    if (this.#label !== value) {
      this.#label = value;
      this.#onChanged();
    }
  }
  get iconPath() {
    return this.#iconPath;
  }
  set iconPath(value) {
    if (this.#iconPath !== value) {
      this.#iconPath = value;
      this.#onChanged();
    }
  }
  get description() {
    return this.#description;
  }
  set description(value) {
    if (this.#description !== value) {
      this.#description = value;
      this.#onChanged();
    }
  }
  get badge() {
    return this.#badge;
  }
  set badge(value) {
    if (this.#badge !== value) {
      this.#badge = value;
      this.#onChanged();
    }
  }
  get status() {
    return this.#status;
  }
  set status(value) {
    if (this.#status !== value) {
      this.#status = value;
      this.#onChanged();
    }
  }
  get archived() {
    return this.#archived;
  }
  set archived(value) {
    if (this.#archived !== value) {
      this.#archived = value;
      this.#onChanged();
    }
  }
  get tooltip() {
    return this.#tooltip;
  }
  set tooltip(value) {
    if (this.#tooltip !== value) {
      this.#tooltip = value;
      this.#onChanged();
    }
  }
  get timing() {
    return this.#timing;
  }
  set timing(value) {
    if (this.#timing !== value) {
      this.#timing = value;
      this.#onChanged();
    }
  }
  get changes() {
    return this.#changes;
  }
  set changes(value) {
    if (this.#changes !== value) {
      this.#changes = value;
      this.#onChanged();
    }
  }
  get metadata() {
    return this.#metadata;
  }
  set metadata(value) {
    if (value !== void 0) {
      try {
        JSON.stringify(value);
      } catch {
        throw new Error("metadata must be JSON-serializable");
      }
    }
    if (!objects.equals(this.#metadata, value)) {
      this.#metadata = value;
      this.#onChanged();
    }
  }
}
function computeItemsDelta(oldItems, newItems) {
  const delta = {
    addedOrUpdated: new ResourceMap(),
    removed: new ResourceSet()
  };
  for (const [newResource, newItem] of newItems) {
    const oldItem = oldItems.get(newResource);
    if (oldItem !== newItem) {
      delta.addedOrUpdated.set(newResource, newItem);
    }
  }
  for (const oldResource of oldItems.keys()) {
    if (!newItems.has(oldResource)) {
      delta.removed.add(oldResource);
    }
  }
  return delta;
}
__name(computeItemsDelta, "computeItemsDelta");
function convertChatSessionDeltaToDto(delta) {
  return {
    addedOrUpdated: delta.addedOrUpdated ? Array.from(delta.addedOrUpdated.values(), typeConvert.ChatSessionItem.from) : [],
    removed: delta.removed ? Array.from(delta.removed.keys()) : []
  };
}
__name(convertChatSessionDeltaToDto, "convertChatSessionDeltaToDto");
class ChatSessionItemCollectionImpl {
  static {
    __name(this, "ChatSessionItemCollectionImpl");
  }
  #items = new ResourceMap();
  #proxy;
  #controllerHandle;
  constructor(controllerHandle, proxy) {
    this.#proxy = proxy;
    this.#controllerHandle = controllerHandle;
  }
  get size() {
    return this.#items.size;
  }
  replace(newItems) {
    if (!newItems.length && !this.#items.size) {
      return;
    }
    const newItemsMap = new ResourceMap(newItems.map((item) => [item.resource, item]));
    const delta = computeItemsDelta(this.#items, newItemsMap);
    if (!delta.addedOrUpdated?.size && !delta.removed?.size) {
      return;
    }
    this.#items = newItemsMap;
    void this.#proxy.$updateChatSessionItems(this.#controllerHandle, convertChatSessionDeltaToDto(delta));
  }
  forEach(callback, thisArg) {
    for (const [_, item] of this.#items) {
      callback.call(thisArg, item, this);
    }
  }
  add(item) {
    const existing = this.#items.get(item.resource);
    if (existing && existing === item) {
      return;
    }
    this.#items.set(item.resource, item);
    void this.#proxy.$addOrUpdateChatSessionItem(this.#controllerHandle, typeConvert.ChatSessionItem.from(item));
  }
  delete(resource) {
    if (this.#items.delete(resource)) {
      void this.#proxy.$updateChatSessionItems(this.#controllerHandle, {
        addedOrUpdated: [],
        removed: [resource]
      });
    }
  }
  get(resource) {
    return this.#items.get(resource);
  }
  [Symbol.iterator]() {
    return this.#items.entries();
  }
}
class ExtHostChatSession {
  static {
    __name(this, "ExtHostChatSession");
  }
  constructor(session, extension, request, proxy, commandsConverter, sessionDisposables) {
    this.session = session;
    this.extension = extension;
    this.proxy = proxy;
    this.commandsConverter = commandsConverter;
    this.sessionDisposables = sessionDisposables;
    this._pendingCarouselResolvers = /* @__PURE__ */ new Map();
    this._stream = new ChatAgentResponseStream(extension, request, proxy, commandsConverter, sessionDisposables, this._pendingCarouselResolvers, CancellationToken.None);
  }
  get activeResponseStream() {
    return this._stream;
  }
  getActiveRequestStream(request) {
    return new ChatAgentResponseStream(this.extension, request, this.proxy, this.commandsConverter, this.sessionDisposables, this._pendingCarouselResolvers, CancellationToken.None);
  }
}
let ExtHostChatSessions = class ExtHostChatSessions2 extends Disposable {
  static {
    __name(this, "ExtHostChatSessions");
  }
  static {
    ExtHostChatSessions_1 = this;
  }
  static {
    this._sessionHandlePool = 0;
  }
  constructor(commands, _languageModels, _extHostRpc, _logService) {
    super();
    this.commands = commands;
    this._languageModels = _languageModels;
    this._extHostRpc = _extHostRpc;
    this._logService = _logService;
    this._itemControllerHandlePool = 0;
    this._chatSessionItemControllers = /* @__PURE__ */ new Map();
    this._contentProviderHandlePool = 0;
    this._chatSessionContentProviders = /* @__PURE__ */ new Map();
    this._extHostChatSessions = new ResourceMap();
    this._providerOptionGroups = /* @__PURE__ */ new Map();
    this._proxy = this._extHostRpc.getProxy(MainContext.MainThreadChatSessions);
    commands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg) => {
        if (arg && arg.$mid === 25) {
          const resource = arg.session.resource;
          for (const { controller } of this._chatSessionItemControllers.values()) {
            const item = controller.items.get(resource);
            if (item) {
              return item;
            }
          }
          this._logService.warn(`No chat session found with uri: ${resource}`);
          return arg;
        }
        return arg;
      }, "processArgument")
    });
  }
  registerChatSessionItemProvider(extension, chatSessionType, provider) {
    const controllerHandle = this._itemControllerHandlePool++;
    const disposables = new DisposableStore();
    const onDidChangeChatSessionItemStateEmitter = disposables.add(new Emitter());
    const collection = new ChatSessionItemCollectionImpl(controllerHandle, this._proxy);
    const controller = {
      id: chatSessionType,
      items: collection,
      createChatSessionItem: /* @__PURE__ */ __name((_resource, _label) => {
        throw new Error("Not implemented for providers");
      }, "createChatSessionItem"),
      onDidChangeChatSessionItemState: onDidChangeChatSessionItemStateEmitter.event,
      newChatSessionItemHandler: void 0,
      dispose: /* @__PURE__ */ __name(() => {
        disposables.dispose();
      }, "dispose"),
      refreshHandler: /* @__PURE__ */ __name(async (token) => {
        const items = await provider.provideChatSessionItems(token) ?? [];
        collection.replace(items);
      }, "refreshHandler")
    };
    this._chatSessionItemControllers.set(controllerHandle, { chatSessionType, controller, extension, disposable: disposables, onDidChangeChatSessionItemStateEmitter });
    this._proxy.$registerChatSessionItemController(controllerHandle, chatSessionType);
    if (provider.onDidChangeChatSessionItems) {
      disposables.add(provider.onDidChangeChatSessionItems(() => {
        this._logService.trace(`ExtHostChatSessions. Provider items changed for ${chatSessionType}`);
        controller.refreshHandler(CancellationToken.None);
      }));
    }
    if (provider.onDidCommitChatSessionItem) {
      disposables.add(provider.onDidCommitChatSessionItem((e) => {
        const { original, modified } = e;
        this._proxy.$onDidCommitChatSessionItem(controllerHandle, original.resource, modified.resource);
      }));
    }
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._chatSessionItemControllers.delete(controllerHandle);
        disposables.dispose();
        this._proxy.$unregisterChatSessionItemController(controllerHandle);
      }, "dispose")
    };
  }
  createChatSessionItemController(extension, id, refreshHandler) {
    const controllerHandle = this._itemControllerHandlePool++;
    const disposables = new DisposableStore();
    let isDisposed = false;
    let newChatSessionItemHandler;
    const onDidChangeChatSessionItemStateEmitter = disposables.add(new Emitter());
    const collection = new ChatSessionItemCollectionImpl(controllerHandle, this._proxy);
    const controller = Object.freeze({
      id,
      refreshHandler: /* @__PURE__ */ __name(async (refreshToken) => {
        if (isDisposed) {
          throw new Error("ChatSessionItemController has been disposed");
        }
        this._logService.trace(`ExtHostChatSessions. Controller(${id}).refresh()`);
        await refreshHandler(refreshToken);
      }, "refreshHandler"),
      items: collection,
      onDidChangeChatSessionItemState: onDidChangeChatSessionItemStateEmitter.event,
      createChatSessionItem: /* @__PURE__ */ __name((resource, label) => {
        if (isDisposed) {
          throw new Error("ChatSessionItemController has been disposed");
        }
        const item = new ChatSessionItemImpl(resource, label, () => {
          if (collection.get(resource) === item) {
            void this._proxy.$addOrUpdateChatSessionItem(controllerHandle, typeConvert.ChatSessionItem.from(item));
          }
        });
        return item;
      }, "createChatSessionItem"),
      get newChatSessionItemHandler() {
        return newChatSessionItemHandler;
      },
      set newChatSessionItemHandler(handler) {
        newChatSessionItemHandler = handler;
      },
      dispose: /* @__PURE__ */ __name(() => {
        isDisposed = true;
        disposables.dispose();
      }, "dispose")
    });
    this._chatSessionItemControllers.set(controllerHandle, { controller, extension, disposable: disposables, chatSessionType: id, onDidChangeChatSessionItemStateEmitter });
    this._proxy.$registerChatSessionItemController(controllerHandle, id);
    disposables.add(toDisposable(() => {
      this._chatSessionItemControllers.delete(controllerHandle);
      this._proxy.$unregisterChatSessionItemController(controllerHandle);
    }));
    return controller;
  }
  registerChatSessionContentProvider(extension, chatSessionScheme, chatParticipant, provider, capabilities) {
    const handle = this._contentProviderHandlePool++;
    const disposables = new DisposableStore();
    this._chatSessionContentProviders.set(handle, { provider, extension, capabilities, disposable: disposables });
    this._proxy.$registerChatSessionContentProvider(handle, chatSessionScheme);
    if (provider.onDidChangeChatSessionOptions) {
      disposables.add(provider.onDidChangeChatSessionOptions((evt) => {
        this._proxy.$onDidChangeChatSessionOptions(handle, evt.resource, evt.updates);
      }));
    }
    if (provider.onDidChangeChatSessionProviderOptions) {
      disposables.add(provider.onDidChangeChatSessionProviderOptions(() => {
        this._proxy.$onDidChangeChatSessionProviderOptions(handle);
      }));
    }
    return new extHostTypes.Disposable(() => {
      this._chatSessionContentProviders.delete(handle);
      disposables.dispose();
      this._proxy.$unregisterChatSessionContentProvider(handle);
    });
  }
  async $provideChatSessionContent(handle, sessionResourceComponents, token) {
    const provider = this._chatSessionContentProviders.get(handle);
    if (!provider) {
      throw new Error(`No provider for handle ${handle}`);
    }
    const sessionResource = URI.revive(sessionResourceComponents);
    const session = await provider.provider.provideChatSessionContent(sessionResource, token);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const sessionDisposables = new DisposableStore();
    const sessionId = ExtHostChatSessions_1._sessionHandlePool++;
    const id = sessionResource.toString();
    const chatSession = new ExtHostChatSession(session, provider.extension, {
      sessionResource,
      requestId: "ongoing",
      agentId: id,
      message: "",
      variables: { variables: [] },
      location: ChatAgentLocation.Chat
    }, {
      $handleProgressChunk: /* @__PURE__ */ __name((requestId, chunks) => {
        return this._proxy.$handleProgressChunk(handle, sessionResource, requestId, chunks);
      }, "$handleProgressChunk"),
      $handleAnchorResolve: /* @__PURE__ */ __name((requestId, requestHandle, anchor) => {
        this._proxy.$handleAnchorResolve(handle, sessionResource, requestId, requestHandle, anchor);
      }, "$handleAnchorResolve")
    }, this.commands.converter, sessionDisposables);
    const disposeCts = sessionDisposables.add(new CancellationTokenSource());
    this._extHostChatSessions.set(sessionResource, { sessionObj: chatSession, disposeCts });
    if (session.activeResponseCallback) {
      Promise.resolve(session.activeResponseCallback(chatSession.activeResponseStream.apiObject, disposeCts.token)).finally(() => {
        this._proxy.$handleProgressComplete(handle, sessionResource, "ongoing");
      });
    }
    const { capabilities } = provider;
    return {
      id: sessionId + "",
      resource: URI.revive(sessionResource),
      title: session.title,
      hasActiveResponseCallback: !!session.activeResponseCallback,
      hasRequestHandler: !!session.requestHandler,
      supportsInterruption: !!capabilities?.supportsInterruptions,
      options: session.options,
      history: session.history.map((turn) => {
        if (turn instanceof extHostTypes.ChatRequestTurn) {
          return this.convertRequestTurn(turn);
        } else {
          return this.convertResponseTurn(turn, sessionDisposables);
        }
      })
    };
  }
  async $provideHandleOptionsChange(handle, sessionResourceComponents, updates, token) {
    const sessionResource = URI.revive(sessionResourceComponents);
    const provider = this._chatSessionContentProviders.get(handle);
    if (!provider) {
      this._logService.warn(`No provider for handle ${handle}`);
      return;
    }
    if (!provider.provider.provideHandleOptionsChange) {
      this._logService.debug(`Provider for handle ${handle} does not implement provideHandleOptionsChange`);
      return;
    }
    try {
      const updatesToSend = updates.map((update) => ({
        optionId: update.optionId,
        value: update.value === void 0 ? void 0 : typeof update.value === "string" ? update.value : update.value.id
      }));
      await provider.provider.provideHandleOptionsChange(sessionResource, updatesToSend, token);
    } catch (error) {
      this._logService.error(`Error calling provideHandleOptionsChange for handle ${handle}, sessionResource ${sessionResource}:`, error);
    }
  }
  async $provideChatSessionProviderOptions(handle, token) {
    const entry = this._chatSessionContentProviders.get(handle);
    if (!entry) {
      this._logService.warn(`No provider for handle ${handle} when requesting chat session options`);
      return;
    }
    const provider = entry.provider;
    if (!provider.provideChatSessionProviderOptions) {
      return;
    }
    try {
      const result = await provider.provideChatSessionProviderOptions(token);
      if (!result) {
        return;
      }
      const { optionGroups, newSessionOptions } = result;
      if (optionGroups) {
        this._providerOptionGroups.set(handle, optionGroups);
      }
      return {
        optionGroups,
        newSessionOptions
      };
    } catch (error) {
      this._logService.error(`Error calling provideChatSessionProviderOptions for handle ${handle}:`, error);
      return;
    }
  }
  async $interruptChatSessionActiveResponse(providerHandle, sessionResource, requestId) {
    const entry = this._extHostChatSessions.get(URI.revive(sessionResource));
    entry?.disposeCts.cancel();
  }
  async $disposeChatSessionContent(providerHandle, sessionResource) {
    const entry = this._extHostChatSessions.get(URI.revive(sessionResource));
    if (!entry) {
      this._logService.warn(`No chat session found for resource: ${sessionResource}`);
      return;
    }
    entry.disposeCts.cancel();
    entry.sessionObj.sessionDisposables.dispose();
    this._extHostChatSessions.delete(URI.revive(sessionResource));
  }
  async $invokeChatSessionRequestHandler(handle, sessionResource, request, history, token) {
    const entry = this._extHostChatSessions.get(URI.revive(sessionResource));
    if (!entry || !entry.sessionObj.session.requestHandler) {
      return {};
    }
    const chatRequest = typeConvert.ChatAgentRequest.to(request, void 0, await this.getModelForRequest(request, entry.sessionObj.extension), [], /* @__PURE__ */ new Map(), entry.sessionObj.extension, this._logService);
    const stream = entry.sessionObj.getActiveRequestStream(request);
    await entry.sessionObj.session.requestHandler(chatRequest, { history, yieldRequested: false }, stream.apiObject, token);
    return {};
  }
  async getModelForRequest(request, extension) {
    let model;
    if (request.userSelectedModelId) {
      model = await this._languageModels.getLanguageModelByIdentifier(extension, request.userSelectedModelId);
    }
    if (!model) {
      model = await this._languageModels.getDefaultLanguageModel(extension);
      if (!model) {
        throw new Error("Language model unavailable");
      }
    }
    return model;
  }
  convertRequestTurn(turn) {
    const variables = turn.references.map((ref) => this.convertReferenceToVariable(ref));
    return {
      type: "request",
      id: turn.id,
      prompt: turn.prompt,
      participant: turn.participant,
      command: turn.command,
      variableData: variables.length > 0 ? { variables } : void 0,
      modelId: turn.modelId
    };
  }
  convertReferenceToVariable(ref) {
    const value = ref.value && typeof ref.value === "object" && "uri" in ref.value && "range" in ref.value ? typeConvert.Location.from(ref.value) : ref.value;
    const range = ref.range ? { start: ref.range[0], endExclusive: ref.range[1] } : void 0;
    if (value && value instanceof extHostTypes.ChatReferenceDiagnostic && Array.isArray(value.diagnostics) && value.diagnostics.length && value.diagnostics[0][1].length) {
      const marker = Diagnostic.from(value.diagnostics[0][1][0]);
      const refValue = {
        filterRange: { startLineNumber: marker.startLineNumber, startColumn: marker.startColumn, endLineNumber: marker.endLineNumber, endColumn: marker.endColumn },
        filterSeverity: marker.severity,
        filterUri: value.diagnostics[0][0],
        problemMessage: value.diagnostics[0][1][0].message
      };
      return IDiagnosticVariableEntryFilterData.toEntry(refValue);
    }
    if (extHostTypes.Location.isLocation(ref.value) && ref.name.startsWith(`sym:`)) {
      const loc = typeConvert.Location.from(ref.value);
      return {
        id: ref.id,
        name: ref.name,
        fullName: ref.name.substring(4),
        value: { uri: ref.value.uri, range: loc.range },
        // We never send this information to extensions, so default to Property
        symbolKind: 6,
        // We never send this information to extensions, so default to Property
        icon: SymbolKinds.toIcon(
          6
          /* SymbolKind.Property */
        ),
        kind: "symbol",
        range
      };
    }
    if (URI.isUri(value) && ref.name.startsWith(`prompt:`) && ref.id.startsWith(PromptFileVariableKind.PromptFile) && ref.id.endsWith(value.toString())) {
      return {
        id: ref.id,
        name: `prompt:${basename(value)}`,
        value,
        kind: "promptFile",
        modelDescription: "Prompt instructions file",
        isRoot: true,
        automaticallyAdded: false,
        range
      };
    }
    const isFile = URI.isUri(value) || value && typeof value === "object" && "uri" in value;
    const isFolder = isFile && URI.isUri(value) && value.path.endsWith("/");
    return {
      id: ref.id,
      name: ref.name,
      value,
      modelDescription: ref.modelDescription,
      range,
      kind: isFolder ? "directory" : isFile ? "file" : "generic"
    };
  }
  convertResponseTurn(turn, sessionDisposables) {
    const parts = coalesce(turn.response.map((r) => typeConvert.ChatResponsePart.from(r, this.commands.converter, sessionDisposables)));
    return {
      type: "response",
      parts,
      participant: turn.participant
    };
  }
  async $invokeOptionGroupSearch(providerHandle, optionGroupId, query, token) {
    const optionGroups = this._providerOptionGroups.get(providerHandle);
    if (!optionGroups) {
      this._logService.warn(`No option groups found for provider handle ${providerHandle}`);
      return [];
    }
    const group = optionGroups.find((g) => g.id === optionGroupId);
    if (!group || !group.onSearch) {
      this._logService.warn(`No onSearch callback found for option group ${optionGroupId}`);
      return [];
    }
    try {
      const results = await group.onSearch(query, token);
      return results ?? [];
    } catch (error) {
      this._logService.error(`Error calling onSearch for option group ${optionGroupId}:`, error);
      return [];
    }
  }
  async $refreshChatSessionItems(handle, token) {
    const controllerData = this._chatSessionItemControllers.get(handle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${handle}`);
      return;
    }
    await controllerData.controller.refreshHandler(token);
  }
  async $newChatSessionItem(handle, request, token) {
    const controllerData = this._chatSessionItemControllers.get(handle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${handle}`);
      return void 0;
    }
    const handler = controllerData.controller.newChatSessionItemHandler;
    if (!handler) {
      return void 0;
    }
    const model = await this.getModelForRequest(request, controllerData.extension);
    const chatRequest = typeConvert.ChatAgentRequest.to(request, void 0, model, [], /* @__PURE__ */ new Map(), controllerData.extension, this._logService);
    const item = await handler({ request: chatRequest }, token);
    if (!item) {
      return void 0;
    }
    return typeConvert.ChatSessionItem.from(item);
  }
  $onDidChangeChatSessionItemState(controllerHandle, sessionResourceComponents, archived) {
    const controllerData = this._chatSessionItemControllers.get(controllerHandle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${controllerHandle}`);
      return;
    }
    const sessionResource = URI.revive(sessionResourceComponents);
    const item = controllerData.controller.items.get(sessionResource);
    if (!item) {
      this._logService.warn(`No item found for session resource ${sessionResource.toString()}`);
      return;
    }
    item.archived = archived;
    controllerData.onDidChangeChatSessionItemStateEmitter.fire(item);
  }
};
ExtHostChatSessions = ExtHostChatSessions_1 = __decorate([
  __param(2, IExtHostRpcService),
  __param(3, ILogService)
], ExtHostChatSessions);
export {
  ExtHostChatSessions
};
//# sourceMappingURL=extHostChatSessions.js.map
