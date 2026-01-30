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
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { equals } from "../../../../../base/common/objects.js";
import { localize } from "../../../../../nls.js";
import { registerAction2, Action2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IChatSessionsService } from "../../common/chatSessionsService.js";
import { AgentSessionProviders, getAgentSessionProviderName } from "./agentSessions.js";
const DEFAULT_EXCLUDES = Object.freeze({
  providers: [],
  states: [],
  archived: true,
  read: false
});
let AgentSessionsFilter = class AgentSessionsFilter2 extends Disposable {
  static {
    __name(this, "AgentSessionsFilter");
  }
  constructor(options, chatSessionsService, storageService) {
    super();
    this.options = options;
    this.chatSessionsService = chatSessionsService;
    this.storageService = storageService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.limitResults = () => this.options.limitResults?.();
    this.groupResults = () => this.options.groupResults?.();
    this.excludes = DEFAULT_EXCLUDES;
    this.actionDisposables = this._register(new DisposableStore());
    this.STORAGE_KEY = `agentSessions.filterExcludes.${this.options.filterMenuId.id.toLowerCase()}`;
    this.updateExcludes(false);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.chatSessionsService.onDidChangeItemsProviders(() => this.updateFilterActions()));
    this._register(this.chatSessionsService.onDidChangeAvailability(() => this.updateFilterActions()));
    this._register(this.storageService.onDidChangeValue(0, this.STORAGE_KEY, this._store)(() => this.updateExcludes(true)));
  }
  updateExcludes(fromEvent) {
    const excludedTypesRaw = this.storageService.get(
      this.STORAGE_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (excludedTypesRaw) {
      try {
        this.excludes = JSON.parse(excludedTypesRaw);
      } catch {
        this.excludes = { ...DEFAULT_EXCLUDES };
      }
    } else {
      this.excludes = { ...DEFAULT_EXCLUDES };
    }
    this.updateFilterActions();
    if (fromEvent) {
      this._onDidChange.fire();
    }
  }
  storeExcludes(excludes) {
    this.excludes = excludes;
    if (equals(this.excludes, DEFAULT_EXCLUDES)) {
      this.storageService.remove(
        this.STORAGE_KEY,
        0
        /* StorageScope.PROFILE */
      );
    } else {
      this.storageService.store(
        this.STORAGE_KEY,
        JSON.stringify(this.excludes),
        0,
        0
        /* StorageTarget.USER */
      );
    }
  }
  updateFilterActions() {
    this.actionDisposables.clear();
    this.registerProviderActions(this.actionDisposables);
    this.registerStateActions(this.actionDisposables);
    this.registerArchivedActions(this.actionDisposables);
    this.registerReadActions(this.actionDisposables);
    this.registerResetAction(this.actionDisposables);
  }
  registerProviderActions(disposables) {
    const providers = Object.values(AgentSessionProviders).map((provider) => ({
      id: provider,
      label: getAgentSessionProviderName(provider)
    }));
    for (const provider of this.chatSessionsService.getAllChatSessionContributions()) {
      if (providers.find((p) => p.id === provider.type)) {
        continue;
      }
      providers.push({ id: provider.type, label: provider.name });
    }
    const that = this;
    let counter = 0;
    for (const provider of providers) {
      disposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `agentSessions.filter.toggleExclude:${provider.id}.${that.options.filterMenuId.id.toLowerCase()}`,
            title: provider.label,
            menu: {
              id: that.options.filterMenuId,
              group: "1_providers",
              order: counter++
            },
            toggled: that.excludes.providers.includes(provider.id) ? ContextKeyExpr.false() : ContextKeyExpr.true()
          });
        }
        run() {
          const providerExcludes = new Set(that.excludes.providers);
          if (!providerExcludes.delete(provider.id)) {
            providerExcludes.add(provider.id);
          }
          that.storeExcludes({ ...that.excludes, providers: Array.from(providerExcludes) });
        }
      }));
    }
  }
  registerStateActions(disposables) {
    const states = [
      { id: 1, label: localize("agentSessionStatus.completed", "Completed") },
      { id: 2, label: localize("agentSessionStatus.inProgress", "In Progress") },
      { id: 3, label: localize("agentSessionStatus.needsInput", "Input Needed") },
      { id: 0, label: localize("agentSessionStatus.failed", "Failed") }
    ];
    const that = this;
    let counter = 0;
    for (const state of states) {
      disposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `agentSessions.filter.toggleExcludeState:${state.id}.${that.options.filterMenuId.id.toLowerCase()}`,
            title: state.label,
            menu: {
              id: that.options.filterMenuId,
              group: "2_states",
              order: counter++
            },
            toggled: that.excludes.states.includes(state.id) ? ContextKeyExpr.false() : ContextKeyExpr.true()
          });
        }
        run() {
          const stateExcludes = new Set(that.excludes.states);
          if (!stateExcludes.delete(state.id)) {
            stateExcludes.add(state.id);
          }
          that.storeExcludes({ ...that.excludes, states: Array.from(stateExcludes) });
        }
      }));
    }
  }
  registerArchivedActions(disposables) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeArchived.${that.options.filterMenuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.archived", "Archived"),
          menu: {
            id: that.options.filterMenuId,
            group: "3_props",
            order: 1e3
          },
          toggled: that.excludes.archived ? ContextKeyExpr.false() : ContextKeyExpr.true()
        });
      }
      run() {
        that.storeExcludes({ ...that.excludes, archived: !that.excludes.archived });
      }
    }));
  }
  registerReadActions(disposables) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeRead.${that.options.filterMenuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.read", "Read"),
          menu: {
            id: that.options.filterMenuId,
            group: "3_props",
            order: 0
          },
          toggled: that.excludes.read ? ContextKeyExpr.false() : ContextKeyExpr.true()
        });
      }
      run() {
        that.storeExcludes({ ...that.excludes, read: !that.excludes.read });
      }
    }));
  }
  registerResetAction(disposables) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.resetExcludes.${that.options.filterMenuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.reset", "Reset"),
          menu: {
            id: that.options.filterMenuId,
            group: "4_reset",
            order: 0
          }
        });
      }
      run() {
        that.storeExcludes({ ...DEFAULT_EXCLUDES });
      }
    }));
  }
  isDefault() {
    return equals(this.excludes, DEFAULT_EXCLUDES);
  }
  getExcludes() {
    return this.excludes;
  }
  exclude(session) {
    const overrideExclude = this.options?.overrideExclude?.(session);
    if (typeof overrideExclude === "boolean") {
      return overrideExclude;
    }
    if (this.excludes.read && session.isRead()) {
      return true;
    }
    if (this.excludes.providers.includes(session.providerType)) {
      return true;
    }
    if (this.excludes.states.includes(session.status)) {
      return true;
    }
    return false;
  }
  notifyResults(count) {
    this.options.notifyResults?.(count);
  }
};
AgentSessionsFilter = __decorate([
  __param(1, IChatSessionsService),
  __param(2, IStorageService)
], AgentSessionsFilter);
export {
  AgentSessionsFilter
};
//# sourceMappingURL=agentSessionsFilter.js.map
