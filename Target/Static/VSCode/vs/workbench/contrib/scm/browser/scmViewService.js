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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { ISCMViewService, ISCMRepository, ISCMService, ISCMViewVisibleRepositoryChangeEvent, ISCMMenus, ISCMProvider, ISCMRepositorySortKey } from "../common/scm.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { SCMMenus } from "./menus.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { debounce } from "../../../../base/common/decorators.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { compareFileNames, comparePaths } from "../../../../base/common/comparers.js";
import { basename } from "../../../../base/common/resources.js";
import { binarySearch } from "../../../../base/common/arrays.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { derivedObservableWithCache, derivedOpts, IObservable, ISettableObservable, latestChangedValue, observableFromEventOpts, observableValue } from "../../../../base/common/observable.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorResourceAccessor } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { localize } from "../../../../nls.js";
function getProviderStorageKey(provider) {
  return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}
__name(getProviderStorageKey, "getProviderStorageKey");
function getRepositoryName(workspaceContextService, repository) {
  if (!repository.provider.rootUri) {
    return repository.provider.label;
  }
  const folder = workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
  return folder?.uri.toString() === repository.provider.rootUri.toString() ? folder.name : basename(repository.provider.rootUri);
}
__name(getRepositoryName, "getRepositoryName");
const RepositoryContextKeys = {
  RepositorySortKey: new RawContextKey("scmRepositorySortKey", ISCMRepositorySortKey.DiscoveryTime)
};
let RepositoryPicker = class {
  constructor(_placeHolder, _autoQuickItemDescription, _quickInputService, _scmViewService) {
    this._placeHolder = _placeHolder;
    this._autoQuickItemDescription = _autoQuickItemDescription;
    this._quickInputService = _quickInputService;
    this._scmViewService = _scmViewService;
    this._autoQuickPickItem = {
      label: localize("auto", "Auto"),
      description: this._autoQuickItemDescription,
      repository: "auto"
    };
  }
  static {
    __name(this, "RepositoryPicker");
  }
  _autoQuickPickItem;
  async pickRepository() {
    const picks = [
      this._autoQuickPickItem,
      { type: "separator" }
    ];
    picks.push(...this._scmViewService.repositories.map((r) => ({
      label: r.provider.name,
      description: r.provider.rootUri?.fsPath,
      iconClass: ThemeIcon.asClassName(Codicon.repo),
      repository: r
    })));
    return this._quickInputService.pick(picks, { placeHolder: this._placeHolder });
  }
};
RepositoryPicker = __decorateClass([
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, ISCMViewService)
], RepositoryPicker);
let SCMViewService = class {
  constructor(scmService, contextKeyService, editorService, extensionService, instantiationService, configurationService, storageService, workspaceContextService) {
    this.scmService = scmService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.menus = instantiationService.createInstance(SCMMenus);
    this._focusedRepositoryObs = observableFromEventOpts(
      {
        owner: this,
        equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn")
      },
      this.onDidFocusRepository,
      () => this.focusedRepository
    );
    this._activeEditorObs = observableFromEventOpts(
      {
        owner: this,
        equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn")
      },
      this.editorService.onDidActiveEditorChange,
      () => this.editorService.activeEditor
    );
    this._activeEditorRepositoryObs = derivedObservableWithCache(
      this,
      (reader, lastValue) => {
        const activeEditor = this._activeEditorObs.read(reader);
        const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
        if (!activeResource) {
          return lastValue;
        }
        const repository = this.scmService.getRepository(activeResource);
        if (!repository) {
          return lastValue;
        }
        return Object.create(repository);
      }
    );
    this._activeRepositoryPinnedObs = observableValue(this, void 0);
    this._activeRepositoryObs = latestChangedValue(this, [this._activeEditorRepositoryObs, this._focusedRepositoryObs]);
    this.activeRepository = derivedOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name((r1, r2) => r1?.id === r2?.id, "equalsFn")
    }, (reader) => {
      const activeRepository = this._activeRepositoryObs.read(reader);
      const activeRepositoryPinned = this._activeRepositoryPinnedObs.read(reader);
      return activeRepositoryPinned ?? activeRepository;
    });
    try {
      this.previousState = JSON.parse(storageService.get("scm:view:visibleRepositories", StorageScope.WORKSPACE, ""));
    } catch {
    }
    this._repositoriesSortKey = this.previousState?.sortKey ?? this.getViewSortOrder();
    this._sortKeyContextKey = RepositoryContextKeys.RepositorySortKey.bindTo(contextKeyService);
    this._sortKeyContextKey.set(this._repositoriesSortKey);
    scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
    scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    for (const repository of scmService.repositories) {
      this.onDidAddRepository(repository);
    }
    storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
    extensionService.onWillStop(() => {
      this.onWillSaveState();
      this.didFinishLoading = false;
    }, this, this.disposables);
  }
  static {
    __name(this, "SCMViewService");
  }
  menus;
  didFinishLoading = false;
  didSelectRepository = false;
  previousState;
  disposables = new DisposableStore();
  _repositories = [];
  get repositories() {
    return this._repositories.map((r) => r.repository);
  }
  get visibleRepositories() {
    if (this._repositoriesSortKey === ISCMRepositorySortKey.DiscoveryTime) {
      return this._repositories.filter((r) => r.selectionIndex !== -1).sort((r1, r2) => r1.selectionIndex - r2.selectionIndex).map((r) => r.repository);
    }
    return this._repositories.filter((r) => r.selectionIndex !== -1).map((r) => r.repository);
  }
  set visibleRepositories(visibleRepositories) {
    const set = new Set(visibleRepositories);
    const added = /* @__PURE__ */ new Set();
    const removed = /* @__PURE__ */ new Set();
    for (const repositoryView of this._repositories) {
      if (!set.has(repositoryView.repository) && repositoryView.selectionIndex !== -1) {
        repositoryView.selectionIndex = -1;
        removed.add(repositoryView.repository);
      }
      if (set.has(repositoryView.repository)) {
        if (repositoryView.selectionIndex === -1) {
          added.add(repositoryView.repository);
        }
        repositoryView.selectionIndex = visibleRepositories.indexOf(repositoryView.repository);
      }
    }
    if (added.size === 0 && removed.size === 0) {
      return;
    }
    this._onDidSetVisibleRepositories.fire({ added, removed });
    if (this._repositories.find((r) => r.focused && r.selectionIndex === -1)) {
      this.focus(this._repositories.find((r) => r.selectionIndex !== -1)?.repository);
    }
  }
  _onDidChangeRepositories = new Emitter();
  onDidChangeRepositories = this._onDidChangeRepositories.event;
  _onDidSetVisibleRepositories = new Emitter();
  onDidChangeVisibleRepositories = Event.any(
    this._onDidSetVisibleRepositories.event,
    Event.debounce(
      this._onDidChangeRepositories.event,
      (last, e) => {
        if (!last) {
          return e;
        }
        const added = new Set(last.added);
        const removed = new Set(last.removed);
        for (const repository of e.added) {
          if (removed.has(repository)) {
            removed.delete(repository);
          } else {
            added.add(repository);
          }
        }
        for (const repository of e.removed) {
          if (added.has(repository)) {
            added.delete(repository);
          } else {
            removed.add(repository);
          }
        }
        return { added, removed };
      },
      0,
      void 0,
      void 0,
      void 0,
      this.disposables
    )
  );
  get focusedRepository() {
    return this._repositories.find((r) => r.focused)?.repository;
  }
  _onDidFocusRepository = new Emitter();
  onDidFocusRepository = this._onDidFocusRepository.event;
  activeRepository;
  _activeEditorObs;
  _activeEditorRepositoryObs;
  /**
   * The focused repository takes precedence over the active editor repository when the observable
   * values are updated in the same transaction (or during the initial read of the observable value).
  */
  _activeRepositoryObs;
  _activeRepositoryPinnedObs;
  _focusedRepositoryObs;
  _repositoriesSortKey;
  _sortKeyContextKey;
  onDidAddRepository(repository) {
    if (!this.didFinishLoading) {
      this.eventuallyFinishLoading();
    }
    const repositoryView = {
      repository,
      discoveryTime: Date.now(),
      focused: false,
      selectionIndex: -1
    };
    let removed = Iterable.empty();
    if (this.previousState && !this.didFinishLoading) {
      const index = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
      if (index === -1) {
        const added = [];
        this.insertRepositoryView(this._repositories, repositoryView);
        this._repositories.forEach((repositoryView2, index2) => {
          if (repositoryView2.selectionIndex === -1) {
            added.push(repositoryView2.repository);
          }
          repositoryView2.selectionIndex = index2;
        });
        this._onDidChangeRepositories.fire({ added, removed: Iterable.empty() });
        this.didSelectRepository = false;
        return;
      }
      if (this.previousState.visible.indexOf(index) === -1) {
        if (this.didSelectRepository) {
          this.insertRepositoryView(this._repositories, repositoryView);
          this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
          return;
        }
      } else {
        if (!this.didSelectRepository) {
          removed = [...this.visibleRepositories];
          this._repositories.forEach((r) => {
            r.focused = false;
            r.selectionIndex = -1;
          });
          this.didSelectRepository = true;
        }
      }
    }
    const maxSelectionIndex = this.getMaxSelectionIndex();
    this.insertRepositoryView(this._repositories, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
    this._onDidChangeRepositories.fire({ added: [repositoryView.repository], removed });
    if (!this._repositories.find((r) => r.focused)) {
      this.focus(repository);
    }
  }
  onDidRemoveRepository(repository) {
    if (!this.didFinishLoading) {
      this.eventuallyFinishLoading();
    }
    const repositoriesIndex = this._repositories.findIndex((r) => r.repository === repository);
    if (repositoriesIndex === -1) {
      return;
    }
    let added = Iterable.empty();
    const repositoryView = this._repositories.splice(repositoriesIndex, 1);
    if (this._repositories.length > 0 && this.visibleRepositories.length === 0) {
      this._repositories[0].selectionIndex = 0;
      added = [this._repositories[0].repository];
    }
    this._onDidChangeRepositories.fire({ added, removed: repositoryView.map((r) => r.repository) });
    if (repositoryView.length === 1 && repositoryView[0].focused && this.visibleRepositories.length > 0) {
      this.focus(this.visibleRepositories[0]);
    }
  }
  isVisible(repository) {
    return this._repositories.find((r) => r.repository === repository)?.selectionIndex !== -1;
  }
  toggleVisibility(repository, visible) {
    if (typeof visible === "undefined") {
      visible = !this.isVisible(repository);
    } else if (this.isVisible(repository) === visible) {
      return;
    }
    if (visible) {
      this.visibleRepositories = [...this.visibleRepositories, repository];
    } else {
      const index = this.visibleRepositories.indexOf(repository);
      if (index > -1) {
        this.visibleRepositories = [
          ...this.visibleRepositories.slice(0, index),
          ...this.visibleRepositories.slice(index + 1)
        ];
      }
    }
  }
  toggleSortKey(sortKey) {
    this._repositoriesSortKey = sortKey;
    this._sortKeyContextKey.set(this._repositoriesSortKey);
    this._repositories.sort(this.compareRepositories.bind(this));
    this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed: Iterable.empty() });
  }
  focus(repository) {
    if (repository && !this.isVisible(repository)) {
      return;
    }
    this._repositories.forEach((r) => r.focused = r.repository === repository);
    if (this._repositories.find((r) => r.focused)) {
      this._onDidFocusRepository.fire(repository);
    }
  }
  pinActiveRepository(repository) {
    this._activeRepositoryPinnedObs.set(repository, void 0);
  }
  compareRepositories(op1, op2) {
    if (this._repositoriesSortKey === ISCMRepositorySortKey.DiscoveryTime) {
      return op1.discoveryTime - op2.discoveryTime;
    }
    if (this._repositoriesSortKey === "path" && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
      return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
    }
    const name1 = getRepositoryName(this.workspaceContextService, op1.repository);
    const name2 = getRepositoryName(this.workspaceContextService, op2.repository);
    const nameComparison = compareFileNames(name1, name2);
    if (nameComparison === 0 && op1.repository.provider.rootUri && op2.repository.provider.rootUri) {
      return comparePaths(op1.repository.provider.rootUri.fsPath, op2.repository.provider.rootUri.fsPath);
    }
    return nameComparison;
  }
  getMaxSelectionIndex() {
    return this._repositories.length === 0 ? -1 : Math.max(...this._repositories.map((r) => r.selectionIndex));
  }
  getViewSortOrder() {
    const sortOder = this.configurationService.getValue("scm.repositories.sortOrder");
    switch (sortOder) {
      case "discovery time":
        return ISCMRepositorySortKey.DiscoveryTime;
      case "name":
        return ISCMRepositorySortKey.Name;
      case "path":
        return ISCMRepositorySortKey.Path;
      default:
        return ISCMRepositorySortKey.DiscoveryTime;
    }
  }
  insertRepositoryView(repositories, repositoryView) {
    const index = binarySearch(repositories, repositoryView, this.compareRepositories.bind(this));
    repositories.splice(index < 0 ? ~index : index, 0, repositoryView);
  }
  onWillSaveState() {
    if (!this.didFinishLoading) {
      return;
    }
    const all = this.repositories.map((r) => getProviderStorageKey(r.provider));
    const visible = this.visibleRepositories.map((r) => all.indexOf(getProviderStorageKey(r.provider)));
    this.previousState = { all, sortKey: this._repositoriesSortKey, visible };
    this.storageService.store("scm:view:visibleRepositories", JSON.stringify(this.previousState), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  eventuallyFinishLoading() {
    this.finishLoading();
  }
  finishLoading() {
    if (this.didFinishLoading) {
      return;
    }
    this.didFinishLoading = true;
  }
  dispose() {
    this.disposables.dispose();
    this._onDidChangeRepositories.dispose();
    this._onDidSetVisibleRepositories.dispose();
  }
};
__decorateClass([
  debounce(5e3)
], SCMViewService.prototype, "eventuallyFinishLoading", 1);
SCMViewService = __decorateClass([
  __decorateParam(0, ISCMService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkspaceContextService)
], SCMViewService);
export {
  RepositoryContextKeys,
  RepositoryPicker,
  SCMViewService
};
//# sourceMappingURL=scmViewService.js.map
