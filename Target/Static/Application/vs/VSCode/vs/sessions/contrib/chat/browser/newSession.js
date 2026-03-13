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
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IChatSessionsService } from "../../../../workbench/contrib/chat/common/chatSessionsService.js";
import { AgentSessionProviders } from "../../../../workbench/contrib/chat/browser/agentSessions/agentSessions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
const REPOSITORY_OPTION_ID = "repository";
const BRANCH_OPTION_ID = "branch";
const ISOLATION_OPTION_ID = "isolation";
const AGENT_OPTION_ID = "agent";
let LocalNewSession = class LocalNewSession2 extends Disposable {
  static {
    __name(this, "LocalNewSession");
  }
  get repoUri() {
    return this._repoUri;
  }
  get isolationMode() {
    return this._isolationMode;
  }
  get branch() {
    return this._branch;
  }
  get modelId() {
    return this._modelId;
  }
  get mode() {
    return this._mode;
  }
  get query() {
    return this._query;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  get disabled() {
    if (!this._repoUri) {
      return true;
    }
    if (this._isolationMode === "worktree" && !this._branch) {
      return true;
    }
    return false;
  }
  constructor(resource, defaultRepoUri, chatSessionsService, logService) {
    super();
    this.resource = resource;
    this.chatSessionsService = chatSessionsService;
    this.logService = logService;
    this._isolationMode = "worktree";
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.target = AgentSessionProviders.Background;
    this.selectedOptions = /* @__PURE__ */ new Map();
    if (defaultRepoUri) {
      this._repoUri = defaultRepoUri;
      this.setOption(REPOSITORY_OPTION_ID, defaultRepoUri.fsPath);
    }
  }
  setRepoUri(uri) {
    this._repoUri = uri;
    this._isolationMode = "workspace";
    this._branch = void 0;
    this._onDidChange.fire("repoUri");
    this._onDidChange.fire("disabled");
    this.setOption(REPOSITORY_OPTION_ID, uri.fsPath);
  }
  setIsolationMode(mode) {
    if (this._isolationMode !== mode) {
      this._isolationMode = mode;
      this._onDidChange.fire("isolationMode");
      this._onDidChange.fire("disabled");
      this.setOption(ISOLATION_OPTION_ID, mode);
    }
  }
  setBranch(branch) {
    if (this._branch !== branch) {
      this._branch = branch;
      this._onDidChange.fire("branch");
      this._onDidChange.fire("disabled");
      this.setOption(BRANCH_OPTION_ID, branch ?? "");
    }
  }
  setModelId(modelId) {
    this._modelId = modelId;
  }
  setMode(mode) {
    if (this._mode?.id !== mode?.id) {
      this._mode = mode;
      this._onDidChange.fire("agent");
      const modeName = mode?.isBuiltin ? void 0 : mode?.name.get();
      this.setOption(AGENT_OPTION_ID, modeName ?? "");
    }
  }
  setQuery(query) {
    this._query = query;
  }
  setAttachedContext(context) {
    this._attachedContext = context;
  }
  setOption(optionId, value) {
    if (typeof value === "string") {
      this.selectedOptions.set(optionId, { id: value, name: value });
    } else {
      this.selectedOptions.set(optionId, value);
    }
    this.chatSessionsService.notifySessionOptionsChange(this.resource, [{ optionId, value }]).catch((err) => this.logService.error(`Failed to notify session option ${optionId} change:`, err));
  }
};
LocalNewSession = __decorate([
  __param(2, IChatSessionsService),
  __param(3, ILogService)
], LocalNewSession);
let RemoteNewSession = class RemoteNewSession2 extends Disposable {
  static {
    __name(this, "RemoteNewSession");
  }
  get repoUri() {
    return this._repoUri;
  }
  get isolationMode() {
    return "worktree";
  }
  get branch() {
    return void 0;
  }
  get modelId() {
    return this._modelId;
  }
  get mode() {
    return void 0;
  }
  get query() {
    return this._query;
  }
  get attachedContext() {
    return this._attachedContext;
  }
  get disabled() {
    return !this._repoUri && !this.selectedOptions.has("repositories");
  }
  constructor(resource, target, chatSessionsService, contextKeyService, logService) {
    super();
    this.resource = resource;
    this.target = target;
    this.chatSessionsService = chatSessionsService;
    this.contextKeyService = contextKeyService;
    this.logService = logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeOptionGroups = this._register(new Emitter());
    this.onDidChangeOptionGroups = this._onDidChangeOptionGroups.event;
    this.selectedOptions = /* @__PURE__ */ new Map();
    this._whenClauseKeys = /* @__PURE__ */ new Set();
    this._updateWhenClauseKeys();
    this._register(this.chatSessionsService.onDidChangeOptionGroups(() => {
      this._updateWhenClauseKeys();
      this._onDidChangeOptionGroups.fire();
      this._onDidChange.fire("options");
    }));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (this._whenClauseKeys.size > 0 && e.affectsSome(this._whenClauseKeys)) {
        this._onDidChangeOptionGroups.fire();
      }
    }));
  }
  setRepoUri(uri) {
    this._repoUri = uri;
    this._onDidChange.fire("repoUri");
    this._onDidChange.fire("disabled");
    const id = uri.path.substring(1);
    this.setOption("repositories", { id, name: id });
  }
  setIsolationMode(_mode) {
  }
  setBranch(_branch) {
  }
  setModelId(modelId) {
    this._modelId = modelId;
  }
  setMode(_mode) {
  }
  setQuery(query) {
    this._query = query;
  }
  setAttachedContext(context) {
    this._attachedContext = context;
  }
  setOption(optionId, value) {
    if (typeof value !== "string") {
      this.selectedOptions.set(optionId, value);
    }
    this._onDidChange.fire("options");
    this._onDidChange.fire("disabled");
    this.chatSessionsService.notifySessionOptionsChange(this.resource, [{ optionId, value }]).catch((err) => this.logService.error(`Failed to notify extension of ${optionId} change:`, err));
  }
  // --- Option group accessors ---
  getModelOptionGroup() {
    const groups = this._getOptionGroups();
    if (!groups) {
      return void 0;
    }
    const group = groups.find((g) => isModelOptionGroup(g));
    if (!group) {
      return void 0;
    }
    return { group, value: this._getValueForGroup(group) };
  }
  getOtherOptionGroups() {
    const groups = this._getOptionGroups();
    if (!groups) {
      return [];
    }
    return groups.filter((g) => !isModelOptionGroup(g) && !isRepositoriesOptionGroup(g) && this._isOptionGroupVisible(g)).map((g) => ({ group: g, value: this._getValueForGroup(g) }));
  }
  getOptionValue(groupId) {
    return this.selectedOptions.get(groupId);
  }
  setOptionValue(groupId, value) {
    this.setOption(groupId, value);
  }
  // --- Internals ---
  _getOptionGroups() {
    return this.chatSessionsService.getOptionGroupsForSessionType(this.target);
  }
  _isOptionGroupVisible(group) {
    if (!group.when) {
      return true;
    }
    const expr = ContextKeyExpr.deserialize(group.when);
    return !expr || this.contextKeyService.contextMatchesRules(expr);
  }
  _updateWhenClauseKeys() {
    this._whenClauseKeys.clear();
    const groups = this._getOptionGroups();
    if (!groups) {
      return;
    }
    for (const group of groups) {
      if (group.when) {
        const expr = ContextKeyExpr.deserialize(group.when);
        if (expr) {
          for (const key of expr.keys()) {
            this._whenClauseKeys.add(key);
          }
        }
      }
    }
  }
  _getValueForGroup(group) {
    const selected = this.selectedOptions.get(group.id);
    if (selected) {
      return selected;
    }
    const sessionOption = this.chatSessionsService.getSessionOption(this.resource, group.id);
    if (sessionOption && typeof sessionOption !== "string") {
      return sessionOption;
    }
    if (typeof sessionOption === "string") {
      const item = group.items.find((i) => i.id === sessionOption.trim());
      if (item) {
        return item;
      }
    }
    return group.items.find((i) => i.default === true) ?? group.items[0];
  }
};
RemoteNewSession = __decorate([
  __param(2, IChatSessionsService),
  __param(3, IContextKeyService),
  __param(4, ILogService)
], RemoteNewSession);
function isModelOptionGroup(group) {
  if (group.id === "models") {
    return true;
  }
  const nameLower = group.name.toLowerCase();
  return nameLower === "model" || nameLower === "models";
}
__name(isModelOptionGroup, "isModelOptionGroup");
function isRepositoriesOptionGroup(group) {
  return group.id === "repositories";
}
__name(isRepositoriesOptionGroup, "isRepositoriesOptionGroup");
export {
  LocalNewSession,
  RemoteNewSession
};
//# sourceMappingURL=newSession.js.map
