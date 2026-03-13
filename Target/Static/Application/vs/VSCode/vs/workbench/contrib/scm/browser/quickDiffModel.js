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
import { ResourceMap } from "../../../../base/common/map.js";
import { createDecorator, IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { isTextFileEditorModel, ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { Disposable, DisposableMap, DisposableStore, ReferenceCollection } from "../../../../base/common/lifecycle.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { shouldSynchronizeModel } from "../../../../editor/common/model.js";
import { compareChanges, getModifiedEndLineNumber, IQuickDiffService } from "../common/quickDiff.js";
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { ISCMService } from "../common/scm.js";
import { sortedDiff, equals } from "../../../../base/common/arrays.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { DiffState } from "../../../../editor/browser/widget/diffEditor/diffEditorViewModel.js";
import { toLineChanges } from "../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IChatEditingService } from "../../chat/common/editing/chatEditingService.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { autorun } from "../../../../base/common/observable.js";
const IQuickDiffModelService = createDecorator("IQuickDiffModelService");
const decoratorQuickDiffModelOptions = {
  algorithm: "advanced",
  maxComputationTimeMs: 1e3
};
let QuickDiffModelReferenceCollection = class QuickDiffModelReferenceCollection2 extends ReferenceCollection {
  static {
    __name(this, "QuickDiffModelReferenceCollection");
  }
  constructor(_instantiationService) {
    super();
    this._instantiationService = _instantiationService;
  }
  createReferencedObject(_key, textFileModel, options) {
    return this._instantiationService.createInstance(QuickDiffModel, textFileModel, options);
  }
  destroyReferencedObject(_key, object) {
    object.dispose();
  }
};
QuickDiffModelReferenceCollection = __decorate([
  __param(0, IInstantiationService)
], QuickDiffModelReferenceCollection);
let QuickDiffModelService = class QuickDiffModelService2 {
  static {
    __name(this, "QuickDiffModelService");
  }
  constructor(instantiationService, textFileService, uriIdentityService) {
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.uriIdentityService = uriIdentityService;
    this._references = this.instantiationService.createInstance(QuickDiffModelReferenceCollection);
  }
  createQuickDiffModelReference(resource, options = decoratorQuickDiffModelOptions) {
    const textFileModel = this.textFileService.files.get(resource);
    if (!textFileModel?.isResolved()) {
      return void 0;
    }
    resource = this.uriIdentityService.asCanonicalUri(resource).with({ query: JSON.stringify(options) });
    return this._references.acquire(resource.toString(), textFileModel, options);
  }
};
QuickDiffModelService = __decorate([
  __param(0, IInstantiationService),
  __param(1, ITextFileService),
  __param(2, IUriIdentityService)
], QuickDiffModelService);
let QuickDiffModel = class QuickDiffModel2 extends Disposable {
  static {
    __name(this, "QuickDiffModel");
  }
  get originalTextModels() {
    return Iterable.map(this._originalEditorModels.values(), (editorModel) => editorModel.textEditorModel);
  }
  get allChanges() {
    return this._allChanges;
  }
  get changes() {
    return this._changes;
  }
  get quickDiffChanges() {
    return this._quickDiffChanges;
  }
  constructor(textFileModel, options, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, _chatEditingService, progressService) {
    super();
    this.options = options;
    this.scmService = scmService;
    this.quickDiffService = quickDiffService;
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
    this.textModelResolverService = textModelResolverService;
    this._chatEditingService = _chatEditingService;
    this.progressService = progressService;
    this._originalEditorModels = new ResourceMap();
    this._originalEditorModelsDisposables = this._register(new DisposableStore());
    this._disposed = false;
    this._quickDiffs = [];
    this._diffDelayer = this._register(new ThrottledDelayer(200));
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._allChanges = [];
    this._changes = [];
    this._quickDiffChanges = /* @__PURE__ */ new Map();
    this._repositoryDisposables = new DisposableMap();
    this._model = textFileModel;
    this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
    this._register(Event.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("scm.diffDecorationsIgnoreTrimWhitespace") || e.affectsConfiguration("diffEditor.ignoreTrimWhitespace"))(this.triggerDiff, this));
    this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
    for (const r of scmService.repositories) {
      this.onDidAddRepository(r);
    }
    this._register(this._model.onDidChangeEncoding(() => {
      this._diffDelayer.cancel();
      this._quickDiffs = [];
      this._originalEditorModels.clear();
      this._quickDiffsPromise = void 0;
      this.setChanges([], [], /* @__PURE__ */ new Map());
      this.triggerDiff();
    }));
    this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
    this._register(autorun((reader) => {
      for (const session of this._chatEditingService.editingSessionsObs.read(reader)) {
        reader.store.add(autorun((r) => {
          for (const entry of session.entries.read(r)) {
            entry.state.read(r);
          }
          this.triggerDiff();
        }));
      }
    }));
    this.triggerDiff();
  }
  get quickDiffs() {
    return this._quickDiffs;
  }
  getQuickDiffResults() {
    return this._quickDiffs.map((quickDiff) => {
      const changes = this.allChanges.filter((change) => change.providerId === quickDiff.id);
      return {
        providerId: quickDiff.id,
        providerKind: quickDiff.kind,
        original: quickDiff.originalResource,
        modified: this._model.resource,
        changes: changes.map((change) => change.change),
        changes2: changes.map((change) => change.change2)
      };
    });
  }
  getDiffEditorModel(originalUri) {
    const editorModel = this._originalEditorModels.get(originalUri);
    return editorModel ? {
      modified: this._model.textEditorModel,
      original: editorModel.textEditorModel
    } : void 0;
  }
  onDidAddRepository(repository) {
    const disposables = new DisposableStore();
    disposables.add(repository.provider.onDidChangeResources(this.triggerDiff, this));
    const onDidRemoveRepository = Event.filter(this.scmService.onDidRemoveRepository, (r) => r === repository);
    disposables.add(onDidRemoveRepository(() => this._repositoryDisposables.deleteAndDispose(repository)));
    this._repositoryDisposables.set(repository, disposables);
    this.triggerDiff();
  }
  triggerDiff() {
    if (!this._diffDelayer) {
      return;
    }
    this._diffDelayer.trigger(async () => {
      const result = await this.diff();
      const editorModels = Array.from(this._originalEditorModels.values());
      if (!result || this._disposed || this._model.isDisposed() || editorModels.some((editorModel) => editorModel.isDisposed())) {
        return;
      }
      this.setChanges(result.allChanges, result.changes, result.mapChanges);
    }).catch((err) => onUnexpectedError(err));
  }
  setChanges(allChanges, changes, mapChanges) {
    const diff = sortedDiff(this.changes, changes, (a, b) => compareChanges(a.change, b.change));
    this._allChanges = allChanges;
    this._changes = changes;
    this._quickDiffChanges = mapChanges;
    this._onDidChange.fire({ changes, diff });
  }
  diff() {
    return this.progressService.withProgress({ location: 3, delay: 250 }, async () => {
      const originalURIs = await this.getQuickDiffsPromise();
      if (this._disposed || this._model.isDisposed() || originalURIs.length === 0) {
        return Promise.resolve({ allChanges: [], changes: [], mapChanges: /* @__PURE__ */ new Map() });
      }
      const quickDiffs = originalURIs.filter((quickDiff) => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
      if (quickDiffs.length === 0) {
        return Promise.resolve({ allChanges: [], changes: [], mapChanges: /* @__PURE__ */ new Map() });
      }
      const quickDiffPrimary = quickDiffs.find((quickDiff) => quickDiff.kind === "primary");
      const ignoreTrimWhitespaceSetting = this.configurationService.getValue("scm.diffDecorationsIgnoreTrimWhitespace");
      const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === "inherit" ? this.configurationService.getValue("diffEditor.ignoreTrimWhitespace") : ignoreTrimWhitespaceSetting !== "false";
      const diffs = [];
      const secondaryDiffs = [];
      for (const quickDiff of quickDiffs) {
        const diff = await this._diff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
        if (diff.changes && diff.changes2 && diff.changes.length === diff.changes2.length) {
          for (let index = 0; index < diff.changes.length; index++) {
            const change2 = diff.changes2[index];
            if (quickDiffPrimary && quickDiff.kind === "secondary") {
              const primaryQuickDiffChange = diffs.find((d) => d.change2.modified.equals(change2.modified) && d.change2.original.length === change2.original.length);
              if (primaryQuickDiffChange) {
                const primaryModel = this._originalEditorModels.get(quickDiffPrimary.originalResource)?.textEditorModel;
                const primaryContent = primaryModel?.getValueInRange(primaryQuickDiffChange.change2.toRangeMapping().originalRange);
                const secondaryModel = this._originalEditorModels.get(quickDiff.originalResource)?.textEditorModel;
                const secondaryContent = secondaryModel?.getValueInRange(change2.toRangeMapping().originalRange);
                if (primaryContent === secondaryContent) {
                  secondaryDiffs.push({
                    providerId: quickDiff.id,
                    original: quickDiff.originalResource,
                    modified: this._model.resource,
                    change: diff.changes[index],
                    change2: diff.changes2[index]
                  });
                  continue;
                }
              }
            }
            diffs.push({
              providerId: quickDiff.id,
              original: quickDiff.originalResource,
              modified: this._model.resource,
              change: diff.changes[index],
              change2: diff.changes2[index]
            });
          }
        }
      }
      const diffsSorted = diffs.sort((a, b) => compareChanges(a.change, b.change));
      const allDiffsSorted = [...diffs, ...secondaryDiffs].sort((a, b) => compareChanges(a.change, b.change));
      const map = /* @__PURE__ */ new Map();
      for (let i = 0; i < diffsSorted.length; i++) {
        const providerId = diffsSorted[i].providerId;
        if (!map.has(providerId)) {
          map.set(providerId, []);
        }
        map.get(providerId).push(i);
      }
      return { allChanges: allDiffsSorted, changes: diffsSorted, mapChanges: map };
    });
  }
  async _diff(original, modified, ignoreTrimWhitespace) {
    const maxComputationTimeMs = this.options.maxComputationTimeMs ?? Number.MAX_SAFE_INTEGER;
    const result = await this.editorWorkerService.computeDiff(original, modified, {
      computeMoves: false,
      ignoreTrimWhitespace,
      maxComputationTimeMs
    }, this.options.algorithm);
    return { changes: result ? toLineChanges(DiffState.fromDiffResult(result)) : null, changes2: result?.changes ?? null };
  }
  getQuickDiffsPromise() {
    if (this._quickDiffsPromise) {
      return this._quickDiffsPromise;
    }
    this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
      if (this._disposed) {
        return [];
      }
      if (quickDiffs.length === 0) {
        this._quickDiffs = [];
        this._originalEditorModels.clear();
        return [];
      }
      if (equals(this._quickDiffs, quickDiffs, (a, b) => a.id === b.id && a.originalResource.toString() === b.originalResource.toString() && this.quickDiffService.isQuickDiffProviderVisible(a.id) === this.quickDiffService.isQuickDiffProviderVisible(b.id))) {
        return quickDiffs;
      }
      this._quickDiffs = quickDiffs;
      this._originalEditorModels.clear();
      this._originalEditorModelsDisposables.clear();
      return (await Promise.all(quickDiffs.map(async (quickDiff) => {
        try {
          const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
          if (this._disposed) {
            ref.dispose();
            return [];
          }
          this._originalEditorModels.set(quickDiff.originalResource, ref.object);
          if (isTextFileEditorModel(ref.object) && !ref.object.isDirty()) {
            const encoding = this._model.getEncoding();
            if (encoding) {
              ref.object.setEncoding(
                encoding,
                1
                /* EncodingMode.Decode */
              );
            }
          }
          this._originalEditorModelsDisposables.add(ref);
          this._originalEditorModelsDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
          return quickDiff;
        } catch (error) {
          return [];
        }
      }))).flat();
    });
    return this._quickDiffsPromise.finally(() => {
      this._quickDiffsPromise = void 0;
    });
  }
  async getOriginalResource() {
    if (this._disposed) {
      return Promise.resolve([]);
    }
    const uri = this._model.resource;
    const isBeingModifiedByChatEdits = this._chatEditingService.editingSessionsObs.get().some(
      (session) => session.getEntry(uri)?.state.get() === 0
      /* ModifiedFileEntryState.Modified */
    );
    if (isBeingModifiedByChatEdits) {
      return Promise.resolve([]);
    }
    const isSynchronized = this._model.textEditorModel ? shouldSynchronizeModel(this._model.textEditorModel) : void 0;
    return this.quickDiffService.getQuickDiffs(uri, this._model.getLanguageId(), isSynchronized);
  }
  findNextClosestChange(lineNumber, inclusive = true, providerId) {
    const visibleQuickDiffIds = new Set(this.quickDiffs.filter((quickDiff) => this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id)).map((quickDiff) => quickDiff.id));
    for (let i = 0; i < this.changes.length; i++) {
      if (providerId && this.changes[i].providerId !== providerId) {
        continue;
      }
      if (!visibleQuickDiffIds.has(this.changes[i].providerId)) {
        continue;
      }
      const change = this.changes[i].change;
      if (inclusive) {
        if (getModifiedEndLineNumber(change) >= lineNumber) {
          return i;
        }
      } else {
        if (change.modifiedStartLineNumber > lineNumber) {
          return i;
        }
      }
    }
    return 0;
  }
  findPreviousClosestChange(lineNumber, inclusive = true, providerId) {
    const visibleQuickDiffIds = new Set(this.quickDiffs.filter((quickDiff) => this.quickDiffService.isQuickDiffProviderVisible(quickDiff.id)).map((quickDiff) => quickDiff.id));
    for (let i = this.changes.length - 1; i >= 0; i--) {
      if (providerId && this.changes[i].providerId !== providerId) {
        continue;
      }
      if (!visibleQuickDiffIds.has(this.changes[i].providerId)) {
        continue;
      }
      const change = this.changes[i].change;
      if (inclusive) {
        if (change.modifiedStartLineNumber <= lineNumber) {
          return i;
        }
      } else {
        if (getModifiedEndLineNumber(change) < lineNumber) {
          return i;
        }
      }
    }
    return this.changes.length - 1;
  }
  dispose() {
    this._disposed = true;
    this._quickDiffs = [];
    this._diffDelayer.cancel();
    this._originalEditorModels.clear();
    this._repositoryDisposables.dispose();
    super.dispose();
  }
};
QuickDiffModel = __decorate([
  __param(2, ISCMService),
  __param(3, IQuickDiffService),
  __param(4, IEditorWorkerService),
  __param(5, IConfigurationService),
  __param(6, ITextModelService),
  __param(7, IChatEditingService),
  __param(8, IProgressService)
], QuickDiffModel);
export {
  IQuickDiffModelService,
  QuickDiffModel,
  QuickDiffModelService
};
//# sourceMappingURL=quickDiffModel.js.map
