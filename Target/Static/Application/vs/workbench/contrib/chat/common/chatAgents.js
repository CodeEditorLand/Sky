var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLast } from "../../../../base/common/arraysFind.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { revive } from "../../../../base/common/marshalling.js";
import { observableValue } from "../../../../base/common/observable.js";
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ChatContextKeys } from "./chatContextKeys.js";
import { ChatAgentLocation, ChatMode } from "./constants.js";
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
var ChatAgentNameService_1;
const IChatAgentService = createDecorator("chatAgentService");
let ChatAgentService = class ChatAgentService2 extends Disposable {
  static {
    __name(this, "ChatAgentService");
  }
  static {
    this.AGENT_LEADER = "@";
  }
  constructor(contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._agents = /* @__PURE__ */ new Map();
    this._onDidChangeAgents = new Emitter();
    this.onDidChangeAgents = this._onDidChangeAgents.event;
    this._agentsContextKeys = /* @__PURE__ */ new Set();
    this._hasToolsAgent = false;
    this._chatParticipantDetectionProviders = /* @__PURE__ */ new Map();
    this._agentCompletionProviders = /* @__PURE__ */ new Map();
    this._hasDefaultAgent = ChatContextKeys.enabled.bindTo(this.contextKeyService);
    this._extensionAgentRegistered = ChatContextKeys.extensionParticipantRegistered.bindTo(this.contextKeyService);
    this._defaultAgentRegistered = ChatContextKeys.panelParticipantRegistered.bindTo(this.contextKeyService);
    this._editingAgentRegistered = ChatContextKeys.editingParticipantRegistered.bindTo(this.contextKeyService);
    this._register(contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._agentsContextKeys)) {
        this._updateContextKeys();
      }
    }));
  }
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
    let extensionAgentRegistered = false;
    let defaultAgentRegistered = false;
    let toolsAgentRegistered = false;
    for (const agent of this.getAgents()) {
      if (agent.isDefault) {
        if (!agent.isCore) {
          extensionAgentRegistered = true;
        }
        if (agent.modes.includes(ChatMode.Agent)) {
          toolsAgentRegistered = true;
        } else if (agent.modes.includes(ChatMode.Edit)) {
          editingAgentRegistered = true;
        } else {
          defaultAgentRegistered = true;
        }
      }
    }
    this._editingAgentRegistered.set(editingAgentRegistered);
    this._defaultAgentRegistered.set(defaultAgentRegistered);
    this._extensionAgentRegistered.set(extensionAgentRegistered);
    if (toolsAgentRegistered !== this._hasToolsAgent) {
      this._hasToolsAgent = toolsAgentRegistered;
      this._onDidChangeAgents.fire(this.getDefaultAgent(ChatAgentLocation.Panel, ChatMode.Agent));
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
        this._hasDefaultAgent.set(Iterable.some(this._agents.values(), (agent) => agent.data.isDefault));
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
  getDefaultAgent(location, mode = ChatMode.Ask) {
    return this._preferExtensionAgent(this.getActivatedAgents().filter((a) => {
      if (mode && !a.modes.includes(mode)) {
        return false;
      }
      return !!a.isDefault && a.locations.includes(location);
    }));
  }
  get hasToolsAgent() {
    return !!this._hasToolsAgent;
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
    if (!data?.impl?.provideFollowups) {
      return [];
    }
    return data.impl.provideFollowups(request, result, history, token);
  }
  async getChatTitle(id, history, token) {
    const data = this._agents.get(id);
    if (!data?.impl?.provideChatTitle) {
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
ChatAgentService = __decorate([
  __param(0, IContextKeyService)
], ChatAgentService);
class MergedChatAgent {
  static {
    __name(this, "MergedChatAgent");
  }
  constructor(data, impl) {
    this.data = data;
    this.impl = impl;
  }
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
  get modes() {
    return this.data.modes;
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
  toJSON() {
    return this.data;
  }
}
const IChatAgentNameService = createDecorator("chatAgentNameService");
let ChatAgentNameService = class ChatAgentNameService2 {
  static {
    __name(this, "ChatAgentNameService");
  }
  static {
    ChatAgentNameService_1 = this;
  }
  static {
    this.StorageKey = "chat.participantNameRegistry";
  }
  constructor(productService, requestService, logService, storageService) {
    this.requestService = requestService;
    this.logService = logService;
    this.storageService = storageService;
    this.registry = observableValue(this, /* @__PURE__ */ Object.create(null));
    this.disposed = false;
    if (!productService.chatParticipantRegistry) {
      return;
    }
    this.url = productService.chatParticipantRegistry;
    const raw = storageService.get(
      ChatAgentNameService_1.StorageKey,
      -1
      /* StorageScope.APPLICATION */
    );
    try {
      this.registry.set(JSON.parse(raw ?? "{}"), void 0);
    } catch (err) {
      storageService.remove(
        ChatAgentNameService_1.StorageKey,
        -1
        /* StorageScope.APPLICATION */
      );
    }
    this.refresh();
  }
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
    this.storageService.store(
      ChatAgentNameService_1.StorageKey,
      JSON.stringify(registry),
      -1,
      1
      /* StorageTarget.MACHINE */
    );
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
ChatAgentNameService = ChatAgentNameService_1 = __decorate([
  __param(0, IProductService),
  __param(1, IRequestService),
  __param(2, ILogService),
  __param(3, IStorageService)
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
  reviveSerializedAgent
};
//# sourceMappingURL=chatAgents.js.map
