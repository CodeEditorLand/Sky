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
var ScmMultiDiffSourceResolver_1, ScmHistoryItemResolver_1;
import { ValueWithChangeEvent } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableFromEvent, ValueWithChangeEventFromObservable, waitForState } from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/path.js";
import { URI } from "../../../../base/common/uri.js";
import { localize2 } from "../../../../nls.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IActivityService, ProgressBadge } from "../../../services/activity/common/activity.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ISCMService } from "../../scm/common/scm.js";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "./multiDiffSourceResolverService.js";
let ScmMultiDiffSourceResolver = class ScmMultiDiffSourceResolver2 {
  static {
    __name(this, "ScmMultiDiffSourceResolver");
  }
  static {
    ScmMultiDiffSourceResolver_1 = this;
  }
  static {
    this._scheme = "scm-multi-diff-source";
  }
  static getMultiDiffSourceUri(repositoryUri, groupId) {
    return URI.from({
      scheme: ScmMultiDiffSourceResolver_1._scheme,
      query: JSON.stringify({ repositoryUri, groupId })
    });
  }
  static parseUri(uri) {
    if (uri.scheme !== ScmMultiDiffSourceResolver_1._scheme) {
      return void 0;
    }
    let query;
    try {
      query = JSON.parse(uri.query);
    } catch (e) {
      return void 0;
    }
    if (typeof query !== "object" || query === null) {
      return void 0;
    }
    const { repositoryUri, groupId } = query;
    if (typeof repositoryUri !== "string" || typeof groupId !== "string") {
      return void 0;
    }
    return { repositoryUri: URI.parse(repositoryUri), groupId };
  }
  constructor(_scmService, _activityService) {
    this._scmService = _scmService;
    this._activityService = _activityService;
  }
  canHandleUri(uri) {
    return ScmMultiDiffSourceResolver_1.parseUri(uri) !== void 0;
  }
  async resolveDiffSource(uri) {
    const { repositoryUri, groupId } = ScmMultiDiffSourceResolver_1.parseUri(uri);
    const repository = await waitForState(observableFromEvent(this, this._scmService.onDidAddRepository, () => [...this._scmService.repositories].find((r) => r.provider.rootUri?.toString() === repositoryUri.toString())));
    const group = await waitForState(observableFromEvent(this, repository.provider.onDidChangeResourceGroups, () => repository.provider.groups.find((g) => g.id === groupId)));
    const scmActivities = observableFromEvent(this._activityService.onDidChangeActivity, () => [...this._activityService.getViewContainerActivities("workbench.view.scm")]);
    const scmViewHasNoProgressBadge = scmActivities.map((activities) => !activities.some((a) => a.badge instanceof ProgressBadge));
    await waitForState(scmViewHasNoProgressBadge, (v) => v);
    return new ScmResolvedMultiDiffSource(group, repository);
  }
};
ScmMultiDiffSourceResolver = ScmMultiDiffSourceResolver_1 = __decorate([
  __param(0, ISCMService),
  __param(1, IActivityService)
], ScmMultiDiffSourceResolver);
let ScmHistoryItemResolver = class ScmHistoryItemResolver2 {
  static {
    __name(this, "ScmHistoryItemResolver");
  }
  static {
    ScmHistoryItemResolver_1 = this;
  }
  static {
    this.scheme = "scm-history-item";
  }
  static getMultiDiffSourceUri(provider, historyItemId, historyItemParentId, historyItemDisplayId) {
    return URI.from({
      scheme: ScmHistoryItemResolver_1.scheme,
      path: provider.rootUri?.fsPath,
      query: JSON.stringify({
        repositoryId: provider.id,
        historyItemId,
        historyItemParentId,
        historyItemDisplayId
      })
    }, true);
  }
  static parseUri(uri) {
    if (uri.scheme !== ScmHistoryItemResolver_1.scheme) {
      return void 0;
    }
    let query;
    try {
      query = JSON.parse(uri.query);
    } catch (e) {
      return void 0;
    }
    if (typeof query !== "object" || query === null) {
      return void 0;
    }
    const { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId } = query;
    if (typeof repositoryId !== "string" || typeof historyItemId !== "string" || typeof historyItemParentId !== "string" && historyItemParentId !== void 0 || typeof historyItemDisplayId !== "string" && historyItemDisplayId !== void 0) {
      return void 0;
    }
    return { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId };
  }
  constructor(_scmService) {
    this._scmService = _scmService;
  }
  canHandleUri(uri) {
    return ScmHistoryItemResolver_1.parseUri(uri) !== void 0;
  }
  async resolveDiffSource(uri) {
    const { repositoryId, historyItemId, historyItemParentId, historyItemDisplayId } = ScmHistoryItemResolver_1.parseUri(uri);
    const repository = this._scmService.getRepository(repositoryId);
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemChanges = await historyProvider?.provideHistoryItemChanges(historyItemId, historyItemParentId) ?? [];
    const resources = ValueWithChangeEvent.const(historyItemChanges.map((change) => {
      const goToFileEditorTitle = change.modifiedUri ? `${basename(change.modifiedUri.fsPath)} (${historyItemDisplayId ?? historyItemId})` : void 0;
      return new MultiDiffEditorItem(change.originalUri, change.modifiedUri, change.modifiedUri, goToFileEditorTitle);
    }));
    return { resources };
  }
};
ScmHistoryItemResolver = ScmHistoryItemResolver_1 = __decorate([
  __param(0, ISCMService)
], ScmHistoryItemResolver);
class ScmResolvedMultiDiffSource {
  static {
    __name(this, "ScmResolvedMultiDiffSource");
  }
  constructor(_group, _repository) {
    this._group = _group;
    this._repository = _repository;
    this._resources = observableFromEvent(this._group.onDidChangeResources, () => (
      /** @description resources */
      this._group.resources.map((e) => new MultiDiffEditorItem(e.multiDiffEditorOriginalUri, e.multiDiffEditorModifiedUri, e.sourceUri))
    ));
    this.resources = new ValueWithChangeEventFromObservable(this._resources);
    this.contextKeys = {
      scmResourceGroup: this._group.id,
      scmProvider: this._repository.provider.providerId
    };
  }
}
let ScmMultiDiffSourceResolverContribution = class ScmMultiDiffSourceResolverContribution2 extends Disposable {
  static {
    __name(this, "ScmMultiDiffSourceResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.scmMultiDiffSourceResolver";
  }
  constructor(instantiationService, multiDiffSourceResolverService) {
    super();
    this._register(multiDiffSourceResolverService.registerResolver(instantiationService.createInstance(ScmHistoryItemResolver)));
    this._register(multiDiffSourceResolverService.registerResolver(instantiationService.createInstance(ScmMultiDiffSourceResolver)));
  }
};
ScmMultiDiffSourceResolverContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, IMultiDiffSourceResolverService)
], ScmMultiDiffSourceResolverContribution);
class OpenScmGroupAction extends Action2 {
  static {
    __name(this, "OpenScmGroupAction");
  }
  static async openMultiFileDiffEditor(editorService, label, repositoryRootUri, resourceGroupId, options) {
    if (!repositoryRootUri) {
      return;
    }
    const multiDiffSource = ScmMultiDiffSourceResolver.getMultiDiffSourceUri(repositoryRootUri.toString(), resourceGroupId);
    return await editorService.openEditor({ label, multiDiffSource, options });
  }
  constructor() {
    super({
      id: "_workbench.openScmMultiDiffEditor",
      title: localize2("openChanges", "Open Changes"),
      f1: false
    });
  }
  async run(accessor, options) {
    const editorService = accessor.get(IEditorService);
    await OpenScmGroupAction.openMultiFileDiffEditor(editorService, options.title, URI.revive(options.repositoryUri), options.resourceGroupId);
  }
}
export {
  OpenScmGroupAction,
  ScmHistoryItemResolver,
  ScmMultiDiffSourceResolver,
  ScmMultiDiffSourceResolverContribution
};
//# sourceMappingURL=scmMultiDiffSourceResolver.js.map
