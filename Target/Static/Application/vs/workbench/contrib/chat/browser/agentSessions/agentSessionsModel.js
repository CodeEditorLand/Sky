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
var AgentSessionsModel_1, AgentSessionsCache_1;
import { coalesce } from "../../../../../base/common/arrays.js";
import { ThrottledDelayer } from "../../../../../base/common/async.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { URI } from "../../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { IChatSessionsService, isSessionInProgressStatus } from "../../common/chatSessionsService.js";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "./agentSessions.js";
import { ChatSessionStatus, isSessionInProgressStatus as isSessionInProgressStatus2 } from "../../common/chatSessionsService.js";
function hasValidDiff(changes) {
  if (!changes) {
    return false;
  }
  if (changes instanceof Array) {
    return changes.length > 0;
  }
  return changes.files > 0 || changes.insertions > 0 || changes.deletions > 0;
}
__name(hasValidDiff, "hasValidDiff");
function getAgentChangesSummary(changes) {
  if (!changes) {
    return;
  }
  if (!(changes instanceof Array)) {
    return changes;
  }
  let insertions = 0;
  let deletions = 0;
  for (const change of changes) {
    insertions += change.insertions;
    deletions += change.deletions;
  }
  return { files: changes.length, insertions, deletions };
}
__name(getAgentChangesSummary, "getAgentChangesSummary");
function isLocalAgentSessionItem(session) {
  return session.providerType === AgentSessionProviders.Local;
}
__name(isLocalAgentSessionItem, "isLocalAgentSessionItem");
function isAgentSession(obj) {
  const session = obj;
  return URI.isUri(session?.resource) && typeof session.setArchived === "function" && typeof session.setRead === "function";
}
__name(isAgentSession, "isAgentSession");
function isAgentSessionsModel(obj) {
  const sessionsModel = obj;
  return Array.isArray(sessionsModel?.sessions) && typeof sessionsModel?.getSession === "function";
}
__name(isAgentSessionsModel, "isAgentSessionsModel");
var AgentSessionSection;
(function(AgentSessionSection2) {
  AgentSessionSection2["InProgress"] = "inProgress";
  AgentSessionSection2["Today"] = "today";
  AgentSessionSection2["Yesterday"] = "yesterday";
  AgentSessionSection2["Week"] = "week";
  AgentSessionSection2["Older"] = "older";
  AgentSessionSection2["Archived"] = "archived";
})(AgentSessionSection || (AgentSessionSection = {}));
function isAgentSessionSection(obj) {
  const candidate = obj;
  return typeof candidate.section === "string" && Array.isArray(candidate.sessions);
}
__name(isAgentSessionSection, "isAgentSessionSection");
function isMarshalledAgentSessionContext(thing) {
  if (typeof thing === "object" && thing !== null) {
    const candidate = thing;
    return candidate.$mid === 25 && typeof candidate.session === "object" && candidate.session !== null;
  }
  return false;
}
__name(isMarshalledAgentSessionContext, "isMarshalledAgentSessionContext");
let AgentSessionsModel = class AgentSessionsModel2 extends Disposable {
  static {
    __name(this, "AgentSessionsModel");
  }
  static {
    AgentSessionsModel_1 = this;
  }
  get sessions() {
    return Array.from(this._sessions.values());
  }
  constructor(chatSessionsService, lifecycleService, instantiationService, storageService, logService) {
    super();
    this.chatSessionsService = chatSessionsService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.logService = logService;
    this._onWillResolve = this._register(new Emitter());
    this.onWillResolve = this._onWillResolve.event;
    this._onDidResolve = this._register(new Emitter());
    this.onDidResolve = this._onDidResolve.event;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this.resolver = this._register(new ThrottledDelayer(300));
    this.providersToResolve = /* @__PURE__ */ new Set();
    this.mapSessionToState = new ResourceMap();
    this._sessions = new ResourceMap();
    this.cache = this.instantiationService.createInstance(AgentSessionsCache);
    for (const data of this.cache.loadCachedSessions()) {
      const session = this.toAgentSession(data);
      this._sessions.set(session.resource, session);
    }
    this.sessionStates = this.cache.loadSessionStates();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.chatSessionsService.onDidChangeItemsProviders(({ chatSessionType: provider }) => this.resolve(provider)));
    this._register(this.chatSessionsService.onDidChangeAvailability(() => this.resolve(void 0)));
    this._register(this.chatSessionsService.onDidChangeSessionItems((provider) => this.resolve(provider)));
    this._register(this.storageService.onWillSaveState(() => {
      this.cache.saveCachedSessions(Array.from(this._sessions.values()));
      this.cache.saveSessionStates(this.sessionStates);
    }));
  }
  getSession(resource) {
    return this._sessions.get(resource);
  }
  async resolve(provider) {
    if (Array.isArray(provider)) {
      for (const p of provider) {
        this.providersToResolve.add(p);
      }
    } else {
      this.providersToResolve.add(provider);
    }
    return this.resolver.trigger(async (token) => {
      if (token.isCancellationRequested || this.lifecycleService.willShutdown) {
        return;
      }
      try {
        this._onWillResolve.fire();
        return await this.doResolve(token);
      } finally {
        this._onDidResolve.fire();
      }
    });
  }
  async doResolve(token) {
    const providersToResolve = Array.from(this.providersToResolve);
    this.providersToResolve.clear();
    this.logService.trace(`[agent sessions] Resolving agent sessions for providers: ${providersToResolve.map((p) => p ?? "all").join(", ")}`);
    const mapSessionContributionToType = /* @__PURE__ */ new Map();
    for (const contribution of this.chatSessionsService.getAllChatSessionContributions()) {
      mapSessionContributionToType.set(contribution.type, contribution);
    }
    const providerFilter = providersToResolve.includes(void 0) ? void 0 : coalesce(providersToResolve);
    const providerResults = await this.chatSessionsService.getChatSessionItems(providerFilter, token);
    const resolvedProviders = /* @__PURE__ */ new Set();
    const sessions = new ResourceMap();
    for (const { chatSessionType, items: providerSessions } of providerResults) {
      this.logService.trace(`[agent sessions] Resolved ${providerSessions.length} agent sessions for provider ${chatSessionType}`);
      resolvedProviders.add(chatSessionType);
      if (token.isCancellationRequested) {
        return;
      }
      for (const session of providerSessions) {
        let icon;
        let providerLabel;
        const agentSessionProvider = getAgentSessionProvider(chatSessionType);
        if (agentSessionProvider !== void 0) {
          providerLabel = getAgentSessionProviderName(agentSessionProvider);
          icon = getAgentSessionProviderIcon(agentSessionProvider);
        } else {
          providerLabel = mapSessionContributionToType.get(chatSessionType)?.name ?? chatSessionType;
          icon = session.iconPath ?? Codicon.terminal;
        }
        const status = session.status ?? 1;
        const state = this.mapSessionToState.get(session.resource);
        let inProgressTime = state?.inProgressTime;
        let finishedOrFailedTime = state?.finishedOrFailedTime;
        if (!state) {
          this.mapSessionToState.set(session.resource, {
            status,
            inProgressTime: isSessionInProgressStatus(status) ? Date.now() : void 0
            // this is not accurate but best effort
          });
        } else if (status !== state.status) {
          inProgressTime = isSessionInProgressStatus(status) ? Date.now() : state.inProgressTime;
          finishedOrFailedTime = !isSessionInProgressStatus(status) ? Date.now() : state.finishedOrFailedTime;
          this.mapSessionToState.set(session.resource, {
            status,
            inProgressTime,
            finishedOrFailedTime
          });
        }
        const changes = session.changes;
        const normalizedChanges = changes && !(changes instanceof Array) ? { files: changes.files, insertions: changes.insertions, deletions: changes.deletions } : changes;
        let created = session.timing.created;
        let lastRequestStarted = session.timing.lastRequestStarted;
        let lastRequestEnded = session.timing.lastRequestEnded;
        if (!created || !lastRequestEnded) {
          const existing = this._sessions.get(session.resource);
          if (!created && existing?.timing.created) {
            created = existing.timing.created;
          }
          if (!lastRequestEnded && existing?.timing.lastRequestEnded) {
            lastRequestEnded = existing.timing.lastRequestEnded;
          }
          if (!lastRequestStarted && existing?.timing.lastRequestStarted) {
            lastRequestStarted = existing.timing.lastRequestStarted;
          }
        }
        sessions.set(session.resource, this.toAgentSession({
          providerType: chatSessionType,
          providerLabel,
          resource: session.resource,
          label: session.label,
          description: session.description,
          icon,
          badge: session.badge,
          tooltip: session.tooltip,
          status,
          archived: session.archived,
          timing: {
            created,
            lastRequestStarted,
            lastRequestEnded,
            inProgressTime,
            finishedOrFailedTime
          },
          changes: normalizedChanges
        }));
      }
    }
    for (const [, session] of this._sessions) {
      if (!resolvedProviders.has(session.providerType)) {
        sessions.set(session.resource, session);
      }
    }
    this._sessions = sessions;
    this.logService.trace(`[agent sessions] Total resolved agent sessions:`, Array.from(this._sessions.values()));
    for (const [resource] of this.mapSessionToState) {
      if (!sessions.has(resource)) {
        this.mapSessionToState.delete(resource);
      }
    }
    for (const [resource] of this.sessionStates) {
      if (!sessions.has(resource)) {
        this.sessionStates.delete(resource);
      }
    }
    this._onDidChangeSessions.fire();
  }
  toAgentSession(data) {
    return {
      ...data,
      isArchived: /* @__PURE__ */ __name(() => this.isArchived(data), "isArchived"),
      setArchived: /* @__PURE__ */ __name((archived) => this.setArchived(data, archived), "setArchived"),
      isRead: /* @__PURE__ */ __name(() => this.isRead(data), "isRead"),
      setRead: /* @__PURE__ */ __name((read) => this.setRead(data, read), "setRead")
    };
  }
  static {
    this.READ_STATE_INITIAL_DATE = Date.UTC(2025, 11, 8);
  }
  isArchived(session) {
    return this.sessionStates.get(session.resource)?.archived ?? Boolean(session.archived);
  }
  setArchived(session, archived) {
    if (archived) {
      this.setRead(session, true);
    }
    if (archived === this.isArchived(session)) {
      return;
    }
    const state = this.sessionStates.get(session.resource) ?? { archived: false, read: 0 };
    this.sessionStates.set(session.resource, { ...state, archived });
    this._onDidChangeSessions.fire();
  }
  isRead(session) {
    if (this.isArchived(session)) {
      return true;
    }
    const readDate = this.sessionStates.get(session.resource)?.read;
    return (readDate ?? AgentSessionsModel_1.READ_STATE_INITIAL_DATE) >= (session.timing.lastRequestEnded ?? session.timing.lastRequestStarted ?? session.timing.created);
  }
  setRead(session, read) {
    if (read === this.isRead(session)) {
      return;
    }
    const state = this.sessionStates.get(session.resource) ?? { archived: false, read: 0 };
    this.sessionStates.set(session.resource, { ...state, read: read ? Date.now() : 0 });
    this._onDidChangeSessions.fire();
  }
};
AgentSessionsModel = AgentSessionsModel_1 = __decorate([
  __param(0, IChatSessionsService),
  __param(1, ILifecycleService),
  __param(2, IInstantiationService),
  __param(3, IStorageService),
  __param(4, ILogService)
], AgentSessionsModel);
let AgentSessionsCache = class AgentSessionsCache2 {
  static {
    __name(this, "AgentSessionsCache");
  }
  static {
    AgentSessionsCache_1 = this;
  }
  static {
    this.SESSIONS_STORAGE_KEY = "agentSessions.model.cache";
  }
  static {
    this.STATE_STORAGE_KEY = "agentSessions.state.cache";
  }
  constructor(storageService) {
    this.storageService = storageService;
  }
  //#region Sessions
  saveCachedSessions(sessions) {
    const serialized = sessions.map((session) => ({
      providerType: session.providerType,
      providerLabel: session.providerLabel,
      resource: session.resource.toString(),
      icon: session.icon.id,
      label: session.label,
      description: session.description,
      badge: session.badge,
      tooltip: session.tooltip,
      status: session.status,
      archived: session.archived,
      timing: {
        created: session.timing.created,
        lastRequestStarted: session.timing.lastRequestStarted,
        lastRequestEnded: session.timing.lastRequestEnded
      },
      changes: session.changes
    }));
    this.storageService.store(
      AgentSessionsCache_1.SESSIONS_STORAGE_KEY,
      JSON.stringify(serialized),
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  loadCachedSessions() {
    const sessionsCache = this.storageService.get(
      AgentSessionsCache_1.SESSIONS_STORAGE_KEY,
      1
      /* StorageScope.WORKSPACE */
    );
    if (!sessionsCache) {
      return [];
    }
    try {
      const cached = JSON.parse(sessionsCache);
      return cached.map((session) => ({
        providerType: session.providerType,
        providerLabel: session.providerLabel,
        resource: typeof session.resource === "string" ? URI.parse(session.resource) : URI.revive(session.resource),
        icon: ThemeIcon.fromId(session.icon),
        label: session.label,
        description: session.description,
        badge: session.badge,
        tooltip: session.tooltip,
        status: session.status,
        archived: session.archived,
        timing: {
          // Support loading both new and old cache formats (TODO@bpasero remove old format support after some time)
          created: session.timing.created ?? session.timing.startTime ?? 0,
          lastRequestStarted: session.timing.lastRequestStarted ?? session.timing.startTime,
          lastRequestEnded: session.timing.lastRequestEnded ?? session.timing.endTime
        },
        changes: Array.isArray(session.changes) ? session.changes.map((change) => ({
          modifiedUri: URI.revive(change.modifiedUri),
          originalUri: change.originalUri ? URI.revive(change.originalUri) : void 0,
          insertions: change.insertions,
          deletions: change.deletions
        })) : session.changes
      }));
    } catch {
      return [];
    }
  }
  //#endregion
  //#region States
  saveSessionStates(states) {
    const serialized = Array.from(states.entries()).map(([resource, state]) => ({
      resource: resource.toString(),
      archived: state.archived,
      read: state.read
    }));
    this.storageService.store(
      AgentSessionsCache_1.STATE_STORAGE_KEY,
      JSON.stringify(serialized),
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  loadSessionStates() {
    const states = new ResourceMap();
    const statesCache = this.storageService.get(
      AgentSessionsCache_1.STATE_STORAGE_KEY,
      1
      /* StorageScope.WORKSPACE */
    );
    if (!statesCache) {
      return states;
    }
    try {
      const cached = JSON.parse(statesCache);
      for (const entry of cached) {
        states.set(typeof entry.resource === "string" ? URI.parse(entry.resource) : URI.revive(entry.resource), {
          archived: entry.archived,
          read: entry.read
        });
      }
    } catch {
    }
    return states;
  }
};
AgentSessionsCache = AgentSessionsCache_1 = __decorate([
  __param(0, IStorageService)
], AgentSessionsCache);
export {
  AgentSessionSection,
  ChatSessionStatus as AgentSessionStatus,
  AgentSessionsModel,
  getAgentChangesSummary,
  hasValidDiff,
  isAgentSession,
  isAgentSessionSection,
  isAgentSessionsModel,
  isLocalAgentSessionItem,
  isMarshalledAgentSessionContext,
  isSessionInProgressStatus2 as isSessionInProgressStatus
};
//# sourceMappingURL=agentSessionsModel.js.map
