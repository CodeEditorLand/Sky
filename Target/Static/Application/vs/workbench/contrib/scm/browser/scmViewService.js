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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { ISCMViewService, ISCMService } from "../common/scm.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { SCMMenus } from "./menus.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { debounce } from "../../../../base/common/decorators.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { compareFileNames, comparePaths } from "../../../../base/common/comparers.js";
import { basename } from "../../../../base/common/resources.js";
import { binarySearch } from "../../../../base/common/arrays.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { autorun, derived, derivedObservableWithCache, derivedOpts, latestChangedValue, observableFromEventOpts, observableValue, runOnChange } from "../../../../base/common/observable.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { EditorResourceAccessor } from "../../../common/editor.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { getSCMRepositoryIcon } from "./util.js";
function getProviderStorageKey(provider) {
  return `${provider.providerId}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
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
  RepositorySortKey: new RawContextKey(
    "scmRepositorySortKey",
    "discoveryTime"
    /* ISCMRepositorySortKey.DiscoveryTime */
  ),
  RepositorySelectionMode: new RawContextKey(
    "scmRepositorySelectionMode",
    "single"
    /* ISCMRepositorySelectionMode.Single */
  )
};
let RepositoryPicker = class RepositoryPicker2 {
  static {
    __name(this, "RepositoryPicker");
  }
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
  async pickRepository() {
    const picks = [
      this._autoQuickPickItem,
      { type: "separator" }
    ];
    const activeRepository = this._scmViewService.activeRepository.get();
    const repository = activeRepository?.repository;
    const pinned = activeRepository?.pinned === true;
    picks.push(...this._scmViewService.repositories.map((r) => {
      const icon = getSCMRepositoryIcon(activeRepository, r);
      return {
        label: r.provider.name,
        description: r.provider.rootUri?.fsPath,
        iconClass: ThemeIcon.asClassName(icon),
        repository: r
      };
    }));
    const activeItem = pinned ? picks.find((p) => p.type !== "separator" && p.repository === repository) : this._autoQuickPickItem;
    return this._quickInputService.pick(picks, { placeHolder: this._placeHolder, activeItem });
  }
};
RepositoryPicker = __decorate([
  __param(2, IQuickInputService),
  __param(3, ISCMViewService)
], RepositoryPicker);
let SCMViewService = class SCMViewService2 {
  static {
    __name(this, "SCMViewService");
  }
  get repositories() {
    return this._repositories.filter((r) => r.repository.provider.isHidden !== true).map((r) => r.repository);
  }
  get visibleRepositories() {
    if (this._repositoriesSortKey === "discoveryTime") {
      return this._repositories.filter((r) => r.repository.provider.isHidden !== true && r.selectionIndex !== -1).sort((r1, r2) => r1.selectionIndex - r2.selectionIndex).map((r) => r.repository);
    }
    return this._repositories.filter((r) => r.repository.provider.isHidden !== true && r.selectionIndex !== -1).map((r) => r.repository);
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
  get focusedRepository() {
    return this._repositories.find((r) => r.focused)?.repository;
  }
  constructor(scmService, contextKeyService, editorService, extensionService, instantiationService, configurationService, storageService, workspaceContextService) {
    this.scmService = scmService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.didSelectRepository = false;
    this.disposables = new DisposableStore();
    this._repositories = [];
    this.didFinishLoadingRepositories = observableValue(this, false);
    this._onDidChangeRepositories = new Emitter();
    this.onDidChangeRepositories = this._onDidChangeRepositories.event;
    this._onDidSetVisibleRepositories = new Emitter();
    this.onDidChangeVisibleRepositories = Event.any(this._onDidSetVisibleRepositories.event, Event.debounce(this._onDidChangeRepositories.event, (last, e) => {
      if (!last) {
        return e;
      }
      const added = new Set(last.added);
      const removed = new Set(last.removed);
      for (const repository of e.added) {
        if (!removed.delete(repository)) {
          added.add(repository);
        }
      }
      for (const repository of e.removed) {
        if (!added.delete(repository)) {
          removed.add(repository);
        }
      }
      return { added, removed };
    }, 0, void 0, void 0, void 0, this.disposables));
    this._onDidFocusRepository = new Emitter();
    this.onDidFocusRepository = this._onDidFocusRepository.event;
    this.menus = instantiationService.createInstance(SCMMenus);
    const explorerEnabledConfig = observableConfigValue("scm.repositories.explorer", false, this.configurationService);
    this.graphShowIncomingChangesConfig = observableConfigValue("scm.graph.showIncomingChanges", true, this.configurationService);
    this.graphShowOutgoingChangesConfig = observableConfigValue("scm.graph.showOutgoingChanges", true, this.configurationService);
    this.selectionModeConfig = observableConfigValue("scm.repositories.selectionMode", "multiple", this.configurationService);
    this.explorerEnabledConfig = derived((reader) => {
      return explorerEnabledConfig.read(reader) === true && this.selectionModeConfig.read(reader) === "single";
    });
    try {
      this.previousState = JSON.parse(storageService.get("scm:view:visibleRepositories", 1, ""));
      if (this.previousState && this.previousState.visible.length > 1 && this.selectionModeConfig.get() === "single") {
        this.previousState = {
          ...this.previousState,
          visible: [this.previousState.visible[0]]
        };
      }
    } catch {
    }
    this._focusedRepositoryObs = observableFromEventOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn")
    }, this.onDidFocusRepository, () => this.focusedRepository);
    this._activeEditorObs = observableFromEventOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name(() => false, "equalsFn")
    }, this.editorService.onDidActiveEditorChange, () => this.editorService.activeEditor);
    this._activeEditorRepositoryObs = derivedObservableWithCache(this, (reader, lastValue) => {
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
    });
    this._activeRepositoryPinnedObs = observableValue(this, void 0);
    this._activeRepositoryObs = latestChangedValue(this, [this._activeEditorRepositoryObs, this._focusedRepositoryObs]);
    this.activeRepository = derivedOpts({
      owner: this,
      equalsFn: /* @__PURE__ */ __name((r1, r2) => r1?.repository.id === r2?.repository.id && r1?.pinned === r2?.pinned, "equalsFn")
    }, (reader) => {
      const activeRepository = this._activeRepositoryObs.read(reader);
      const activeRepositoryPinned = this._activeRepositoryPinnedObs.read(reader);
      const repository = activeRepositoryPinned ?? activeRepository;
      const pinned = !!activeRepositoryPinned;
      return repository ? { repository, pinned } : void 0;
    });
    this.disposables.add(runOnChange(this.selectionModeConfig, (selectionMode) => {
      if (selectionMode === "single" && this.visibleRepositories.length > 1) {
        const repository = this.visibleRepositories[0];
        this.visibleRepositories = [repository];
      } else if (selectionMode === "multiple" && this.repositories.length > 1) {
        this.visibleRepositories = this.repositories;
      }
    }));
    this._repositoriesSortKey = this.previousState?.sortKey ?? this.getViewSortOrder();
    this._sortKeyContextKey = RepositoryContextKeys.RepositorySortKey.bindTo(contextKeyService);
    this._sortKeyContextKey.set(this._repositoriesSortKey);
    this._selectionModelContextKey = RepositoryContextKeys.RepositorySelectionMode.bindTo(contextKeyService);
    this.disposables.add(autorun((reader) => {
      const selectionMode = this.selectionModeConfig.read(reader);
      this._selectionModelContextKey.set(selectionMode);
    }));
    scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
    scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
    for (const repository of scmService.repositories) {
      this.onDidAddRepository(repository);
    }
    storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
    extensionService.onWillStop(() => {
      this.onWillSaveState();
      this.didFinishLoadingRepositories.set(false, void 0);
    }, this, this.disposables);
  }
  onDidAddRepository(repository) {
    if (!this.didFinishLoadingRepositories.get()) {
      this.eventuallyFinishLoading();
    }
    const repositoryView = {
      repository,
      discoveryTime: Date.now(),
      focused: false,
      selectionIndex: -1
    };
    let removed = Iterable.empty();
    if (this.previousState && !this.didFinishLoadingRepositories.get()) {
      const index = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
      if (index === -1) {
        const added = [];
        this.insertRepositoryView(this._repositories, repositoryView);
        if (this.selectionModeConfig.get() === "multiple" || !this._repositories.find((r) => r.selectionIndex !== -1)) {
          this._repositories.forEach((repositoryView2, index2) => {
            if (repositoryView2.selectionIndex === -1) {
              added.push(repositoryView2.repository);
            }
            repositoryView2.selectionIndex = index2;
          });
          this._onDidChangeRepositories.fire({ added, removed: Iterable.empty() });
        }
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
    if (this.selectionModeConfig.get() === "multiple" || !this._repositories.find((r) => r.selectionIndex !== -1)) {
      const maxSelectionIndex = this.getMaxSelectionIndex();
      this.insertRepositoryView(this._repositories, { ...repositoryView, selectionIndex: maxSelectionIndex + 1 });
      this._onDidChangeRepositories.fire({ added: [repositoryView.repository], removed });
    } else {
      this.insertRepositoryView(this._repositories, repositoryView);
      this._onDidChangeRepositories.fire({ added: Iterable.empty(), removed });
    }
    if (!this._repositories.find((r) => r.focused)) {
      this.focus(repository);
    }
  }
  onDidRemoveRepository(repository) {
    if (!this.didFinishLoadingRepositories.get()) {
      this.eventuallyFinishLoading();
    }
    const repositoriesIndex = this._repositories.findIndex((r) => r.repository === repository);
    if (repositoriesIndex === -1) {
      return;
    }
    let added = Iterable.empty();
    const removed = this._repositories.splice(repositoriesIndex, 1);
    if (this._repositories.length > 0 && this.visibleRepositories.length === 0) {
      this._repositories[0].selectionIndex = 0;
      added = [this._repositories[0].repository];
    }
    this._onDidChangeRepositories.fire({ added, removed: removed.map((r) => r.repository) });
    if (removed.length === 1 && removed[0].focused && this.visibleRepositories.length > 0) {
      this.focus(this.visibleRepositories[0]);
    }
    if (removed.length === 1 && this._repositories.length === 0) {
      this._onDidFocusRepository.fire(void 0);
    }
    if (removed.length === 1 && removed[0].repository === this._activeRepositoryPinnedObs.get()) {
      this._activeRepositoryPinnedObs.set(void 0, void 0);
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
      if (this.selectionModeConfig.get() === "single") {
        this.visibleRepositories = [repository];
      } else if (this.selectionModeConfig.get() === "multiple") {
        this.visibleRepositories = [...this.visibleRepositories, repository];
      }
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
  toggleSelectionMode(selectionMode) {
    this.configurationService.updateValue("scm.repositories.selectionMode", selectionMode);
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
    if (this._repositoriesSortKey === "discoveryTime") {
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
        return "discoveryTime";
      case "name":
        return "name";
      case "path":
        return "path";
      default:
        return "discoveryTime";
    }
  }
  insertRepositoryView(repositories, repositoryView) {
    const index = binarySearch(repositories, repositoryView, this.compareRepositories.bind(this));
    repositories.splice(index < 0 ? ~index : index, 0, repositoryView);
  }
  onWillSaveState() {
    if (!this.didFinishLoadingRepositories.get()) {
      return;
    }
    const all = this.repositories.map((r) => getProviderStorageKey(r.provider));
    const visible = this.visibleRepositories.map((r) => all.indexOf(getProviderStorageKey(r.provider)));
    this.previousState = { all, visible, sortKey: this._repositoriesSortKey };
    this.storageService.store(
      "scm:view:visibleRepositories",
      JSON.stringify(this.previousState),
      1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  eventuallyFinishLoading() {
    this.finishLoading();
  }
  finishLoading() {
    if (this.didFinishLoadingRepositories.get()) {
      return;
    }
    this.didFinishLoadingRepositories.set(true, void 0);
  }
  dispose() {
    this.disposables.dispose();
    this._onDidFocusRepository.dispose();
    this._onDidChangeRepositories.dispose();
    this._onDidSetVisibleRepositories.dispose();
  }
};
__decorate([
  debounce(5e3)
], SCMViewService.prototype, "eventuallyFinishLoading", null);
SCMViewService = __decorate([
  __param(0, ISCMService),
  __param(1, IContextKeyService),
  __param(2, IEditorService),
  __param(3, IExtensionService),
  __param(4, IInstantiationService),
  __param(5, IConfigurationService),
  __param(6, IStorageService),
  __param(7, IWorkspaceContextService)
], SCMViewService);
export {
  RepositoryContextKeys,
  RepositoryPicker,
  SCMViewService
};
//# sourceMappingURL=scmViewService.js.map
