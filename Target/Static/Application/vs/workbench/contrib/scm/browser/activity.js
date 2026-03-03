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
import { localize } from "../../../../nls.js";
import { basename } from "../../../../base/common/resources.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { VIEW_PANE_ID, ISCMService, ISCMViewService } from "../common/scm.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { EditorResourceAccessor } from "../../../common/editor.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { getRepositoryResourceCount, getSCMRepositoryIcon, getStatusBarCommandGenericName } from "./util.js";
import { autorun, derived, observableFromEvent } from "../../../../base/common/observable.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
const ActiveRepositoryContextKeys = {
  ActiveRepositoryName: new RawContextKey("scmActiveRepositoryName", ""),
  ActiveRepositoryBranchName: new RawContextKey("scmActiveRepositoryBranchName", "")
};
let SCMActiveRepositoryController = class SCMActiveRepositoryController2 extends Disposable {
  static {
    __name(this, "SCMActiveRepositoryController");
  }
  constructor(activityService, configurationService, contextKeyService, scmService, scmViewService, statusbarService, titleService) {
    super();
    this.activityService = activityService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.statusbarService = statusbarService;
    this.titleService = titleService;
    this._activeRepositoryNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryName.bindTo(this.contextKeyService);
    this._activeRepositoryBranchNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryBranchName.bindTo(this.contextKeyService);
    this.titleService.registerVariables([
      { name: "activeRepositoryName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryName.key },
      { name: "activeRepositoryBranchName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryBranchName.key }
    ]);
    this._countBadgeConfig = observableConfigValue("scm.countBadge", "all", this.configurationService);
    this._repositories = observableFromEvent(this, Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository), () => Iterable.filter(this.scmService.repositories, (r) => r.provider.isHidden !== true));
    this._activeRepositoryHistoryItemRefName = derived((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const historyProvider = activeRepository?.repository.provider.historyProvider.read(reader);
      const historyItemRef = historyProvider?.historyItemRef.read(reader);
      return historyItemRef?.name;
    });
    this._countBadgeRepositories = derived(this, (reader) => {
      switch (this._countBadgeConfig.read(reader)) {
        case "all": {
          const repositories = this._repositories.read(reader);
          return [...Iterable.map(repositories, (r) => ({ provider: r.provider, resourceCount: this._getRepositoryResourceCount(r) }))];
        }
        case "focused": {
          const activeRepository = this.scmViewService.activeRepository.read(reader);
          return activeRepository ? [{ provider: activeRepository.repository.provider, resourceCount: this._getRepositoryResourceCount(activeRepository.repository) }] : [];
        }
        case "off":
          return [];
        default:
          throw new Error("Invalid countBadge setting");
      }
    });
    this._countBadge = derived(this, (reader) => {
      let total = 0;
      for (const repository of this._countBadgeRepositories.read(reader)) {
        const count = repository.provider.count?.read(reader);
        const resourceCount = repository.resourceCount.read(reader);
        total = total + (count ?? resourceCount);
      }
      return total;
    });
    this._register(autorun((reader) => {
      const countBadge = this._countBadge.read(reader);
      this._updateActivityCountBadge(countBadge, reader.store);
    }));
    this._register(autorun((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const commands = activeRepository?.repository.provider.statusBarCommands.read(reader);
      this._updateStatusBar(activeRepository, commands ?? [], reader.store);
    }));
    this._register(autorun((reader) => {
      const activeRepository = this.scmViewService.activeRepository.read(reader);
      const historyItemRefName = this._activeRepositoryHistoryItemRefName.read(reader);
      this._updateActiveRepositoryContextKeys(activeRepository?.repository.provider.name, historyItemRefName);
    }));
  }
  _getRepositoryResourceCount(repository) {
    return observableFromEvent(this, repository.provider.onDidChangeResources, () => (
      /** @description repositoryResourceCount */
      getRepositoryResourceCount(repository.provider)
    ));
  }
  _updateActivityCountBadge(count, store) {
    if (count === 0) {
      return;
    }
    const badge = new NumberBadge(count, (num) => localize("scmPendingChangesBadge", "{0} pending changes", num));
    store.add(this.activityService.showViewActivity(VIEW_PANE_ID, { badge }));
  }
  _updateStatusBar(activeRepository, commands, store) {
    if (!activeRepository) {
      return;
    }
    const label = activeRepository.repository.provider.rootUri ? `${basename(activeRepository.repository.provider.rootUri)} (${activeRepository.repository.provider.label})` : activeRepository.repository.provider.label;
    for (let index = 0; index < commands.length; index++) {
      const command = commands[index];
      const tooltip = `${label}${command.tooltip ? ` - ${command.tooltip}` : ""}`;
      const genericCommandName = getStatusBarCommandGenericName(command);
      const statusbarEntry = {
        name: localize("status.scm", "Source Control") + (genericCommandName ? ` ${genericCommandName}` : ""),
        text: command.title,
        ariaLabel: tooltip,
        tooltip,
        command: command.id ? command : void 0
      };
      store.add(index === 0 ? this.statusbarService.addEntry(statusbarEntry, `status.scm.${index}`, 0, 1e4) : this.statusbarService.addEntry(statusbarEntry, `status.scm.${index}`, 0, { location: { id: `status.scm.${index - 1}`, priority: 1e4 }, alignment: 1, compact: true }));
    }
    if (this.scmViewService.repositories.length > 1) {
      const icon = getSCMRepositoryIcon(activeRepository, activeRepository.repository);
      const repositoryStatusbarEntry = {
        name: localize("status.scm.provider", "Source Control Provider"),
        text: `$(${icon.id}) ${activeRepository.repository.provider.name}`,
        ariaLabel: label,
        tooltip: label,
        command: "scm.setActiveProvider"
      };
      store.add(this.statusbarService.addEntry(repositoryStatusbarEntry, "status.scm.provider", 0, { location: { id: `status.scm.0`, priority: 1e4 }, alignment: 0, compact: true }));
    }
  }
  _updateActiveRepositoryContextKeys(repositoryName, branchName) {
    this._activeRepositoryNameContextKey.set(repositoryName ?? "");
    this._activeRepositoryBranchNameContextKey.set(branchName ?? "");
  }
};
SCMActiveRepositoryController = __decorate([
  __param(0, IActivityService),
  __param(1, IConfigurationService),
  __param(2, IContextKeyService),
  __param(3, ISCMService),
  __param(4, ISCMViewService),
  __param(5, IStatusbarService),
  __param(6, ITitleService)
], SCMActiveRepositoryController);
let SCMActiveResourceContextKeyController = class SCMActiveResourceContextKeyController2 extends Disposable {
  static {
    __name(this, "SCMActiveResourceContextKeyController");
  }
  constructor(editorGroupsService, scmService, uriIdentityService) {
    super();
    this.scmService = scmService;
    this.uriIdentityService = uriIdentityService;
    this._onDidRepositoryChange = new Emitter();
    const activeResourceHasChangesContextKey = new RawContextKey("scmActiveResourceHasChanges", false, localize("scmActiveResourceHasChanges", "Whether the active resource has changes"));
    const activeResourceRepositoryContextKey = new RawContextKey("scmActiveResourceRepository", void 0, localize("scmActiveResourceRepository", "The active resource's repository"));
    this._repositories = observableFromEvent(this, Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository), () => this.scmService.repositories);
    this._register(autorun((reader) => {
      for (const repository of this._repositories.read(reader)) {
        reader.store.add(Event.runAndSubscribe(repository.provider.onDidChangeResources, () => {
          this._onDidRepositoryChange.fire();
        }));
      }
    }));
    const hasChangesContextKeyProvider = {
      contextKey: activeResourceHasChangesContextKey,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this._getEditorHasChanges(group.activeEditor), "getGroupContextKeyValue"),
      onDidChange: this._onDidRepositoryChange.event
    };
    const repositoryContextKeyProvider = {
      contextKey: activeResourceRepositoryContextKey,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this._getEditorRepositoryId(group.activeEditor), "getGroupContextKeyValue"),
      onDidChange: this._onDidRepositoryChange.event
    };
    this._store.add(editorGroupsService.registerContextKeyProvider(hasChangesContextKeyProvider));
    this._store.add(editorGroupsService.registerContextKeyProvider(repositoryContextKeyProvider));
  }
  _getEditorHasChanges(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return false;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    for (const resourceGroup of activeResourceRepository?.provider.groups ?? []) {
      if (resourceGroup.resources.some((scmResource) => this.uriIdentityService.extUri.isEqual(activeResource, scmResource.sourceUri))) {
        return true;
      }
    }
    return false;
  }
  _getEditorRepositoryId(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return void 0;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    return activeResourceRepository?.id;
  }
  dispose() {
    this._onDidRepositoryChange.dispose();
    super.dispose();
  }
};
SCMActiveResourceContextKeyController = __decorate([
  __param(0, IEditorGroupsService),
  __param(1, ISCMService),
  __param(2, IUriIdentityService)
], SCMActiveResourceContextKeyController);
export {
  SCMActiveRepositoryController,
  SCMActiveResourceContextKeyController
};
//# sourceMappingURL=activity.js.map
