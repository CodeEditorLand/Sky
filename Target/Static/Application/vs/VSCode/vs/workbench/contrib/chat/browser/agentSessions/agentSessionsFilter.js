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
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderName } from "./agentSessions.js";
var AgentSessionsGrouping;
(function(AgentSessionsGrouping2) {
  AgentSessionsGrouping2["Capped"] = "capped";
  AgentSessionsGrouping2["Date"] = "date";
  AgentSessionsGrouping2["Repository"] = "repository";
})(AgentSessionsGrouping || (AgentSessionsGrouping = {}));
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
    this.STORAGE_KEY = `agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu`;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.limitResults = () => this.options.limitResults?.();
    this.groupResults = () => this.options.groupResults?.();
    this.excludes = DEFAULT_EXCLUDES;
    this.isStoringExcludes = false;
    this.actionDisposables = this._register(new DisposableStore());
    this.updateExcludes(false);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.chatSessionsService.onDidChangeItemsProviders(() => this.updateFilterActions()));
    this._register(this.chatSessionsService.onDidChangeAvailability(() => this.updateFilterActions()));
    this._register(this.storageService.onDidChangeValue(0, this.STORAGE_KEY, this._store)(() => this.updateExcludes(true)));
  }
  updateExcludes(fromEvent) {
    if (!this.isStoringExcludes) {
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
    }
    this.updateFilterActions();
    if (fromEvent) {
      this._onDidChange.fire();
    }
  }
  storeExcludes(excludes) {
    this.excludes = excludes;
    this.isStoringExcludes = true;
    try {
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
    } finally {
      this.isStoringExcludes = false;
    }
  }
  updateFilterActions() {
    this.actionDisposables.clear();
    const menuId = this.options.filterMenuId;
    if (!menuId) {
      return;
    }
    this.registerProviderActions(this.actionDisposables, menuId);
    this.registerStateActions(this.actionDisposables, menuId);
    this.registerArchivedActions(this.actionDisposables, menuId);
    this.registerReadActions(this.actionDisposables, menuId);
    this.registerResetAction(this.actionDisposables, menuId);
  }
  registerProviderActions(disposables, menuId) {
    const labelOverrides = this.options.providerLabelOverrides;
    const resolveLabel = /* @__PURE__ */ __name((id) => {
      if (labelOverrides?.has(id)) {
        return labelOverrides.get(id);
      }
      const knownProvider = getAgentSessionProvider(id);
      return knownProvider ? getAgentSessionProviderName(knownProvider) : id;
    }, "resolveLabel");
    let providers;
    if (this.options.allowedProviders) {
      providers = this.options.allowedProviders.map((id) => ({ id, label: resolveLabel(id) }));
    } else {
      providers = [{ id: AgentSessionProviders.Local, label: resolveLabel(AgentSessionProviders.Local) }];
      for (const contribution of this.chatSessionsService.getAllChatSessionContributions()) {
        if (providers.find((p) => p.id === contribution.type)) {
          continue;
        }
        providers.push({
          id: contribution.type,
          label: resolveLabel(contribution.type)
        });
      }
    }
    const that = this;
    let counter = 0;
    for (const provider of providers) {
      disposables.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: `agentSessions.filter.toggleExclude:${provider.id}.${menuId.id.toLowerCase()}`,
            title: provider.label,
            menu: {
              id: menuId,
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
  registerStateActions(disposables, menuId) {
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
            id: `agentSessions.filter.toggleExcludeState:${state.id}.${menuId.id.toLowerCase()}`,
            title: state.label,
            menu: {
              id: menuId,
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
  registerArchivedActions(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeArchived.${menuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.archived", "Archived"),
          menu: {
            id: menuId,
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
  registerReadActions(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.toggleExcludeRead.${menuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.read", "Read"),
          menu: {
            id: menuId,
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
  registerResetAction(disposables, menuId) {
    const that = this;
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.resetExcludes.${menuId.id.toLowerCase()}`,
          title: localize("agentSessions.filter.reset", "Reset"),
          menu: {
            id: menuId,
            group: "4_reset",
            order: 0
          }
        });
      }
      run() {
        that.reset();
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
    if (this.options.allowedProviders && !this.options.allowedProviders.includes(session.providerType)) {
      return true;
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
    if (this.excludes.archived && this.groupResults?.() === AgentSessionsGrouping.Capped && session.isArchived()) {
      return true;
    }
    return false;
  }
  notifyResults(count) {
    this.options.notifyResults?.(count);
  }
  reset() {
    this.storeExcludes({ ...DEFAULT_EXCLUDES });
  }
};
AgentSessionsFilter = __decorate([
  __param(1, IChatSessionsService),
  __param(2, IStorageService)
], AgentSessionsFilter);
export {
  AgentSessionsFilter,
  AgentSessionsGrouping
};
//# sourceMappingURL=agentSessionsFilter.js.map
