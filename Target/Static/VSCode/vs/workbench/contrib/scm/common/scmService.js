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
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { ISCMService, ISCMProvider, ISCMInput, ISCMRepository, IInputValidator, ISCMInputChangeEvent, SCMInputChangeReason, InputValidationType, IInputValidation } from "./scm.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { HistoryNavigator2 } from "../../../../base/common/history.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { URI } from "../../../../base/common/uri.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Schemas } from "../../../../base/common/network.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { runOnChange } from "../../../../base/common/observable.js";
class SCMInput extends Disposable {
  constructor(repository, history) {
    super();
    this.repository = repository;
    this.history = history;
    if (this.repository.provider.rootUri) {
      this.historyNavigator = history.getHistory(this.repository.provider.label, this.repository.provider.rootUri);
      this._register(this.history.onWillSaveHistory((event) => {
        if (this.historyNavigator.isAtEnd()) {
          this.saveValue();
        }
        if (this.didChangeHistory) {
          event.historyDidIndeedChange();
        }
        this.didChangeHistory = false;
      }));
    } else {
      this.historyNavigator = new HistoryNavigator2([""], 100);
    }
    this._value = this.historyNavigator.current();
  }
  static {
    __name(this, "SCMInput");
  }
  _value = "";
  get value() {
    return this._value;
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _placeholder = "";
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this._onDidChangePlaceholder.fire(placeholder);
  }
  _onDidChangePlaceholder = new Emitter();
  onDidChangePlaceholder = this._onDidChangePlaceholder.event;
  _enabled = true;
  get enabled() {
    return this._enabled;
  }
  set enabled(enabled) {
    this._enabled = enabled;
    this._onDidChangeEnablement.fire(enabled);
  }
  _onDidChangeEnablement = new Emitter();
  onDidChangeEnablement = this._onDidChangeEnablement.event;
  _visible = true;
  get visible() {
    return this._visible;
  }
  set visible(visible) {
    this._visible = visible;
    this._onDidChangeVisibility.fire(visible);
  }
  _onDidChangeVisibility = new Emitter();
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  setFocus() {
    this._onDidChangeFocus.fire();
  }
  _onDidChangeFocus = new Emitter();
  onDidChangeFocus = this._onDidChangeFocus.event;
  showValidationMessage(message, type) {
    this._onDidChangeValidationMessage.fire({ message, type });
  }
  _onDidChangeValidationMessage = new Emitter();
  onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
  _validateInput = /* @__PURE__ */ __name(() => Promise.resolve(void 0), "_validateInput");
  get validateInput() {
    return this._validateInput;
  }
  set validateInput(validateInput) {
    this._validateInput = validateInput;
    this._onDidChangeValidateInput.fire();
  }
  _onDidChangeValidateInput = new Emitter();
  onDidChangeValidateInput = this._onDidChangeValidateInput.event;
  historyNavigator;
  didChangeHistory = false;
  setValue(value, transient, reason) {
    if (value === this._value) {
      return;
    }
    if (!transient) {
      this.historyNavigator.replaceLast(this._value);
      this.historyNavigator.add(value);
      this.didChangeHistory = true;
    }
    this._value = value;
    this._onDidChange.fire({ value, reason });
  }
  showNextHistoryValue() {
    if (this.historyNavigator.isAtEnd()) {
      return;
    } else if (!this.historyNavigator.has(this.value)) {
      this.saveValue();
      this.historyNavigator.resetCursor();
    }
    const value = this.historyNavigator.next();
    this.setValue(value, true, SCMInputChangeReason.HistoryNext);
  }
  showPreviousHistoryValue() {
    if (this.historyNavigator.isAtEnd()) {
      this.saveValue();
    } else if (!this.historyNavigator.has(this._value)) {
      this.saveValue();
      this.historyNavigator.resetCursor();
    }
    const value = this.historyNavigator.previous();
    this.setValue(value, true, SCMInputChangeReason.HistoryPrevious);
  }
  saveValue() {
    const oldValue = this.historyNavigator.replaceLast(this._value);
    this.didChangeHistory = this.didChangeHistory || oldValue !== this._value;
  }
}
class SCMRepository {
  constructor(id, provider, disposables, inputHistory) {
    this.id = id;
    this.provider = provider;
    this.disposables = disposables;
    this.input = new SCMInput(this, inputHistory);
  }
  static {
    __name(this, "SCMRepository");
  }
  _selected = false;
  get selected() {
    return this._selected;
  }
  _onDidChangeSelection = new Emitter();
  onDidChangeSelection = this._onDidChangeSelection.event;
  input;
  setSelected(selected) {
    if (this._selected === selected) {
      return;
    }
    this._selected = selected;
    this._onDidChangeSelection.fire(selected);
  }
  dispose() {
    this.disposables.dispose();
    this.provider.dispose();
  }
}
class WillSaveHistoryEvent {
  static {
    __name(this, "WillSaveHistoryEvent");
  }
  _didChangeHistory = false;
  get didChangeHistory() {
    return this._didChangeHistory;
  }
  historyDidIndeedChange() {
    this._didChangeHistory = true;
  }
}
let SCMInputHistory = class {
  constructor(storageService, workspaceContextService) {
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.histories = /* @__PURE__ */ new Map();
    const entries = this.storageService.getObject("scm.history", StorageScope.WORKSPACE, []);
    for (const [providerLabel, rootUri, history] of entries) {
      let providerHistories = this.histories.get(providerLabel);
      if (!providerHistories) {
        providerHistories = new ResourceMap();
        this.histories.set(providerLabel, providerHistories);
      }
      providerHistories.set(rootUri, new HistoryNavigator2(history, 100));
    }
    if (this.migrateStorage()) {
      this.saveToStorage();
    }
    this.disposables.add(this.storageService.onDidChangeValue(StorageScope.WORKSPACE, "scm.history", this.disposables)((e) => {
      if (e.external && e.key === "scm.history") {
        const raw = this.storageService.getObject("scm.history", StorageScope.WORKSPACE, []);
        for (const [providerLabel, uri, rawHistory] of raw) {
          const history = this.getHistory(providerLabel, uri);
          for (const value of Iterable.reverse(rawHistory)) {
            history.prepend(value);
          }
        }
      }
    }));
    this.disposables.add(this.storageService.onWillSaveState((_) => {
      const event = new WillSaveHistoryEvent();
      this._onWillSaveHistory.fire(event);
      if (event.didChangeHistory) {
        this.saveToStorage();
      }
    }));
  }
  static {
    __name(this, "SCMInputHistory");
  }
  disposables = new DisposableStore();
  histories = /* @__PURE__ */ new Map();
  _onWillSaveHistory = this.disposables.add(new Emitter());
  onWillSaveHistory = this._onWillSaveHistory.event;
  saveToStorage() {
    const raw = [];
    for (const [providerLabel, providerHistories] of this.histories) {
      for (const [rootUri, history] of providerHistories) {
        if (!(history.size === 1 && history.current() === "")) {
          raw.push([providerLabel, rootUri, [...history]]);
        }
      }
    }
    this.storageService.store("scm.history", raw, StorageScope.WORKSPACE, StorageTarget.USER);
  }
  getHistory(providerLabel, rootUri) {
    let providerHistories = this.histories.get(providerLabel);
    if (!providerHistories) {
      providerHistories = new ResourceMap();
      this.histories.set(providerLabel, providerHistories);
    }
    let history = providerHistories.get(rootUri);
    if (!history) {
      history = new HistoryNavigator2([""], 100);
      providerHistories.set(rootUri, history);
    }
    return history;
  }
  // Migrates from Application scope storage to Workspace scope.
  // TODO@joaomoreno: Change from January 2024 onwards such that the only code is to remove all `scm/input:` storage keys
  migrateStorage() {
    let didSomethingChange = false;
    const machineKeys = Iterable.filter(this.storageService.keys(StorageScope.APPLICATION, StorageTarget.MACHINE), (key) => key.startsWith("scm/input:"));
    for (const key of machineKeys) {
      try {
        const legacyHistory = JSON.parse(this.storageService.get(key, StorageScope.APPLICATION, ""));
        const match = /^scm\/input:([^:]+):(.+)$/.exec(key);
        if (!match || !Array.isArray(legacyHistory?.history) || !Number.isInteger(legacyHistory?.timestamp)) {
          this.storageService.remove(key, StorageScope.APPLICATION);
          continue;
        }
        const [, providerLabel, rootPath] = match;
        const rootUri = URI.file(rootPath);
        if (this.workspaceContextService.getWorkspaceFolder(rootUri)) {
          const history = this.getHistory(providerLabel, rootUri);
          for (const entry of Iterable.reverse(legacyHistory.history)) {
            history.prepend(entry);
          }
          didSomethingChange = true;
          this.storageService.remove(key, StorageScope.APPLICATION);
        }
      } catch {
        this.storageService.remove(key, StorageScope.APPLICATION);
      }
    }
    return didSomethingChange;
  }
  dispose() {
    this.disposables.dispose();
  }
};
SCMInputHistory = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IWorkspaceContextService)
], SCMInputHistory);
let SCMService = class {
  constructor(logService, workspaceContextService, contextKeyService, storageService, uriIdentityService) {
    this.logService = logService;
    this.uriIdentityService = uriIdentityService;
    this.inputHistory = new SCMInputHistory(storageService, workspaceContextService);
    this.providerCount = contextKeyService.createKey("scm.providerCount", 0);
    this.historyProviderCount = contextKeyService.createKey("scm.historyProviderCount", 0);
  }
  static {
    __name(this, "SCMService");
  }
  _repositories = /* @__PURE__ */ new Map();
  // used in tests
  get repositories() {
    return this._repositories.values();
  }
  get repositoryCount() {
    return this._repositories.size;
  }
  inputHistory;
  providerCount;
  historyProviderCount;
  _onDidAddProvider = new Emitter();
  onDidAddRepository = this._onDidAddProvider.event;
  _onDidRemoveProvider = new Emitter();
  onDidRemoveRepository = this._onDidRemoveProvider.event;
  registerSCMProvider(provider) {
    this.logService.trace("SCMService#registerSCMProvider");
    if (this._repositories.has(provider.id)) {
      throw new Error(`SCM Provider ${provider.id} already exists.`);
    }
    const disposables = new DisposableStore();
    const historyProviderCount = /* @__PURE__ */ __name(() => {
      return Array.from(this._repositories.values()).filter((r) => !!r.provider.historyProvider.get()).length;
    }, "historyProviderCount");
    disposables.add(toDisposable(() => {
      this._repositories.delete(provider.id);
      this._onDidRemoveProvider.fire(repository);
      this.providerCount.set(this._repositories.size);
      this.historyProviderCount.set(historyProviderCount());
    }));
    const repository = new SCMRepository(provider.id, provider, disposables, this.inputHistory);
    this._repositories.set(provider.id, repository);
    disposables.add(runOnChange(provider.historyProvider, () => {
      this.historyProviderCount.set(historyProviderCount());
    }));
    this.providerCount.set(this._repositories.size);
    this.historyProviderCount.set(historyProviderCount());
    this._onDidAddProvider.fire(repository);
    return repository;
  }
  getRepository(idOrResource) {
    if (typeof idOrResource === "string") {
      return this._repositories.get(idOrResource);
    }
    if (idOrResource.scheme !== Schemas.file && idOrResource.scheme !== Schemas.vscodeRemote) {
      return void 0;
    }
    let bestRepository = void 0;
    let bestMatchLength = Number.POSITIVE_INFINITY;
    for (const repository of this.repositories) {
      const root = repository.provider.rootUri;
      if (!root) {
        continue;
      }
      const path = this.uriIdentityService.extUri.relativePath(root, idOrResource);
      if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
        bestRepository = repository;
        bestMatchLength = path.length;
      }
    }
    return bestRepository;
  }
};
SCMService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IUriIdentityService)
], SCMService);
export {
  SCMService
};
//# sourceMappingURL=scmService.js.map
