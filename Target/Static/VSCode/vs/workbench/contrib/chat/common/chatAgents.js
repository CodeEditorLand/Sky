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
import { findLast } from "../../../../base/common/arraysFind.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IMarkdownString, isMarkdownString } from "../../../../base/common/htmlContent.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { IObservable, observableValue } from "../../../../base/common/observable.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { Command, ProviderResult } from "../../../../editor/common/languages.js";
import { ContextKeyExpr, IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ChatContextKeys } from "./chatContextKeys.js";
import { IChatProgressHistoryResponseContent, IChatRequestVariableData, ISerializableChatAgentData } from "./chatModel.js";
import { IRawChatCommandContribution } from "./chatParticipantContribTypes.js";
import { IChatFollowup, IChatLocationData, IChatProgress, IChatResponseErrorDetails, IChatTaskDto } from "./chatService.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
function isChatWelcomeMessageContent(obj) {
  return obj && ThemeIcon.isThemeIcon(obj.icon) && typeof obj.title === "string" && isMarkdownString(obj.message);
}
__name(isChatWelcomeMessageContent, "isChatWelcomeMessageContent");
const IChatAgentService = createDecorator("chatAgentService");
let ChatAgentService = class extends Disposable {
  constructor(contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._hasDefaultAgent = ChatContextKeys.enabled.bindTo(this.contextKeyService);
    this._defaultAgentRegistered = ChatContextKeys.panelParticipantRegistered.bindTo(this.contextKeyService);
    this._editingAgentRegistered = ChatContextKeys.editingParticipantRegistered.bindTo(this.contextKeyService);
    this._register(contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._agentsContextKeys)) {
        this._updateContextKeys();
      }
    }));
    this._hasToolsAgentContextKey = ChatContextKeys.Editing.hasToolsAgent.bindTo(contextKeyService);
  }
  static {
    __name(this, "ChatAgentService");
  }
  static AGENT_LEADER = "@";
  _agents = /* @__PURE__ */ new Map();
  _onDidChangeAgents = new Emitter();
  onDidChangeAgents = this._onDidChangeAgents.event;
  _agentsContextKeys = /* @__PURE__ */ new Set();
  _hasDefaultAgent;
  _defaultAgentRegistered;
  _editingAgentRegistered;
  _hasToolsAgentContextKey;
  _chatParticipantDetectionProviders = /* @__PURE__ */ new Map();
  registerAgent(id, data) {
    const existingAgent = this.getAgent(id);
    if (existingAgent) {
      throw new Error(`Agent already registered: ${JSON.stringify(id)}`);
    }
    const that = this;
    const commands = data.slashCommands;
    data = {
      ...data,
      get slashCommands() {
        return commands.filter((c) => !c.when || that.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(c.when)));
      }
    };
    const entry = { data };
    this._agents.set(id, entry);
    this._updateAgentsContextKeys();
    this._updateContextKeys();
    this._onDidChangeAgents.fire(void 0);
    return toDisposable(() => {
      this._agents.delete(id);
      this._updateAgentsContextKeys();
      this._updateContextKeys();
      this._onDidChangeAgents.fire(void 0);
    });
  }
  _updateAgentsContextKeys() {
    this._agentsContextKeys.clear();
    for (const agent of this._agents.values()) {
      if (agent.data.when) {
        const expr = ContextKeyExpr.deserialize(agent.data.when);
        for (const key of expr?.keys() || []) {
          this._agentsContextKeys.add(key);
        }
      }
    }
  }
  _updateContextKeys() {
    let editingAgentRegistered = false;
    let defaultAgentRegistered = false;
    let toolsAgentRegistered = false;
    for (const agent of this.getAgents()) {
      if (agent.isDefault && agent.locations.includes(ChatAgentLocation.EditingSession)) {
        editingAgentRegistered = true;
        if (agent.isToolsAgent) {
          toolsAgentRegistered = true;
        }
      } else if (agent.isDefault) {
        defaultAgentRegistered = true;
      }
    }
    this._editingAgentRegistered.set(editingAgentRegistered);
    this._defaultAgentRegistered.set(defaultAgentRegistered);
    if (toolsAgentRegistered !== this._hasToolsAgentContextKey.get()) {
      this._hasToolsAgentContextKey.set(toolsAgentRegistered);
      this._onDidChangeAgents.fire(this.getDefaultAgent(ChatAgentLocation.EditingSession));
    }
  }
  registerAgentImplementation(id, agentImpl) {
    const entry = this._agents.get(id);
    if (!entry) {
      throw new Error(`Unknown agent: ${JSON.stringify(id)}`);
    }
    if (entry.impl) {
      throw new Error(`Agent already has implementation: ${JSON.stringify(id)}`);
    }
    if (entry.data.isDefault) {
      this._hasDefaultAgent.set(true);
    }
    entry.impl = agentImpl;
    this._onDidChangeAgents.fire(new MergedChatAgent(entry.data, agentImpl));
    return toDisposable(() => {
      entry.impl = void 0;
      this._onDidChangeAgents.fire(void 0);
      if (entry.data.isDefault) {
        this._hasDefaultAgent.set(false);
      }
    });
  }
  registerDynamicAgent(data, agentImpl) {
    data.isDynamic = true;
    const agent = { data, impl: agentImpl };
    this._agents.set(data.id, agent);
    this._onDidChangeAgents.fire(new MergedChatAgent(data, agentImpl));
    return toDisposable(() => {
      this._agents.delete(data.id);
      this._onDidChangeAgents.fire(void 0);
    });
  }
  _agentCompletionProviders = /* @__PURE__ */ new Map();
  registerAgentCompletionProvider(id, provider) {
    this._agentCompletionProviders.set(id, provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._agentCompletionProviders.delete(id);
      }, "dispose")
    };
  }
  async getAgentCompletionItems(id, query, token) {
    return await this._agentCompletionProviders.get(id)?.(query, token) ?? [];
  }
  updateAgent(id, updateMetadata) {
    const agent = this._agents.get(id);
    if (!agent?.impl) {
      throw new Error(`No activated agent with id ${JSON.stringify(id)} registered`);
    }
    agent.data.metadata = { ...agent.data.metadata, ...updateMetadata };
    this._onDidChangeAgents.fire(new MergedChatAgent(agent.data, agent.impl));
  }
  getDefaultAgent(location, mode) {
    if (mode === ChatMode.Edit || mode === ChatMode.Agent) {
      location = ChatAgentLocation.EditingSession;
    }
    return this._preferExtensionAgent(this.getActivatedAgents().filter((a) => {
      if (mode === ChatMode.Agent !== !!a.isToolsAgent) {
        return false;
      }
      return !!a.isDefault && a.locations.includes(location);
    }));
  }
  get hasToolsAgent() {
    return !!this._hasToolsAgentContextKey.get();
  }
  getContributedDefaultAgent(location) {
    return this._preferExtensionAgent(this.getAgents().filter((a) => !!a.isDefault && a.locations.includes(location)));
  }
  _preferExtensionAgent(agents) {
    return findLast(agents, (agent) => !agent.isCore) ?? agents.at(-1);
  }
  getAgent(id, includeDisabled = false) {
    if (!this._agentIsEnabled(id) && !includeDisabled) {
      return;
    }
    return this._agents.get(id)?.data;
  }
  _agentIsEnabled(idOrAgent) {
    const entry = typeof idOrAgent === "string" ? this._agents.get(idOrAgent) : idOrAgent;
    return !entry?.data.when || this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(entry.data.when));
  }
  getAgentByFullyQualifiedId(id) {
    const agent = Iterable.find(this._agents.values(), (a) => getFullyQualifiedId(a.data) === id)?.data;
    if (agent && !this._agentIsEnabled(agent.id)) {
      return;
    }
    return agent;
  }
  /**
   * Returns all agent datas that exist- static registered and dynamic ones.
   */
  getAgents() {
    return Array.from(this._agents.values()).map((entry) => entry.data).filter((a) => this._agentIsEnabled(a.id));
  }
  getActivatedAgents() {
    return Array.from(this._agents.values()).filter((a) => !!a.impl).filter((a) => this._agentIsEnabled(a.data.id)).map((a) => new MergedChatAgent(a.data, a.impl));
  }
  getAgentsByName(name) {
    return this._preferExtensionAgents(this.getAgents().filter((a) => a.name === name));
  }
  _preferExtensionAgents(agents) {
    const extensionAgents = agents.filter((a) => !a.isCore);
    return extensionAgents.length > 0 ? extensionAgents : agents;
  }
  agentHasDupeName(id) {
    const agent = this.getAgent(id);
    if (!agent) {
      return false;
    }
    return this.getAgentsByName(agent.name).filter((a) => a.extensionId.value !== agent.extensionId.value).length > 0;
  }
  async invokeAgent(id, request, progress, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    return await data.impl.invoke(request, progress, history, token);
  }
  setRequestPaused(id, requestId, isPaused) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    data.impl.setRequestPaused?.(requestId, isPaused);
  }
  async getFollowups(id, request, result, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    if (!data.impl?.provideFollowups) {
      return [];
    }
    return data.impl.provideFollowups(request, result, history, token);
  }
  async getChatTitle(id, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl) {
      throw new Error(`No activated agent with id "${id}"`);
    }
    if (!data.impl?.provideChatTitle) {
      return void 0;
    }
    return data.impl.provideChatTitle(history, token);
  }
  registerChatParticipantDetectionProvider(handle, provider) {
    this._chatParticipantDetectionProviders.set(handle, provider);
    return toDisposable(() => {
      this._chatParticipantDetectionProviders.delete(handle);
    });
  }
  hasChatParticipantDetectionProviders() {
    return this._chatParticipantDetectionProviders.size > 0;
  }
  async detectAgentOrCommand(request, history, options, token) {
    const provider = Iterable.first(this._chatParticipantDetectionProviders.values());
    if (!provider) {
      return;
    }
    const participants = this.getAgents().reduce((acc, a) => {
      if (a.locations.includes(options.location)) {
        acc.push({ participant: a.id, disambiguation: a.disambiguation ?? [] });
        for (const command2 of a.slashCommands) {
          acc.push({ participant: a.id, command: command2.name, disambiguation: command2.disambiguation ?? [] });
        }
      }
      return acc;
    }, []);
    const result = await provider.provideParticipantDetection(request, history, { ...options, participants }, token);
    if (!result) {
      return;
    }
    const agent = this.getAgent(result.participant);
    if (!agent) {
      return;
    }
    if (!result.command) {
      return { agent };
    }
    const command = agent?.slashCommands.find((c) => c.name === result.command);
    if (!command) {
      return;
    }
    return { agent, command };
  }
};
ChatAgentService = __decorateClass([
  __decorateParam(0, IContextKeyService)
], ChatAgentService);
class MergedChatAgent {
  constructor(data, impl) {
    this.data = data;
    this.impl = impl;
  }
  static {
    __name(this, "MergedChatAgent");
  }
  when;
  publisherDisplayName;
  isDynamic;
  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name ?? "";
  }
  get fullName() {
    return this.data.fullName ?? "";
  }
  get description() {
    return this.data.description ?? "";
  }
  get extensionId() {
    return this.data.extensionId;
  }
  get extensionPublisherId() {
    return this.data.extensionPublisherId;
  }
  get extensionPublisherDisplayName() {
    return this.data.publisherDisplayName;
  }
  get extensionDisplayName() {
    return this.data.extensionDisplayName;
  }
  get isDefault() {
    return this.data.isDefault;
  }
  get isToolsAgent() {
    return this.data.isToolsAgent;
  }
  get isCore() {
    return this.data.isCore;
  }
  get metadata() {
    return this.data.metadata;
  }
  get slashCommands() {
    return this.data.slashCommands;
  }
  get locations() {
    return this.data.locations;
  }
  get disambiguation() {
    return this.data.disambiguation;
  }
  async invoke(request, progress, history, token) {
    return this.impl.invoke(request, progress, history, token);
  }
  setRequestPaused(requestId, isPaused) {
    if (this.impl.setRequestPaused) {
      this.impl.setRequestPaused(requestId, isPaused);
    }
  }
  async provideFollowups(request, result, history, token) {
    if (this.impl.provideFollowups) {
      return this.impl.provideFollowups(request, result, history, token);
    }
    return [];
  }
  provideWelcomeMessage(token) {
    if (this.impl.provideWelcomeMessage) {
      return this.impl.provideWelcomeMessage(token);
    }
    return void 0;
  }
  provideSampleQuestions(location, token) {
    if (this.impl.provideSampleQuestions) {
      return this.impl.provideSampleQuestions(location, token);
    }
    return void 0;
  }
  toJSON() {
    return this.data;
  }
}
const IChatAgentNameService = createDecorator("chatAgentNameService");
let ChatAgentNameService = class {
  constructor(productService, requestService, logService, storageService) {
    this.requestService = requestService;
    this.logService = logService;
    this.storageService = storageService;
    if (!productService.chatParticipantRegistry) {
      return;
    }
    this.url = productService.chatParticipantRegistry;
    const raw = storageService.get(ChatAgentNameService.StorageKey, StorageScope.APPLICATION);
    try {
      this.registry.set(JSON.parse(raw ?? "{}"), void 0);
    } catch (err) {
      storageService.remove(ChatAgentNameService.StorageKey, StorageScope.APPLICATION);
    }
    this.refresh();
  }
  static {
    __name(this, "ChatAgentNameService");
  }
  static StorageKey = "chat.participantNameRegistry";
  url;
  registry = observableValue(this, /* @__PURE__ */ Object.create(null));
  disposed = false;
  refresh() {
    if (this.disposed) {
      return;
    }
    this.update().catch((err) => this.logService.warn("Failed to fetch chat participant registry", err)).then(() => timeout(5 * 60 * 1e3)).then(() => this.refresh());
  }
  async update() {
    const context = await this.requestService.request({ type: "GET", url: this.url }, CancellationToken.None);
    if (context.res.statusCode !== 200) {
      throw new Error("Could not get extensions report.");
    }
    const result = await asJson(context);
    if (!result || result.version !== 1) {
      throw new Error("Unexpected chat participant registry response.");
    }
    const registry = result.restrictedChatParticipants;
    this.registry.set(registry, void 0);
    this.storageService.store(ChatAgentNameService.StorageKey, JSON.stringify(registry), StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
  /**
   * Returns true if the agent is allowed to use this name
   */
  getAgentNameRestriction(chatAgentData) {
    if (chatAgentData.isCore) {
      return true;
    }
    const nameAllowed = this.checkAgentNameRestriction(chatAgentData.name, chatAgentData).get();
    const fullNameAllowed = !chatAgentData.fullName || this.checkAgentNameRestriction(chatAgentData.fullName.replace(/\s/g, ""), chatAgentData).get();
    return nameAllowed && fullNameAllowed;
  }
  checkAgentNameRestriction(name, chatAgentData) {
    const allowList = this.registry.map((registry) => registry[name.toLowerCase()]);
    return allowList.map((allowList2) => {
      if (!allowList2) {
        return true;
      }
      return allowList2.some((id) => equalsIgnoreCase(id, id.includes(".") ? chatAgentData.extensionId.value : chatAgentData.extensionPublisherId));
    });
  }
  dispose() {
    this.disposed = true;
  }
};
ChatAgentNameService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IStorageService)
], ChatAgentNameService);
function getFullyQualifiedId(chatAgentData) {
  return `${chatAgentData.extensionId.value}.${chatAgentData.id}`;
}
__name(getFullyQualifiedId, "getFullyQualifiedId");
function reviveSerializedAgent(raw) {
  const agent = "name" in raw ? raw : {
    ...raw,
    name: raw.id
  };
  if (!("extensionPublisherId" in agent)) {
    agent.extensionPublisherId = agent.extensionPublisher ?? "";
  }
  if (!("extensionDisplayName" in agent)) {
    agent.extensionDisplayName = "";
  }
  if (!("extensionId" in agent)) {
    agent.extensionId = new ExtensionIdentifier("");
  }
  return revive(agent);
}
__name(reviveSerializedAgent, "reviveSerializedAgent");
export {
  ChatAgentNameService,
  ChatAgentService,
  IChatAgentNameService,
  IChatAgentService,
  MergedChatAgent,
  getFullyQualifiedId,
  isChatWelcomeMessageContent,
  reviveSerializedAgent
};
//# sourceMappingURL=chatAgents.js.map
